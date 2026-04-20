"""Centralized environment-backed configuration for the backend services."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Maps `.env` values into typed settings used across the API."""

    app_name: str = "docuMind API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    frontend_origin: str = "http://localhost:3000"

    use_local_storage: bool = True
    local_storage_path: str = "./data"

    azure_storage_connection_string: str = ""
    azure_storage_container: str = "documents"

    azure_search_endpoint: str = ""
    azure_search_api_key: str = ""
    azure_search_index: str = "documind-documents"

    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_chat_deployment: str = ""

    llm_provider: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    ollama_timeout_seconds: float = 60.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
