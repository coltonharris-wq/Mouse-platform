"""
Async Queue for Background Processing
Handles payment webhooks and other async tasks
"""
import asyncio
import json
from typing import Callable, Dict, Any, Optional
from datetime import datetime
from enum import Enum
import os


class TaskPriority(Enum):
    HIGH = 1      # Critical: Payment processing, security events
    NORMAL = 2    # Standard: VM operations, customer updates
    LOW = 3       # Background: Analytics, cleanup


class AsyncTaskQueue:
    """Priority-based async task queue with persistence"""
    
    def __init__(self, max_workers: int = 5, persistence_path: Optional[str] = None):
        self.queue = asyncio.PriorityQueue()
        self.max_workers = max_workers
        self.workers = []
        self.running = False
        self.persistence_path = persistence_path
        self.task_handlers: Dict[str, Callable] = {}
        self.metrics = {
            "tasks_submitted": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "avg_processing_time": 0.0
        }
        self._lock = asyncio.Lock()
        
    def register_handler(self, task_type: str, handler: Callable):
        """Register a handler for a task type"""
        self.task_handlers[task_type] = handler
        
    async def submit(self, task_type: str, payload: Dict[str, Any], 
                     priority: TaskPriority = TaskPriority.NORMAL,
                     delay_ms: int = 0) -> str:
        """Submit a task to the queue"""
        task_id = f"task_{datetime.utcnow().timestamp()}_{id(payload)}"
        
        task = {
            "id": task_id,
            "type": task_type,
            "payload": payload,
            "priority": priority.value,
            "submitted_at": datetime.utcnow().isoformat(),
            "delay_ms": delay_ms
        }
        
        # Priority queue uses tuple: (priority, task_id, task)
        # task_id ensures FIFO for same priority
        await self.queue.put((priority.value, task_id, task))
        
        async with self._lock:
            self.metrics["tasks_submitted"] += 1
            
        return task_id
    
    async def start(self):
        """Start the worker pool"""
        if self.running:
            return
            
        self.running = True
        self.workers = [
            asyncio.create_task(self._worker_loop(f"worker-{i}"))
            for i in range(self.max_workers)
        ]
        
    async def stop(self):
        """Stop the worker pool gracefully"""
        self.running = False
        
        # Wait for all workers to finish
        if self.workers:
            await asyncio.gather(*self.workers, return_exceptions=True)
            self.workers = []
            
    async def _worker_loop(self, worker_id: str):
        """Worker loop that processes tasks"""
        while self.running:
            try:
                # Wait for a task with timeout
                priority, task_id, task = await asyncio.wait_for(
                    self.queue.get(), timeout=1.0
                )
                
                # Handle delay if specified
                delay_ms = task.get("delay_ms", 0)
                if delay_ms > 0:
                    await asyncio.sleep(delay_ms / 1000)
                
                # Process the task
                start_time = asyncio.get_event_loop().time()
                try:
                    await self._process_task(task)
                    processing_time = asyncio.get_event_loop().time() - start_time
                    
                    async with self._lock:
                        self.metrics["tasks_completed"] += 1
                        # Update running average
                        n = self.metrics["tasks_completed"]
                        self.metrics["avg_processing_time"] = (
                            (self.metrics["avg_processing_time"] * (n - 1) + processing_time) / n
                        )
                            
                except Exception as e:
                    async with self._lock:
                        self.metrics["tasks_failed"] += 1
                    print(f"[AsyncQueue] Task {task_id} failed: {e}")
                    
                    # Re-queue with lower priority if retries < max
                    retries = task.get("retries", 0)
                    if retries < 3:
                        task["retries"] = retries + 1
                        task["error"] = str(e)
                        await self.queue.put((priority + 1, task_id, task))
                        
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"[AsyncQueue] Worker {worker_id} error: {e}")
                
    async def _process_task(self, task: Dict):
        """Process a single task"""
        task_type = task["type"]
        handler = self.task_handlers.get(task_type)
        
        if not handler:
            print(f"[AsyncQueue] No handler for task type: {task_type}")
            return
            
        await handler(task["payload"])
        
    def get_metrics(self) -> Dict:
        """Get queue metrics"""
        return {
            **self.metrics,
            "queue_size": self.queue.qsize(),
            "workers": len(self.workers),
            "running": self.running
        }


# Payment-specific queue with batching support
class PaymentQueue(AsyncTaskQueue):
    """Specialized queue for payment processing with idempotency support"""
    
    def __init__(self, max_workers: int = 3):
        super().__init__(max_workers=max_workers)
        self.processed_ids: set = set()  # For idempotency
        self._id_lock = asyncio.Lock()
        
    async def is_processed(self, payment_id: str) -> bool:
        """Check if payment was already processed (idempotency)"""
        async with self._id_lock:
            return payment_id in self.processed_ids
            
    async def mark_processed(self, payment_id: str):
        """Mark payment as processed"""
        async with self._id_lock:
            self.processed_ids.add(payment_id)
            # Keep set size manageable
            if len(self.processed_ids) > 10000:
                self.processed_ids = set(list(self.processed_ids)[-5000:])
                
    async def submit_payment(self, payment_type: str, event_data: Dict,
                            priority: TaskPriority = TaskPriority.HIGH) -> Optional[str]:
        """Submit a payment task with idempotency check"""
        payment_id = event_data.get("id") or event_data.get("session_id")
        
        if payment_id and await self.is_processed(payment_id):
            print(f"[PaymentQueue] Skipping duplicate payment: {payment_id}")
            return None
            
        if payment_id:
            await self.mark_processed(payment_id)
            
        return await self.submit(
            task_type=f"payment_{payment_type}",
            payload=event_data,
            priority=priority
        )


# Global queue instances
payment_queue = PaymentQueue(max_workers=3)
background_queue = AsyncTaskQueue(max_workers=2)
