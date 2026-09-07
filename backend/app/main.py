from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.connections.router import router as connections_router
from app.schema.router import router as schema_router
from app.llm.router import router as llm_router

import os

from app.db.session import engine, Base
from app.db import models  # noqa: F401

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="QueryMind API", lifespan=lifespan)

origins = [
    os.getenv("FRONTEND_URL", "*"),
    "http://localhost:3000",
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(connections_router)
app.include_router(schema_router)
app.include_router(llm_router)


@app.get("/")
def root():
    return {"status": "QueryMind API is running"}