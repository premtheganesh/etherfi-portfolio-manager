import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Add auth token to requests if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Health check
  health: () => axios.get(`${API_BASE_URL}/health`),
  
  // Get market data
  getMarketData: () => axios.get(`${API_BASE_URL}/market-data`),
  
  // Generate portfolios
  generatePortfolios: (profile, market) => 
    axios.post(`${API_BASE_URL}/generate-portfolios`, { profile, market }),
  
  // Create recommendation
  createRecommendation: (nickname, profile, market, portfolios, summary) =>
    axios.post(`${API_BASE_URL}/create-recommendation`, { 
      nickname, profile, market, portfolios, summary 
    }),
  
  // Get all recommendations
  getRecommendations: () => axios.get(`${API_BASE_URL}/recommendations`),
  
  // Get specific recommendation
  getRecommendation: (recId) => axios.get(`${API_BASE_URL}/recommendation/${recId}`),
  
  // Submit vote
  submitVote: (recId, choice) =>
    axios.post(`${API_BASE_URL}/vote`, { rec_id: recId, choice }),
  
  // Submit decision
  submitDecision: (recId, decision, timeLimitDays, ethHoldings, ethPrice, expectedReturn) =>
    axios.post(`${API_BASE_URL}/decision`, { 
      rec_id: recId, 
      decision, 
      time_limit_days: timeLimitDays,
      eth_holdings: ethHoldings,
      eth_price: ethPrice,
      expected_return: expectedReturn
    }),
  
  // Submit feedback
  submitFeedback: (recId, thumb, note) =>
    axios.post(`${API_BASE_URL}/feedback`, { rec_id: recId, thumb, note }),
  
  // Get broker-specific earnings
  getBrokerEarnings: () => axios.get(`${API_BASE_URL}/broker/earnings`),
  
  // Get broker profile stats
  getBrokerProfile: (brokerId) => axios.get(`${API_BASE_URL}/broker/profile/${brokerId}`),
};

