"""
KATMAN 1 - Input Guardrail
==========================
Kullanicidan gelen sorunun:
  - prompt injection sablonu icermedigini
  - sistemden cikarmaya calismadigini
  - asiri uzun olmadigini
  - sadece e-ticaret/analytics scope'unda oldugunu
kontrol eder.

Bu LLM kullanmaz, deterministik regex - hizli ve guvenilir.
"""
import re

# --- Prompt injection imzalari ---
INJECTION_PATTERNS = [
    # Ingilizce klasikleri
    r"ignore\s+(previous|above|all|prior)\s+(instructions?|rules?|prompts?)",
    r"disregard\s+(previous|above|all|prior)\s+(instructions?|rules?)",
    r"forget\s+(everything|previous|above|all)",
    r"you\s+are\s+now\s+(a|an|in)\s+",
    r"act\s+as\s+(a\s+)?(different|new|jailbroken)",
    r"system\s*[:\-]\s*",
    r"</?\s*(system|instruction|prompt)\s*>",
    r"DAN\s+mode|developer\s+mode|jailbreak",
    r"reveal\s+(your\s+)?(system\s+)?(prompt|instructions?)",
    r"what\s+are\s+your\s+instructions",
    r"print\s+(your\s+)?(system\s+)?prompt",
    r"repeat\s+the\s+(words\s+)?above",

    # Turkce karsiliklari
    r"(onceki|ustteki|yukaridaki|tum)[\s\w]{0,30}(talimat|kural|komut|yonerge)[\s\w]{0,30}(unut|yok\s+say|atla|gormezden\s+gel)",
    r"(sistem|admin|yonetici)\s+(modu|olarak|gibi)",
    r"sistem\s+talimat",
    r"kurallari\s+(unut|yok\s+say|gormezden)",
]

# --- PII / kotuye kullanim sinyalleri ---
ABUSE_PATTERNS = [
    r"\bsifre\w*\b",
    r"\bparola\w*\b",
    r"\bpassword\w*\b",
    r"\bbcrypt\b",
    r"\bhash\w*\b",
    r"\btum\s+(kullanici|email|e-?posta)",
    r"\ball\s+(user|email|password)",
    r"information_schema",
    r"pg_(catalog|user|shadow|stat)",
    r"\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b|\bALTER\b|\bTRUNCATE\b",
]

# --- Zero-width / gorulmez karakterler ---
ZERO_WIDTH = re.compile(r"[​-‏‪-‮⁠-⁩﻿]")

# --- Greeting patterns ---
GREETINGS = re.compile(
    r"^\s*(merhaba|selam|hi|hello|hey|naber|nasilsin|gunaydin|iyi\s+aksamlar?)\s*[.!?]*\s*$",
    re.IGNORECASE,
)


def sanitize(question: str) -> str:
    """Zero-width karakterleri sil, trim."""
    return ZERO_WIDTH.sub("", question).strip()


def classify(question: str) -> tuple[str, str | None]:
    """
    Donus:
      ("BLOCKED",  reason)   - prompt injection / kotuye kullanim
      ("GREETING", None)     - merhaba / nasilsin
      ("IN_SCOPE", None)     - normal soru, devam et
    """
    q = sanitize(question)

    if not q:
        return "BLOCKED", "Bos soru"

    if len(q) > 500:
        return "BLOCKED", "Soru cok uzun (max 500 karakter)"

    if GREETINGS.match(q):
        return "GREETING", None

    for pat in INJECTION_PATTERNS:
        if re.search(pat, q, re.IGNORECASE):
            return "BLOCKED", "Prompt injection sablonu tespit edildi"

    for pat in ABUSE_PATTERNS:
        if re.search(pat, q, re.IGNORECASE):
            return "BLOCKED", "Bu konu sorgulanamaz (sifre/PII/admin komut)"

    if q.count(";") > 0 and any(k in q.upper() for k in ["DROP", "DELETE", "UPDATE", "INSERT"]):
        return "BLOCKED", "SQL injection sablonu"

    return "IN_SCOPE", None


def greeting_response() -> str:
    return (
        "Merhaba! Ben DataPulse analytics asistanin. "
        "E-ticaret verilerin hakkinda sorular sorabilirsin. "
        "Ornek: 'Bu ay en cok satan urun nedir?' veya "
        "'Gold uyelerin ortalama harcamasi ne kadar?'"
    )
