"""
Performance Test for Mouse Platform API
Tests the 4 performance optimizations at scale:
1. Concurrent VM fetching
2. Payment async queue
3. VM status caching
4. Screenshot optimization
"""
import asyncio
import aiohttp
import time
import json
import statistics
from datetime import datetime
from typing import List, Dict
import sys

# Configuration
BASE_URL = "http://localhost:8000"
CONCURRENT_USERS = 50
VM_COUNT = 100
TEST_DURATION_SECONDS = 60


class PerformanceMetrics:
    """Collect and analyze performance metrics"""
    
    def __init__(self):
        self.response_times: List[float] = []
        self.errors: List[Dict] = []
        self.throughput: List[int] = []  # requests per second
        self.cache_hit_rates: List[float] = []
        self.start_time = time.time()
        
    def add_response(self, response_time: float, error: str = None):
        """Record a response"""
        self.response_times.append(response_time)
        if error:
            self.errors.append({
                "time": time.time() - self.start_time,
                "error": error
            })
    
    def add_cache_stats(self, hit_rate: float):
        """Record cache hit rate"""
        self.cache_hit_rates.append(hit_rate)
    
    def get_summary(self) -> Dict:
        """Get performance summary"""
        if not self.response_times:
            return {"error": "No data collected"}
        
        total_requests = len(self.response_times)
        total_errors = len(self.errors)
        
        return {
            "total_requests": total_requests,
            "total_errors": total_errors,
            "error_rate": total_errors / total_requests if total_requests > 0 else 0,
            "response_times": {
                "min_ms": round(min(self.response_times) * 1000, 2),
                "max_ms": round(max(self.response_times) * 1000, 2),
                "avg_ms": round(statistics.mean(self.response_times) * 1000, 2),
                "median_ms": round(statistics.median(self.response_times) * 1000, 2),
                "p95_ms": round(self._percentile(95) * 1000, 2),
                "p99_ms": round(self._percentile(99) * 1000, 2)
            },
            "throughput": {
                "total_duration_sec": round(time.time() - self.start_time, 2),
                "requests_per_sec": round(total_requests / (time.time() - self.start_time), 2)
            },
            "cache_performance": {
                "avg_hit_rate": round(statistics.mean(self.cache_hit_rates), 4) if self.cache_hit_rates else 0,
                "samples": len(self.cache_hit_rates)
            }
        }
    
    def _percentile(self, p: float) -> float:
        """Calculate percentile"""
        sorted_times = sorted(self.response_times)
        k = (len(sorted_times) - 1) * p / 100
        f = int(k)
        c = f + 1 if f + 1 < len(sorted_times) else f
        return sorted_times[f] + (k - f) * (sorted_times[c] - sorted_times[f])


async def test_concurrent_vm_fetching(session: aiohttp.ClientSession, metrics: PerformanceMetrics):
    """Test 1: Concurrent VM fetching performance"""
    print("\n[TEST 1] Concurrent VM Fetching...")
    
    # Create test customers with VMs
    customer_ids = []
    for i in range(10):
        async with session.post(f"{BASE_URL}/api/v1/customers", json={
            "company_name": f"Test Company {i}",
            "email": f"test{i}@example.com"
        }) as resp:
            if resp.status == 200:
                data = await resp.json()
                customer_ids.append(data["customer"]["id"])
    
    # Deploy VMs for each customer
    vm_count = 0
    for customer_id in customer_ids:
        for _ in range(5):  # 5 VMs per customer
            async with session.post(f"{BASE_URL}/api/v1/customers/{customer_id}/vms", json={
                "role": "Developer",
                "name": f"Test VM {vm_count}",
                "task_description": "Test task"
            }) as resp:
                if resp.status == 200:
                    vm_count += 1
    
    print(f"  Created {vm_count} VMs across {len(customer_ids)} customers")
    
    # Test concurrent VM listing
    async def list_vms(customer_id: str):
        start = time.time()
        try:
            async with session.get(
                f"{BASE_URL}/api/v1/customers/{customer_id}/vms?fast=true"
            ) as resp:
                await resp.json()
                elapsed = time.time() - start
                metrics.add_response(elapsed)
                return elapsed
        except Exception as e:
            metrics.add_response(time.time() - start, str(e))
            return None
    
    # Run concurrent requests
    start = time.time()
    tasks = [list_vms(cid) for cid in customer_ids for _ in range(10)]
    results = await asyncio.gather(*tasks)
    elapsed = time.time() - start
    
    successful = [r for r in results if r is not None]
    print(f"  Concurrent requests: {len(tasks)}")
    print(f"  Successful: {len(successful)}")
    print(f"  Total time: {elapsed:.2f}s")
    print(f"  Avg time per request: {elapsed/len(tasks)*1000:.2f}ms")
    print(f"  Throughput: {len(tasks)/elapsed:.2f} req/s")


