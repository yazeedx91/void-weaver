"""
FLUX-DNA Backend Server
The Sovereign API Gateway
Version: 2026.1.0
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import API routers
from api.health import router as health_router
from api.assessment import router as assessment_router
from api.founder import router as founder_router
from api.sanctuary import router as sanctuary_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FLUX-DNA Sovereign API",
    description="AI-Native Psychometric Sanctuary - The Phoenix Has Ascended",
    version="2026.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(assessment_router, tags=["Assessment"])
app.include_router(founder_router, tags=["Founder Dashboard"])
app.include_router(sanctuary_router, tags=["Sovereigness Sanctuary"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - The Sentinel's Welcome"""
    return {
        "status": "FORTRESS_ACTIVE",
        "mission": "SOVEREIGN_LIBERATION",
        "message": "Welcome to FLUX-DNA - The AI-Native Psychometric Sanctuary",
        "version": "2026.1.0",
        "phoenix": "ASCENDED",
        "guardian": "WATCHING",
        "people": "FREE",
        "features": {
            "8_scale_oracle": "Claude 4 Sonnet (Al-Hakim & Al-Sheikha)",
            "zero_knowledge": "AES-256-GCM Client-Side Encryption",
            "sovereigness_sanctuary": "4-Pillar Protection System",
            "time_gate_links": "24-Hour / 3-Click Self-Destruct",
            "founder_dashboard": "/api/founder/metrics",
            "bilingual": "English & Saudi Arabic"
        },
        "documentation": "/api/docs",
        "founder_email": "Yazeedx91@gmail.com"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🔥 THE PHOENIX IS ASCENDING...")
    
    try:
        # Lazy load services to avoid startup failures
        logger.info("✅ FLUX-DNA API Gateway initialized")
        logger.info("🚀 THE PHOENIX HAS ASCENDED")
        logger.info("👁️  THE GUARDIAN IS WATCHING")
        logger.info("🕊️  THE PEOPLE ARE FREE")
        
    except Exception as e:
        logger.error(f"❌ Startup warning: {e}")
        # Don't raise - allow server to start anyway

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🌙 The Phoenix rests...")
