import os

class Settings:
    PROJECT_NAME: str = "TalentOS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_for_talent_os_recruitment_system_123456")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./talentos.db")

settings = Settings()
