"""
Error Agent - SQL hata verirse kullaniciya guvenli bir mesaj uretir.
DB hatasini ASLA ham olarak dondurmuyoruz (information disclosure).
"""
import logging

logger = logging.getLogger("datapulse-ai.error_agent")

GENERIC_ERROR = (
    "Sorgun sirasinda bir hata olustu. "
    "Sorunu farkli bir sekilde sormayi deneyebilirsin, "
    "ya da daha az filtre ile tekrar dene."
)


def safe_error_message(exception_text: str) -> str:
    logger.warning("SQL execution error: %s", exception_text)
    return GENERIC_ERROR
