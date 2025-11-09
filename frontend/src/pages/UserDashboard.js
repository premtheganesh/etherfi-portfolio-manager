import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import PortfolioChart from '../components/PortfolioChart';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('guest');
  const [maxEthHoldings, setMaxEthHoldings] = useState(5.0); // Max ETH from user account
  const [ethHoldings, setEthHoldings] = useState(5.0); // Current ETH to convert
  const [eethHoldings, setEethHoldings] = useState(0);
  const [conversionRate, setConversionRate] = useState(1.0); // ETH to eETH rate
  const [isConverted, setIsConverted] = useState(false);
  const [risk, setRisk] = useState('medium');
  const [goal, setGoal] = useState('steady yield');
  const [portfolioType, setPortfolioType] = useState('etherfi-native'); // 'etherfi-native' or 'traditional'
  
  const [marketData, setMarketData] = useState(null);
  const [portfolios, setPortfolios] = useState(null);
  const [summary, setSummary] = useState('');
  const [currentRecId, setCurrentRecId] = useState('');
  const [userHash, setUserHash] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [votes, setVotes] = useState({});
  const [brokerVotes, setBrokerVotes] = useState({});
  const [timeLimit, setTimeLimit] = useState(30);
  const [decision, setDecision] = useState('No action');
  const [rewardSplit, setRewardSplit] = useState(null);
  const [profitInfo, setProfitInfo] = useState(null);
  const [lastVoteUpdate, setLastVoteUpdate] = useState(null);
  
  // Load user data and persisted state from localStorage on mount
  useEffect(() => {
    // Load logged-in user data
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Set ETH holdings from user account
      if (parsedUser.eth_holdings) {
        setMaxEthHoldings(parsedUser.eth_holdings);
        setEthHoldings(parsedUser.eth_holdings);
      }
      
      // Set nickname from username
      setNickname(parsedUser.username || 'guest');
    }
    
    loadMarketData();
    
    // Restore state from localStorage
    const savedRecId = localStorage.getItem('currentRecId');
    const savedUserHash = localStorage.getItem('userHash');
    const savedPortfolios = localStorage.getItem('portfolios');
    const savedSummary = localStorage.getItem('summary');
    
    if (savedRecId) {
      setCurrentRecId(savedRecId);
      console.log('Restored recommendation ID:', savedRecId);
    }
    if (savedUserHash) {
      setUserHash(savedUserHash);
    }
    if (savedPortfolios) {
      try {
        setPortfolios(JSON.parse(savedPortfolios));
      } catch (e) {
        console.error('Error parsing saved portfolios:', e);
      }
    }
    if (savedSummary) {
      setSummary(savedSummary);
    }
  }, []);

  // Real-time polling for vote updates
  useEffect(() => {
    if (currentRecId) {
      // Load immediately
      loadRecommendationData();
      
      // Then poll every 3 seconds for real-time updates
      const pollInterval = setInterval(() => {
        loadRecommendationData();
      }, 3000);
      
      // Cleanup interval on unmount or when recId changes
      return () => clearInterval(pollInterval);
    }
  }, [currentRecId]);

  const loadMarketData = async () => {
    try {
      const response = await api.getMarketData();
      setMarketData(response.data);
      // Set eETH conversion rate (typically slightly favorable, e.g., 1 ETH = 0.98 eETH)
      // In reality, this would come from ether.fi API
      setConversionRate(0.98 + Math.random() * 0.04); // Simulated rate between 0.98-1.02
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  };

  const handleConvertToEeth = () => {
    if (ethHoldings <= 0) {
      alert('Please enter a valid ETH amount');
      return;
    }
    const convertedAmount = ethHoldings * conversionRate;
    setEethHoldings(convertedAmount);
    setIsConverted(true);
    alert(`✅ Converted ${ethHoldings} ETH to ${convertedAmount.toFixed(4)} eETH!\n\nYou can now generate portfolios with ether.fi protocols.`);
  };

  const loadRecommendationData = async () => {
    try {
      const response = await api.getRecommendation(currentRecId);
      setVotes(response.data.votes || {});
      setBrokerVotes(response.data.broker_votes || {});
      setLastVoteUpdate(new Date());
      console.log('Votes updated:', response.data.votes);
      console.log('Broker votes:', response.data.broker_votes);
    } catch (error) {
      console.error('Error loading recommendation data:', error);
    }
  };

  const handleGeneratePortfolios = async () => {
    if (!isConverted) {
      alert('⚠️ Please convert your ETH to eETH first!\n\nClick the "Convert to eETH" button to stake your ETH with ether.fi.');
      return;
    }
    
    setLoading(true);
    try {
      const profile = { 
        eth_holdings: ethHoldings,
        eeth_holdings: eethHoldings,
        risk, 
        goal,
        portfolio_type: portfolioType  // Add portfolio type selection
      };
      const market = {
        apy: marketData.etherfi.apy,
        tvl_b: marketData.etherfi.tvl_b,
        eth_usd: marketData.eth_usd
      };
      
      const response = await api.generatePortfolios(profile, market);
      console.log('Portfolio response:', response.data);
      
      if (response.data && response.data.portfolios) {
      setPortfolios(response.data.portfolios);
        setSummary(response.data.summary || '');
        
        // Persist to localStorage
        localStorage.setItem('portfolios', JSON.stringify(response.data.portfolios));
        localStorage.setItem('summary', response.data.summary || '');
        
        console.log('Portfolios set:', response.data.portfolios);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating portfolios:', error);
      alert('Error generating portfolios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate projected growth data for line chart
  const generateProjectedGrowth = () => {
    if (!portfolios || !marketData) return [];
    
    const months = ['Now', '3M', '6M', '9M', '1Y', '18M', '2Y'];
    const baseApy = marketData.etherfi.apy || 4.5;
    
    return months.map((month, idx) => {
      const timeMultiplier = idx * 0.25; // Each step is ~3 months
      const portfolioA = Object.keys(portfolios)[0];
      const portfolioB = Object.keys(portfolios)[1];
      
      // Calculate growth based on portfolio metrics
      const calcGrowth = (portfolio) => {
        const metrics = calculatePortfolioMetrics(portfolios[portfolio]);
        if (!metrics) return 100;
        
        // Use the calculated expected return from metrics
        const annualReturn = parseFloat(metrics.expectedReturn) / 100;
        const growth = annualReturn * timeMultiplier;
        
        return (1 + growth) * 100;
      };
      
      return {
        month,
        [portfolioA]: calcGrowth(portfolioA).toFixed(2),
        [portfolioB]: calcGrowth(portfolioB).toFixed(2)
      };
    });
  };

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = (portfolio) => {
    if (!portfolio || !marketData) return null;
    
    const allocation = portfolio;
    const baseApy = marketData.etherfi.apy || 4.5;
    
    // Calculate metrics based on ether.fi protocols
    let cryptoExposure = 0;
    let stableExposure = 0;
    let expectedReturn = 0;
    let riskScore = 0;
    
    Object.entries(allocation).forEach(([asset, weight]) => {
      const w = weight / 100;
      
      // Map each asset to returns and risk
      if (asset === 'weETH Staking') {
        cryptoExposure += weight;
        expectedReturn += w * (baseApy * 1.2); // 20% boost
        riskScore += w * 5;
      } else if (asset === 'Liquid Vaults') {
        cryptoExposure += weight;
        expectedReturn += w * (baseApy * 1.8);
        riskScore += w * 7;
      } else if (asset === 'Aave Integration') {
        cryptoExposure += weight;
        expectedReturn += w * (baseApy * 1.4);
        riskScore += w * 5;
      } else if (asset === 'Pendle Integration') {
        cryptoExposure += weight;
        expectedReturn += w * (baseApy * 1.5);
        riskScore += w * 6;
      } else if (asset === 'Gearbox Integration') {
        cryptoExposure += weight;
        expectedReturn += w * (baseApy * 2.0);
        riskScore += w * 8;
      } else if (asset === 'eBTC') {
        cryptoExposure += weight;
        expectedReturn += w * 12;
        riskScore += w * 7;
      } else if (asset === 'eUSD Stablecoins') {
        stableExposure += weight;
        expectedReturn += w * (baseApy * 0.8);
        riskScore += w * 2;
      } else if (asset === 'US Stocks') {
        stableExposure += weight;
        expectedReturn += w * 10;
        riskScore += w * 4;
      } else if (asset === 'ether.fi Cash') {
        stableExposure += weight;
        expectedReturn += w * 3;
        riskScore += w * 1;
      } else if (asset === 'eETH') {
        cryptoExposure += weight;
        expectedReturn += w * baseApy;
        riskScore += w * 6;
      } else if (asset === 'BTC/Alts') {
        cryptoExposure += weight;
        expectedReturn += w * 15;
        riskScore += w * 8;
      } else if (asset === 'Cash/FD') {
        stableExposure += weight;
        expectedReturn += w * 4;
        riskScore += w * 1;
      } else {
        // Unknown asset
        cryptoExposure += weight * 0.5;
        stableExposure += weight * 0.5;
        expectedReturn += w * 8;
        riskScore += w * 5;
      }
    });
    
    // Diversification score
    const numAssets = Object.keys(allocation).filter(k => allocation[k] > 0).length;
    const diversificationScore = Math.min(10, numAssets * 1.5).toFixed(0);
    
    return {
      expectedReturn: expectedReturn.toFixed(2),
      riskScore: riskScore.toFixed(1),
      diversificationScore,
      cryptoExposure: cryptoExposure.toFixed(1),
      stableExposure: stableExposure.toFixed(1)
    };
  };

  // Calculate potential broker earnings if user selects their recommended portfolio
  const calculateBrokerEarnings = (portfolioName) => {
    if (!portfolios || !marketData) return 0;
    
    const portfolio = portfolios[portfolioName];
    if (!portfolio) return 0;
    
    const metrics = calculatePortfolioMetrics(portfolio);
    if (!metrics) return 0;
    
    // Calculate potential profit
    const initialValue = ethHoldings * marketData.eth_usd;
    const expectedReturnPct = parseFloat(metrics.expectedReturn);
    const annualizedReturn = (expectedReturnPct / 100) * initialValue;
    const timePeriod = timeLimit / 365; // Convert days to years
    const totalProfit = annualizedReturn * timePeriod;
    
    // Broker gets 3% of profit
    const brokerShare = totalProfit * 0.03;
    
    return brokerShare;
  };

  const handleCreateRecommendation = async () => {
    try {
      const profile = { eth_holdings: ethHoldings, risk, goal };
      const market = {
        apy: marketData.etherfi.apy,
        tvl_b: marketData.etherfi.tvl_b,
        eth_usd: marketData.eth_usd
      };
      
      const response = await api.createRecommendation(nickname, profile, market, portfolios, summary);
      const recId = response.data.rec_id;
      const userHashValue = response.data.user_hash;
      
      setCurrentRecId(recId);
      setUserHash(userHashValue);
      
      // Persist to localStorage
      localStorage.setItem('currentRecId', recId);
      localStorage.setItem('userHash', userHashValue);
      
      alert(`Recommendation created! Share ID with broker: ${recId}`);
      console.log('Recommendation created. Votes will auto-refresh every 3 seconds.');
    } catch (error) {
      console.error('Error creating recommendation:', error);
      alert('Error creating recommendation. Please try again.');
    }
  };

  const handleSubmitDecision = async () => {
    try {
      // Get expected return from the selected portfolio
      let expectedReturn = 8.0; // Default return percentage
      
      if (decision !== 'No action' && portfolios && portfolios[decision]) {
        // Calculate expected return from the portfolio metrics
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
      
      setRewardSplit(response.data.reward_split);
      setProfitInfo(response.data.profit_info);
      
      // Automatically send feedback to LLM
      try {
        await api.submitFeedback(currentRecId, '👍', `User selected: ${decision} with ${timeLimit} days time limit`);
        alert('✅ Decision saved!\n📊 Projected earnings calculated!\n🤖 Feedback sent to AI system!\n\nScroll down to see your earnings breakdown.');
      } catch (feedbackError) {
        console.error('Error submitting feedback:', feedbackError);
        // Don't fail the whole operation if feedback fails
        alert('✅ Decision saved!\n📊 Projected earnings calculated!\n⚠️ Feedback to AI could not be sent.\n\nScroll down to see your earnings breakdown.');
      }
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Error submitting decision. Please try again.');
    }
  };

  const handleClearSession = () => {
    if (window.confirm('Clear current session? This will reset portfolios and recommendation data.')) {
      localStorage.removeItem('currentRecId');
      localStorage.removeItem('userHash');
      localStorage.removeItem('portfolios');
      localStorage.removeItem('summary');
      
      setCurrentRecId('');
      setUserHash('');
      setPortfolios(null);
      setSummary('');
      setVotes({});
      setBrokerVotes({});
      setRewardSplit(null);
      setProfitInfo(null);
      setLastVoteUpdate(null);
      
      alert('Session cleared! You can now generate new portfolios.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 User Dashboard</h1>
        <p className="page-subtitle">
          Anonymous profile → two portfolios → broker votes → you decide. Educational demo only.
        </p>
        {(currentRecId || portfolios) && (
          <button 
            onClick={handleClearSession}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              fontSize: '14px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#dc2626';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.color = '#dc2626';
            }}
          >
            🔄 Clear Session & Start Fresh
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className="card">
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Your Anonymized Profile</h2>
        <div className="grid grid-cols-3">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Nickname (for anonymous ID only)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              ETH to Convert (Max: {maxEthHoldings} ETH)
            </label>
            <input
              type="number"
              value={ethHoldings}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value <= maxEthHoldings) {
                  setEthHoldings(value);
                } else {
                  setEthHoldings(maxEthHoldings);
                  alert(`⚠️ You can only convert up to ${maxEthHoldings} ETH from your account balance.`);
                }
              }}
              step="0.1"
              min="0"
              max={maxEthHoldings}
            />
            <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.6)', marginTop: '6px' }}>
              Account Balance: {maxEthHoldings} ETH
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Risk preference
            </label>
            <select value={risk} onChange={(e) => setRisk(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Goal (e.g., steady yield)
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
        {userHash && (
          <div className="alert alert-info" style={{ marginTop: '20px' }}>
            Anonymous ID: <code>{userHash}</code>
          </div>
        )}
      </div>

      {/* ETH to eETH Conversion */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
        border: isConverted ? '2px solid rgba(16, 185, 129, 0.5)' : '2px solid rgba(139, 92, 246, 0.3)'
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🔄 Convert ETH to eETH (ether.fi)
          {isConverted && <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>✅ Converted</span>}
        </h2>
        
        <div style={{ 
          padding: '16px', 
          background: 'rgba(139, 92, 246, 0.08)', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            Stake your ETH with <strong>ether.fi</strong> to get eETH (restaked ETH) and access:
          </p>
          <ul style={{ 
            fontSize: '14px', 
            lineHeight: '1.8',
            paddingLeft: '20px',
            marginBottom: '0'
          }}>
            <li>🏆 <strong>weETH</strong> - Value-accruing restaked ETH</li>
            <li>💎 <strong>Liquid Vaults</strong> - Automated DeFi strategies</li>
            <li>🔗 <strong>400+ Integrations</strong> - Aave, Pendle, Gearbox & more</li>
            <li>💳 <strong>3% Cashback</strong> - ether.fi Cash card rewards</li>
          </ul>
        </div>

        <div className="grid grid-cols-3" style={{ gap: '20px', marginBottom: '20px' }}>
          <div style={{ 
            padding: '16px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
              Your ETH
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#a78bfa' }}>
              {ethHoldings.toFixed(4)}
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
              Conversion Rate
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#818cf8' }}>
              {conversionRate.toFixed(4)}
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: isConverted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '10px',
            border: isConverted ? '1px solid rgba(16, 185, 129, 0.3)' : 'none'
          }}>
            <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
              You'll Receive
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: isConverted ? '#10b981' : '#a78bfa' }}>
              {(ethHoldings * conversionRate).toFixed(4)} <span style={{ fontSize: '14px' }}>eETH</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleConvertToEeth}
            disabled={isConverted || ethHoldings <= 0}
            style={{
              opacity: isConverted ? 0.6 : 1,
              cursor: isConverted ? 'not-allowed' : 'pointer',
              flex: 1
            }}
          >
            {isConverted ? '✅ Already Converted to eETH' : '🔄 Convert to eETH Now'}
          </button>

          {isConverted && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setIsConverted(false);
                setEethHoldings(0);
                setPortfolios(null);
                alert('✅ Conversion reset!\n\nYou can now edit your ETH amount and convert again.');
              }}
              style={{
                padding: '12px 20px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid #dc2626'
              }}
            >
              🔄 Reset & Convert Again
            </button>
          )}
        </div>

        {isConverted && (
          <div style={{ 
            marginTop: '15px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <strong style={{ color: '#10b981' }}>✅ Success!</strong>
            <p style={{ marginTop: '8px', fontSize: '14px', marginBottom: '0' }}>
              You now have <strong>{eethHoldings.toFixed(4)} eETH</strong> ready for ether.fi portfolio strategies.
              Click "Generate Portfolios" to see allocation recommendations!
            </p>
          </div>
        )}
      </div>

      {/* Market Metrics */}
      {marketData && (
        <div className="grid grid-cols-3">
          <div className="metric-card">
            <div className="metric-label">EtherFi APY</div>
            <div className="metric-value">{marketData.etherfi.apy}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">EtherFi TVL</div>
            <div className="metric-value">{marketData.etherfi.tvl_b}B USD</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">ETH Price</div>
            <div className="metric-value">${marketData.eth_usd.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Generate Portfolios */}
      <div className="card">
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Two Portfolio Recommendations</h2>
        
        {/* Portfolio Type Selection */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontSize: '15px', 
            fontWeight: '600',
            color: '#a78bfa'
          }}>
            Select Portfolio Strategy Type:
          </label>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '14px 20px',
              background: portfolioType === 'etherfi-native' 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
                : 'rgba(255, 255, 255, 0.03)',
              border: portfolioType === 'etherfi-native' 
                ? '2px solid rgba(139, 92, 246, 0.6)' 
                : '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flex: '1',
              minWidth: '240px'
            }}>
              <input
                type="radio"
                value="etherfi-native"
                checked={portfolioType === 'etherfi-native'}
                onChange={(e) => setPortfolioType(e.target.value)}
                style={{ 
                  marginRight: '12px',
                  cursor: 'pointer',
                  width: '18px',
                  height: '18px'
                }}
              />
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '15px',
                  color: portfolioType === 'etherfi-native' ? '#a78bfa' : '#e8eaed',
                  marginBottom: '4px'
                }}>
                  🏆 ether.fi Native
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.6)' }}>
                  weETH, Liquid Vaults, Aave, Pendle, Gearbox, eBTC, eUSD
                </div>
              </div>
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '14px 20px',
              background: portfolioType === 'traditional' 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
                : 'rgba(255, 255, 255, 0.03)',
              border: portfolioType === 'traditional' 
                ? '2px solid rgba(139, 92, 246, 0.6)' 
                : '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flex: '1',
              minWidth: '240px'
            }}>
              <input
                type="radio"
                value="traditional"
                checked={portfolioType === 'traditional'}
                onChange={(e) => setPortfolioType(e.target.value)}
                style={{ 
                  marginRight: '12px',
                  cursor: 'pointer',
                  width: '18px',
                  height: '18px'
                }}
              />
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '15px',
                  color: portfolioType === 'traditional' ? '#a78bfa' : '#e8eaed',
                  marginBottom: '4px'
                }}>
                  💼 Traditional Mix
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.6)' }}>
                  eETH, BTC/Alts, US Stocks, Cash/FD
                </div>
              </div>
            </label>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleGeneratePortfolios}
          disabled={loading || !marketData}
        >
          {loading ? 'Generating...' : 'Generate Portfolios'}
        </button>

        {/* {summary && (
          <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ lineHeight: '1.6' }}>{summary}</p>
          </div>
        )} */}

        {portfolios && Object.keys(portfolios).length > 0 && (
          <div style={{ marginTop: '30px' }}>
            {/* Portfolio Metrics Comparison */}
            <div className="grid grid-cols-2" style={{ marginBottom: '30px', gap: '20px' }}>
              {Object.entries(portfolios).map(([name, allocation]) => {
                const metrics = calculatePortfolioMetrics(allocation);
                
                // Skip if metrics couldn't be calculated (no market data yet)
                if (!metrics) {
                  return null;
                }
                
                return (
                  <div key={name} className="card" style={{ 
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      marginBottom: '20px', 
                      color: '#a78bfa',
                      fontWeight: '600'
                    }}>
                      {name}
                    </h3>
                    <div className="grid grid-cols-2" style={{ gap: '15px' }}>
                      <div className="metric-card">
                        <div className="metric-label">Expected Return</div>
                        <div className="metric-value" style={{ color: '#10b981' }}>
                          {metrics.expectedReturn}%
                        </div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Risk Score</div>
                        <div className="metric-value" style={{ color: '#f59e0b' }}>
                          {metrics.riskScore}/10
                        </div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Crypto Exposure</div>
                        <div className="metric-value" style={{ color: '#8b5cf6' }}>
                          {metrics.cryptoExposure}%
                        </div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Stable Exposure</div>
                        <div className="metric-value" style={{ color: '#06b6d4' }}>
                          {metrics.stableExposure}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Projected Growth Chart */}
            <div className="card" style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                📈 Projected Portfolio Growth (Estimated)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={generateProjectedGrowth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    label={{ value: 'Portfolio Value ($100 base)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={Object.keys(portfolios)[0]} 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={Object.keys(portfolios)[1]} 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ 
                textAlign: 'center', 
                fontSize: '14px', 
                color: '#6b7280', 
                marginTop: '10px' 
              }}>
                * Educational projections based on historical asset class returns. Not financial advice.
              </p>
            </div>

            {/* Portfolio Allocation Charts */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                📊 Detailed Portfolio Allocations
              </h3>
            {Object.entries(portfolios).map(([name, allocation]) => (
              <PortfolioChart key={name} name={name} portfolio={allocation} />
            ))}
            </div>

            {/* Asset Allocation Comparison Bar Chart */}
            <div className="card" style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
                🔄 Asset Allocation Comparison
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={(() => {
                  // Dynamically extract all unique assets from both portfolios
                  const allAssets = new Set();
                  Object.values(portfolios).forEach(allocation => {
                    Object.keys(allocation).forEach(asset => allAssets.add(asset));
                  });
                  
                  const assets = Array.from(allAssets);
                  
                  return assets.map(asset => {
                    const data = { asset };
                    Object.entries(portfolios).forEach(([name, allocation]) => {
                      data[name] = allocation[asset] || 0;
                    });
                    return data;
                  });
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                  <XAxis 
                    dataKey="asset" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    style={{ fontSize: '12px', fill: '#e8eaed' }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Allocation %', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#e8eaed' }
                    }}
                    style={{ fontSize: '12px', fill: '#e8eaed' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(20, 20, 40, 0.95)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#e8eaed'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                  <Bar 
                    dataKey={Object.keys(portfolios)[0]} 
                    fill="#667eea"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey={Object.keys(portfolios)[1]} 
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleCreateRecommendation}
              style={{ marginTop: '20px' }}
            >
              Create Recommendation for Broker Voting
            </button>
          </div>
        )}
      </div>

      {/* Voting and Decision Section */}
      {currentRecId && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>⏱️ Set Your Time Limit (Mandatory)</h2>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Time limit (days)
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>📊 Broker Votes</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981',
                  animation: 'pulse 2s infinite'
                }}></span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Live Updates
                </span>
              </div>
            </div>
            
            {lastVoteUpdate && (
              <div style={{ 
                fontSize: '13px', 
                color: 'rgba(232, 234, 237, 0.7)', 
                marginBottom: '15px',
                padding: '8px 12px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                Last updated: {lastVoteUpdate.toLocaleTimeString()} 
                <span style={{ marginLeft: '10px' }}>🔄 Auto-refreshing every 3s</span>
              </div>
            )}
            
            {Object.keys(brokerVotes).length > 0 ? (
              <div>
                <div style={{ 
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: 'rgba(232, 234, 237, 0.8)',
                  fontWeight: '500'
                }}>
                  Individual Broker Votes & Potential Earnings
                </div>
                
              <ul style={{ listStyle: 'none', padding: 0 }}>
                  {Object.entries(brokerVotes).map(([brokerId, voteData]) => {
                    const potentialEarnings = calculateBrokerEarnings(voteData.choice);
                    
                    return (
                      <li key={brokerId} style={{ 
                        marginBottom: '12px', 
                        fontSize: '15px',
                        padding: '16px 18px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                          <div style={{ flex: 1 }}>
                            <Link
                              to={`/broker/profile/${voteData.broker_id}`}
                              style={{ 
                                color: '#a78bfa', 
                                fontWeight: '600',
                                marginBottom: '6px',
                                fontSize: '16px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.color = '#c4b5fd';
                                e.target.style.textDecoration = 'underline';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.color = '#a78bfa';
                                e.target.style.textDecoration = 'none';
                              }}
                            >
                              👤 {voteData.broker_username}
                            </Link>
                            <div style={{ 
                              color: 'rgba(232, 234, 237, 0.7)', 
                              fontSize: '13px',
                              marginBottom: '8px'
                            }}>
                              Broker ID: {voteData.broker_id}
                            </div>
                            <div style={{ 
                              color: 'rgba(232, 234, 237, 0.9)', 
                              fontWeight: '500',
                              padding: '6px 10px',
                              background: 'rgba(139, 92, 246, 0.15)',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}>
                              📌 Recommended: {voteData.choice}
                            </div>
                          </div>
                          
                          <div style={{ 
                            textAlign: 'right',
                            minWidth: '140px'
                          }}>
                            <div style={{ 
                              fontSize: '12px',
                              color: 'rgba(232, 234, 237, 0.6)',
                              marginBottom: '4px'
                            }}>
                              Potential Earnings
                            </div>
                            <div style={{ 
                              fontWeight: '700', 
                              fontSize: '18px',
                              color: '#10b981',
                              padding: '8px 12px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              borderRadius: '10px',
                              border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                              ${potentialEarnings.toFixed(2)}
                            </div>
                            <div style={{ 
                              fontSize: '11px',
                              color: 'rgba(232, 234, 237, 0.5)',
                              marginTop: '4px'
                            }}>
                              (if selected)
                            </div>
                          </div>
                        </div>
                  </li>
                    );
                  })}
              </ul>
                
                <div style={{ 
                  marginTop: '15px', 
                  padding: '12px 16px', 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)', 
                  borderRadius: '10px',
                  fontSize: '15px',
                  color: '#6ee7b7',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: '600'
                }}>
                  ✅ Total votes: <strong style={{ color: '#10b981' }}>{Object.keys(brokerVotes).length}</strong>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <strong>⏳ Waiting for broker votes...</strong>
                <br />
                <small>Share this ID with your broker: <code>{currentRecId}</code></small>
                <br />
                <small>Votes will appear here automatically when brokers cast them.</small>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>✅ Your Decision</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Choose a portfolio
              </label>
              <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option>No action</option>
                {portfolios && Object.keys(portfolios).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Time Limit (days)
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                min="1"
                step="1"
              />
              <p style={{ 
                fontSize: '13px', 
                color: 'rgba(232, 234, 237, 0.7)', 
                marginTop: '8px',
                lineHeight: '1.5'
              }}>
                Profit will be calculated based on your portfolio's expected return over this period.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleSubmitDecision}>
              Confirm Decision & Calculate Earnings
            </button>

            {profitInfo && rewardSplit && (
              <div className="card" style={{ 
                marginTop: '25px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '24px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  marginBottom: '20px',
                  color: '#10b981',
                  fontWeight: '700'
                }}>
                  💰 Projected Earnings Breakdown
                </h3>
                
                {/* Investment Overview */}
                <div style={{ 
                  marginBottom: '20px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
                        Initial Investment
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#a78bfa' }}>
                        ${profitInfo.initial_investment.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
                        Expected Return (Annual)
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                        {profitInfo.expected_return_pct}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
                        Time Period
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#818cf8' }}>
                        {profitInfo.time_period_days} days
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.7)', marginBottom: '6px' }}>
                        Total Profit
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                        ${profitInfo.profit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Split */}
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ 
                    fontSize: '16px', 
                    marginBottom: '15px',
                    color: 'rgba(232, 234, 237, 0.9)',
                    fontWeight: '600'
                  }}>
                    💸 How the ${profitInfo.profit.toLocaleString()} profit is distributed:
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* User Share */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                      borderRadius: '10px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#a78bfa', marginBottom: '4px' }}>
                          👤 Your Earnings (96%)
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.6)' }}>
                          Portfolio returns
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#a78bfa' }}>
                        ${rewardSplit.user.toLocaleString()}
                      </div>
                    </div>

                    {/* Broker Share */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
                          🤝 Broker Earnings (3%)
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.6)' }}>
                          Advisory services
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
                        ${rewardSplit.broker.toLocaleString()}
                      </div>
                    </div>

                    {/* Platform Share */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
                      borderRadius: '10px',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#f59e0b', marginBottom: '4px' }}>
                          🏢 Platform Fee (1%)
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.6)' }}>
                          Service maintenance
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>
                        ${rewardSplit.platform.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Value */}
                <div style={{ 
                  marginTop: '20px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                  borderRadius: '10px',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: 'rgba(232, 234, 237, 0.8)', marginBottom: '8px' }}>
                    Your Final Portfolio Value
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#a78bfa' }}>
                    ${profitInfo.final_value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.6)', marginTop: '6px' }}>
                    (${profitInfo.initial_investment.toLocaleString()} initial + ${profitInfo.profit.toLocaleString()} profit)
                  </div>
                </div>

                <div style={{ 
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'rgba(232, 234, 237, 0.7)',
                  lineHeight: '1.6',
                  borderLeft: '3px solid #6366f1'
                }}>
                  <strong>Note:</strong> These are projected earnings based on the portfolio's expected return of {profitInfo.expected_return_pct}% annually over {profitInfo.time_period_days} days. Actual returns may vary based on market conditions.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserDashboard;

