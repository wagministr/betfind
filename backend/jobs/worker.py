#!/usr/bin/env python3
import os
import json
import time
import redis
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("worker")

# Redis connection
try:
    redis_client = redis.from_url(os.environ.get("REDIS_URL", "redis://redis:6379/0"))
    logger.info("Redis connected successfully")
except Exception as e:
    logger.error(f"Redis connection error: {e}")
    redis_client = None

def process_task(task_data):
    """
    Process a task from the queue.
    This function will dispatch different task types to appropriate handlers.
    """
    try:
        if not task_data:
            return False
        
        task_type = task_data.get("type")
        match_id = task_data.get("match_id")
        
        logger.info(f"Processing task: {task_type} for match {match_id}")
        
        # Different task handlers based on type
        if task_type == "fetch_rest_data":
            # Placeholder for REST fetcher
            logger.info(f"Would fetch REST data for match {match_id}")
            # Example: rest_fetcher.fetch_match_data(match_id)
            time.sleep(1)  # Simulate work
            
        elif task_type == "scrape_news":
            # Placeholder for web scraper
            logger.info(f"Would scrape news for match {match_id}")
            # Example: scraper_fetcher.scrape_match_news(match_id)
            time.sleep(1)  # Simulate work
            
        elif task_type == "generate_prediction":
            # Placeholder for LLM prediction
            logger.info(f"Would generate prediction for match {match_id}")
            # Example: llm_reasoner.generate_prediction(match_id)
            time.sleep(2)  # Simulate work
            
        else:
            logger.warning(f"Unknown task type: {task_type}")
            return False
            
        return True
        
    except Exception as e:
        logger.error(f"Error processing task: {e}")
        return False

def main():
    if not redis_client:
        logger.error("Cannot start worker: Redis connection not available")
        return
    
    logger.info("Worker started, waiting for tasks...")
    
    while True:
        try:
            # Try to get a task from the queue (blocking with timeout)
            task = redis_client.brpop("queue:fixtures", timeout=5)
            
            if task:
                _, task_data = task
                try:
                    task_json = json.loads(task_data.decode('utf-8'))
                    success = process_task(task_json)
                    
                    if success:
                        logger.info(f"Task processed successfully: {task_json.get('type')}")
                    else:
                        # Requeue failed tasks (with limit)
                        retry_count = task_json.get("retry_count", 0)
                        if retry_count < 3:
                            task_json["retry_count"] = retry_count + 1
                            redis_client.lpush("queue:fixtures", json.dumps(task_json))
                            logger.warning(f"Task requeued (attempt {retry_count+1}/3)")
                        else:
                            logger.error(f"Task failed after 3 attempts: {task_json}")
                            # Could add to a dead letter queue here
                            
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON in task: {task_data}")
                    
            # Heartbeat logging (every ~5 minutes)
            if datetime.now().minute % 5 == 0 and datetime.now().second < 10:
                queue_size = redis_client.llen("queue:fixtures")
                logger.info(f"Worker heartbeat - Queue size: {queue_size}")
                time.sleep(10)  # Avoid repeated logging in the same minute
                
        except KeyboardInterrupt:
            logger.info("Worker shutting down...")
            break
            
        except Exception as e:
            logger.error(f"Worker error: {e}")
            time.sleep(5)  # Wait before retrying

if __name__ == "__main__":
    main() 