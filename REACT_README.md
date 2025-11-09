# DeFi Oracle Duo v2 - React Edition

A modern React + Flask application for DeFi portfolio management with user and broker dashboards.

## 🚀 Features

- **User Dashboard**: Create anonymous profiles, generate AI-powered portfolio recommendations, collect broker votes, and make decisions
- **Broker Dashboard**: Review user profiles and portfolios, cast votes on recommendations
- **Real-time Market Data**: Fetch live EtherFi APY, TVL, and ETH prices
- **AI-Powered Summaries**: Claude AI generates portfolio explanations
- **Beautiful UI**: Modern, gradient-based design with interactive charts

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🔧 Installation & Setup

### Backend Setup (Flask API)

1. **Install Python dependencies:**
```bash
pip install -r requirements_api.txt
```

2. **Create a `.env` file in the root directory:**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

3. **Start the Flask API server:**
```bash
python api_server.py
```

The API will run on `http://localhost:5000`

### Frontend Setup (React)

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install Node dependencies:**
```bash
npm install
```

3. **Start the React development server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🎯 Usage

### For Users:

1. Navigate to the **User Dashboard**
2. Fill in your profile (nickname, ETH holdings, risk preference, goals)
3. Click "Generate Portfolios" to get AI-powered recommendations
4. Review two portfolio options with visual charts
5. Create a recommendation for broker voting
6. Set your time limit and review broker votes
7. Make your final decision and submit feedback

### For Brokers:

1. Navigate to the **Broker Dashboard**
2. Select a recommendation from the dropdown
3. Review the anonymous user profile and market data
4. Examine both portfolio options with charts
5. Cast your vote for the preferred portfolio
6. View user decisions and time limits

## 🔌 API Endpoints

### Market Data
- `GET /api/health` - Health check
- `GET /api/market-data` - Fetch current market data (EtherFi, ETH price)

### Portfolio Management
- `POST /api/generate-portfolios` - Generate portfolio recommendations
- `POST /api/create-recommendation` - Create a new recommendation

### Recommendations
- `GET /api/recommendations` - Get all recommendations
- `GET /api/recommendation/<rec_id>` - Get specific recommendation details

### Voting & Decisions
- `POST /api/vote` - Submit broker vote
- `POST /api/decision` - Submit user decision
- `POST /api/feedback` - Submit feedback

## 🏗️ Project Structure

```
defi_oracle_broker_user_v2/
├── api_server.py           # Flask backend API
├── backend.py              # Business logic (portfolio generation, AI summaries)
├── utils.py                # Data storage utilities
├── requirements_api.txt    # Python dependencies
├── .env                    # Environment variables (create this)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── PortfolioChart.js    # Reusable chart component
│   │   ├── pages/
│   │   │   ├── Home.js              # Landing page
│   │   │   ├── UserDashboard.js     # User interface
│   │   │   └── BrokerDashboard.js   # Broker interface
│   │   ├── utils/
│   │   │   └── api.js               # API client functions
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── data/
    └── store.json          # JSON database (auto-created)
```

## 🎨 Tech Stack

### Backend
- **Flask**: Web framework for Python
- **Flask-CORS**: Enable cross-origin requests
- **Anthropic Claude**: AI-powered portfolio summaries
- **Requests**: HTTP library for API calls

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Recharts**: Beautiful React charts
- **CSS3**: Modern styling with gradients

## 🔒 Security Notes

- User identities are anonymized using SHA-256 hashing
- No actual financial transactions occur (educational only)
- API keys should be kept in `.env` and never committed to version control

## 🐛 Troubleshooting

**Backend won't start:**
- Check that all Python dependencies are installed
- Verify the `.env` file exists with valid API key
- Ensure port 5000 is not in use

**Frontend won't start:**
- Run `npm install` to install dependencies
- Check that Node.js version is 16+
- Clear npm cache: `npm cache clean --force`

**API connection errors:**
- Verify backend is running on port 5000
- Check CORS is enabled in Flask
- Confirm `proxy` setting in `frontend/package.json`

**Charts not displaying:**
- Ensure `recharts` is installed: `npm install recharts`
- Check browser console for errors

## 📝 Development

### Running in Development Mode

1. Start backend (Terminal 1):
```bash
python api_server.py
```

2. Start frontend (Terminal 2):
```bash
cd frontend
npm start
```

### Building for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/build/`

## 📄 License

Educational use only. Not financial advice.

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your own learning!

## ⚠️ Disclaimer

This application is for educational purposes only. It does not provide financial advice. Always do your own research and consult with qualified financial advisors before making investment decisions.

