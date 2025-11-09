import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleGetStarted = (type) => {
    if (user) {
      // Already logged in, go to dashboard
      if (type === 'user' && user.user_type === 'user') {
        navigate('/user-dashboard');
      } else if (type === 'broker' && user.user_type === 'broker') {
        navigate('/broker-dashboard');
      } else {
        // Wrong user type, redirect to appropriate login
        navigate(type === 'user' ? '/user-login' : '/broker-login');
      }
    } else {
      // Not logged in, go to login
      navigate(type === 'user' ? '/user-login' : '/broker-login');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">DeFi Oracle Advisory System</h1>
        <p className="page-subtitle">
          AI-powered portfolio recommendations with professional broker insights
        </p>
        {user && (
          <div style={{ 
            marginTop: '20px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{ color: '#10b981', fontSize: '16px', fontWeight: '600' }}>
              ✅ Logged in as {user.username} ({user.user_type})
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px', marginTop: '40px' }}>
        <div className="card" style={{
          border: '2px solid rgba(139, 92, 246, 0.3)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>👤</div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#a78bfa' }}>For Users</h2>
            <p style={{ fontSize: '16px', color: 'rgba(232, 234, 237, 0.8)', marginBottom: '24px', lineHeight: '1.6' }}>
              Get personalized portfolio recommendations based on your risk profile
              and goals. Receive validation from professional brokers.
            </p>
            <button 
              onClick={() => handleGetStarted('user')}
              className="btn btn-primary" 
              style={{ display: 'inline-block', width: 'auto' }}
            >
              {user && user.user_type === 'user' ? 'Go to Dashboard' : 'Get Started →'}
            </button>
          </div>
        </div>

        <div className="card" style={{
          border: '2px solid rgba(16, 185, 129, 0.3)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧑‍💼</div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#6ee7b7' }}>For Brokers</h2>
            <p style={{ fontSize: '16px', color: 'rgba(232, 234, 237, 0.8)', marginBottom: '24px', lineHeight: '1.6' }}>
              Review AI-generated portfolios and provide expert recommendations.
              Earn rewards for your advisory services.
            </p>
            <button 
              onClick={() => handleGetStarted('broker')}
              className="btn btn-primary" 
              style={{ 
                display: 'inline-block', 
                width: 'auto',
                background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)'
              }}
            >
              {user && user.user_type === 'broker' ? 'Go to Dashboard' : 'Get Started →'}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '40px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>🔄 How It Works</h2>
        <ol style={{ fontSize: '16px', lineHeight: '1.8', color: '#e5e7eb', paddingLeft: '24px' }}>
          <li><strong>Sign Up:</strong> Create an account as a User or Broker</li>
          <li><strong>User Profile:</strong> Users input their ETH holdings, risk tolerance, and investment goals</li>
          <li><strong>AI Generation:</strong> Our system generates two optimized portfolio recommendations</li>
          <li><strong>Broker Review:</strong> Professional brokers review and vote on the recommendations</li>
          <li><strong>Decision & Rewards:</strong> Users make final decisions and rewards are distributed (96% User, 3% Broker, 1% Platform)</li>
        </ol>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '20px', marginTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center', background: 'rgba(139, 92, 246, 0.05)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
          <h3 style={{ fontSize: '18px', color: '#a78bfa', marginBottom: '8px' }}>AI-Powered</h3>
          <p style={{ fontSize: '14px', color: 'rgba(232, 234, 237, 0.7)' }}>
            Claude AI generates personalized portfolios
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
          <h3 style={{ fontSize: '18px', color: '#6ee7b7', marginBottom: '8px' }}>Secure</h3>
          <p style={{ fontSize: '14px', color: 'rgba(232, 234, 237, 0.7)' }}>
            Encrypted authentication & session management
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
          <h3 style={{ fontSize: '18px', color: '#818cf8', marginBottom: '8px' }}>Rewarding</h3>
          <p style={{ fontSize: '14px', color: 'rgba(232, 234, 237, 0.7)' }}>
            Fair profit distribution for all participants
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
