from pydantic import BaseModel
from app.db.models import DBEngineType


class ConnectionCreate(BaseModel):
    nickname: str
    engine_type: DBEngineType
    host: str
    port: int
    database_name: str
    username: str
    password: str


class ConnectionResponse(BaseModel):
    id: int
    nickname: str
    engine_type: DBEngineType
    host: str
    port: int
    database_name: str
    username: str
    # password intentionally excluded — never send it back to the client

    class Config:
        from_attributes = True
