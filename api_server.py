from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from backend import fetch_etherfi, fetch_eth_price_usd, generate_two_portfolios, llm_summary, reward_split, calculate_profit
from utils import load_store, save_store, anon_hash, new_rec_id
import database

load_dotenv()

# Initialize database
database.init_db()

app = Flask(__name__)

# Enable CORS for all routes and origins (development mode)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

# ====================== AUTHENTICATION ENDPOINTS ======================

@app.route('/api/auth/signup/user', methods=['POST'])
def signup_user():
    """Register a new user"""
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    eth_holdings = data.get('eth_holdings', 0.0)
    
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    result = database.create_user(username, email, password, eth_holdings)
    
    if result['success']:
        # Create session
        token = database.create_session(result['user_id'], None, 'user')
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": result['user_id'],
                "username": result['username'],
                "email": result['email'],
                "user_type": "user"
            }
        })
    else:
        return jsonify({"error": result['error']}), 400

@app.route('/api/auth/signup/broker', methods=['POST'])
def signup_broker():
    """Register a new broker"""
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    result = database.create_broker(username, email, password)
    
    if result['success']:
        # Create session
        token = database.create_session(None, result['broker_id'], 'broker')
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": result['broker_id'],
                "username": result['username'],
                "email": result['email'],
                "user_type": "broker"
            }
        })
    else:
        return jsonify({"error": result['error']}), 400

@app.route('/api/auth/login/user', methods=['POST'])
def login_user():
    """Login as user"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    user = database.authenticate_user(username, password)
    
    if user:
        token = database.create_session(user['id'], None, 'user')
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "eth_holdings": user['eth_holdings'],
                "user_type": "user"
            }
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/auth/login/broker', methods=['POST'])
def login_broker():
    """Login as broker"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    broker = database.authenticate_broker(username, password)
    
    if broker:
        token = database.create_session(None, broker['id'], 'broker')
        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": broker['id'],
                "username": broker['username'],
                "email": broker['email'],
                "total_earnings": broker['total_earnings'],
                "user_type": "broker"
            }
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/auth/validate', methods=['GET'])
def validate_token():
    """Validate session token"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not token:
        return jsonify({"error": "No token provided"}), 401
    
    session_data = database.validate_session(token)
    
    if session_data:
        return jsonify({"success": True, "user": session_data})
    else:
        return jsonify({"error": "Invalid or expired token"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout and invalidate session"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if token:
        database.delete_session(token)
    
    return jsonify({"success": True})

# ====================== END AUTHENTICATION ENDPOINTS ======================

@app.route('/api/market-data', methods=['GET'])
def get_market_data():
    """Get current market data (EtherFi, ETH price)"""
    etherfi = fetch_etherfi()
    eth_usd = fetch_eth_price_usd()
    return jsonify({
        "etherfi": etherfi,
        "eth_usd": eth_usd
    })

@app.route('/api/generate-portfolios', methods=['POST'])
def generate_portfolios():
    """Generate two portfolio recommendations"""
    data = request.json
    profile = data.get('profile', {})
    market = data.get('market', {})
    
    portfolios = generate_two_portfolios(profile, market)
    summary = llm_summary(profile, market, portfolios)
    
    return jsonify({
        "portfolios": portfolios,
        "summary": summary
    })

@app.route('/api/create-recommendation', methods=['POST'])
def create_recommendation():
    """Create a new recommendation for broker voting"""
    data = request.json
    nickname = data.get('nickname', 'guest')
    profile = data.get('profile', {})
    market = data.get('market', {})
    portfolios = data.get('portfolios', {})
    summary = data.get('summary', '')
    
    # Get user info from auth token if available
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = None
    username = nickname
    
    if token:
        session_data = database.validate_session(token)
        if session_data and session_data.get('user_type') == 'user':
            user_id = session_data.get('id')
            username = session_data.get('username')
    
    user_hash = anon_hash(username.strip() or "guest")
    rec_id = new_rec_id()
    
    store = load_store()
    store["users"][user_hash] = profile
    store["recs"][rec_id] = {
        "user_hash": user_hash,
        "user_id": user_id,  # Store user ID for broker filtering
        "username": username,  # Store username for broker display
        "input": {"profile": profile, "market": market},
        "portfolios": portfolios,
        "summary": summary
    }
    store["votes"][rec_id] = {}
    save_store(store)
    
    return jsonify({
        "rec_id": rec_id,
        "user_hash": user_hash
    })

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get all recommendations"""
    store = load_store()
    return jsonify(store.get("recs", {}))

