"""
KATMAN 2 - SQL Validator (sqlglot ile parser-tabanli)
=====================================================
LLM ne uretirse uretsin, gercek SQL parser ile her node'u kontrol ediyoruz.
Regex DEGIL - sqlglot AST taramasi. Comment, encoding, alias trick'lerini yakalar.

Kontroller:
  - Tek cumle (multi-statement yok)
  - Sadece SELECT (DDL/DML/DCL yok)
  - UNION/INTERSECT/EXCEPT yok
  - Sadece whitelist'teki tablolar
  - Yasak fonksiyon yok (pg_sleep, dblink, lo_*, vs)
  - LIMIT zorunlu ve <=1000
  - Comment yasak
  - information_schema / pg_catalog yasak
"""
import sqlglot
from sqlglot import expressions as exp

ALLOWED_TABLES = {
    "users",
    "stores",
    "products",
    "categories",
    "customer_profiles",
    "orders",
    "order_items",
    "shipments",
    "reviews",
    "v_orders_summary",
    "v_top_products",
    "ai_query_audit",
}

FORBIDDEN_FUNCTIONS = {
    "pg_read_file", "pg_ls_dir", "pg_read_binary_file",
    "pg_sleep", "pg_sleep_for", "pg_sleep_until",
    "lo_import", "lo_export",
    "dblink", "dblink_exec",
    "copy_to_program", "copy_from_program",
    "current_setting", "set_config",
    "version", "current_database", "current_user", "session_user",
}

FORBIDDEN_SCHEMAS = {"information_schema", "pg_catalog", "pg_toast"}

# sqlglot versiyonuna gore degisebilen node tipleri - guvenli sekilde al
_FORBIDDEN_NODE_TYPES = tuple(filter(None, [
    getattr(exp, "Insert", None),
    getattr(exp, "Update", None),
    getattr(exp, "Delete", None),
    getattr(exp, "Drop", None),
    getattr(exp, "Alter", None),
    getattr(exp, "Create", None),
    getattr(exp, "Command", None),
    getattr(exp, "Truncate", None),
    getattr(exp, "TransactionCmd", None),
    getattr(exp, "AlterColumn", None),
    getattr(exp, "AlterTable", None),
]))


class ValidationError(Exception):
    pass


def validate(sql: str, max_limit: int = 1000) -> str:
    """
    SQL'i validate et. OK ise normalize edilmis SQL'i don, degilse ValidationError firlatir.
    """
    if not sql or not sql.strip():
        raise ValidationError("Bos SQL")

    # Comment yasagi - parser'dan once
    if "--" in sql or "/*" in sql or "*/" in sql:
        raise ValidationError("Comment karakteri yasak")

    # Coklu cumle
    if sql.strip().rstrip(";").count(";") > 0:
        raise ValidationError("Coklu cumle yasak")

    try:
        parsed = sqlglot.parse(sql, read="postgres")
    except sqlglot.errors.ParseError as e:
        raise ValidationError(f"SQL parse hatasi: {e}")

    if len(parsed) != 1:
        raise ValidationError("Sadece tek cumle calistirilabilir")

    tree = parsed[0]

    # Sadece SELECT
    if not isinstance(tree, exp.Select):
        raise ValidationError(f"Sadece SELECT izinli, gelen: {type(tree).__name__}")

    # DDL/DML/DCL node taramasi
    for ftype in _FORBIDDEN_NODE_TYPES:
        if tree.find(ftype):
            raise ValidationError(f"Yasak node tespit edildi: {ftype.__name__}")

    # UNION / INTERSECT / EXCEPT yasagi
    if tree.find(exp.Union) or tree.find(exp.Intersect) or tree.find(exp.Except):
        raise ValidationError("UNION/INTERSECT/EXCEPT yasak")

    # Tablo whitelist
    for t in tree.find_all(exp.Table):
        name = (t.name or "").lower()
        db_arg = t.args.get("db")
        schema = (db_arg.name if db_arg else "").lower()

        if schema in FORBIDDEN_SCHEMAS:
            raise ValidationError(f"Yasak schema: {schema}")
        if schema and schema != "public":
            raise ValidationError(f"Sadece public schema'ya izin var (gelen: {schema})")
        if name not in ALLOWED_TABLES:
            raise ValidationError(f"Izinsiz tablo: {name}")

    # Fonksiyon kara listesi
    for func in tree.find_all(exp.Anonymous):
        fname = (func.name or "").lower()
        if fname in FORBIDDEN_FUNCTIONS:
            raise ValidationError(f"Yasak fonksiyon: {fname}")

    for func in tree.find_all(exp.Func):
        fname = (getattr(func, "sql_name", lambda: None)() or func.key or "").lower()
        if fname in FORBIDDEN_FUNCTIONS:
            raise ValidationError(f"Yasak fonksiyon: {fname}")

    # LIMIT zorunlu ve <= max_limit
    limit_node = tree.args.get("limit")
    if not limit_node:
        tree = tree.limit(max_limit)
    else:
        expression = limit_node.expression
        if isinstance(expression, exp.Literal) and expression.is_int:
            limit_val = int(expression.this)
            if limit_val > max_limit:
                raise ValidationError(f"LIMIT {limit_val} > {max_limit}")

    return tree.sql(dialect="postgres")
