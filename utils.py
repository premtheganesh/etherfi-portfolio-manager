import hashlib, json, os, time
from typing import Dict, Any

STORE_PATH = os.path.join("data", "store.json")

def load_store() -> Dict[str, Any]:
    try:
        with open(STORE_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {"users": {}, "recs": {}, "votes": {}, "decisions": {}, "feedback": {}}

def save_store(data: Dict[str, Any]) -> None:
    os.makedirs("data", exist_ok=True)
    with open(STORE_PATH, "w") as f:
        json.dump(data, f, indent=2)

def anon_hash(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:12]

def new_rec_id() -> str:
    return f"rec_{int(time.time()*1000)}"