@app.route('/api/recommendation/<rec_id>', methods=['GET'])
def get_recommendation(rec_id):
    """Get a specific recommendation"""
    store = load_store()
    rec = store.get("recs", {}).get(rec_id)
    votes = store.get("votes", {}).get(rec_id, {})
    decision = store.get("decisions", {}).get(rec_id)
    feedback = store.get("feedback", {}).get(rec_id, [])
    broker_votes = store.get("broker_votes", {}).get(rec_id, {})
    
    if not rec:
        return jsonify({"error": "Recommendation not found"}), 404
    
    return jsonify({
        "recommendation": rec,
        "votes": votes,
        "decision": decision,
        "feedback": feedback,
        "broker_votes": broker_votes
    })

@app.route('/api/vote', methods=['POST'])
def submit_vote():
    """Submit a broker vote"""
    data = request.json
    rec_id = data.get('rec_id')
    choice = data.get('choice')
    
    # Get broker info from auth token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    broker_id = None
    broker_username = 'Anonymous'
    
    if token:
        session_data = database.validate_session(token)
        if session_data and session_data.get('user_type') == 'broker':
            broker_id = session_data.get('id')
            broker_username = session_data.get('username')
    
    store = load_store()
    if rec_id not in store.get("recs", {}):
        return jsonify({"error": "Recommendation not found"}), 404
    
    # Store vote with broker tracking
    store["votes"].setdefault(rec_id, {})
    
    # Update aggregate vote count
    store["votes"][rec_id][choice] = store["votes"][rec_id].get(choice, 0) + 1
    
    # Track individual broker votes
    if "broker_votes" not in store:
        store["broker_votes"] = {}
    
    store["broker_votes"].setdefault(rec_id, {})
    store["broker_votes"][rec_id][str(broker_id)] = {
        "broker_id": broker_id,
        "broker_username": broker_username,
        "choice": choice
    }
    
    save_store(store)
    
    return jsonify({"success": True, "votes": store["votes"][rec_id]})

