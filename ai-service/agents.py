import json
import re
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import AGENT_CONFIGS, DB_SCHEMA_DESCRIPTION, OPENAI_API_KEY, MAX_SQL_RETRIES
from state import AgentState

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=OPENAI_API_KEY)

def _scope_filter_for_role(state: AgentState) -> str:
    """Return SQL predicates that MUST be applied based on the user's role."""
    role = state.get("user_role")
    if role == "INDIVIDUAL":
        return f"-- Restrict to user_id = {state['user_id']}"
    if role == "CORPORATE":
        return f"-- Restrict to store_id = {state['store_id']}"
    return "-- ADMIN: no row-level restriction"

# ---------- Node 1: Guardrails ----------
def guardrails_node(state: AgentState) -> Dict[str, Any]:
    cfg = AGENT_CONFIGS["guardrails_agent"]
    resp = llm.invoke([
        SystemMessage(content=cfg["system_prompt"]),
        HumanMessage(content=f'Question: "{state["question"]}"')
    ])
    try:
        parsed = json.loads(resp.content)
        cls = parsed.get("classification", "OUT_OF_SCOPE")
    except Exception:
        cls = "OUT_OF_SCOPE"

    if cls == "GREETING":
        return {
            "is_greeting": True, "is_in_scope": False,
            "final_answer": "Hi! I'm your e-commerce data assistant. "
                            "Ask me about sales, customers, orders, shipments, or reviews.",
        }
    if cls == "OUT_OF_SCOPE":
        return {
            "is_greeting": False, "is_in_scope": False,
            "rejection_reason": parsed.get("reason", "Out of scope"),
            "final_answer": "I can only answer questions about the e-commerce analytics data "
                            "(sales, customers, orders, products, shipments, reviews).",
        }
    return {"is_greeting": False, "is_in_scope": True, "iteration_count": 0}

# ---------- Node 2: SQL generation ----------
def sql_agent_node(state: AgentState) -> Dict[str, Any]:
    cfg = AGENT_CONFIGS["sql_agent"]
    prompt = (
        f"Schema:\n{DB_SCHEMA_DESCRIPTION}\n\n"
        f"Role-based constraint:\n{_scope_filter_for_role(state)}\n\n"
        f"User question: {state['question']}\n\n"
        "Generate the SQL SELECT query."
    )
    resp = llm.invoke([SystemMessage(content=cfg["system_prompt"]), HumanMessage(content=prompt)])
    sql = re.sub(r"```(?:sql)?", "", resp.content).strip().rstrip(";")
    return {"sql_query": sql}

# ---------- Node 3: Execute SQL ----------
def execute_sql_node(state: AgentState) -> Dict[str, Any]:
    from sqlalchemy import create_engine, text
    from config import DATABASE_URL

    # Hard safety guard: block any non-SELECT
    sql = state["sql_query"].strip()
    if not re.match(r"(?is)^\s*(with|select)\b", sql):
        return {"error": "Only SELECT queries are permitted.", "query_result": None}
    forbidden = r"\b(insert|update|delete|drop|alter|truncate|grant|revoke)\b"
    if re.search(forbidden, sql, re.IGNORECASE):
        return {"error": "Disallowed SQL keyword detected.", "query_result": None}

    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            rows = [dict(r._mapping) for r in result.fetchmany(500)]
        return {"query_result": rows, "error": None}
    except Exception as e:
        iteration = state.get("iteration_count", 0) + 1
        return {"error": str(e), "iteration_count": iteration, "query_result": None}

# ---------- Node 4: Error recovery ----------
def error_agent_node(state: AgentState) -> Dict[str, Any]:
    cfg = AGENT_CONFIGS["error_agent"]
    prompt = (
        f"Schema:\n{DB_SCHEMA_DESCRIPTION}\n\n"
        f"Failing query:\n{state['sql_query']}\n\n"
        f"Database error:\n{state['error']}\n\n"
        "Return the corrected SELECT query only."
    )
    resp = llm.invoke([SystemMessage(content=cfg["system_prompt"]), HumanMessage(content=prompt)])
    fixed = re.sub(r"```(?:sql)?", "", resp.content).strip().rstrip(";")
    return {"sql_query": fixed, "error": None}

# ---------- Node 5: Analysis ----------
def analysis_agent_node(state: AgentState) -> Dict[str, Any]:
    cfg = AGENT_CONFIGS["analysis_agent"]
    sample = state["query_result"][:20]
    prompt = (
        f"Question: {state['question']}\n"
        f"Row count: {len(state['query_result'])}\n"
        f"Sample rows: {json.dumps(sample, default=str)}\n\n"
        "Provide a concise natural-language answer."
    )
    resp = llm.invoke([SystemMessage(content=cfg["system_prompt"]), HumanMessage(content=prompt)])
    return {"final_answer": resp.content.strip()}

# ---------- Node 6: Decide if viz needed ----------
def decide_viz_node(state: AgentState) -> Dict[str, Any]:
    rows = state.get("query_result") or []
    needs = (len(rows) >= 2) and any(
        isinstance(v, (int, float)) for v in (rows[0].values() if rows else [])
    )
    return {"needs_visualization": needs}

# ---------- Node 7: Visualization ----------
def viz_agent_node(state: AgentState) -> Dict[str, Any]:
    cfg = AGENT_CONFIGS["viz_agent"]
    columns = list(state["query_result"][0].keys())
    prompt = (
        f"DataFrame columns: {columns}\n"
        f"Rows: {len(state['query_result'])}\n"
        f"Question context: {state['question']}\n\n"
        "Generate Plotly code that creates variable `fig`."
    )
    resp = llm.invoke([SystemMessage(content=cfg["system_prompt"]), HumanMessage(content=prompt)])
    code = re.sub(r"```(?:python)?", "", resp.content).strip()

    # Execute in a sandboxed namespace to get the figure JSON
    import pandas as pd
    import plotly.express as px
    import plotly.graph_objects as go
    df = pd.DataFrame(state["query_result"])
    local_ns = {"df": df, "pd": pd, "px": px, "go": go}
    try:
        exec(code, local_ns)
        fig = local_ns.get("fig")
        chart_json = fig.to_json() if fig is not None else None
    except Exception as e:
        chart_json = None
    return {"visualization_code": code, "chart_json": chart_json}

# ---------- Routing functions ----------
def route_after_guardrails(state: AgentState) -> str:
    if state.get("is_in_scope"):
        return "sql_agent"
    return "end"

def route_after_execution(state: AgentState) -> str:
    if state.get("error"):
        if state.get("iteration_count", 0) >= MAX_SQL_RETRIES:
            return "analysis_agent_error"
        return "error_agent"
    return "analysis_agent"

def route_after_viz_decision(state: AgentState) -> str:
    return "viz_agent" if state.get("needs_visualization") else "end"

def analysis_error_node(state: AgentState) -> Dict[str, Any]:
    return {"final_answer": f"I couldn't retrieve those results after {MAX_SQL_RETRIES} attempts. "
                            f"Last error: {state.get('error')}"}