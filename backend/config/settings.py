import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    GITHUB_CALLBACK_URL: str = os.getenv("GITHUB_CALLBACK_URL", f"https://{os.getenv('RAILWAY_PUBLIC_DOMAIN', 'localhost:8000')}/auth/github/callback")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./echosys.db")
    # Add other settings as needed

settings = Settings() 