@app.route('/api/broker/earnings', methods=['GET'])
def get_broker_earnings():
    """Get earnings for the logged-in broker"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not token:
        return jsonify({"error": "No token provided"}), 401
    
    session_data = database.validate_session(token)
    if not session_data or session_data.get('user_type') != 'broker':
        return jsonify({"error": "Unauthorized"}), 401
    
    broker_id = session_data.get('id')
    
    # Calculate earnings from decisions where this broker voted
    store = load_store()
    total_earnings = 0.0
    recommendations_voted = []
    
    broker_votes = store.get("broker_votes", {})
    
    for rec_id, votes_by_broker in broker_votes.items():
        # Check if this broker voted on this recommendation
        if str(broker_id) in votes_by_broker:
            # Check if there's a decision with earnings
            decision = store.get("decisions", {}).get(rec_id)
            if decision and "reward_split" in decision and decision["reward_split"].get("broker"):
                broker_earnings = decision["reward_split"]["broker"]
                total_earnings += broker_earnings
                recommendations_voted.append({
                    "rec_id": rec_id,
                    "earnings": broker_earnings,
                    "user": store["recs"][rec_id].get("username", "Anonymous"),
                    "decision": decision.get("decision")
                })
    
    return jsonify({
        "total_earnings": round(total_earnings, 2),
        "recommendations_count": len(recommendations_voted),
        "details": recommendations_voted
    })

@app.route('/api/broker/profile/<int:broker_id>', methods=['GET'])
def get_broker_profile(broker_id):
    """Get public profile stats for a specific broker"""
    store = load_store()
    broker_votes = store.get("broker_votes", {})
    decisions = store.get("decisions", {})
    
    # Get broker info from database
    broker_info = database.get_broker_by_id(broker_id)
    
    if not broker_info:
        return jsonify({"error": "Broker not found"}), 404
    
    # Calculate stats
    total_votes = 0
    total_earnings = 0.0
    successful_recommendations = 0
    portfolio_recommendations = {}
    vote_history = []
    
    for rec_id, votes_by_broker in broker_votes.items():
        if str(broker_id) in votes_by_broker:
            total_votes += 1
            vote_data = votes_by_broker[str(broker_id)]
            recommended_portfolio = vote_data.get("choice")
            
            # Track portfolio recommendations
            portfolio_recommendations[recommended_portfolio] = portfolio_recommendations.get(recommended_portfolio, 0) + 1
            
            # Check if user followed this broker's recommendation
            decision = decisions.get(rec_id)
            if decision:
                chosen_portfolio = decision.get("portfolio_chosen")
                earnings = 0
                
                if decision.get("reward_split", {}).get("broker"):
                    earnings = decision["reward_split"]["broker"]
                    total_earnings += earnings
                
                if chosen_portfolio == recommended_portfolio:
                    successful_recommendations += 1
                
                vote_history.append({
                    "rec_id": rec_id,
                    "recommended": recommended_portfolio,
                    "user_chose": chosen_portfolio,
                    "was_followed": chosen_portfolio == recommended_portfolio,
                    "earnings": earnings,
                    "timestamp": decision.get("timestamp")
                })
            else:
                vote_history.append({
                    "rec_id": rec_id,
                    "recommended": recommended_portfolio,
                    "user_chose": None,
                    "was_followed": False,
                    "earnings": 0,
                    "timestamp": None
                })
    
    # Calculate success rate
    success_rate = (successful_recommendations / total_votes * 100) if total_votes > 0 else 0
    
    # Sort vote history by most recent
    vote_history.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
    
    return jsonify({
        "broker_id": broker_id,
        "username": broker_info['username'],  # Access by key name
        "total_votes": total_votes,
        "total_earnings": round(total_earnings, 2),
        "successful_recommendations": successful_recommendations,
        "success_rate": round(success_rate, 2),
        "portfolio_recommendations": portfolio_recommendations,
        "vote_history": vote_history[:10]  # Last 10 votes
    })

@app.route('/api/decision', methods=['POST'])
def submit_decision():
    """Submit user decision"""
    data = request.json
    rec_id = data.get('rec_id')
    decision = data.get('decision')
    time_limit_days = data.get('time_limit_days', 30)
    
    # Get additional data for profit calculation
    eth_holdings = data.get('eth_holdings', 5.0)
    eth_price = data.get('eth_price', 3000.0)
    expected_return = data.get('expected_return', 8.0)  # Annual return percentage
    
    store = load_store()
    if rec_id not in store.get("recs", {}):
        return jsonify({"error": "Recommendation not found"}), 404
    
    # Calculate profit based on investment and expected return
    profit_info = calculate_profit(eth_holdings, eth_price, expected_return, time_limit_days)
    
    # Calculate reward split based on the profit
    split = reward_split(profit_info['profit'])
    
    store["decisions"][rec_id] = {
        "decision": decision,
        "time_limit_days": int(time_limit_days),
        "profit_info": profit_info,
        "reward_split": split
    }
    save_store(store)
    
    return jsonify({
        "success": True,
        "profit_info": profit_info,
        "reward_split": split
    })

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback"""
    data = request.json
    rec_id = data.get('rec_id')
    thumb = data.get('thumb')
    note = data.get('note', '')
    
    store = load_store()
    if rec_id not in store.get("recs", {}):
        return jsonify({"error": "Recommendation not found"}), 404
    
    store["feedback"].setdefault(rec_id, [])
    store["feedback"][rec_id].append({
        "thumb": thumb,
        "note": note
    })
    save_store(store)
    
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='127.0.0.1')

