import sys
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.session import engine, Base
import app.models.schema  # Register all ORM models
from app.api.v1.endpoints import docgen, resumes, models, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup (works for SQLite + PostgreSQL)
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# ── CORS ──────────────────────────────────────────────────────────
# FRONTEND_URL env var: set to your Vercel URL in Railway dashboard
# e.g. "https://nova-resume-ai.vercel.app"
# Falls back to "*" for local development.
origins = (
    ["*"]
    if settings.FRONTEND_URL == "*"
    else [settings.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix=f"{settings.API_V1_STR}/auth",    tags=["Authentication"])
app.include_router(resumes.router, prefix=f"{settings.API_V1_STR}/resumes", tags=["Resumes"])
app.include_router(docgen.router,  prefix=f"{settings.API_V1_STR}/docgen",  tags=["Document Generation"])
app.include_router(models.router,  prefix=f"{settings.API_V1_STR}/models",  tags=["Models"])

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
