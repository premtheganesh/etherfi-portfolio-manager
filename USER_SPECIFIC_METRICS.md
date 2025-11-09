# User-Specific Metrics & Multi-User Support 🎯

## Overview

The system has been enhanced to support multiple users and brokers with personalized experiences:

1. **User-Specific ETH Holdings**: Each user has their own ETH balance from signup
2. **ETH Conversion Limits**: Users can only convert up to their account balance
3. **Broker Multi-User View**: Brokers can see all user portfolios in one dashboard
4. **Test Data**: 5 test users and 4 test brokers pre-created with different ETH holdings

---

## 🎯 Key Changes

### 1. User ETH Holdings from Signup

When users sign up, they specify their ETH holdings. This value is:
- Stored in the `users` table
- Loaded automatically when they login
- Used as the **maximum** ETH they can convert to eETH
- Displayed in their dashboard

**User Dashboard Updates:**
- Shows "Account Balance: X ETH" under the ETH input
- Input field shows "ETH to Convert (Max: X ETH)"
- Validation prevents converting more than account balance
- Alert shown if user tries to exceed maximum

---

### 2. Recommendation User Tracking

Each portfolio recommendation now includes:
- `user_id` - Database ID of the logged-in user
- `username` - Username for broker display
- User's specific ETH holdings at time of creation

This allows brokers to see **which user** created each recommendation.

---

### 3. Broker Multi-User Dashboard

Brokers can now:
- See **ALL** user recommendations in one place
- Select by username and ETH holdings (not just rec_id)
- View portfolio recommendations from multiple users simultaneously

**Dropdown now shows:**
```
👤 alice - 10.0 ETH (rec_abc123)
👤 bob - 25.5 ETH (rec_def456)
👤 charlie - 5.0 ETH (rec_ghi789)
```

---

## 👥 Test Users & Brokers

### Test Users (5)

| Username  | Password   | ETH Holdings | Use Case                    |
|-----------|------------|--------------|----------------------------|
| `alice`   | `alice123` | 10.0 ETH     | Medium holdings            |
| `bob`     | `bob123`   | 25.5 ETH     | Large holdings             |
| `charlie` | `charlie123`| 5.0 ETH     | Small holdings             |
| `diana`   | `diana123` | 50.0 ETH     | Very large holdings        |
| `eve`     | `eve123`   | 15.75 ETH    | Medium-large holdings      |

### Test Brokers (4)

| Username        | Password    | Purpose                    |
|-----------------|-------------|----------------------------|
| `broker_john`   | `john123`   | Can vote on all portfolios |
| `broker_sarah`  | `sarah123`  | Can vote on all portfolios |
| `broker_mike`   | `mike123`   | Can vote on all portfolios |
| `broker_lisa`   | `lisa123`   | Can vote on all portfolios |

---

## 🔄 User Workflow Example

### Alice's Experience (10 ETH)

1. **Login**:
   ```
   Username: alice
   Password: alice123
   ```

2. **Dashboard shows**:
   - ETH to Convert (Max: 10 ETH)
   - Account Balance: 10 ETH

3. **Tries to convert 15 ETH**:
   - Input automatically caps at 10 ETH
   - Alert: "⚠️ You can only convert up to 10 ETH from your account balance."

4. **Converts 8 ETH**:
   - Successfully converts 8 ETH to 7.9896 eETH
   - Can still adjust input between 0-10 ETH

5. **Generates Portfolios**:
   - Creates recommendation with 8 ETH holdings
   - Recommendation tagged with `user_id` and `username: alice`

---

### Bob's Experience (25.5 ETH)

1. **Login**:
   ```
   Username: bob
   Password: bob123
   ```

2. **Dashboard shows**:
   - ETH to Convert (Max: 25.5 ETH)
   - Account Balance: 25.5 ETH

3. **Converts 20 ETH**:
   - Successfully converts (well within his 25.5 ETH limit)
   - Creates portfolios with 20 ETH holdings

4. **Higher Profits**:
   - More ETH = higher initial investment
   - Larger projected earnings than Alice
   - Different portfolio metrics based on 20 ETH

---

### Broker John's Experience

1. **Login**:
   ```
   Username: broker_john
   Password: john123
   ```