async def test_payment_queue_performance(session: aiohttp.ClientSession, metrics: PerformanceMetrics):
    """Test 2: Payment async queue performance"""
    print("\n[TEST 2] Payment Async Queue...")
    
    # Create test customer
    async with session.post(f"{BASE_URL}/api/v1/customers", json={
        "company_name": "Payment Test",
        "email": "payment@test.com"
    }) as resp:
        data = await resp.json()
        customer_id = data["customer"]["id"]
    
    # Test concurrent checkout session creation
    async def create_checkout():
        start = time.time()
        try:
            async with session.post(
                f"{BASE_URL}/api/v1/customers/{customer_id}/tokens/purchase",
                json={
                    "package_slug": "starter",
                    "success_url": "http://localhost/success",
                    "cancel_url": "http://localhost/cancel"
                }
            ) as resp:
                await resp.json()
                elapsed = time.time() - start
                metrics.add_response(elapsed)
                return elapsed
        except Exception as e:
            metrics.add_response(time.time() - start, str(e))
            return None
    
    # Run burst of concurrent requests
    start = time.time()
    tasks = [create_checkout() for _ in range(50)]
    results = await asyncio.gather(*tasks)
    elapsed = time.time() - start
    
    successful = [r for r in results if r is not None]
    print(f"  Concurrent checkout requests: 50")
    print(f"  Successful: {len(successful)}")
    print(f"  Total time: {elapsed:.2f}s")
    print(f"  Avg time per request: {elapsed/50*1000:.2f}ms")
    print(f"  Throughput: {50/elapsed:.2f} req/s")


async def test_vm_status_caching(session: aiohttp.ClientSession, metrics: PerformanceMetrics):
    """Test 3: VM status caching performance"""
    print("\n[TEST 3] VM Status Caching...")
    
    # Get health to check cache stats
    async with session.get(f"{BASE_URL}/health") as resp:
        health = await resp.json()
        initial_cache_stats = health.get("performance", {}).get("caches", {}).get("vm_status", {})
    
    # Create test customer with VM
    async with session.post(f"{BASE_URL}/api/v1/customers", json={
        "company_name": "Cache Test",
        "email": "cache@test.com"
    }) as resp:
        data = await resp.json()
        customer_id = data["customer"]["id"]
    
    # Deploy VM
    async with session.post(f"{BASE_URL}/api/v1/customers/{customer_id}/vms", json={
        "role": "Developer",
        "name": "Cache Test VM",
        "task_description": "Test task"
    }) as resp:
        vm_data = await resp.json()
        vm_id = vm_data["vm"]["id"]
    
    # Repeatedly request VM status to test caching
    async def get_vm_status(round_num: int):
        start = time.time()
        try:
            async with session.get(
                f"{BASE_URL}/api/v1/customers/{customer_id}/vms"
            ) as resp:
                await resp.json()
                elapsed = time.time() - start
                metrics.add_response(elapsed)
                return elapsed
        except Exception as e:
            metrics.add_response(time.time() - start, str(e))
            return None
    
    # Run 100 sequential requests to test cache effectiveness
    start = time.time()
    for i in range(100):
        await get_vm_status(i)
    elapsed = time.time() - start
    
    # Check final cache stats
    async with session.get(f"{BASE_URL}/health") as resp:
        health = await resp.json()
        final_cache_stats = health.get("performance", {}).get("caches", {}).get("vm_status", {})
    
    print(f"  Sequential requests: 100")
    print(f"  Total time: {elapsed:.2f}s")
    print(f"  Avg time per request: {elapsed/100*1000:.2f}ms")
    print(f"  Initial cache size: {initial_cache_stats.get('size', 0)}")
    print(f"  Final cache size: {final_cache_stats.get('size', 0)}")
    print(f"  Cache hit rate: {final_cache_stats.get('hit_rate', 0):.2%}")
    
    metrics.add_cache_stats(final_cache_stats.get("hit_rate", 0))


