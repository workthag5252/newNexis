import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "NexusAI API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./nexus_ai.db"
    MYSQL_HOST: Optional[str] = "localhost"
    MYSQL_PORT: Optional[int] = 3306
    MYSQL_DATABASE: Optional[str] = "nexus_ai_db"
    MYSQL_USER: Optional[str] = "nexus_user"
    MYSQL_PASSWORD: Optional[str] = "nexus_password"

    # JWT Authentication
    JWT_SECRET: str = "nexus-super-secret-jwt-key-2026-production-ready"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # OpenAI API
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Google Sheets
    GOOGLE_SHEET_ID: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