2. **Broker Dashboard shows**:
   ```
   Select User Portfolio (Total: 5 users)
   
   Dropdown:
   👤 alice - 8.0 ETH (rec_123abc)
   👤 bob - 20.0 ETH (rec_456def)
   👤 charlie - 5.0 ETH (rec_789ghi)
   👤 diana - 45.0 ETH (rec_jkl012)
   👤 eve - 12.5 ETH (rec_mno345)
   ```

3. **Reviews Multiple Users**:
   - Selects alice's portfolio → sees her 8 ETH allocation
   - Votes on alice's portfolio
   - Switches to bob's portfolio → sees his 20 ETH allocation
   - Votes on bob's portfolio
   - Can review all 5 users' portfolios

4. **Earnings Tracking**:
   - Total broker earnings shown at top
   - Combines earnings from all users' decisions
   - Updated when any user confirms their decision

---

## 🔧 Technical Implementation

### Frontend Changes

#### UserDashboard.js

**Added State:**
```javascript
const [user, setUser] = useState(null);
const [maxEthHoldings, setMaxEthHoldings] = useState(5.0);
const [ethHoldings, setEthHoldings] = useState(5.0);
```

**Load User Data:**
```javascript
useEffect(() => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.eth_holdings) {
      setMaxEthHoldings(parsedUser.eth_holdings);
      setEthHoldings(parsedUser.eth_holdings);
    }
    
    setNickname(parsedUser.username || 'guest');
  }
}, []);
```

**ETH Input Validation:**
```javascript
<input
  type="number"
  value={ethHoldings}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    if (value <= maxEthHoldings) {
      setEthHoldings(value);
    } else {
      setEthHoldings(maxEthHoldings);
      alert(`⚠️ You can only convert up to ${maxEthHoldings} ETH`);
    }
  }}
  min="0"
  max={maxEthHoldings}
/>
```

#### BrokerDashboard.js

**Enhanced Dropdown:**
```javascript
<select value={selectedRecId} onChange={(e) => setSelectedRecId(e.target.value)}>
  {recIds.map(id => {
    const rec = recommendations[id];
    const username = rec?.username || 'Anonymous';
    const ethHoldings = rec?.input?.profile?.eth_holdings || 0;
    return (
      <option key={id} value={id}>
        👤 {username} - {ethHoldings} ETH ({id})
      </option>
    );
  })}
</select>
```

**User Display:**
```javascript
<h3>👤 User Profile - {currentRec.username || 'Anonymous'}</h3>
```

---

### Backend Changes

#### api_server.py

**Store User Info with Recommendation:**
```python
@app.route('/api/create-recommendation', methods=['POST'])
def create_recommendation():
    # Get user info from auth token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = None
    username = nickname
    
    if token:
        session_data = database.validate_session(token)
        if session_data and session_data.get('user_type') == 'user':
            user_id = session_data.get('id')
            username = session_data.get('username')
    
    store["recs"][rec_id] = {
        "user_hash": user_hash,
        "user_id": user_id,  # NEW
        "username": username,  # NEW
        "input": {"profile": profile, "market": market},
        "portfolios": portfolios,
        "summary": summary
    }
```

#### utils/api.js

**Auto-Include Auth Token:**
```javascript
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Data Flow

### User Creates Recommendation

```
1. User logs in with credentials
   └─> Token stored in localStorage
   
2. User's ETH holdings loaded from database
   └─> maxEthHoldings = user.eth_holdings
   
3. User converts ETH (validated against max)
   └─> ethHoldings <= maxEthHoldings
   
4. User generates portfolios
   └─> API call includes auth token in header
   
5. Backend validates token
   └─> Extracts user_id and username
   
6. Recommendation saved with user info
   └─> {user_id, username, user_hash, portfolios...}
```

### Broker Views All Users

```
1. Broker logs in
   └─> Token stored in localStorage
   
2. Broker dashboard loads all recommendations
   └─> GET /api/recommendations
   
3. Each recommendation includes:
   └─> {username, eth_holdings, portfolios...}
   
4. Dropdown populated with user info
   └─> "👤 alice - 10.0 ETH (rec_123)"
   
5. Broker selects user
   └─> Loads that user's specific portfolios
   
6. Broker votes on portfolio
   └─> Vote recorded for that recommendation
