from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.code_service import CodeService

# Import models to ensure SQLAlchemy tables are registered
import app.models

# Import Routers
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.codes import router as codes_router
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.api.doctor import router as doctor_router
from app.api.patient import router as patient_router
from app.api.coder import router as coder_router

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Seed reference data
try:
    with SessionLocal() as db:
        CodeService.seed_codes_if_needed(db)
except Exception as e:
    print(f"Warning: Could not seed initial medical codes: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ClaimSure-AI: Healthcare Insurance & Medical Coding Intelligence Platform API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(codes_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(doctor_router, prefix=settings.API_V1_STR)
app.include_router(patient_router, prefix=settings.API_V1_STR)
app.include_router(coder_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
