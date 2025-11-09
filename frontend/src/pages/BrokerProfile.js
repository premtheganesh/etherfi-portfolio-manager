import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function BrokerProfile() {
  const { brokerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrokerProfile();
  }, [brokerId]);

  const loadBrokerProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getBrokerProfile(brokerId);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading broker profile:', err);
      setError('Failed to load broker profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        color: '#e8eaed'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '18px' }}>Loading broker profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        color: '#e8eaed'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>{error || 'Broker not found'}</div>
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for portfolio recommendations chart
  const portfolioData = Object.entries(profile.portfolio_recommendations || {}).map(([name, count]) => ({
    name: name.replace('Portfolio ', '').substring(0, 30),
    value: count
  }));

  const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div>
      {/* Header Section */}
      <div className="page-header" style={{ position: 'relative' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '8px 16px',
            fontSize: '14px',
            background: 'rgba(139, 92, 246, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(139, 92, 246, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(139, 92, 246, 0.1)';
          }}
        >
          ← Back
        </button>
        
        <h1 className="page-title">👤 Broker Profile</h1>
        <p className="page-subtitle">
          Public statistics and performance metrics
        </p>
      </div>

      <div className="dashboard-container">
        {/* Broker Info Card */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                fontSize: '32px', 
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {profile.username}
              </h2>
              <div style={{ 
                color: '#FFD700', 
                fontSize: '14px' 
              }}>
                Broker ID: {profile.broker_id}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Total Earnings */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#FFD700', marginBottom: '8px' }}>
              💰 Total Earnings
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '4px'
            }}>
              ${profile.total_earnings.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.5)' }}>
              From {profile.successful_recommendations} successful recommendations
            </div>
          </div>

          {/* Total Votes */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#FFD700', marginBottom: '8px' }}>
              📊 Total Votes Cast
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
              {profile.total_votes}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.5)' }}>
              Portfolio recommendations
            </div>
          </div>

          {/* Success Rate */}
          <div className="card" style={{
            background: profile.success_rate >= 50 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: profile.success_rate >= 50 
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#FFD700', marginBottom: '8px' }}>
              🎯 Success Rate
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              color: profile.success_rate >= 50 ? '#10b981' : '#f59e0b',
              marginBottom: '4px'
            }}>
              {profile.success_rate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.5)' }}>
              {profile.successful_recommendations} out of {profile.total_votes} followed
            </div>
          </div>

          {/* Most Recommended */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: '#FFD700', marginBottom: '8px' }}>
              ⭐ Most Recommended
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '4px',
              lineHeight: '1.3'
            }}>
              {portfolioData.length > 0 
                ? portfolioData.reduce((max, item) => item.value > max.value ? item : max, portfolioData[0]).name
                : 'N/A'
              }
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(232, 234, 237, 0.5)' }}>
              {portfolioData.length > 0 
                ? `${portfolioData.reduce((max, item) => item.value > max.value ? item : max, portfolioData[0]).value} times`
                : 'No votes yet'
              }
            </div>
          </div>
        </div>

        {/* Portfolio Recommendations Chart */}
        {portfolioData.length > 0 && (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
              📊 Portfolio Recommendation Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(20, 20, 40, 0.95)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#e8eaed'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty State */}
        {profile.total_votes === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#e8eaed' }}>
              No votes yet
            </h3>
            <p style={{ color: 'rgba(232, 234, 237, 0.6)', fontSize: '14px' }}>
              This broker hasn't cast any votes on portfolio recommendations yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrokerProfile;

