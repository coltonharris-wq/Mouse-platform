"""
Cache Manager for VM Status and Screenshots
Provides in-memory caching with TTL support
"""
import asyncio
import hashlib
import base64
from typing import Dict, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import time


@dataclass
class CacheEntry:
    """Cache entry with metadata"""
    value: Any
    created_at: float
    ttl_seconds: int
    access_count: int = 0
    last_accessed: float = None
    
    def __post_init__(self):
        if self.last_accessed is None:
            self.last_accessed = self.created_at
            
    @property
    def is_expired(self) -> bool:
        return time.time() - self.created_at > self.ttl_seconds
        
    @property
    def age_seconds(self) -> float:
        return time.time() - self.created_at


class CacheManager:
    """In-memory cache with TTL and LRU eviction"""
    
    def __init__(self, default_ttl: int = 60, max_size: int = 1000):
        self._cache: Dict[str, CacheEntry] = {}
        self._locks: Dict[str, asyncio.Lock] = {}
        self.default_ttl = default_ttl
        self.max_size = max_size
        self._cleanup_task = None
        self._global_lock = asyncio.Lock()
        self._hits = 0
        self._misses = 0
        
    async def start(self):
        """Start background cleanup task"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())
            
    async def stop(self):
        """Stop background cleanup task"""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None
            
    def _get_lock(self, key: str) -> asyncio.Lock:
        """Get or create a lock for a key"""
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        return self._locks[key]
        
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        async with self._get_lock(key):
            entry = self._cache.get(key)
            
            if entry is None:
                self._misses += 1
                return None
                
            if entry.is_expired:
                del self._cache[key]
                self._misses += 1
                return None
                
            # Update access stats
            entry.access_count += 1
            entry.last_accessed = time.time()
            self._hits += 1
            
            return entry.value
            
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache with TTL"""
        ttl = ttl or self.default_ttl
        
        async with self._global_lock:
            # Evict if at capacity
            if len(self._cache) >= self.max_size:
                await self._evict_lru()
                
        async with self._get_lock(key):
            self._cache[key] = CacheEntry(
                value=value,
                created_at=time.time(),
                ttl_seconds=ttl
            )
            
    async def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        async with self._get_lock(key):
            if key in self._cache:
                del self._cache[key]
                return True
            return False
            
    async def get_or_set(self, key: str, factory: Callable, 
                         ttl: Optional[int] = None) -> Any:
        """Get from cache or compute and store"""
        value = await self.get(key)
        if value is not None:
            return value
            
        # Compute value
        value = await factory() if asyncio.iscoroutinefunction(factory) else factory()
        
        await self.set(key, value, ttl)
        return value
        
    async def _evict_lru(self):
        """Evict least recently used entries"""
        if not self._cache:
            return
            
        # Sort by last_accessed and remove oldest 10%
        sorted_items = sorted(
            self._cache.items(),
            key=lambda x: x[1].last_accessed
        )
        
        to_remove = int(len(sorted_items) * 0.1) or 1
        for key, _ in sorted_items[:to_remove]:
            del self._cache[key]
            
    async def _cleanup_loop(self):
        """Background task to clean expired entries"""
        while True:
            try:
                await asyncio.sleep(30)  # Run every 30 seconds
                
                expired_keys = [
                    key for key, entry in self._cache.items()
                    if entry.is_expired
                ]
                
                for key in expired_keys:
                    async with self._get_lock(key):
                        if key in self._cache and self._cache[key].is_expired:
                            del self._cache[key]
                            
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[CacheManager] Cleanup error: {e}")
                
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        total_requests = self._hits + self._misses
        hit_rate = self._hits / total_requests if total_requests > 0 else 0
        
        return {
            "size": len(self._cache),
            "max_size": self.max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(hit_rate, 4),
            "default_ttl": self.default_ttl
        }
        
    async def clear(self):
        """Clear all cache entries"""
        async with self._global_lock:
            self._cache.clear()


