import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

function UserLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ethHoldings, setEthHoldings] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login/user' : '/auth/signup/user';
      const payload = isLogin 
        ? { username, password }
        : { username, email, password, eth_holdings: parseFloat(ethHoldings) || 0 };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      if (response.data.success) {
        // Save token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        alert(`✅ ${isLogin ? 'Login' : 'Signup'} successful!`);
        navigate('/user-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '500px', 
        width: '100%',
        background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.8) 0%, rgba(20, 20, 40, 0.8) 100%)',
        border: '2px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            👤 User Portal
          </h1>
          <p style={{ color: 'rgba(232, 234, 237, 0.7)', fontSize: '15px' }}>
            {isLogin ? 'Login to access your portfolio' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="alert" style={{ 
            marginBottom: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a78bfa'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              style={{ 
                width: '100%',
                padding: '12px',
                fontSize: '15px'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#a78bfa'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                style={{ 
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a78bfa'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ 
                width: '100%',
                padding: '12px',
                fontSize: '15px'
              }}
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#a78bfa'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#a78bfa'
                }}>
                  Initial ETH Holdings (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ethHoldings}
                  onChange={(e) => setEthHoldings(e.target.value)}
                  placeholder="0.00"
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px'
                  }}
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '20px'
            }}
          >
            {loading ? '⏳ Processing...' : (isLogin ? '🔐 Login' : '✨ Create Account')}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center',
          padding: '20px 0',
          borderTop: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{ 
              background: 'none',
              border: 'none',
              color: '#8b5cf6',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
          
          <div style={{ marginTop: '15px' }}>
            <Link 
              to="/broker-login"
              style={{ 
                color: '#6ee7b7',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              👔 Login as Broker →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;

