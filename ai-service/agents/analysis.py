"""
Analysis Agent - SQL sonucunu dogal Turkce cevaba cevirir.
"""
import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI

from config import settings

SYSTEM_PROMPT = """Sen DataPulse'un Analysis Agent'isin. Bir SQL sorgusunun sonucu (JSON satirlari) verilecek.
Bunu kisa, net, Turkce 1-3 cumlelik analitik bir cevaba cevir.

KURALLAR:
- Asla SQL gosterme.
- Asla email/sifre/PII goruntuleme. Eger sonucta varsa "[gizli]" yaz.
- Sayilari binlik ayracla goster (1.234.567 TL gibi).
- 0 satir gelirse: "Bu kriterlere uygun veri bulunamadi" de.
- Yorum yapma, sadece veriden cikarim yap.
"""


def summarize(question: str, rows: list[dict]) -> str:
    if not rows:
        return "Bu kriterlere uygun veri bulunamadi."

    # Cok satir varsa LLM'e ilk 50'sini ver
    sample = rows[:50]
    payload = {
        "question": question,
        "row_count": len(rows),
        "sample_rows": sample,
    }

    llm = ChatOpenAI(
        model=settings.llm_model,
        temperature=settings.llm_temperature,
        api_key=settings.openai_api_key,
    )
    msgs = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=json.dumps(payload, default=str, ensure_ascii=False)),
    ]
    return llm.invoke(msgs).content.strip()
