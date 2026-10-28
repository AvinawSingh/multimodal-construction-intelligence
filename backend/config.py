import os
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    # AI configuration
    LLAMA_API_KEY: str = ""
    LLAMA_API_BASE_URL: str = "https://api.groq.com/openai/v1"
    LLAMA_VISION_MODEL: str = "llama-3.2-11b-vision-preview"
    LLAMA_TEXT_MODEL: str = "llama-3.3-70b-versatile"
    
    # Weather configuration
    WEATHER_API_PROVIDER: str = "open-meteo"
    OPENWEATHERMAP_API_KEY: str = ""
    
    # Image Generation
    ENABLE_IMAGE_GENERATION: bool = True
    
    # Maximum upload size in bytes (10 MB)
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

@lru_cache()
def get_settings() -> Settings:
    return Settings()
