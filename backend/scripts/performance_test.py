import requests
import threading
import time
import statistics
import sys
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://127.0.0.1:5000"
NUM_REQUESTS = 500
CONCURRENCY = 20

results = {
    "queue": [],
    "countdown": [],
    "status": [] # Note: status requires auth, might skip or mock login if simple test enough
}

def test_endpoint(endpoint):
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}/{endpoint}", timeout=5)
        latency = (time.time() - start) * 1000 # ms
        if response.status_code == 200:
            return endpoint, latency
        else:
            return endpoint, None
    except Exception as e:
        return endpoint, None

def run_load_test():
    print(f"Starting Load Test: {NUM_REQUESTS} requests with {CONCURRENCY} concurrency...")
    
    tasks = []
    # Mix of endpoints
    for _ in range(NUM_REQUESTS):
        tasks.append("queue")
        tasks.append("countdown")
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(test_endpoint, task) for task in tasks]
        
        for future in futures:
            endpoint, latency = future.result()
            if latency is not None:
                results[endpoint].append(latency)
            else:
                print(f"Request to {endpoint} failed")

    total_time = time.time() - start_time
    
    print(f"\nTest Completed in {total_time:.2f} seconds")
    print("-" * 40)
    
    for endpoint, latencies in results.items():
        if not latencies:
            continue
        
        avg = statistics.mean(latencies)
        p95 = statistics.quantiles(latencies, n=20)[18] # 95th percentile
        max_lat = max(latencies)
        
        print(f"Endpoint: /{endpoint}")
        print(f"  Requests: {len(latencies)}")
        print(f"  Avg Latency: {avg:.2f} ms")
        print(f"  95th %ile:   {p95:.2f} ms")
        print(f"  Max Latency: {max_lat:.2f} ms")
        print("-" * 40)

if __name__ == "__main__":
    run_load_test()
