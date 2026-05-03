"""
PostgreSQL baglantisi - ai_readonly user'i ile + RLS context.
"""
from contextlib import contextmanager
from typing import Any
import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from config import settings

_pool: ConnectionPool | None = None
ALLOWED_ROLES = {"ADMIN", "CORPORATE", "INDIVIDUAL"}


def get_pool() -> ConnectionPool:
    global _pool
    if _pool is None:
        conninfo = (
            f"host={settings.db_host} port={settings.db_port} "
            f"dbname={settings.db_name} user={settings.db_user} "
            f"password={settings.db_password} "
            f"options='-c statement_timeout={settings.query_timeout_seconds}s'"
        )
        _pool = ConnectionPool(conninfo, min_size=1, max_size=5, kwargs={"autocommit": False})
    return _pool


@contextmanager
def rls_session(user_id: int, user_role: str, store_id: int | None):
    if user_role not in ALLOWED_ROLES:
        raise ValueError(f"Gecersiz rol: {user_role}")
    uid = int(user_id)
    sid = int(store_id) if store_id is not None else None

    pool = get_pool()
    with pool.connection() as conn:
        with conn.cursor() as cur:
            # SET LOCAL parametre kabul etmiyor; degerleri yukarida int/whitelist ile dogruladik
            cur.execute(f"SET LOCAL app.user_role = '{user_role}'")
            cur.execute(f"SET LOCAL app.user_id = '{uid}'")
            if sid is not None:
                cur.execute(f"SET LOCAL app.store_id = '{sid}'")
        yield conn


def execute_safe(sql: str, user_id: int, user_role: str,
                 store_id: int | None) -> list[dict[str, Any]]:
    with rls_session(user_id, user_role, store_id) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(sql)
            try:
                rows = cur.fetchall()
                return [dict(r) for r in rows]
            except psycopg.ProgrammingError:
                return []