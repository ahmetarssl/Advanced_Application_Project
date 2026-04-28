from langgraph.graph import StateGraph, END
from state import AgentState
from agents import (
    guardrails_node, sql_agent_node, execute_sql_node, error_agent_node,
    analysis_agent_node, decide_viz_node, viz_agent_node, analysis_error_node,
    route_after_guardrails, route_after_execution, route_after_viz_decision,
)

def build_graph():
    g = StateGraph(AgentState)

    g.add_node("guardrails",     guardrails_node)
    g.add_node("sql_agent",      sql_agent_node)
    g.add_node("execute_sql",    execute_sql_node)
    g.add_node("error_agent",    error_agent_node)
    g.add_node("analysis_agent", analysis_agent_node)
    g.add_node("analysis_agent_error", analysis_error_node)
    g.add_node("decide_viz",     decide_viz_node)
    g.add_node("viz_agent",      viz_agent_node)

    g.set_entry_point("guardrails")

    g.add_conditional_edges("guardrails", route_after_guardrails,
                            {"sql_agent": "sql_agent", "end": END})
    g.add_edge("sql_agent", "execute_sql")
    g.add_conditional_edges("execute_sql", route_after_execution, {
        "error_agent": "error_agent",
        "analysis_agent": "analysis_agent",
        "analysis_agent_error": "analysis_agent_error",
    })
    g.add_edge("error_agent", "execute_sql")   # retry loop
    g.add_edge("analysis_agent_error", END)
    g.add_edge("analysis_agent", "decide_viz")
    g.add_conditional_edges("decide_viz", route_after_viz_decision,
                            {"viz_agent": "viz_agent", "end": END})
    g.add_edge("viz_agent", END)

    return g.compile()

graph = build_graph()