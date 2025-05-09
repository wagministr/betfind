import os
import json
import time
import redis
from datetime import datetime

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    decode_responses=True
)

def process_fixture(fixture_id: int):
    """Process a single fixture and store results in Redis"""
    print(f"Processing fixture {fixture_id}")
    
    # Simulate some processing time
    time.sleep(1)
    
    # Create a demo result
    result = {
        "fixture_id": fixture_id,
        "processed_at": datetime.utcnow().isoformat(),
        "status": "completed",
        "demo_data": {
            "home_team": "Demo Home",
            "away_team": "Demo Away",
            "prediction": "Demo prediction"
        }
    }
    
    # Store in Redis
    redis_client.set(
        f"fixture:{fixture_id}:result",
        json.dumps(result),
        ex=3600  # Expire after 1 hour
    )
    
    print(f"Stored result for fixture {fixture_id}")

def main():
    """Main worker loop"""
    print("Starting demo worker...")
    
    while True:
        try:
            # Get fixture ID from queue
            fixture_id = redis_client.blpop("queue:fixtures", timeout=30)
            
            if fixture_id:
                # blpop returns a tuple (queue_name, value)
                fixture_id = int(fixture_id[1])
                process_fixture(fixture_id)
            else:
                print("No fixtures in queue, waiting...")
                
        except redis.RedisError as e:
            print(f"Redis error: {e}")
            time.sleep(5)  # Wait before retrying
        except Exception as e:
            print(f"Error processing fixture: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main() 