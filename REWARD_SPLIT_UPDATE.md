# 💰 Reward Split Update - Complete Guide

## 🎯 Overview

The reward split functionality has been completely overhauled to show **actual money earned** from portfolio profits instead of just arbitrary percentages. The system now calculates real earnings based on:

- User's ETH holdings
- Current ETH price
- Portfolio's expected return
- Time period selected

---

## 📊 How It Works

### Step 1: Calculate Initial Investment
```
initial_investment = eth_holdings × eth_price
Example: 5 ETH × $3,368 = $16,840
```

### Step 2: Calculate Expected Profit
```
annual_return = expected_return_pct / 100
time_fraction = time_limit_days / 365
profit = initial_investment × annual_return × time_fraction

Example: $16,840 × 0.08 × (30/365) = $110.68
```

### Step 3: Split the Profit
```
User:     96% = $106.25
Broker:    3% = $3.32
Platform:  1% = $1.11
```

---

## 🆕 New Features

### 1. Automatic Profit Calculation
- ✅ Based on actual portfolio expected return
- ✅ Prorated for time period (annualized to daily)
- ✅ Uses current ETH price from market data
- ✅ Dynamic, not hardcoded

### 2. Detailed Breakdown Display
The new UI shows:
- **Initial Investment**: Total value of ETH holdings
- **Expected Return**: Annual percentage from chosen portfolio
- **Time Period**: Investment horizon in days
- **Total Profit**: Calculated profit over the period

### 3. Beautiful Earnings Split Cards
Three color-coded cards showing:
- 🟣 **Your Earnings (96%)**: Portfolio returns
- 🟢 **Broker Earnings (3%)**: Advisory services
- 🟠 **Platform Fee (1%)**: Service maintenance

### 4. Final Portfolio Value
- Shows projected final value
- Breakdown of initial + profit
- Clear, large numbers for easy reading

---

## 📁 Files Modified

### 1. `backend.py`
**New Functions:**
```python
def calculate_profit(eth_holdings, eth_price, expected_return_pct, time_limit_days):
    """Calculate profit based on investment and expected return."""
    initial_investment = eth_holdings * eth_price
    annual_return = expected_return_pct / 100.0
    time_fraction = time_limit_days / 365.0
    profit = initial_investment * annual_return * time_fraction
    
    return {
        "initial_investment": round(initial_investment, 2),
        "profit": round(profit, 2),
        "final_value": round(initial_investment + profit, 2),
        "expected_return_pct": expected_return_pct,
        "time_period_days": time_limit_days
    }
```

**Enhanced Function:**
```python
def reward_split(total_reward):
    """Calculate reward split with actual dollar amounts."""
    return {
        "user": round(total_reward * 0.96, 2),
        "broker": round(total_reward * 0.03, 2),
        "platform": round(total_reward * 0.01, 2),
        "total": total_reward
    }
```

### 2. `api_server.py`
**Updated Endpoint:**
```python
@app.route('/api/decision', methods=['POST'])
def submit_decision():
    # Get parameters from frontend
    eth_holdings = data.get('eth_holdings', 5.0)
    eth_price = data.get('eth_price', 3000.0)
    expected_return = data.get('expected_return', 8.0)
    time_limit_days = data.get('time_limit_days', 30)
    
    # Calculate profit
    profit_info = calculate_profit(eth_holdings, eth_price, 
                                   expected_return, time_limit_days)
    
    # Calculate split
    split = reward_split(profit_info['profit'])
    
    return jsonify({
        "profit_info": profit_info,
        "reward_split": split
    })
```

### 3. `frontend/src/utils/api.js`
**Updated API Call:**
```javascript
submitDecision: (recId, decision, timeLimitDays, 
                 ethHoldings, ethPrice, expectedReturn) =>
  axios.post(`${API_BASE_URL}/decision`, { 
    rec_id: recId, 
    decision, 
    time_limit_days: timeLimitDays,
    eth_holdings: ethHoldings,
    eth_price: ethPrice,
    expected_return: expectedReturn
  })
```

### 4. `frontend/src/pages/UserDashboard.js`
**Key Changes:**
- Removed manual `estReward` input field
- Added automatic calculation from portfolio metrics
- Enhanced UI with detailed earnings breakdown
- Added `profitInfo` state variable

**New State:**
```javascript
const [profitInfo, setProfitInfo] = useState(null);
```

**Enhanced Handler:**
```javascript
const handleSubmitDecision = async () => {
  // Get expected return from selected portfolio
  let expectedReturn = 8.0; // Default
  
  if (decision !== 'No action' && portfolios[decision]) {
    const metrics = calculatePortfolioMetrics(portfolios[decision]);
    if (metrics) {
      expectedReturn = metrics.expectedReturn;
    }
  }
  
  const response = await api.submitDecision(
    currentRecId, 
    decision, 
    timeLimit, 
    ethHoldings,
    marketData?.eth_usd || 3000,
    expectedReturn
  );
  
  setProfitInfo(response.data.profit_info);
  setRewardSplit(response.data.reward_split);
};
```

---

## 🧪 How to Test

