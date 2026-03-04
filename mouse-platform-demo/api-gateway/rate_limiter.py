"""
Rate Limiter Module
Implements sliding window rate limiting for API endpoints
"""
import time
from collections import defaultdict
from typing import Dict, Optional
import threading

class RateLimiter:
    """Thread-safe rate limiter using sliding window algorithm"""
    
    def __init__(self, window_size: int = 60):
        """
        Initialize rate limiter
        
        Args:
            window_size: Time window in seconds (default 60)
        """
        self.window_size = window_size
        self.requests: Dict[str, list] = defaultdict(list)
        self._lock = threading.Lock()
    
    def check_rate_limit(self, key: str, max_requests: int) -> bool:
        """
        Check if request is within rate limit
        
        Args:
            key: Unique identifier (e.g., "api:192.168.1.1:create_customer")
            max_requests: Maximum requests allowed in window
            
        Returns:
            True if allowed, False if rate limited
        """
        now = time.time()
        
        with self._lock:
            # Get existing requests for this key
            requests = self.requests[key]
            
            # Remove old requests outside the window
            cutoff = now - self.window_size
            requests = [r for r in requests if r > cutoff]
            
            # Check if under limit
            if len(requests) >= max_requests:
                self.requests[key] = requests  # Update with cleaned list
                return False
            
            # Add current request
            requests.append(now)
            self.requests[key] = requests
            
            return True
    
    def get_remaining(self, key: str, max_requests: int) -> int:
        """Get remaining requests in current window"""
        now = time.time()
        
        with self._lock:
            requests = self.requests[key]
            cutoff = now - self.window_size
            requests = [r for r in requests if r > cutoff]
            self.requests[key] = requests
            
            return max(0, max_requests - len(requests))
    
    def get_reset_time(self, key: str) -> Optional[float]:
        """Get timestamp when rate limit resets"""
        with self._lock:
            requests = self.requests[key]
            if not requests:
                return None
            return min(requests) + self.window_size
    
    def reset(self, key: str):
        """Reset rate limit for a key"""
        with self._lock:
            if key in self.requests:
                del self.requests[key]

# Global rate limiter instance
rate_limiter = RateLimiter()
