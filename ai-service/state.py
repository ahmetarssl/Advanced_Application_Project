from typing import TypedDict, Optional, List, Dict, Any, Literal

class AgentState(TypedDict, total=False):
    # Input
    question: str
    user_id: int
    user_role: Literal["ADMIN", "CORPORATE", "INDIVIDUAL"]
    store_id: Optional[int]          # for corporate users
    conversation_history: List[Dict[str, str]]

    # Guardrails output
    is_in_scope: bool
    is_greeting: bool
    rejection_reason: Optional[str]

    # SQL pipeline
    sql_query: Optional[str]
    query_result: Optional[List[Dict[str, Any]]]
    error: Optional[str]
    iteration_count: int

    # Post-processing
    final_answer: Optional[str]
    needs_visualization: bool
    visualization_code: Optional[str]
    chart_json: Optional[str]