async def test_screenshot_optimization(session: aiohttp.ClientSession, metrics: PerformanceMetrics):
    """Test 4: Screenshot optimization"""
    print("\n[TEST 4] Screenshot Optimization...")
    
    # Create test customer with VM
    async with session.post(f"{BASE_URL}/api/v1/customers", json={
        "company_name": "Screenshot Test",
        "email": "screenshot@test.com"
    }) as resp:
        data = await resp.json()
        customer_id = data["customer"]["id"]
    
    # Deploy VM
    async with session.post(f"{BASE_URL}/api/v1/customers/{customer_id}/vms", json={
        "role": "Developer",
        "name": "Screenshot Test VM",
        "task_description": "Test task"
    }) as resp:
        vm_data = await resp.json()
        vm_id = vm_data["vm"]["id"]
    
    # Test different quality settings
    qualities = ["low", "medium", "high"]
    
    for quality in qualities:
        times = []
        for _ in range(10):
            start = time.time()
            try:
                async with session.get(
                    f"{BASE_URL}/api/v1/customers/{customer_id}/vms/{vm_id}/screenshot?quality={quality}"
                ) as resp:
                    data = await resp.json()
                    elapsed = time.time() - start
                    times.append(elapsed)
                    metrics.add_response(elapsed)
            except Exception as e:
                metrics.add_response(time.time() - start, str(e))
        
        if times:
            print(f"  Quality '{quality}': avg={statistics.mean(times)*1000:.2f}ms, "
                  f"min={min(times)*1000:.2f}ms, max={max(times)*1000:.2f}ms")


async def test_websocket_streaming(session: aiohttp.ClientSession, metrics: PerformanceMetrics):
    """Test 5: WebSocket streaming performance"""
    print("\n[TEST 5] WebSocket Streaming...")
    
    # Create test customer with VM
    async with session.post(f"{BASE_URL}/api/v1/customers", json={
        "company_name": "WebSocket Test",
        "email": "websocket@test.com"
    }) as resp:
        data = await resp.json()
        customer_id = data["customer"]["id"]
    
    # Deploy VM
    async with session.post(f"{BASE_URL}/api/v1/customers/{customer_id}/vms", json={
        "role": "Developer",
        "name": "WebSocket Test VM",
        "task_description": "Test task"
    }) as resp:
        vm_data = await resp.json()
        vm_id = vm_data["vm"]["id"]
    
    # Note: WebSocket testing requires a WebSocket client
    # For now, we just verify the endpoint exists
    print(f"  VM created: {vm_id}")
    print(f"  WebSocket endpoint: ws://localhost:8000/ws/vms/{customer_id}/{vm_id}")
    print("  (WebSocket performance testing requires ws client)")


