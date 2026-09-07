from sqlalchemy import create_engine, inspect


def get_schema_text(connection_url: str) -> str:
    """
    Connects to the given database and returns a text description
    of all tables and their columns, formatted for an LLM prompt.
    """
    engine = create_engine(connection_url)
    inspector = inspect(engine)

    table_names = inspector.get_table_names()

    if not table_names:
        return "No tables found in this database."

    schema_lines = []
    for table_name in table_names:
        schema_lines.append(f"Table: {table_name}")
        columns = inspector.get_columns(table_name)
        for col in columns:
            schema_lines.append(f"  - {col['name']} ({col['type']})")
        schema_lines.append("")  # blank line between tables

    return "\n".join(schema_lines)