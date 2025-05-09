import logging
import json
import os
import sys
from datetime import datetime
import traceback

# Get Logtail token from environment variable
LOGTAIL_TOKEN = os.environ.get("LOGTAIL_SOURCE_TOKEN")

class LogtailHandler(logging.Handler):
    """
    A custom handler that sends logs to Logtail.
    """
    def __init__(self, source_token):
        super().__init__()
        self.source_token = source_token
        self.service_name = os.environ.get("SERVICE_NAME", "backend")
        
    def emit(self, record):
        try:
            import httpx
            
            log_entry = self.format(record)
            
            # Prepare the log payload
            payload = {
                "dt": datetime.utcnow().isoformat() + "Z",
                "level": record.levelname,
                "message": record.getMessage(),
                "service": self.service_name,
            }
            
            # Add exception info if present
            if record.exc_info:
                payload["error"] = {
                    "message": str(record.exc_info[1]),
                    "stack": "".join(traceback.format_exception(*record.exc_info))
                }
            
            # Add extra fields
            if hasattr(record, "extra"):
                payload.update(record.extra)
            
            # Send to Logtail
            httpx.post(
                "https://in.logtail.com",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.source_token}"
                },
                json=payload,
                timeout=2.0  # Don't block the application for logging
            )
        except Exception as e:
            # If logging fails, print to stderr but don't crash
            print(f"Error sending logs to Logtail: {e}", file=sys.stderr)

def setup_logging(service_name=None):
    """
    Set up logging with console and Logtail handlers
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Always add a console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    root_logger.addHandler(console_handler)
    
    # Add Logtail handler if token exists
    if LOGTAIL_TOKEN:
        logtail_handler = LogtailHandler(LOGTAIL_TOKEN)
        if service_name:
            logtail_handler.service_name = service_name
        logtail_handler.setFormatter(logging.Formatter('%(message)s'))
        root_logger.addHandler(logtail_handler)
        
    return root_logger

# Usage example:
# logger = setup_logging("backend-worker")
# logger.info("Worker started", extra={"job_id": "123"})
# try:
#     1/0
# except Exception as e:
#     logger.exception("Division error occurred") 