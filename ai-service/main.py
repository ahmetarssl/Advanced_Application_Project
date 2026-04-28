from fastapi import FastAPI
from pydantic import BaseModel
from graph import graph

app = FastAPI()

class ChatRequest(BaseModel):
    question: str
    user_id: int
    user_role: str
    store_id: int | None = None

@app.post("/chat/ask")
def ask(req: ChatRequest):
    initial_state = {
        "question": req.question,
        "user_id": req.user_id,
        "user_role": req.user_role,
        "store_id": req.store_id,
        "iteration_count": 0,
    }
    result = graph.invoke(initial_state)
    return {
        "answer":    result.get("final_answer"),
        "sql":       result.get("sql_query"),
        "rows":      result.get("query_result"),
        "chart":     result.get("chart_json"),
        "in_scope":  result.get("is_in_scope", False),
    }