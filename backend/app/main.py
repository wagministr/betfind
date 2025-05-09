from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os
from prometheus_fastapi_instrumentator import Instrumentator
from app.utils.logging import setup_logging
import httpx
import redis
from pydantic import BaseModel
from typing import Dict, Any

# Configure logging
logger = setup_logging("backend-api")

# Initialize FastAPI app
app = FastAPI(
    title="MrBets.ai Backend API",
    description="FastAPI backend for MrBets.ai sports prediction platform",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with actual frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Prometheus metrics
@app.on_event("startup")
async def startup():
    logger.info("Starting up MrBets.ai API")
    Instrumentator().instrument(app).expose(app)

    # Redis connection
    try:
        redis_client = redis.from_url(os.environ.get("REDIS_URL", "redis://redis:6379/0"))
    except Exception as e:
        print(f"Redis connection error: {e}")
        redis_client = None

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down MrBets.ai API")

# Root endpoint
@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to MrBets.ai API",
        "status": "operational",
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    health_data = {
        "status": "healthy",
        "services": {
            "redis": "unavailable",
            "supabase": "unchecked"
        }
    }
    
    # Check Redis
    try:
        if redis_client and redis_client.ping():
            health_data["services"]["redis"] = "available"
    except:
        pass
    
    # Check Supabase (minimal check)
    supabase_url = os.environ.get("SUPABASE_URL")
    if supabase_url:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{supabase_url}/rest/v1/?apikey={os.environ.get('SUPABASE_KEY', '')}")
                if response.status_code < 500:  # Even 401 would mean service is up
                    health_data["services"]["supabase"] = "available"
        except:
            pass

    # Overall status
    if any(status == "unavailable" for status in health_data["services"].values()):
        health_data["status"] = "degraded"
        return health_data, 200  # Still return 200 to avoid alerting on partial outages
    
    return health_data

@app.get("/version")
async def version():
    return {
        "api_version": "0.1.0",
        "environment": os.environ.get("ENVIRONMENT", "development")
    }

# Import and include routers here once created
# Example:
# from app.routers import fixtures, predictions
# app.include_router(fixtures.router)
# app.include_router(predictions.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 