```

---

## 🧪 Testing Instructions

### Test Multi-User Scenario

1. **Create portfolios for multiple users:**
   
   **User 1 (Alice - 10 ETH):**
   - Login: `alice` / `alice123`
   - Convert: 8 ETH
   - Generate Portfolio (Medium risk)
   - Create Recommendation

   **User 2 (Bob - 25.5 ETH):**
   - Logout
   - Login: `bob` / `bob123`
   - Convert: 20 ETH
   - Generate Portfolio (High risk)
   - Create Recommendation

   **User 3 (Charlie - 5 ETH):**
   - Logout
   - Login: `charlie` / `charlie123`
   - Convert: 5 ETH
   - Generate Portfolio (Low risk)
   - Create Recommendation

2. **Broker reviews all users:**
   - Logout
   - Login: `broker_john` / `john123`
   - Dropdown shows all 3 users:
     ```
     👤 alice - 8.0 ETH (rec_xxx)
     👤 bob - 20.0 ETH (rec_yyy)
     👤 charlie - 5.0 ETH (rec_zzz)
     ```
   - Select alice → See her 8 ETH portfolios
   - Vote on alice's portfolio
   - Select bob → See his 20 ETH portfolios
   - Vote on bob's portfolio
   - Select charlie → See his 5 ETH portfolios
   - Vote on charlie's portfolio

3. **Verify earnings differ:**
   - Alice (8 ETH at $3000) = $24,000 initial investment
   - Bob (20 ETH at $3000) = $60,000 initial investment
   - Charlie (5 ETH at $3000) = $15,000 initial investment
   
   With 8% annual return over 30 days:
   - Alice profit: ~$158
   - Bob profit: ~$395
   - Charlie profit: ~$99

4. **Check ETH limits:**
   - Login as alice
   - Try to input 15 ETH (should be blocked)
   - Alert shown: "⚠️ You can only convert up to 10 ETH"
   - Input capped at 10 ETH maximum

---

## 💡 Benefits

### For Users
✅ **Personalized Experience**: Uses their actual ETH holdings  
✅ **Safety**: Can't accidentally over-commit funds  
✅ **Clarity**: Clear display of account balance and limits  
✅ **Realistic**: Projections based on their actual holdings  

### For Brokers
✅ **Multi-User Management**: See all users in one place  
✅ **User Context**: Know who they're advising (username + ETH)  
✅ **Efficient**: Quick switching between user portfolios  
✅ **Complete View**: Total earnings from all advisory services  

### For Platform
✅ **Scalability**: Supports unlimited users and brokers  
✅ **User Tracking**: Each recommendation linked to user account  
✅ **Metrics**: Can analyze by user, ETH holdings, risk levels  
✅ **Realistic**: Simulates real multi-user DeFi platform  

---

## 📝 Files Modified

1. `/Users/premg/Downloads/defi_oracle_broker_user_v2/seed_database.py` - ✅ NEW
2. `/frontend/src/pages/UserDashboard.js` - ✏️ MODIFIED
3. `/frontend/src/pages/BrokerDashboard.js` - ✏️ MODIFIED
4. `/api_server.py` - ✏️ MODIFIED
5. `/frontend/src/utils/api.js` - ✏️ MODIFIED

---

## 🚀 Status

✅ **User-specific ETH holdings** - Loaded from database  
✅ **ETH conversion limits** - Validated against account balance  
✅ **Multi-user support** - Brokers see all users  
✅ **Test data created** - 5 users, 4 brokers  
✅ **Username tracking** - Recommendations tagged with user info  
✅ **Auth token integration** - Automatic header inclusion  
✅ **No linter errors** - All code validated  
✅ **API server restarted** - Changes live  

**Ready to test with multiple users!** 🎉

---

## 🎬 Quick Start

```bash
# 1. Login as alice (10 ETH)
URL: http://localhost:3000/user-login
Username: alice
Password: alice123

# 2. Create portfolio (will use 10 ETH max)
Convert: 8 ETH
Generate: Portfolio
Create Recommendation

# 3. Logout and login as bob (25.5 ETH)
Username: bob
Password: bob123

# 4. Create portfolio (will use 25.5 ETH max)
Convert: 20 ETH
Generate: Portfolio
Create Recommendation

# 5. Login as broker to see both users
URL: http://localhost:3000/broker-login
Username: broker_john
Password: john123

# 6. Switch between user portfolios
Dropdown: Select alice or bob
Review and vote on each
```

Enjoy the multi-user experience! 👥✨

