#!/usr/bin/env python3
import os
import json
import httpx
import redis
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("scan_fixtures")

# Environment variables
API_FOOTBALL_KEY = os.environ.get("API_FOOTBALL_KEY")
API_FOOTBALL_URL = "https://v3.football.api-sports.io"
REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")

# Default leagues to track (can be moved to config/database later)
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

def get_redis_connection():
    """Establish connection to Redis"""
    try:
        redis_conn = redis.from_url(REDIS_URL)
        redis_conn.ping()  # Test connection
        return redis_conn
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        return None

def fetch_fixtures(from_date, to_date, league_ids=None):
    """
    Fetch fixtures from API-Football
    
    Args:
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)
        league_ids: List of league IDs to filter by
        
    Returns:
        List of fixture objects
    """
    if not API_FOOTBALL_KEY:
        logger.error("API_FOOTBALL_KEY environment variable not set")
        return []
        
    leagues_param = ""
    if league_ids:
        leagues_param = f"&league={','.join(map(str, league_ids))}"
    
    url = f"{API_FOOTBALL_URL}/fixtures?from={from_date}&to={to_date}{leagues_param}"
    
    headers = {
        "x-rapidapi-key": API_FOOTBALL_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
    }
    
    try:
        logger.info(f"Fetching fixtures from {from_date} to {to_date}")
        with httpx.Client(timeout=30.0) as client:
            response = client.get(url, headers=headers)
            
        if response.status_code != 200:
            logger.error(f"API request failed: {response.status_code} - {response.text}")
            return []
            
        data = response.json()
        
        if "errors" in data and data["errors"]:
            logger.error(f"API returned errors: {data['errors']}")
            return []
            
        if "response" not in data:
            logger.error("Unexpected API response format")
            return []
            
        fixtures = data["response"]
        logger.info(f"Fetched {len(fixtures)} fixtures")
        return fixtures
        
    except Exception as e:
        logger.error(f"Error fetching fixtures: {e}")
        return []

def queue_fixtures_for_processing(fixtures, redis_conn):
    """
    Queue fixtures for processing by workers
    
    Args:
        fixtures: List of fixture objects from API-Football
        redis_conn: Redis connection
    
    Returns:
        Number of fixtures queued
    """
    if not fixtures:
        return 0
        
    # Get set of fixtures already in process (to avoid duplicates)
    processed_fixture_ids = set()
    try:
        # Use a Redis SET to track fixtures we've seen
        processed_fixture_ids = set(map(
            int, 
            redis_conn.smembers("processed_fixtures")
        ))
    except Exception as e:
        logger.warning(f"Couldn't get processed fixtures: {e}")
    
    queued_count = 0
    for fixture in fixtures:
        try:
            fixture_id = fixture["fixture"]["id"]
            fixture_date = fixture["fixture"]["date"]
            home_team = fixture["teams"]["home"]["name"]
            away_team = fixture["teams"]["away"]["name"]
            league = fixture["league"]["name"]
            
            # Skip if already processed
            if fixture_id in processed_fixture_ids:
                continue
                
            # Prepare task data
            task_data = {
                "type": "fetch_rest_data",
                "match_id": fixture_id,
                "metadata": {
                    "date": fixture_date,
                    "home": home_team,
                    "away": away_team,
                    "league": league
                }
            }
            
            # Queue the task
            redis_conn.lpush("queue:fixtures", json.dumps(task_data))
            
            # Also add scraping and prediction tasks
            scrape_task = {
                "type": "scrape_news",
                "match_id": fixture_id,
                "metadata": {
                    "date": fixture_date,
                    "home": home_team,
                    "away": away_team,
                    "league": league
                }
            }
            redis_conn.lpush("queue:fixtures", json.dumps(scrape_task))
            
            # Mark as processed
            redis_conn.sadd("processed_fixtures", fixture_id)
            
            queued_count += 1
            
            logger.info(f"Queued fixture: {league} - {home_team} vs {away_team} (ID: {fixture_id})")
            
        except Exception as e:
            logger.error(f"Error queuing fixture: {e}")
    
    return queued_count

def main():
    """Main function"""
    # Connect to Redis
    redis_conn = get_redis_connection()
    if not redis_conn:
        return 1
    
    # Calculate date range (today + 2 days)
    today = datetime.now().date()
    to_date = today + timedelta(days=2)
    
    # Format dates for API
    from_date_str = today.strftime("%Y-%m-%d")
    to_date_str = to_date.strftime("%Y-%m-%d")
    
    # Fetch fixtures
    fixtures = fetch_fixtures(from_date_str, to_date_str, TRACKED_LEAGUES)
    
    # Queue fixtures
    if fixtures:
        queued_count = queue_fixtures_for_processing(fixtures, redis_conn)
        logger.info(f"Queued {queued_count} new fixtures for processing")
    
    # Expire processed fixtures set after 30 days
    redis_conn.expire("processed_fixtures", 60 * 60 * 24 * 30)
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code) 