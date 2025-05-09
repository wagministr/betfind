from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import os
import httpx
import json
from datetime import datetime, timedelta
import redis

from app.models.fixtures import Fixture, FixtureDB
from app.utils.logging import setup_logging

# Configure logging
logger = setup_logging("fixtures-router")

# Initialize router
router = APIRouter(
    prefix="/fixtures",
    tags=["fixtures"],
    responses={404: {"description": "Not found"}},
)

# API-Football configuration
API_FOOTBALL_KEY = os.environ.get("API_FOOTBALL_KEY")
API_FOOTBALL_URL = "https://v3.football.api-sports.io"

# Redis connection
try:
    redis_client = redis.from_url(os.environ.get("REDIS_URL", "redis://redis:6379/0"))
except Exception as e:
    logger.error(f"Redis connection error: {e}")
    redis_client = None

# Tracked leagues
TRACKED_LEAGUES = [
    39,   # Premier League
    140,  # La Liga
    78,   # Bundesliga
    135,  # Serie A
    61,   # Ligue 1
    2,    # Champions League
    3,    # Europa League
    848,  # Conference League
]

@router.get("/", response_model=List[FixtureDB])
async def get_fixtures(
    days: Optional[int] = Query(2, description="Number of days to fetch fixtures for"),
    league_ids: Optional[str] = Query(None, description="Comma-separated list of league IDs")
):
    """
    Get upcoming fixtures
    """
    try:
        # Parse league IDs
        leagues = None
        if league_ids:
            leagues = [int(id) for id in league_ids.split(",") if id.strip().isdigit()]
        else:
            leagues = TRACKED_LEAGUES
            
        # Calculate dates
        today = datetime.now().date()
        to_date = today + timedelta(days=days)
        
        # Format dates for API
        from_date_str = today.strftime("%Y-%m-%d")
        to_date_str = to_date.strftime("%Y-%m-%d")
        
        # Try to get from cache first
        cache_key = f"fixtures:{from_date_str}:{to_date_str}:{','.join(map(str, leagues))}"
        
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"Returning cached fixtures for {cache_key}")
                return json.loads(cached)
        
        # Fetch from API if not in cache
        fixtures = await fetch_fixtures(from_date_str, to_date_str, leagues)
        
        # Convert to database model
        db_fixtures = []
        for fix in fixtures:
            try:
                db_fix = FixtureDB(
                    fixture_id=fix.fixture.id,
                    league_id=fix.league.id,
                    home_id=fix.home_team.id,
                    away_id=fix.away_team.id,
                    home_name=fix.home_team.name,
                    away_name=fix.away_team.name,
                    league_name=fix.league.name,
                    utc_kickoff=fix.fixture.date,
                    status=fix.fixture.status.short,
                    venue=fix.fixture.venue.name if fix.fixture.venue else None
                )
                db_fixtures.append(db_fix)
            except Exception as e:
                logger.error(f"Error converting fixture {fix.fixture.id}: {e}")
        
        # Cache results for 1 hour
        if redis_client and db_fixtures:
            redis_client.setex(
                cache_key,
                60 * 60,  # 1 hour TTL
                json.dumps([fix.dict() for fix in db_fixtures])
            )
        
        return db_fixtures
            
    except Exception as e:
        logger.error(f"Error getting fixtures: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/trigger-scan")
async def trigger_fixture_scan():
    """
    Trigger a scan for new fixtures and add them to processing queue
    """
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis connection not available")
        
    try:
        # Push a special command to run the scan
        redis_client.lpush(
            "queue:commands", 
            json.dumps({"command": "scan_fixtures", "timestamp": datetime.now().timestamp()})
        )
        
        return {"status": "scan triggered"}
    except Exception as e:
        logger.error(f"Error triggering scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{fixture_id}", response_model=Fixture)
async def get_fixture(fixture_id: int):
    """
    Get details for a specific fixture
    """
    try:
        # Try to get from cache first
        cache_key = f"fixture:{fixture_id}"
        
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"Returning cached fixture {fixture_id}")
                return json.loads(cached)
        
        # Fetch from API if not in cache
        if not API_FOOTBALL_KEY:
            raise HTTPException(status_code=500, detail="API_FOOTBALL_KEY not configured")
            
        headers = {
            "x-rapidapi-key": API_FOOTBALL_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io"
        }
        
        url = f"{API_FOOTBALL_URL}/fixtures"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                url, 
                params={"id": fixture_id},
                headers=headers
            )
            
        if response.status_code != 200:
            logger.error(f"API request failed: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail="API request failed")
            
        data = response.json()
        
        if "errors" in data and data["errors"]:
            logger.error(f"API returned errors: {data['errors']}")
            raise HTTPException(status_code=500, detail=str(data["errors"]))
            
        if "response" not in data or not data["response"]:
            raise HTTPException(status_code=404, detail="Fixture not found")
            
        fixture = Fixture(**data["response"][0])
        
        # Cache result for 30 minutes
        if redis_client:
            redis_client.setex(
                cache_key,
                30 * 60,  # 30 minutes TTL
                fixture.json()
            )
        
        return fixture
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting fixture {fixture_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_fixtures(from_date, to_date, league_ids=None):
    """
    Fetch fixtures from API-Football
    """
    if not API_FOOTBALL_KEY:
        logger.error("API_FOOTBALL_KEY environment variable not set")
        raise HTTPException(status_code=500, detail="API key not configured")
        
    leagues_param = ""
    if league_ids:
        leagues_param = f"&league={','.join(map(str, league_ids))}"
    
    url = f"{API_FOOTBALL_URL}/fixtures?from={from_date}&to={to_date}{leagues_param}"
    
    headers = {
        "x-rapidapi-key": API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
    }
    
    logger.info(f"Fetching fixtures from {from_date} to {to_date}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, headers=headers)
        
    if response.status_code != 200:
        logger.error(f"API request failed: {response.status_code} - {response.text}")
        raise HTTPException(status_code=response.status_code, detail="API request failed")
        
    data = response.json()
    
    if "errors" in data and data["errors"]:
        logger.error(f"API returned errors: {data['errors']}")
        raise HTTPException(status_code=500, detail=str(data["errors"]))
        
    if "response" not in data:
        logger.error("Unexpected API response format")
        raise HTTPException(status_code=500, detail="Unexpected API response format")
        
    fixtures_data = data["response"]
    fixtures = [Fixture(**item) for item in fixtures_data]
    
    logger.info(f"Fetched {len(fixtures)} fixtures")
    return fixtures 