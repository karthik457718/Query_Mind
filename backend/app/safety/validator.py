import sqlglot
from sqlglot import exp


class UnsafeSQLError(Exception):
    pass


def validate_sql(sql: str) -> str:
    """
    Parses the given SQL and ensures it is a single, safe SELECT statement.
    Raises UnsafeSQLError if anything looks unsafe.
    Returns the validated SQL string if safe.
    """
    try:
        parsed_statements = sqlglot.parse(sql)
    except Exception as e:
        raise UnsafeSQLError(f"Could not parse SQL: {e}")

    # Rule 1: must be exactly one statement
    if len(parsed_statements) != 1:
        raise UnsafeSQLError("Only a single SQL statement is allowed")

    statement = parsed_statements[0]

    if statement is None:
        raise UnsafeSQLError("Empty or unparsable SQL")

    # Rule 2: the top-level statement must be a SELECT
    if not isinstance(statement, exp.Select):
        raise UnsafeSQLError(f"Only SELECT statements are allowed, got: {type(statement).__name__}")

    # Rule 3: block dangerous statement types even if nested (e.g. inside a CTE)
    forbidden_types = (exp.Drop, exp.Delete, exp.Insert, exp.Update, exp.Alter, exp.Create, exp.TruncateTable)
    for node in statement.walk():
        if isinstance(node, forbidden_types):
            raise UnsafeSQLError(f"Forbidden operation detected: {type(node).__name__}")

    return sql