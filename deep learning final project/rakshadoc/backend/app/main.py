from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.db.models import User
from app.api import auth, layout, braille, tts, export, admin

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial admin user if not exists
def seed_admin_user():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@rakshadoc.ai").first()
        if not admin_user:
            admin_user = User(
                full_name="System Administrator",
                email="admin@rakshadoc.ai",
                hashed_password=get_password_hash("Admin@12345"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            print("[INFO] Seeded default Admin user: admin@rakshadoc.ai / Admin@12345")
    finally:
        db.close()

seed_admin_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads & exports
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(layout.router, prefix=settings.API_V1_STR)
app.include_router(braille.router, prefix=settings.API_V1_STR)
app.include_router(tts.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to RakshaDoc - Indic Document AI & Braille Accessibility Platform API",
        "docs_url": "/docs",
        "version": settings.VERSION
    }
