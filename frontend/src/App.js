import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ModalProvider } from './contexts/ModalContext';
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import BrokerProfile from './pages/BrokerProfile';
import UserLogin from './pages/UserLogin';
import BrokerLogin from './pages/BrokerLogin';
import './App.css';

function Navigation() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for stored user data
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/');
  };

  const isLoginPage = location.pathname === '/user-login' || location.pathname === '/broker-login';

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            ether.fi Portfolio Manager
          </Link>
          <div className="nav-links">
            {user ? (
              <>
                <span className="nav-link" style={{ color: '#10b981', pointerEvents: 'none' }}>
                  👋 {user.username} ({user.user_type})
                </span>
                {user.user_type === 'user' && (
                  <Link to="/user-dashboard" className="nav-link">
                    👤 User Dashboard
                  </Link>
                )}
                {user.user_type === 'broker' && (
                  <Link to="/broker-dashboard" className="nav-link">
                    🧑‍💼 Broker Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ 
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444'
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              !isLoginPage && (
                <>
                  <Link to="/user-login" className="nav-link">
                    👤 User Login
                  </Link>
                  <Link to="/broker-login" className="nav-link">
                    🧑‍💼 Broker Login
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <ModalProvider>
      <Router>
        <div className="App">
          <Navigation />
          
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/user-login" element={<UserLogin />} />
              <Route path="/broker-login" element={<BrokerLogin />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/broker-dashboard" element={<BrokerDashboard />} />
              <Route path="/broker/profile/:brokerId" element={<BrokerProfile />} />
              {/* Legacy routes for compatibility */}
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/broker" element={<BrokerDashboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ModalProvider>
  );
}

export default App;

