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

def setup_logging(name, log_level=None):
    """
    Set up logging with proper format and level
    
    Args:
        name: Logger name
        log_level: Logging level (defaults to INFO or from environment)
        
    Returns:
        Configured logger instance
    """
    if log_level is None:
        log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    
    numeric_level = getattr(logging, log_level, logging.INFO)
    
    # Create a custom logger
    logger = logging.getLogger(name)
    logger.setLevel(numeric_level)
    
    # Check if handlers already exist (avoid duplicate handlers during reloads)
    if not logger.handlers:
        # Create handlers
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(numeric_level)
        
        # Create formatters
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)8s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Add formatters to handlers
        console_handler.setFormatter(formatter)
        
        # Add handlers to the logger
        logger.addHandler(console_handler)
    
    # Setup a file handler if in production
    if os.environ.get("ENVIRONMENT") == "production" and not any(isinstance(h, logging.FileHandler) for h in logger.handlers):
        try:
            log_dir = os.environ.get("LOG_DIR", "/app/logs")
            os.makedirs(log_dir, exist_ok=True)
            
            today = datetime.now().strftime("%Y-%m-%d")
            file_handler = logging.FileHandler(f"{log_dir}/{name}-{today}.log")
            file_handler.setLevel(numeric_level)
            
            file_formatter = logging.Formatter(
                '%(asctime)s | %(levelname)8s | %(name)s | %(filename)s:%(lineno)d | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            file_handler.setFormatter(file_formatter)
            
            logger.addHandler(file_handler)
        except Exception as e:
            logger.error(f"Failed to setup file logging: {e}")
    
    return logger

# Usage example:
# logger = setup_logging("backend-worker")
# logger.info("Worker started", extra={"job_id": "123"})
# try:
#     1/0
# except Exception as e:
#     logger.exception("Division error occurred") 