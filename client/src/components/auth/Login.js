import React, { useState } from 'react';
import '../../styles/auth/Login.css';

const Login = ({ onLogin, navigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <h1>Volunteer Management System</h1>
        <p>Connect with meaningful volunteer opportunities in your community</p>
      </div>
      
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="register-link">
            <p>New to our platform?</p>
            <button onClick={navigateToRegister} className="register-link-button">
              Create an Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
