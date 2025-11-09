import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { showModal } = useModal();

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

      {/* Premium Feature Section */}
      <div className="card" style={{ 
        marginTop: '30px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
        border: '2px solid rgba(255, 215, 0, 0.5)',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Premium Badge */}
        <div className="premium-badge" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: '#000',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '1px',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
        }}>
          ⭐ PREMIUM
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', paddingRight: '120px' }}>
          <div style={{ 
            fontSize: '80px', 
            flexShrink: 0,
            filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))'
          }}>
            👑
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '32px', 
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '800'
            }}>
              Upgrade to Premium Access
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: '#e8eaed', 
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Get exclusive access to our <strong style={{ color: '#FFD700' }}>highest-rated premium brokers</strong> with proven track records and superior success rates.
            </p>
            
            {/* Premium Benefits */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ color: '#e8eaed', fontSize: '14px' }}>Top 5% Rated Brokers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ color: '#e8eaed', fontSize: '14px' }}>One Free Consultation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ color: '#e8eaed', fontSize: '14px' }}>Priority Portfolio Reviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ color: '#e8eaed', fontSize: '14px' }}>Advanced Analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ color: '#e8eaed', fontSize: '14px' }}>24/7 Support</span>
              </div>
            </div>

            <button 
              className="btn btn-premium"
              onClick={() => showModal(
                'Premium Feature Coming Soon!',
                'You\'ll get access to:\n• Top 5% rated brokers with 90%+ success rates\n• One FREE consultation with a premium broker\n• Priority portfolio reviews\n• Advanced analytics and insights\n• 24/7 premium support',
                'premium'
              )}
              style={{ 
                fontSize: '16px',
                padding: '14px 32px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>👑 Upgrade to Premium</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>→</span>
            </button>
          </div>
        </div>
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

      {/* Premium Brokers Showcase */}
      <div className="card" style={{ 
        marginTop: '40px',
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 165, 0, 0.05) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ 
              fontSize: '28px', 
              marginBottom: '8px',
              color: '#FFD700',
              fontWeight: '700'
            }}>
              👑 Premium Brokers
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(232, 234, 237, 0.7)' }}>
              Access our elite brokers with exceptional track records
            </p>
          </div>
          <div className="premium-badge" style={{
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            color: '#000'
          }}>
            TOP 5%
          </div>
        </div>

        <div className="grid grid-cols-3" style={{ gap: '20px' }}>
          {/* Sample Premium Broker 1 */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              ⭐ 98%
            </div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥇</div>
            <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '8px', fontWeight: '700' }}>EliteTrader_Pro</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.6)', marginBottom: '4px' }}>Success Rate</div>
              <div style={{ fontSize: '28px', color: '#10b981', fontWeight: '700' }}>98.2%</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: 'rgba(232, 234, 237, 0.8)' }}>
              <div>
                <div style={{ color: 'rgba(232, 234, 237, 0.5)' }}>Votes</div>
                <div style={{ fontWeight: '600' }}>1,243</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255, 215, 0, 0.3)', paddingLeft: '12px' }}>
                <div style={{ color: 'rgba(232, 234, 237, 0.5)' }}>Earnings</div>
                <div style={{ fontWeight: '600', color: '#10b981' }}>$24.5K</div>
              </div>
            </div>
          </div>

          {/* Sample Premium Broker 2 */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              ⭐ 96%
            </div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥈</div>
            <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '8px', fontWeight: '700' }}>DeFi_Master</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.6)', marginBottom: '4px' }}>Success Rate</div>
              <div style={{ fontSize: '28px', color: '#10b981', fontWeight: '700' }}>96.7%</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: 'rgba(232, 234, 237, 0.8)' }}>
              <div>
                <div style={{ color: 'rgba(232, 234, 237, 0.5)' }}>Votes</div>
                <div style={{ fontWeight: '600' }}>987</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255, 215, 0, 0.3)', paddingLeft: '12px' }}>
                <div style={{ color: 'rgba(232, 234, 237, 0.5)' }}>Earnings</div>
                <div style={{ fontWeight: '600', color: '#10b981' }}>$19.8K</div>
              </div>
            </div>
          </div>

          {/* Sample Premium Broker 3 */}
            <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.4)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              ⭐ 95%
            </div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥉</div>
            <h3 style={{ fontSize: '20px', color: '#a78bfa', marginBottom: '8px', fontWeight: '700' }}>CryptoAdvisor</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: 'rgba(232, 234, 237, 0.6)', marginBottom: '4px' }}>Success Rate</div>
              <div style={{ fontSize: '28px', color: '#10b981', fontWeight: '700' }}>95.3%</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', color: 'rgba(232, 234, 237, 0.8)' }}>
              <div>
                <div style={{ color: 'rgba(232, 234, 237, 0.5)' }}>Votes</div>
                <div style={{ fontWeight: '600' }}>856</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255, 215, 0, 0.3)', paddingLeft: '12px' }}>
                <div style={{ color: 'rgba(232, 234, 237, 0.5)' }}>Earnings</div>
                <div style={{ fontWeight: '600', color: '#10b981' }}>$17.2K</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          padding: '16px',
          background: 'rgba(255, 215, 0, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <p style={{ fontSize: '14px', color: '#e8eaed', marginBottom: '12px' }}>
            🔒 <strong>Premium brokers</strong> have verified track records with 90%+ success rates
          </p>
          <button 
            className="btn btn-premium"
            onClick={() => showModal(
              'Premium Feature Coming Soon!',
              'You\'ll get access to:\n• Top 5% rated brokers with 90%+ success rates\n• One FREE consultation with a premium broker\n• Priority portfolio reviews\n• Advanced analytics and insights\n• 24/7 premium support',
              'premium'
            )}
            style={{ 
              fontSize: '14px',
              padding: '10px 24px',
              border: 'none'
            }}
          >
            <span>👑 Access Premium Brokers</span>
          </button>
        </div>
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
