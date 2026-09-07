from sqlalchemy import create_engine, text
from decimal import Decimal
from datetime import date, datetime


def _serialize_value(value):
    """Convert DB-specific types into JSON-friendly Python types."""
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def execute_query(connection_url: str, sql: str) -> dict:
    """
    Executes a validated SELECT query against the given database
    and returns column names + rows as JSON-friendly data.
    """
    engine = create_engine(connection_url)

    with engine.connect() as conn:
        # execution_options(readonly...) isn't universally supported across drivers,
        # so our real safety net remains the sqlglot validation from Lesson 8 —
        # this connection is just for running the already-validated SELECT.
        result = conn.execute(text(sql))
        columns = list(result.keys())
        rows = [[_serialize_value(value) for value in row] for row in result.fetchall()]

    return {"columns": columns, "rows": rows}
