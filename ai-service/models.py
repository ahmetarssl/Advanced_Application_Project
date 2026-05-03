"""Pydantic schemas - request/response."""
from typing import Any, Literal
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    user_id: int
    user_role: Literal["ADMIN", "CORPORATE", "INDIVIDUAL"]
    store_id: int | None = None


class ChatResponse(BaseModel):
    blocked: bool = False
    reason: str | None = None
    sql: str | None = None
    answer: str = ""
    rows: list[dict[str, Any]] = []
    chart: dict[str, Any] | None = None
