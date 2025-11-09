import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import PortfolioChart from '../components/PortfolioChart';

function BrokerDashboard() {
  const [recommendations, setRecommendations] = useState({});
  const [selectedRecId, setSelectedRecId] = useState('');
  const [currentRec, setCurrentRec] = useState(null);
  const [votes, setVotes] = useState({});
  const [decision, setDecision] = useState(null);
  const [selectedVote, setSelectedVote] = useState('');
  const [totalBrokerEarnings, setTotalBrokerEarnings] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (selectedRecId) {
      loadRecommendationDetails();
    }
  }, [selectedRecId]);

  const loadRecommendations = async () => {
    try {
      const response = await api.getRecommendations();
      setRecommendations(response.data);
      
      // Auto-select the first recommendation if available
      const recIds = Object.keys(response.data).sort().reverse();
      if (recIds.length > 0 && !selectedRecId) {
        setSelectedRecId(recIds[0]);
      }
      
      // Get broker-specific earnings
      try {
        const earningsResponse = await api.getBrokerEarnings();
        setTotalBrokerEarnings(earningsResponse.data.total_earnings);
      } catch (err) {
        console.error('Error loading broker earnings:', err);
        setTotalBrokerEarnings(0);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadRecommendationDetails = async () => {
    try {
      const response = await api.getRecommendation(selectedRecId);
      setCurrentRec(response.data.recommendation);
      setVotes(response.data.votes);
      setDecision(response.data.decision);
      
      // Set first portfolio as default vote choice
      if (response.data.recommendation?.portfolios) {
        const portfolioNames = Object.keys(response.data.recommendation.portfolios);
        if (portfolioNames.length > 0) {
          setSelectedVote(portfolioNames[0]);
        }
      }
    } catch (error) {
      console.error('Error loading recommendation details:', error);
    }
  };

  const handleSubmitVote = async () => {
    try {
      await api.submitVote(selectedRecId, selectedVote);
      alert('Vote recorded ✅');
      loadRecommendationDetails(); // Reload to show updated votes
      loadRecommendations(); // Reload to update earnings if decision was made
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Error submitting vote. Please try again.');
    }
  };

  const recIds = Object.keys(recommendations).sort().reverse();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🧑‍💼 Broker Dashboard</h1>
        <p className="page-subtitle">
          Review anonymous profile & two portfolios, then vote. Educational only.
        </p>
      </div>

      {/* Total Broker Earnings */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        marginBottom: '30px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            fontSize: '18px', 
            color: '#ffffff',
            marginBottom: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            💰 Total Broker Earnings
          </h3>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: '900',
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            ${totalBrokerEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
            <p style={{ 
              fontSize: '14px', 
              color: '#FFD700',
              margin: 0
            }}>
              Your earnings from recommendations you voted on (3% of profits)
            </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', fontSize: '24px', color: 'rgba(232, 234, 237, 0.9)' }}>
          📋 Open Recommendations
        </h2>
        
        {recIds.length === 0 ? (
          <div className="alert alert-info">
            No recommendations yet. Ask a user to create one from the User Dashboard.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: 'rgba(232, 234, 237, 0.9)'
              }}>
                Select User Portfolio (Total: {recIds.length} users)
              </label>
              <select 
                value={selectedRecId} 
                onChange={(e) => setSelectedRecId(e.target.value)}
              >
                {recIds.map(id => {
                  const rec = recommendations[id];
                  const username = 'Anonymous';
                  const ethHoldings = rec?.input?.profile?.eth_holdings || 0;
                  return (
                    <option key={id} value={id}>
                      👤 {username} - {ethHoldings} ETH ({id})
                    </option>
                  );
                })}
              </select>
            </div>

            {currentRec && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    <strong style={{ color: 'rgba(232, 234, 237, 0.9)' }}>User (anonymous id):</strong>
                    <code style={{ 
                      background: 'rgba(139, 92, 246, 0.2)', 
                      padding: '6px 12px', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#ffffff',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      {currentRec.user_hash}
                    </code>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    marginBottom: '12px',
                    fontSize: '18px',
                    color: 'rgba(232, 234, 237, 0.9)',
                    fontWeight: '600'
                  }}>
                    👤 User Profile - {currentRec.user_hash}
                  </h3>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{ 
                          background: 'rgba(139, 92, 246, 0.15)',
                          borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
                        }}>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Property</th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(currentRec.input.profile).map(([key, value], idx) => (
                          <tr key={key} style={{ 
                            borderBottom: idx < Object.entries(currentRec.input.profile).length - 1 
                              ? '1px solid rgba(139, 92, 246, 0.1)' 
                              : 'none'
                          }}>
                            <td style={{ 
                              padding: '14px 20px',
                              color: '#FFD700',
                              fontWeight: '500'
                            }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            <td style={{ 
                              padding: '14px 20px',
                              color: '#e8eaed',
                              fontWeight: '600'
                            }}>
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    marginBottom: '12px',
                    fontSize: '18px',
                    color: 'rgba(232, 234, 237, 0.9)',
                    fontWeight: '600'
                  }}>
                    📊 Market Snapshot at Creation
                  </h3>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse'
                    }}>
                      <thead>
                        <tr style={{ 
                          background: 'rgba(99, 102, 241, 0.15)',
                          borderBottom: '1px solid rgba(99, 102, 241, 0.3)'
                        }}>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Metric</th>
                          <th style={{ 
                            padding: '14px 20px', 
                            textAlign: 'left',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(currentRec.input.market).map(([key, value], idx) => (
                          <tr key={key} style={{ 
                            borderBottom: idx < Object.entries(currentRec.input.market).length - 1 
                              ? '1px solid rgba(99, 102, 241, 0.1)' 
                              : 'none'
                          }}>
                            <td style={{ 
                              padding: '14px 20px',
                              color: '#FFD700',
                              fontWeight: '500'
                            }}>
                              {key === 'apy' ? 'APY' : 
                               key === 'tvl_b' ? 'TVL (Billions)' : 
                               key === 'eth_usd' ? 'ETH Price (USD)' : 
                               key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            <td style={{ 
                              padding: '14px 20px',
                              color: '#e8eaed',
                              fontWeight: '600'
                            }}>
                              {key === 'apy' ? `${value}%` : 
                               key === 'tvl_b' ? `$${value}B` : 
                               key === 'eth_usd' ? `$${value.toLocaleString()}` : 
                               String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {currentRec.summary && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ 
                      marginBottom: '12px',
                      fontSize: '18px',
                      color: 'rgba(232, 234, 237, 0.9)',
                      fontWeight: '600'
                    }}>
                      🤖 AI Summary
                    </h3>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                      padding: '20px 24px', 
                      borderRadius: '12px',
                      lineHeight: '1.8',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      color: 'rgba(232, 234, 237, 0.9)',
                      fontSize: '15px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
                    }}>
                      {currentRec.summary}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Portfolios */}
      {currentRec && currentRec.portfolios && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', fontSize: '24px', color: 'rgba(232, 234, 237, 0.9)' }}>
            📊 Portfolios
          </h2>
          {Object.entries(currentRec.portfolios).map(([name, allocation]) => (
            <PortfolioChart key={name} name={name} portfolio={allocation} />
          ))}
        </div>
      )}

      {/* Voting */}
      {currentRec && currentRec.portfolios && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', fontSize: '24px', color: 'rgba(232, 234, 237, 0.9)' }}>
            🗳️ Cast Your Vote
          </h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: 'rgba(232, 234, 237, 0.9)'
            }}>
              Vote for one
            </label>
            <select 
              value={selectedVote} 
              onChange={(e) => setSelectedVote(e.target.value)}
            >
              {Object.keys(currentRec.portfolios).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSubmitVote}>
            Submit Vote
          </button>

          {Object.keys(votes).length > 0 && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <strong style={{ 
                display: 'block', 
                marginBottom: '16px',
                fontSize: '16px',
                color: 'rgba(232, 234, 237, 0.9)'
              }}>
                📊 Current Votes:
              </strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {Object.entries(votes).map(([portfolio, count]) => (
                  <li key={portfolio} style={{ 
                    marginBottom: '10px', 
                    fontSize: '15px',
                    padding: '10px 14px',
                    background: 'rgba(139, 92, 246, 0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <span style={{ color: '#FFD700' }}>
                      {portfolio}
                    </span>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {count} {count === 1 ? 'vote' : 'votes'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* User Decision */}
      {currentRec && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', fontSize: '24px', color: 'rgba(232, 234, 237, 0.9)' }}>
            ✅ User Decision & Time Limit
          </h2>
          {decision ? (
            <div style={{ 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)', 
              borderRadius: '12px', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
            }}>
              <p style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#ffffff', minWidth: '100px' }}>Decision:</strong> 
                <span style={{ 
                  color: '#e8eaed',
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  {decision.decision}
                </span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#ffffff', minWidth: '100px' }}>Time limit:</strong> 
                <span style={{ 
                  color: '#e8eaed',
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  {decision.time_limit_days} days
                </span>
              </p>
            </div>
          ) : (
            <div className="alert alert-info">
              ⏳ User has not decided yet. Waiting for decision...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrokerDashboard;

