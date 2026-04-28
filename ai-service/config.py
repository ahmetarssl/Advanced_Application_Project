import os
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL   = os.getenv("DATABASE_URL", "postgresql://datapulse:pass@localhost:5432/datapulse")
MAX_SQL_RETRIES = 3

DB_SCHEMA_DESCRIPTION = """
Tables (PostgreSQL):

users(id, email, first_name, last_name, gender, role_type, is_active, created_at)
customer_profiles(id, user_id, age, city, country, membership_type, total_spend, items_purchased)
stores(id, owner_id, name, status, country, created_at)
categories(id, parent_id, name)
products(id, store_id, category_id, sku, name, unit_price, currency, stock_quantity, is_active)
orders(id, user_id, store_id, order_number, status, payment_method, grand_total, order_date)
order_items(id, order_id, product_id, quantity, unit_price, line_total)
shipments(id, order_id, warehouse_block, mode, status, customer_rating, shipped_at, delivered_at)
reviews(id, user_id, product_id, star_rating, sentiment, helpful_votes, created_at)

Enums:
- role_type_enum: ADMIN, CORPORATE, INDIVIDUAL
- order_status_enum: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED
- shipment_mode_enum: AIR, SHIP, ROAD, RAIL
- sentiment_enum: POSITIVE, NEUTRAL, NEGATIVE
"""

AGENT_CONFIGS = {
    "guardrails_agent": {
        "role": "Security and Scope Manager",
        "system_prompt": (
            "You are a strict guardrails system. Your job is to classify a user's question "
            "into exactly one of: GREETING, OUT_OF_SCOPE, IN_SCOPE.\n"
            "IN_SCOPE means the question can be answered from an e-commerce analytics database "
            "containing users, products, orders, shipments, reviews.\n"
            "Respond with ONLY a JSON object: "
            '{"classification": "IN_SCOPE|OUT_OF_SCOPE|GREETING", "reason": "..."}'
        ),
    },
    "sql_agent": {
        "role": "SQL Expert",
        "system_prompt": (
            "You are a senior PostgreSQL developer. Generate a single valid SELECT query. "
            "Never use INSERT/UPDATE/DELETE/DROP/ALTER. Use proper JOINs. "
            "Return ONLY the SQL — no markdown, no explanation, no trailing semicolon comments."
        ),
    },
    "analysis_agent": {
        "role": "Data Analyst",
        "system_prompt": (
            "You are a friendly data analyst. Explain query results in 2-4 sentences in plain English. "
            "Highlight the most important insight. Do not repeat raw numbers exhaustively."
        ),
    },
    "viz_agent": {
        "role": "Visualization Specialist",
        "system_prompt": (
            "You generate clean Plotly (plotly.graph_objects or plotly.express) Python code. "
            "Input: a pandas DataFrame named `df`. Output: a figure assigned to variable `fig`. "
            "No imports needed — `px`, `go`, `pd` are pre-imported. No markdown. No prints."
        ),
    },
    "error_agent": {
        "role": "Error Recovery Specialist",
        "system_prompt": (
            "You diagnose and fix failing PostgreSQL SELECT queries given the schema, "
            "the failed query, and the database error message. "
            "Return ONLY the corrected SQL query."
        ),
    },
}