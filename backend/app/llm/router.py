from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from groq import Groq

from app.auth.dependencies import get_current_user, get_db
from app.db.models import User, Connection
from app.connections.db_test import build_connection_url
from app.connections.encryption import decrypt_password
from app.schema.schema_embedder import get_relevant_tables
from app.llm.generate_sql import generate_sql
from app.safety.validator import validate_sql, UnsafeSQLError
from app.query.executor import execute_query

router = APIRouter(prefix="/query", tags=["query"])


# ── Request schemas ──────────────────────────────────────────────

class HistoryEntry(BaseModel):
    question: str
    sql: str


class AskRequest(BaseModel):
    connection_id: int
    question: str
    history: list[HistoryEntry] = []


class ExecuteRequest(BaseModel):
    connection_id: int
    sql: str
    question: str | None = None


class ExplainRequest(BaseModel):
    sql: str


# ── Helpers ──────────────────────────────────────────────────────

def _get_connection_url(connection_id: int, current_user: User, db: Session) -> tuple[str, str]:
    connection = (
        db.query(Connection)
        .filter(Connection.id == connection_id, Connection.user_id == current_user.id)
        .first()
    )
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    plain_password = decrypt_password(connection.encrypted_password)
    url = build_connection_url(
        connection.engine_type.value,
        connection.username,
        plain_password,
        connection.host,
        connection.port,
        connection.database_name,
    )
    return url, connection.nickname


def _history_to_dicts(history: list[HistoryEntry]) -> list[dict]:
    """Convert pydantic HistoryEntry list to plain dicts for the prompt builder."""
    return [{"question": h.question, "sql": h.sql} for h in history]


# ── Endpoints ────────────────────────────────────────────────────

@router.post("/generate")
def generate_query(
    payload: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url, _ = _get_connection_url(payload.connection_id, current_user, db)
    schema_text = get_relevant_tables(url, payload.question)
    sql = generate_sql(schema_text, payload.question, history=_history_to_dicts(payload.history))

    # ── Ambiguity handling (Feature 2) ───────────────────────────
    if sql.startswith("CLARIFY:"):
        return {"type": "clarification", "question": sql[len("CLARIFY:"):].strip()}

    if sql == "NO_VALID_QUERY":
        raise HTTPException(status_code=400, detail="Could not generate a valid query for this question")

    try:
        validated_sql = validate_sql(sql)
    except UnsafeSQLError as e:
        raise HTTPException(status_code=400, detail=f"Generated SQL failed safety check: {e}")

    return {"type": "sql", "generated_sql": validated_sql}


@router.post("/estimate")
def estimate_sql_route(
    payload: ExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url, _ = _get_connection_url(payload.connection_id, current_user, db)
    
    try:
        validated_sql = validate_sql(payload.sql)
    except UnsafeSQLError as e:
        raise HTTPException(status_code=400, detail=f"Query failed safety check: {e}")

    from app.query.explain_cost import get_query_plan
    estimate = get_query_plan(url, validated_sql)
    return estimate


@router.post("/ask")
def ask_question(
    payload: AskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url, _ = _get_connection_url(payload.connection_id, current_user, db)
    schema_text = get_relevant_tables(url, payload.question)
    sql = generate_sql(schema_text, payload.question, history=_history_to_dicts(payload.history))

    if sql.startswith("CLARIFY:"):
        return {"type": "clarification", "question": sql[len("CLARIFY:"):].strip()}

    if sql == "NO_VALID_QUERY":
        raise HTTPException(status_code=400, detail="Could not generate a valid query for this question")

    try:
        validated_sql = validate_sql(sql)
    except UnsafeSQLError as e:
        raise HTTPException(status_code=400, detail=f"Generated SQL failed safety check: {e}")

    retried = False
    try:
        results = execute_query(url, validated_sql)
    except Exception as e:
        try:
            from app.llm.retry import retry_sql
            fixed_sql = retry_sql(schema_text, payload.question, validated_sql, str(e))
            validated_sql = fixed_sql
            retried = True
            results = execute_query(url, validated_sql)
        except Exception as retry_e:
            raise HTTPException(status_code=400, detail=f"Query execution failed (auto-retry also failed): {str(retry_e)}")

    from app.query.explain_cost import get_query_plan
    estimate = get_query_plan(url, validated_sql)

    return {
        "type": "sql",
        "question": payload.question,
        "generated_sql": validated_sql,
        "columns": results["columns"],
        "rows": results["rows"],
        "retried": retried,
        "estimate": estimate,
    }


@router.post("/execute")
def execute_sql_route(
    payload: ExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url, _ = _get_connection_url(payload.connection_id, current_user, db)

    try:
        validated_sql = validate_sql(payload.sql)
    except UnsafeSQLError as e:
        raise HTTPException(status_code=400, detail=f"Query failed safety check: {e}")

    retried = False
    try:
        results = execute_query(url, validated_sql)
    except Exception as e:
        if payload.question:
            try:
                schema_text = get_relevant_tables(url, payload.question)
                from app.llm.retry import retry_sql
                fixed_sql = retry_sql(schema_text, payload.question, validated_sql, str(e))
                validated_sql = fixed_sql
                retried = True
                results = execute_query(url, validated_sql)
            except Exception as retry_e:
                raise HTTPException(status_code=400, detail=f"Query execution failed (auto-retry also failed): {str(retry_e)}")
        else:
            raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")

    # Feature 8: Save to query history if successful and we have a question
    if payload.question:
        from app.db.models import QueryHistory
        history_record = QueryHistory(
            user_id=current_user.id,
            connection_id=payload.connection_id,
            question=payload.question,
            generated_sql=validated_sql
        )
        db.add(history_record)
        db.commit()

    return {
        "generated_sql": validated_sql,
        "columns": results["columns"],
        "rows": results["rows"],
        "retried": retried,
    }


@router.get("/history/{connection_id}")
def get_query_history(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.db.models import QueryHistory
    
    # Verify connection ownership
    _get_connection_url(connection_id, current_user, db)
    
    history_records = (
        db.query(QueryHistory)
        .filter(QueryHistory.connection_id == connection_id, QueryHistory.user_id == current_user.id)
        .order_by(QueryHistory.created_at.desc())
        .limit(50)
        .all()
    )
    
    return [
        {
            "id": r.id,
            "question": r.question,
            "sql": r.generated_sql,
            "created_at": r.created_at
        }
        for r in history_records
    ]


@router.post("/explain")
def explain_sql_route(
    payload: ExplainRequest,
    current_user: User = Depends(get_current_user),
):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = f"""Explain what this SQL query does, in one or two plain-English sentences a non-technical person could understand. Do not repeat the SQL back. Just the explanation.

SQL:
{payload.sql}

Explanation:"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=150,
    )
    explanation = response.choices[0].message.content.strip()
    return {"explanation": explanation}