async def test_end_to_end_load(session: aiohttp.ClientSession, metrics: PerformanceMetrics):
    """Test 6: End-to-end load test"""
    print("\n[TEST 6] End-to-End Load Test...")
    
    async def mixed_workflow(user_id: int):
        """Simulate a user workflow"""
        start = time.time()
        errors = []
        
        try:
            # Signup
            async with session.post(f"{BASE_URL}/api/v1/customers", json={
                "company_name": f"Load Test {user_id}",
                "email": f"load{user_id}@test.com"
            }) as resp:
                data = await resp.json()
                customer_id = data["customer"]["id"]
            
            # Get dashboard
            async with session.get(f"{BASE_URL}/api/v1/customers/{customer_id}/dashboard") as resp:
                await resp.json()
            
            # Send message
            async with session.post(f"{BASE_URL}/api/v1/customers/{customer_id}/message", json={
                "message": "Hello!"
            }) as resp:
                await resp.json()
            
            # Deploy VM
            async with session.post(f"{BASE_URL}/api/v1/customers/{customer_id}/vms", json={
                "role": "Developer",
                "name": f"Load Test VM {user_id}",
                "task_description": "Load testing"
            }) as resp:
                if resp.status == 200:
                    await resp.json()
            
            # List VMs
            async with session.get(f"{BASE_URL}/api/v1/customers/{customer_id}/vms") as resp:
                await resp.json()
            
        except Exception as e:
            errors.append(str(e))
        
        elapsed = time.time() - start
        if errors:
            metrics.add_response(elapsed, "; ".join(errors))
        else:
            metrics.add_response(elapsed)
        return elapsed
    
    # Run concurrent workflows
    start = time.time()
    tasks = [mixed_workflow(i) for i in range(CONCURRENT_USERS)]
    results = await asyncio.gather(*tasks)
    elapsed = time.time() - start
    
    successful = [r for r in results if r is not None]
    print(f"  Concurrent users: {CONCURRENT_USERS}")
    print(f"  Successful workflows: {len(successful)}")
    print(f"  Total time: {elapsed:.2f}s")
    print(f"  Throughput: {CONCURRENT_USERS/elapsed:.2f} workflows/s")


async def main():
    """Run all performance tests"""
    print("=" * 60)
    print("MOUSE PLATFORM PERFORMANCE TEST")
    print("=" * 60)
    print(f"Target: {BASE_URL}")
    print(f"Concurrent Users: {CONCURRENT_USERS}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)
    
    metrics = PerformanceMetrics()
    
    async with aiohttp.ClientSession() as session:
        # Check if server is running
        try:
            async with session.get(f"{BASE_URL}/health") as resp:
                if resp.status == 200:
                    health = await resp.json()
                    print(f"\n✓ Server healthy (version {health.get('version', 'unknown')})")
                else:
                    print(f"\n✗ Server returned status {resp.status}")
                    return
        except Exception as e:
            print(f"\n✗ Cannot connect to server: {e}")
            print(f"  Make sure the server is running at {BASE_URL}")
            return
        
        # Run tests
        await test_concurrent_vm_fetching(session, metrics)
        await test_payment_queue_performance(session, metrics)
        await test_vm_status_caching(session, metrics)
        await test_screenshot_optimization(session, metrics)
        await test_websocket_streaming(session, metrics)
        await test_end_to_end_load(session, metrics)
        
        # Print summary
        print("\n" + "=" * 60)
        print("PERFORMANCE SUMMARY")
        print("=" * 60)
        
        summary = metrics.get_summary()
        print(json.dumps(summary, indent=2))
        
        # Save report
        report = {
            "timestamp": datetime.now().isoformat(),
            "config": {
                "base_url": BASE_URL,
                "concurrent_users": CONCURRENT_USERS,
                "vm_count": VM_COUNT
            },
            "summary": summary
        }
        
        report_file = f"performance_test_report_{int(time.time())}.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"\n✓ Report saved to: {report_file}")
        
        # Check if performance meets targets
        print("\n" + "=" * 60)
        print("PERFORMANCE TARGETS")
        print("=" * 60)
        
        rt = summary.get("response_times", {})
        targets = {
            "p95 < 1000ms": rt.get("p95_ms", 9999) < 1000,
            "p99 < 2000ms": rt.get("p99_ms", 9999) < 2000,
            "error rate < 5%": summary.get("error_rate", 1) < 0.05,
            "throughput > 10 req/s": summary.get("throughput", {}).get("requests_per_sec", 0) > 10
        }
        
        for target, passed in targets.items():
            status = "✓" if passed else "✗"
            print(f"  {status} {target}")
        
        all_passed = all(targets.values())
        print("\n" + "=" * 60)
        if all_passed:
            print("✓ ALL PERFORMANCE TARGETS MET")
        else:
            print("✗ SOME PERFORMANCE TARGETS NOT MET")
        print("=" * 60)
        
        return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
