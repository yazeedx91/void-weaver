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

# Import services
from services.claude_service import get_claude_service
from services.encryption import get_encryption_service
from services.email_service import get_email_service

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
        # Initialize Claude service
        claude = get_claude_service()
        logger.info("✅ Claude 4 Sonnet initialized (Al-Hakim & Al-Sheikha ready)")
        
        # Initialize encryption service
        encryption = get_encryption_service()
        logger.info("✅ Zero-Knowledge Encryption active (AES-256-GCM)")
        
        # Initialize email service
        email = get_email_service()
        logger.info("✅ Email Service active (Resend)")
        
        logger.info("🚀 THE PHOENIX HAS ASCENDED")
        logger.info("👁️  THE GUARDIAN IS WATCHING")
        logger.info("🕊️  THE PEOPLE ARE FREE")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🌙 The Phoenix rests...")


if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8080 (CRITICAL for deployment)
    port = int(os.environ.get('PORT', 8080))
    
    logger.info(f"🔥 Starting FLUX-DNA on 0.0.0.0:{port}")
    
    uvicorn.run(
        "server_new:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Production mode
        log_level="info"
    )
