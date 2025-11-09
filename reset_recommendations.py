"""
Reset recommendations data to start fresh with user tracking
"""
import json
import os

def reset_store():
    """Reset store.json to empty state"""
    store_path = os.path.join(os.path.dirname(__file__), 'data', 'store.json')
    
    fresh_store = {
        "users": {},
        "recs": {},
        "votes": {},
        "decisions": {},
        "feedback": {}
    }
    
    with open(store_path, 'w') as f:
        json.dump(fresh_store, f, indent=2)
    
    print("✅ Store reset successfully!")
    print("📝 All old recommendations cleared")
    print("🔄 Users can now create new recommendations with proper tracking")

if __name__ == "__main__":
    confirm = input("⚠️  This will delete all existing recommendations. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        reset_store()
    else:
        print("❌ Reset cancelled")

