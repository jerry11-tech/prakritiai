import os

class Settings:
    PROJECT_NAME: str = "RakshaDoc - Indic Document AI & Braille Accessibility Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rakshadoc_super_secret_jwt_key_2026_indic_ai")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'rakshadoc.db')}"
    
    # Upload & Storage
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    EXPORTS_DIR: str = os.path.join(BASE_DIR, "uploads", "exports")
    
    # Pretrained / Mock Layout Model Weights Directory
    WEIGHTS_DIR: str = os.path.join(BASE_DIR, "weights")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.EXPORTS_DIR, exist_ok=True)
os.makedirs(settings.WEIGHTS_DIR, exist_ok=True)
