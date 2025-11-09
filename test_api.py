#!/usr/bin/env python3
"""
Quick test script to verify the API endpoints work correctly
"""
import requests
import json

API_BASE = "http://localhost:5001/api"

def test_health():
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"   ✅ Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_market_data():
    print("\n2. Testing market data endpoint...")
    try:
        response = requests.get(f"{API_BASE}/market-data")
        print(f"   ✅ Status: {response.status_code}")
        data = response.json()
        print(f"   EtherFi APY: {data['etherfi']['apy']}%")
        print(f"   ETH Price: ${data['eth_usd']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None
    return data

def test_generate_portfolios(market_data):
    print("\n3. Testing generate portfolios endpoint...")
    try:
        payload = {
            "profile": {
                "eth_holdings": 5.0,
                "risk": "medium",
                "goal": "steady yield"
            },
            "market": {
                "apy": market_data['etherfi']['apy'],
                "tvl_b": market_data['etherfi']['tvl_b'],
                "eth_usd": market_data['eth_usd']
            }
        }
        
        response = requests.post(f"{API_BASE}/generate-portfolios", json=payload)
        print(f"   ✅ Status: {response.status_code}")
        data = response.json()
        
        print(f"\n   📊 Portfolios Generated:")
        for name, allocation in data['portfolios'].items():
            print(f"\n   {name}:")
            for asset, weight in allocation.items():
                print(f"      - {asset}: {weight}%")
        
        print(f"\n   📝 Summary:")
        print(f"      {data['summary'][:150]}...")
        
        return data
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("API ENDPOINT TEST")
    print("=" * 60)
    print("\nMake sure the API server is running on port 5001!")
    print("Run: python api_server.py\n")
    
    test_health()
    market_data = test_market_data()
    
    if market_data:
        test_generate_portfolios(market_data)
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)