1. **Refresh your browser** (Cmd+Shift+R or Ctrl+Shift+R)

2. **Go to User Dashboard**

3. **Generate portfolios** (if not already done)
   - Fill in your profile (ETH holdings, risk, goal)
   - Click "Generate Portfolios"

4. **Create recommendation**
   - Click "Create Recommendation"
   - Note the recommendation ID

5. **Make your decision**
   - Scroll to "Your Decision" section
   - Select a portfolio from the dropdown
   - Set time limit (e.g., 30 days)
   - Click "Confirm Decision & Calculate Earnings"

6. **View earnings breakdown**
   - Scroll down to see the detailed breakdown
   - Should show:
     - Investment overview grid (4 metrics)
     - Profit calculation
     - 3 colored split cards
     - Final portfolio value
     - Explanatory note

---

## 💡 Example Scenarios

### Conservative Portfolio (30 days)
```
Investment:    5 ETH × $3,368 = $16,840
Expected Return: 6% annually
Time Period:   30 days
Profit:        $82.85

Split:
  Your Earnings:  $79.54 (96%)
  Broker:         $2.49  (3%)
  Platform:       $0.83  (1%)

Final Value: $16,922.85
```

### Aggressive Portfolio (90 days)
```
Investment:    10 ETH × $3,368 = $33,680
Expected Return: 12% annually
Time Period:   90 days
Profit:        $995.34

Split:
  Your Earnings:  $955.53 (96%)
  Broker:         $29.86  (3%)
  Platform:       $9.95   (1%)

Final Value: $34,675.34
```

---

## ✨ Key Improvements

### Before ❌
- Manual input of arbitrary reward amount
- Just showed percentages: 96%, 3%, 1%
- Not tied to actual portfolio performance
- No context about profit calculation
- Confusing for users

### After ✅
- Automatic calculation based on portfolio
- Shows actual dollar amounts earned
- Tied to portfolio's expected return
- Complete breakdown with context
- Beautiful visual presentation
- Transparent calculations
- Educational and informative

---

## 🎨 UI Components

### Investment Overview
```
┌─────────────────────────────────────────────┐
│ Initial Investment │ Expected Return        │
│     $16,840        │        8%              │
├─────────────────────────────────────────────┤
│ Time Period        │ Total Profit           │
│    30 days         │      $110.68           │
└─────────────────────────────────────────────┘
```

### Earnings Split
```
🟣 Your Earnings (96%)        $106.25
   Portfolio returns

🟢 Broker Earnings (3%)       $3.32
   Advisory services

🟠 Platform Fee (1%)          $1.11
   Service maintenance
```

### Final Value
```
╔═══════════════════════════════════╗
║  Your Final Portfolio Value       ║
║           $16,950.68              ║
║  ($16,840 initial + $110.68)      ║
╚═══════════════════════════════════╝
```

---

## 🔬 Technical Details

### Calculation Formula
```python
# Initial investment
initial = eth_holdings × eth_price

# Annual return rate
rate = expected_return_pct / 100

# Time as fraction of year
time = time_limit_days / 365

# Profit calculation
profit = initial × rate × time

# Final value
final = initial + profit

# Reward split
user_earnings = profit × 0.96
broker_earnings = profit × 0.03
platform_fee = profit × 0.01
```

### API Request Format
```json
{
  "rec_id": "abc123",
  "decision": "Portfolio A - Aggressive Growth",
  "time_limit_days": 30,
  "eth_holdings": 5.0,
  "eth_price": 3368.87,
  "expected_return": 8.5
}
```

### API Response Format
```json
{
  "success": true,
  "profit_info": {
    "initial_investment": 16840.00,
    "profit": 110.68,
    "final_value": 16950.68,
    "expected_return_pct": 8.5,
    "time_period_days": 30
  },
  "reward_split": {
    "user": 106.25,
    "broker": 3.32,
    "platform": 1.11,
    "total": 110.68
  }
}
```

---

## 🚀 Benefits

### For Users
- **Transparency**: See exactly how much they'll earn
- **Clarity**: Understand profit calculations
- **Trust**: No hidden fees or percentages
- **Education**: Learn about portfolio returns

### For Brokers
- **Fair Compensation**: 3% of profits for advisory services
- **Clear Value**: Users see the value brokers provide
- **Motivation**: Higher returns = higher earnings

### For Platform
- **Sustainability**: 1% fee for platform maintenance
- **Transparency**: Users know what they're paying
- **Trust**: Clear, fair pricing model

---

## 📝 Notes

- All calculations are **projections** based on expected returns
- Actual returns may vary based on market conditions
- The split percentages (96/3/1) remain constant
- Only the **profit** is split, not the initial investment
- User keeps 100% of their initial investment plus 96% of profits

---

## 🎉 Summary

The reward split system now provides:
1. **Realistic profit calculations** based on actual portfolio metrics
2. **Transparent earnings breakdown** showing all participants
3. **Beautiful visual presentation** for easy understanding
4. **Automatic calculations** removing manual input errors
5. **Educational context** helping users understand returns

Users can now see exactly how much they, brokers, and the platform will earn from their portfolio's expected performance! 💰

