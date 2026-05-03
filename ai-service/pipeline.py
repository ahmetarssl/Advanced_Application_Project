"""
LangGraph Pipeline - butun agent'lari birbirine bagliyor.

State machine:

   START
     |
     v
  guardrail_check  --(BLOCKED)--> done(blocked)
     |  (IN_SCOPE)         (GREETING)--> done(greeting)
     v
  generate_sql
     |
     v
  validate_sql  --(invalid)--> done(blocked)
     |
     v
  execute_with_rls --(error)--> error_recovery --> done(error)
     |
     v
  analyze_results
     |
     v
  build_chart
     |
     v
  scrub_output
     |
     v
   END
"""
from typing import Any, Literal, TypedDict
from langgraph.graph import StateGraph, END

from agents import guardrails, sql_agent, sql_validator, analysis, visualization, output_filter, error_agent
from db import execute_safe


class State(TypedDict, total=False):
    # Input
    question: str
    user_id: int
    user_role: str
    store_id: int | None

    # Pipeline durumu
    classification: str            # IN_SCOPE / BLOCKED / GREETING
    block_reason: str | None
    sql: str | None
    rows: list[dict[str, Any]]
    answer: str
    chart: dict[str, Any] | None
    error: str | None


# ---------- Nodes ----------

def node_guardrail(state: State) -> State:
    cls, reason = guardrails.classify(state["question"])
    state["classification"] = cls
    state["block_reason"] = reason
    return state


def node_greeting(state: State) -> State:
    state["answer"] = guardrails.greeting_response()
    return state


def node_blocked(state: State) -> State:
    state["answer"] = "Bu soru sistem politikalari nedeniyle yanitlanamiyor."
    return state


def node_generate_sql(state: State) -> State:
    state["sql"] = sql_agent.generate_sql(state["question"])
    return state


def node_validate_sql(state: State) -> State:
    try:
        state["sql"] = sql_validator.validate(state["sql"])
    except sql_validator.ValidationError as e:
        state["classification"] = "BLOCKED"
        state["block_reason"]   = f"SQL guvenli degil: {e}"
    return state


def node_execute(state: State) -> State:
    try:
        state["rows"] = execute_safe(
            state["sql"],
            state["user_id"],
            state["user_role"],
            state.get("store_id"),
        )
    except Exception as e:
        state["error"] = error_agent.safe_error_message(str(e))
        state["rows"] = []
    return state


def node_analyze(state: State) -> State:
    if state.get("error"):
        state["answer"] = state["error"]
    else:
        state["answer"] = analysis.summarize(state["question"], state["rows"])
    return state


def node_chart(state: State) -> State:
    state["chart"] = visualization.suggest_chart(state.get("rows", []))
    return state


def node_scrub(state: State) -> State:
    state["answer"] = output_filter.scrub_text(state.get("answer", ""))
    state["rows"]   = output_filter.scrub_rows(state.get("rows", []))
    return state


# ---------- Routers ----------

def route_after_guardrail(state: State) -> Literal["greeting", "blocked", "generate"]:
    if state["classification"] == "GREETING":
        return "greeting"
    if state["classification"] == "BLOCKED":
        return "blocked"
    return "generate"


def route_after_validate(state: State) -> Literal["execute", "blocked"]:
    return "blocked" if state["classification"] == "BLOCKED" else "execute"


# ---------- Graph build ----------

def build_graph():
    g = StateGraph(State)

    g.add_node("guardrail",    node_guardrail)
    g.add_node("greeting",     node_greeting)
    g.add_node("blocked",      node_blocked)
    g.add_node("generate_sql", node_generate_sql)
    g.add_node("validate_sql", node_validate_sql)
    g.add_node("execute",      node_execute)
    g.add_node("analyze",      node_analyze)
    g.add_node("chart",        node_chart)
    g.add_node("scrub",        node_scrub)

    g.set_entry_point("guardrail")

    g.add_conditional_edges("guardrail", route_after_guardrail, {
        "greeting":  "greeting",
        "blocked":   "blocked",
        "generate":  "generate_sql",
    })
    g.add_edge("greeting", "scrub")
    g.add_edge("blocked",  "scrub")

    g.add_edge("generate_sql", "validate_sql")
    g.add_conditional_edges("validate_sql", route_after_validate, {
        "execute":  "execute",
        "blocked":  "blocked",
    })

    g.add_edge("execute", "analyze")
    g.add_edge("analyze", "chart")
    g.add_edge("chart",   "scrub")
    g.add_edge("scrub",   END)

    return g.compile()


graph = build_graph()