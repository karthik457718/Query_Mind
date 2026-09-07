from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.db.models import User, Connection
from app.connections.db_test import build_connection_url
from app.connections.encryption import decrypt_password
from app.schema.schema_reader import get_schema_text

router = APIRouter(prefix="/schema", tags=["schema"])


@router.get("/{connection_id}")
def read_schema(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    schema_text = get_schema_text(url)
    return {"schema": schema_text}