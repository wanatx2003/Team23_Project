import React, { useState } from 'react';
import '../../styles/auth/Auth.css';

const Login = ({ onLogin, navigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">BookFinder</h2>
        <p className="login-subtitle">University Library Portal</p>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
            placeholder="Enter your password"
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">Login</button>
          <button type="button" onClick={navigateToRegister} className="btn btn-secondary">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
