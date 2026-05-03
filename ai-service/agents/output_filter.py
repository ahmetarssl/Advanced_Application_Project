"""
KATMAN 5 - Output Filter
========================
SON savunma. AI yanlislikla bir email/sifre dondurduyse bile burada maskeleyecegiz.
"""
import re
from typing import Any

EMAIL_RE     = re.compile(r"\b[\w\.\-]+@[\w\.\-]+\.\w+\b")
TC_KIMLIK_RE = re.compile(r"\b\d{11}\b")
CARD_RE      = re.compile(r"\b\d{13,19}\b")
BCRYPT_RE    = re.compile(r"\$2[ayb]\$\d+\$[./A-Za-z0-9]{53}")
PHONE_TR_RE  = re.compile(r"\b(?:\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b")


def scrub_text(text: str) -> str:
    if not text:
        return text
    text = BCRYPT_RE.sub("[PASSWORD_HASH]", text)
    text = EMAIL_RE.sub("[EMAIL]", text)
    text = TC_KIMLIK_RE.sub("[TC_KIMLIK]", text)
    text = CARD_RE.sub("[KART_NO]", text)
    text = PHONE_TR_RE.sub("[TELEFON]", text)
    return text


def scrub_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{k: _scrub_value(v) for k, v in r.items()} for r in rows]


def _scrub_value(v: Any) -> Any:
    if isinstance(v, str):
        return scrub_text(v)
    return v
