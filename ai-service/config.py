"""DataPulse AI Service - Konfigurasyon."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # LLM
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.0

    # DB - mutlaka ai_readonly user!
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "datapulse"
    db_user: str = "ai_readonly"
    db_password: str = ""

    # Server
    host: str = "0.0.0.0"
    port: int = 8001
    log_level: str = "INFO"

    # Guvenlik
    max_question_length: int = 500
    max_query_limit: int = 1000
    query_timeout_seconds: int = 5


settings = Settings()