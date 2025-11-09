"""
Database module for user and broker authentication
Uses SQLite for simplicity and portability
"""
import sqlite3
import hashlib
import secrets
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'auth.db')

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with tables for users, brokers, and sessions"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            eth_holdings REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Brokers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS brokers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            total_earnings REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            broker_id INTEGER,
            user_type TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (broker_id) REFERENCES brokers(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

# ====================== USER FUNCTIONS ======================

def create_user(username: str, email: str, password: str, eth_holdings: float = 0.0) -> Dict[str, Any]:
    """Create a new user account"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, eth_holdings)
            VALUES (?, ?, ?, ?)
        ''', (username, email, password_hash, eth_holdings))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True,
            "user_id": user_id,
            "username": username,
            "email": email
        }
    except sqlite3.IntegrityError as e:
        return {
            "success": False,
            "error": "Username or email already exists"
        }
    finally:
        conn.close()

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user and return user data if successful"""
    conn = get_db()
    cursor = conn.cursor()
    
    password_hash = hash_password(password)
    cursor.execute('''
        SELECT id, username, email, eth_holdings, created_at
        FROM users
        WHERE username = ? AND password_hash = ?
    ''', (username, password_hash))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row['id'],
            "username": row['username'],
            "email": row['email'],
            "eth_holdings": row['eth_holdings'],
            "created_at": row['created_at']
        }
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, username, email, eth_holdings, created_at
        FROM users
        WHERE id = ?
    ''', (user_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_user_eth_holdings(user_id: int, eth_holdings: float) -> bool:
    """Update user's ETH holdings"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE users
        SET eth_holdings = ?
        WHERE id = ?
    ''', (eth_holdings, user_id))
    
    conn.commit()
    success = cursor.rowcount > 0
    conn.close()
    return success

# ====================== BROKER FUNCTIONS ======================

def create_broker(username: str, email: str, password: str) -> Dict[str, Any]:
    """Create a new broker account"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO brokers (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        
        broker_id = cursor.lastrowid
        conn.commit()
        
        return {
            "success": True,
            "broker_id": broker_id,
            "username": username,
            "email": email
        }
    except sqlite3.IntegrityError as e:
        return {
            "success": False,
            "error": "Username or email already exists"
        }
    finally:
        conn.close()

def authenticate_broker(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate broker and return broker data if successful"""
    conn = get_db()
    cursor = conn.cursor()
    
    password_hash = hash_password(password)
    cursor.execute('''
        SELECT id, username, email, total_earnings, created_at
        FROM brokers
        WHERE username = ? AND password_hash = ?
    ''', (username, password_hash))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row['id'],
            "username": row['username'],
            "email": row['email'],
            "total_earnings": row['total_earnings'],
            "created_at": row['created_at']
        }
    return None

def get_broker_by_id(broker_id: int) -> Optional[Dict[str, Any]]:
    """Get broker by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, username, email, total_earnings, created_at
        FROM brokers
        WHERE id = ?
    ''', (broker_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def update_broker_earnings(broker_id: int, additional_earnings: float) -> bool:
    """Add to broker's total earnings"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE brokers
        SET total_earnings = total_earnings + ?
        WHERE id = ?
    ''', (additional_earnings, broker_id))
    
    conn.commit()
    success = cursor.rowcount > 0
    conn.close()
    return success

# ====================== SESSION FUNCTIONS ======================

def create_session(user_id: Optional[int], broker_id: Optional[int], user_type: str) -> str:
    """Create a new session and return token"""
    conn = get_db()
    cursor = conn.cursor()
    
    token = generate_token()
    expires_at = datetime.now() + timedelta(days=7)  # Token valid for 7 days
    
    cursor.execute('''
        INSERT INTO sessions (user_id, broker_id, user_type, token, expires_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, broker_id, user_type, token, expires_at))
    
    conn.commit()
    conn.close()
    
    return token

def validate_session(token: str) -> Optional[Dict[str, Any]]:
    """Validate session token and return user/broker data"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT user_id, broker_id, user_type, expires_at
        FROM sessions
        WHERE token = ?
    ''', (token,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    # Check if token expired
    expires_at = datetime.fromisoformat(row['expires_at'])
    if datetime.now() > expires_at:
        delete_session(token)
        return None
    
    # Get user or broker data
    if row['user_type'] == 'user' and row['user_id']:
        user_data = get_user_by_id(row['user_id'])
        if user_data:
            user_data['user_type'] = 'user'
            return user_data
    elif row['user_type'] == 'broker' and row['broker_id']:
        broker_data = get_broker_by_id(row['broker_id'])
        if broker_data:
            broker_data['user_type'] = 'broker'
            return broker_data
    
    return None

def delete_session(token: str) -> bool:
    """Delete session (logout)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM sessions WHERE token = ?', (token,))
    
    conn.commit()
    success = cursor.rowcount > 0
    conn.close()
    return success

def cleanup_expired_sessions():
    """Delete all expired sessions"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM sessions WHERE expires_at < ?', (datetime.now(),))
    
    conn.commit()
    deleted_count = cursor.rowcount
    conn.close()
    
    return deleted_count

# Initialize database on module import
if __name__ == "__main__":
    init_db()
    print("Database setup complete!")

