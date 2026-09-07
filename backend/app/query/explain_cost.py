# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, text

def get_query_plan(connection_url: str, sql: str) -> dict:
    """
    Runs EXPLAIN (FORMAT JSON) to get the estimated cost and rows.
    Supports PostgreSQL and MySQL.
    """
    engine = create_engine(connection_url)

    is_postgres = "postgresql" in connection_url
    is_mysql = "mysql" in connection_url

    if not is_postgres and not is_mysql:
        return {"estimated_rows": None, "estimated_cost": None, "plan_summary": "Estimate not supported for this DB"}

    explain_prefix = "EXPLAIN (FORMAT JSON)" if is_postgres else "EXPLAIN FORMAT=JSON"
    explain_query = f"{explain_prefix} {sql}"

    try:
        with engine.connect() as conn:
            result = conn.execute(text(explain_query)).fetchone()
            
            if is_postgres:
                plan = result[0][0]["Plan"]
                return {
                    "estimated_rows": plan.get("Plan Rows"),
                    "estimated_cost": plan.get("Total Cost"),
                    "plan_summary": plan.get("Node Type"),
                }
            elif is_mysql:
                # MySQL returns a string that we'd need to parse, or sometimes an object
                import json
                try:
                    plan = json.loads(result[0]) if isinstance(result[0], str) else result[0]
                    query_block = plan.get("query_block", {})
                    cost_info = query_block.get("cost_info", {})
                    return {
                        "estimated_rows": query_block.get("table", {}).get("rows"),
                        "estimated_cost": cost_info.get("query_cost"),
                        "plan_summary": "MySQL Plan",
                    }
                except Exception:
                    return {"estimated_rows": None, "estimated_cost": None, "plan_summary": "Could not parse MySQL plan"}
    except Exception as e:
        return {"estimated_rows": None, "estimated_cost": None, "plan_summary": f"Could not generate estimate: {str(e)}"}
