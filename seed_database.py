"""
Seed the database with test users and brokers
"""
import database

def seed_data():
    """Create test users and brokers"""
    print("🌱 Seeding database with test data...\n")
    
    # Create test users
    users = [
        {"username": "alice", "email": "alice@defi.com", "password": "alice123", "eth_holdings": 10.0},
        {"username": "bob", "email": "bob@defi.com", "password": "bob123", "eth_holdings": 25.5},
        {"username": "charlie", "email": "charlie@defi.com", "password": "charlie123", "eth_holdings": 5.0},
        {"username": "diana", "email": "diana@defi.com", "password": "diana123", "eth_holdings": 50.0},
        {"username": "eve", "email": "eve@defi.com", "password": "eve123", "eth_holdings": 15.75},
    ]
    
    print("👤 Creating test users...")
    for user_data in users:
        result = database.create_user(
            username=user_data["username"],
            email=user_data["email"],
            password=user_data["password"],
            eth_holdings=user_data["eth_holdings"]
        )
        if result["success"]:
            print(f"   ✅ Created user: {user_data['username']} ({user_data['eth_holdings']} ETH)")
        else:
            print(f"   ⚠️  User {user_data['username']} already exists")
    
    # Create test brokers
    brokers = [
        {"username": "broker_john", "email": "john@broker.com", "password": "john123"},
        {"username": "broker_sarah", "email": "sarah@broker.com", "password": "sarah123"},
        {"username": "broker_mike", "email": "mike@broker.com", "password": "mike123"},
        {"username": "broker_lisa", "email": "lisa@broker.com", "password": "lisa123"},
    ]
    
    print("\n🧑‍💼 Creating test brokers...")
    for broker_data in brokers:
        result = database.create_broker(
            username=broker_data["username"],
            email=broker_data["email"],
            password=broker_data["password"]
        )
        if result["success"]:
            print(f"   ✅ Created broker: {broker_data['username']}")
        else:
            print(f"   ⚠️  Broker {broker_data['username']} already exists")
    
    print("\n" + "="*60)
    print("✨ Database seeding complete!")
    print("="*60)
    
    print("\n📝 Test Credentials:")
    print("\n👤 Users:")
    for user in users:
        print(f"   Username: {user['username']:<12} Password: {user['password']:<12} ETH: {user['eth_holdings']}")
    
    print("\n🧑‍💼 Brokers:")
    for broker in brokers:
        print(f"   Username: {broker['username']:<15} Password: {broker['password']}")
    
    print("\n🌐 Access the application:")
    print("   User Login:   http://localhost:3000/user-login")
    print("   Broker Login: http://localhost:3000/broker-login")
    print()

if __name__ == "__main__":
    seed_data()

