# 🚀 Quick Start Guide

Get up and running with DeFi Oracle Duo v2 React Edition in 5 minutes!

## ⚡ Fast Setup

### Step 1: Install Dependencies

**Backend:**
```bash
pip install -r requirements_api.txt
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Step 2: Configure API Key

Create a `.env` file in the project root:
```bash
echo "ANTHROPIC_API_KEY=your_actual_api_key" > .env
```

Replace `your_actual_api_key` with your real Anthropic API key.

### Step 3: Start the Application

**Option A - Using the convenience script (macOS/Linux):**
```bash
./run_dev.sh
```

**Option B - Manual start (two terminals):**

Terminal 1 (Backend):
```bash
python api_server.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### Step 4: Open Your Browser

The app will automatically open at: **http://localhost:3000**

## 🎯 What to Try

1. **Home Page** - See overview and navigation
2. **User Dashboard** (`/user`) - Create portfolios and recommendations
3. **Broker Dashboard** (`/broker`) - Vote on recommendations

## 📂 What Was Created

```
Your Project/
├── api_server.py              ← Flask REST API backend
├── backend.py                 ← Business logic (portfolios, AI)
├── utils.py                   ← Data storage utilities
├── requirements_api.txt       ← Python dependencies
├── run_dev.sh                 ← Convenience startup script
├── REACT_README.md            ← Full documentation
├── QUICKSTART.md              ← This file
│
└── frontend/                  ← React application
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── PortfolioChart.js    ← Chart component
    │   ├── pages/
    │   │   ├── Home.js              ← Landing page
    │   │   ├── UserDashboard.js     ← User interface
    │   │   └── BrokerDashboard.js   ← Broker interface
    │   ├── utils/
    │   │   └── api.js               ← API client
    │   ├── App.js                   ← Main app with routing
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 🔑 Key Features

✅ **Modern React UI** - Beautiful gradient design with animations  
✅ **Flask REST API** - Clean separation of frontend/backend  
✅ **Live Market Data** - Real-time EtherFi & ETH prices  
✅ **AI Summaries** - Claude-powered portfolio explanations  
✅ **Interactive Charts** - Recharts for beautiful visualizations  
✅ **Responsive Design** - Works on desktop and mobile  

## ❓ Troubleshooting

**"Port already in use"**
- Kill processes on ports 3000 and 5000
- Or use different ports in the code

**"Module not found"**
- Run `pip install -r requirements_api.txt`
- Run `cd frontend && npm install`

**"API connection failed"**
- Ensure backend is running on port 5000
- Check console for error messages

**"No Anthropic API key"**
- Create `.env` file with your API key
- The app will work with fallback summaries if no key

## 📚 Next Steps

- Read `REACT_README.md` for detailed documentation
- Customize styling in `frontend/src/index.css`
- Add new features to `api_server.py`
- Extend components in `frontend/src/components/`

## 🎉 You're Ready!

Open http://localhost:3000 and start exploring!

