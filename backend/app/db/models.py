from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One user can have many saved DB connections
    connections = relationship("Connection", back_populates="owner")


class DBEngineType(str, enum.Enum):
    postgresql = "postgresql"
    mysql = "mysql"


class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    nickname = Column(String, nullable=False)  # e.g. "My Sales DB"
    engine_type = Column(Enum(DBEngineType), nullable=False)

    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    database_name = Column(String, nullable=False)
    username = Column(String, nullable=False)
    encrypted_password = Column(
        String, nullable=False
    )  # never store plaintext — Lesson 5

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="connections")
    history = relationship("QueryHistory", back_populates="connection", cascade="all, delete-orphan")


class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connection_id = Column(Integer, ForeignKey("connections.id"), nullable=False)
    
    question = Column(String, nullable=False)
    generated_sql = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    connection = relationship("Connection", back_populates="history")