class VMStatusCache(CacheManager):
    """Specialized cache for VM status with optimized TTLs"""
    
    def __init__(self):
        super().__init__(default_ttl=10, max_size=500)  # 10 second TTL for VM status
        self._status_ttl_map = {
            "running": 15,      # Running VMs change less frequently
            "stopped": 60,      # Stopped VMs rarely change
            "creating": 5,      # Creating changes quickly
            "starting": 5,      # Starting changes quickly
            "stopping": 5,      # Stopping changes quickly
            "error": 30,        # Error state persists
            "unknown": 5        # Unknown should refresh quickly
        }
        
    def get_status_ttl(self, status: str) -> int:
        """Get appropriate TTL based on VM status"""
        return self._status_ttl_map.get(status, self.default_ttl)
        
    async def cache_vm_status(self, vm_id: str, status_data: Dict):
        """Cache VM status with dynamic TTL"""
        status = status_data.get("status", "unknown")
        ttl = self.get_status_ttl(status)
        await self.set(f"vm_status:{vm_id}", status_data, ttl=ttl)
        
    async def get_vm_status(self, vm_id: str) -> Optional[Dict]:
        """Get cached VM status"""
        return await self.get(f"vm_status:{vm_id}")
        
    async def invalidate_vm_status(self, vm_id: str):
        """Invalidate VM status cache"""
        await self.delete(f"vm_status:{vm_id}")


class ScreenshotCache(CacheManager):
    """Specialized cache for VM screenshots with compression"""
    
    def __init__(self):
        super().__init__(default_ttl=3, max_size=200)  # 3 second TTL for screenshots
        self._compression_threshold = 100 * 1024  # 100KB threshold
        
    def _compress_screenshot(self, base64_data: str, quality: str = "medium") -> str:
        """Compress screenshot based on quality setting"""
        try:
            import io
            from PIL import Image
            
            # Decode base64
            img_data = base64.b64decode(base64_data)
            
            # If small enough, don't compress
            if len(img_data) < self._compression_threshold:
                return base64_data
                
            # Open image
            img = Image.open(io.BytesIO(img_data))
            
            # Resize based on quality
            quality_settings = {
                "low": (640, 480, 60),
                "medium": (1024, 768, 75),
                "high": (1920, 1080, 85)
            }
            
            width, height, jpeg_quality = quality_settings.get(quality, (1024, 768, 75))
            
            # Resize maintaining aspect ratio
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Save with compression
            output = io.BytesIO()
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=jpeg_quality, optimize=True)
            
            return base64.b64encode(output.getvalue()).decode()
            
        except Exception as e:
            # Return original on error
            return base64_data
            
    async def cache_screenshot(self, vm_id: str, screenshot_base64: str, 
                              quality: str = "medium") -> str:
        """Cache screenshot with optional compression"""
        # Compress if needed
        compressed = self._compress_screenshot(screenshot_base64, quality)
        
        await self.set(f"screenshot:{vm_id}", {
            "data": compressed,
            "quality": quality,
            "original_size": len(screenshot_base64),
            "compressed_size": len(compressed)
        }, ttl=self.default_ttl)
        
        return compressed
        
    async def get_screenshot(self, vm_id: str) -> Optional[Dict]:
        """Get cached screenshot"""
        return await self.get(f"screenshot:{vm_id}")
        
    def get_stats(self) -> Dict:
        """Get screenshot cache stats with compression info"""
        stats = super().get_stats()
        
        # Calculate compression stats
        total_original = 0
        total_compressed = 0
        
        for entry in self._cache.values():
            if isinstance(entry.value, dict):
                total_original += entry.value.get("original_size", 0)
                total_compressed += entry.value.get("compressed_size", 0)
                
        if total_original > 0:
            compression_ratio = (1 - total_compressed / total_original) * 100
            stats["compression_ratio"] = round(compression_ratio, 2)
            stats["bytes_saved"] = total_original - total_compressed
            
        return stats


# Global cache instances
vm_status_cache = VMStatusCache()
screenshot_cache = ScreenshotCache()
general_cache = CacheManager(default_ttl=300, max_size=1000)  # 5 min default TTL
