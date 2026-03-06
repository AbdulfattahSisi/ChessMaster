from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "ChessMaster API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database (SQLite for dev, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./chessmaster.db"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI Engine
    AI_MAX_DEPTH: int = 4  # Minimax search depth
    AI_TIME_LIMIT: float = 5.0  # seconds

    # Export
    EXPORT_DIR: str = "exports"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
