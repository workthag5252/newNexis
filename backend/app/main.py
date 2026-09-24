from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.config import settings
from app.database import engine, Base
from app.routers import auth, users, ai, sheets
from app.services.ai_service import ai_service

# Initialize tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table initialization warning: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="NexusAI - FastAPI backend with JWT Auth, MySQL, OpenAI GPT API, and Google Sheets integration",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(ai.router)
app.include_router(sheets.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_endpoints": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/me",
            "/api/users",
            "/api/ai/chat",
            "/api/ai/history",
            "/api/sheets/sync",
            "/api/sheets/config"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_model": settings.OPENAI_MODEL,
        "ai_service_ready": bool(settings.OPENAI_API_KEY),
        "google_sheets_ready": bool(settings.GOOGLE_SHEET_ID),
        "timestamp": datetime.utcnow()
    }
