# DataPulse

**Natural-language analytics for e-commerce data.** Ask business questions in plain language and get back SQL-backed answers, tables, and auto-generated charts — no query writing required.

![Angular](https://img.shields.io/badge/Angular_21-DD0031?logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot_3-6DB33F?logo=springboot&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o--mini-412991?logo=openai&logoColor=white)

---

## Overview

DataPulse is a full-stack analytics platform that lets users explore e-commerce data through natural language. A user asks *"What were the top 5 selling products last month?"* and a multi-agent AI pipeline converts the question into a validated SQL query, executes it safely, and returns the result as a human-readable summary with an optional chart.

The standout part is the **security-first Text2SQL pipeline**. It does not simply generate SQL and run it. Every query passes through five layers — prompt injection detection, LLM-based SQL generation, AST-level structural validation, read-only execution, and a summarization step — before any result reaches the user. No raw SQL is ever shown, no credentials or PII columns are accessible, and the database user has zero write privileges.

---

## Architecture

```
┌──────────────────────┐      REST / JWT      ┌──────────────────────────┐
│  Angular 21 Frontend │ ◄──────────────────► │  Spring Boot 3 Backend   │
│  TypeScript, Chart.js│                      │  Auth · Business Logic   │
└──────────────────────┘                      │  Role-based API          │
                                              └────────────┬─────────────┘
                                                            │  HTTP (internal only)
                                               ┌────────────▼─────────────┐
                                               │  FastAPI AI Service       │
                                               │  LangGraph multi-agent    │
                                               │  pipeline (port 8001)     │
                                               └────────────┬─────────────┘
                                                            │  read-only connection
                                               ┌────────────▼─────────────┐
                                               │  PostgreSQL               │
                                               │  ai_readonly user         │
                                               └──────────────────────────┘
```

The AI service is not publicly reachable. Only the Spring Boot backend can call it, and it does so with the authenticated user's role and store context on every request.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Chart.js, RxJS |
| Backend | Java 21, Spring Boot 3, Spring Security, JPA / Hibernate |
| AI Service | Python 3.12, FastAPI, LangGraph, LangChain, OpenAI GPT-4o-mini |
| SQL Safety | sqlglot (AST-based validation — not regex) |
| Database | PostgreSQL 15 |
| Auth | Stateless JWT, BCrypt (cost 12) |

---

## Text2SQL Pipeline

User input travels through five sequential agents before any SQL runs. If any layer rejects the request, the pipeline short-circuits and returns a blocked response — the database is never contacted.

```
User Question
      │
      ▼
[1] Guardrails ────────── Regex-based detection of prompt injection patterns
      │                   (English + Turkish), PII keyword blocking, zero-width
      │                   character stripping, 500-character length cap.
      │                   Handles greetings separately (no SQL needed).
      ▼
[2] SQL Agent ─────────── LLM (GPT-4o-mini) receives a fixed schema description
      │                   and strict generation rules. User input is wrapped in
      │                   <user_question> tags to prevent instruction injection.
      │                   Output must be a single SELECT — no CTEs, no UNION,
      │                   no DDL/DML, no comments.
      ▼
[3] SQL Validator ──────── sqlglot parses the SQL into an AST and checks:
      │                   · SELECT-only (no INSERT / UPDATE / DELETE / DROP)
      │                   · Table whitelist (only allowed domain tables)
      │                   · Forbidden function blacklist (pg_sleep, dblink, …)
      │                   · No forbidden schemas (pg_catalog, information_schema)
      │                   · LIMIT required and ≤ 1000
      │                   · No UNION / INTERSECT / EXCEPT
      │                   · No SQL comments
      ▼
[4] Execution ──────────── Validated SQL runs under a PostgreSQL user that has
      │                   SELECT-only privileges. The Spring Boot backend applies
      │                   row-level scoping per authenticated user (store_id / role).
      ▼
[5] Analysis + Chart ───── An LLM summarizes the result rows into 1–3 sentences.
                          A deterministic function inspects column types and
                          produces a chart spec: date + numeric → line chart,
                          string + numeric → bar chart. Rendered by Chart.js.
```

---

## Role-Based Access Control

Three user roles control both API access and AI query scope:

| Role | Scope |
|---|---|
| `ADMIN` | Full platform — all stores, all users, global KPIs and analytics |
| `CORPORATE` | Own store only — orders, products, reviews, shipments, revenue |
| `INDIVIDUAL` | Own orders, customer profile, purchase history |

Spring Security enforces role rules at the controller level. The AI service receives `user_role` and `store_id` on every chat request so the SQL agent automatically scopes generated queries.

---

## Project Structure

```
├── backend/
│   └── src/main/java/com/datapulse/
│       ├── ai/           # ChatService, AiQueryService, query audit log
│       ├── config/       # CORS, DataSource
│       ├── domain/       # JPA entities (User, Order, Product, Store, …)
│       ├── repository/   # Spring Data JPA
│       ├── security/     # JWT filter, SecurityConfig, BCrypt
│       ├── service/      # Business logic
│       └── web/          # REST controllers + DTOs
│
├── ai-service/
│   ├── agents/
│   │   ├── guardrails.py      # Layer 1 — injection & PII detection
│   │   ├── sql_agent.py       # Layer 2 — NL → SQL via LLM
│   │   ├── sql_validator.py   # Layer 3 — AST validation (sqlglot)
│   │   ├── analysis.py        # Layer 4 — result summarization via LLM
│   │   └── visualization.py   # Layer 5 — deterministic chart spec
│   ├── graph.py          # LangGraph pipeline definition
│   ├── state.py          # Shared pipeline state (TypedDict)
│   ├── config.py         # Pydantic settings (loaded from .env)
│   └── main.py           # FastAPI entry point
│
└── datapulse-frontend/
    └── src/app/
        ├── components/   # Dashboard, Chat, Orders, Products, …
        ├── services/     # HTTP client wrappers
        └── guards/       # Route auth guards
```

---

## Domain Model

```
users ──┬── stores (owner_id)
        ├── orders ──── order_items ──── products ──── categories
        ├── customer_profiles
        └── reviews ──── products

orders ── shipments  (1 : 1)
```

---

## Getting Started

### Prerequisites

- Java 21, Maven
- Python 3.12
- Node.js 20+, Angular CLI
- PostgreSQL 15+
- OpenAI API key

### 1. Database

```sql
CREATE DATABASE datapulse;

-- Read-only user for the AI service (no write access)
CREATE USER ai_readonly WITH PASSWORD 'your_password';
GRANT CONNECT ON DATABASE datapulse TO ai_readonly;
GRANT USAGE ON SCHEMA public TO ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly;
```

### 2. Backend

```bash
cd backend
# Edit src/main/resources/application.properties
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/datapulse
spring.datasource.username=datapulse_user
spring.datasource.password=your_password
app.jwt.secret=your_jwt_secret_min_32_chars
app.ai-service.base-url=http://localhost:8001
```

### 3. AI Service

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS

pip install -r requirements.txt
```

Create a `.env` file:
```env
OPENAI_API_KEY=sk-...
DB_HOST=localhost
DB_NAME=datapulse
DB_USER=ai_readonly
DB_PASSWORD=your_password
```

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Frontend

```bash
cd datapulse-frontend
npm install
ng serve
# Runs on http://localhost:4200
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/dashboard/stats` | Any | KPI summary for current user |
| GET | `/api/orders` | Any | Paginated order list |
| GET | `/api/products` | Public | Product catalog |
| POST | `/api/checkout` | Any | Place an order |
| POST | `/api/chat/ask` | Any | Natural language analytics query |
| GET | `/api/admin/users` | ADMIN | All platform users |
| GET | `/api/admin/stores` | ADMIN | All stores |

---

## Security Design

- Passwords hashed with BCrypt (cost factor 12); never stored in plain text
- JWT tokens are stateless — no session storage on the server
- The AI service listens only on `localhost`; it is not accessible from outside the server
- `users.email` and `users.password` are excluded from the AI schema description and blocked by the guardrails layer
- Every AI-generated SQL query is structurally validated by sqlglot before reaching the database — prompt injection cannot produce executable DML

---

## License

MIT

---

Built by [Ahmet Arslan](https://github.com/ahmetarssl) · [LinkedIn](https://www.linkedin.com/in/ahmet-arslan-739840285)
