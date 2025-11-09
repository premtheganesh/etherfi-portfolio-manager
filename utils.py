"""
Utility functions for DeFi Oracle system
"""
import json
import hashlib
import uuid
import os

STORE_PATH = 'data/store.json'

def load_store():
    """Load the JSON store file"""
    if not os.path.exists(STORE_PATH):
        # Create default store structure
        os.makedirs('data', exist_ok=True)
        default_store = {
            "users": {},
            "recs": {},
            "recommendations": {},
            "votes": {},
            "broker_votes": {},
            "decisions": {},
            "feedback": {},
            "market": {}
        }
        with open(STORE_PATH, 'w') as f:
            json.dump(default_store, f, indent=2)
        return default_store
    
    with open(STORE_PATH, 'r') as f:
        return json.load(f)

def save_store(store):
    """Save the store to JSON file"""
    os.makedirs('data', exist_ok=True)
    with open(STORE_PATH, 'w') as f:
        json.dump(store, f, indent=2)

def anon_hash(username):
    """Create anonymous hash from username"""
    return hashlib.sha256(username.encode()).hexdigest()[:16]

def new_rec_id():
    """Generate a new recommendation ID"""
    return str(uuid.uuid4())

