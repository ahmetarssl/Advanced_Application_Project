"""
DataPulse AI Service - FastAPI entry point.

Calistirma:
  uvicorn main:app --host 0.0.0.0 --port 8001 --reload
"""
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models import ChatRequest, ChatResponse
from pipeline import graph

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger("datapulse-ai")

app = FastAPI(title="DataPulse AI Service", version="1.0.0")

# Sadece backend'in cagirmasina izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat/ask", response_model=ChatResponse)
def ask(req: ChatRequest):
    """
    Backend'den gelen sorgu burada islenir.
    Tum savunma katmanlari pipeline icinde calisir.
    """
    try:
        result = graph.invoke({
            "question":  req.question,
            "user_id":   req.user_id,
            "user_role": req.user_role,
            "store_id":  req.store_id,
        })
    except Exception as e:
        logger.exception("Pipeline failure")
        raise HTTPException(500, "AI servisinde beklenmedik bir hata olustu")

    return ChatResponse(
        blocked = (result.get("classification") == "BLOCKED"),
        reason  = result.get("block_reason"),
        sql     = result.get("sql"),
        answer  = result.get("answer", ""),
        rows    = result.get("rows", []),
        chart   = result.get("chart"),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)