import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
GENERATED_DIR = BASE_DIR / "generated"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "NovaResume AI"
    VERSION: str = "2.0 Enterprise"
    API_V1_STR: str = "/api/v1"

    # Groq Key for Resume AI Enhancer
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    SUPPORTED_MODELS: list = [
        {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B Versatile", "provider": "Groq", "description": "Flagship open model for high-impact ATS optimization"},
        {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B Instant", "provider": "Groq", "description": "Fast lightweight model"}
    ]

    # ── DATABASE ──────────────────────────────────────────────────
    # Railway injects DATABASE_URL automatically when PostgreSQL is added.
    # Falls back to local SQLite for development.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR}/novaresume.db"
    )

    # ── JWT SECRETS ───────────────────────────────────────────────
    # Set these as env variables in Railway for production security.
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "nova_resume_ai_secret_jwt_key_ved_dhobi_2026"
    )
    JWT_REFRESH_SECRET_KEY: str = os.getenv(
        "JWT_REFRESH_SECRET_KEY",
        "nova_resume_ai_refresh_jwt_key_ved_dhobi_2026"
    )

    # ── FRONTEND ORIGIN ───────────────────────────────────────────
    # Set FRONTEND_URL in Railway to restrict CORS to your Vercel domain.
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "*")

    UPLOADS_PATH: str = str(UPLOADS_DIR)
    GENERATED_PATH: str = str(GENERATED_DIR)

    MAX_FILE_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx", ".txt", ".json"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
