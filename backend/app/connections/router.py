from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.db.models import User, Connection
from app.connections.schemas import ConnectionCreate, ConnectionResponse
from app.connections.db_test import build_connection_url, test_connection
from app.connections.encryption import encrypt_password

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/", response_model=ConnectionResponse)
def create_connection(
    payload: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    url = build_connection_url(
        payload.engine_type.value,
        payload.username,
        payload.password,
        payload.host,
        payload.port,
        payload.database_name,
    )

    success, message = test_connection(url)
    if not success:
        raise HTTPException(status_code=400, detail=message)

    new_connection = Connection(
        user_id=current_user.id,
        nickname=payload.nickname,
        engine_type=payload.engine_type,
        host=payload.host,
        port=payload.port,
        database_name=payload.database_name,
        username=payload.username,
        encrypted_password=encrypt_password(payload.password),
    )
    db.add(new_connection)
    db.commit()
    db.refresh(new_connection)

    return new_connection


@router.get("/", response_model=list[ConnectionResponse])
def list_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Connection).filter(Connection.user_id == current_user.id).all()
