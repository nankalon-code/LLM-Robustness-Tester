import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    LLM_PROVIDER: str = "ollama"
    OLLAMA_HOST: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "qwen2.5:3b"
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./llm_robustness.db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
