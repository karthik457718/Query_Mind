from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("APP_DATABASE_URL")

# For sqlite we need check_same_thread: False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# The engine manages the actual connection pool
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal is a factory — each request will get its own database session from it
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is what all our model classes will inherit from
Base = declarative_base()