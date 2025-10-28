import React, { useState } from 'react';
import '../../styles/auth/Register.css';

const Register = ({ onRegister, navigateToLogin }) => {
  const [formData, setFormData] = useState({
    Username: '',
    Password: '',
    confirmPassword: '',
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    Role: 'volunteer'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Username.trim()) newErrors.Username = 'Username is required';
    if (!formData.Email.trim()) newErrors.Email = 'Email is required';
    if (!formData.Email.includes('@')) newErrors.Email = 'Please enter a valid email';
    if (!formData.Password) newErrors.Password = 'Password is required';
    if (formData.Password.length < 6) newErrors.Password = 'Password must be at least 6 characters';
    if (formData.Password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.FirstName.trim()) newErrors.FirstName = 'First name is required';
    if (!formData.LastName.trim()) newErrors.LastName = 'Last name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onRegister(formData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-hero">
        <h1>Join Our Volunteer Community</h1>
        <p>Start making a difference in your community today</p>
      </div>
      
      <div className="register-form-container">
        <div className="register-form-wrapper">
          <h2>Create Your Account</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="FirstName">First Name *</label>
                <input
                  type="text"
                  id="FirstName"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
                {errors.FirstName && <span className="error">{errors.FirstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="LastName">Last Name *</label>
                <input
                  type="text"
                  id="LastName"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
                {errors.LastName && <span className="error">{errors.LastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="Username">Username *</label>
              <input
                type="text"
                id="Username"
                name="Username"
                value={formData.Username}
                onChange={handleChange}
                placeholder="Choose a username"
              />
              {errors.Username && <span className="error">{errors.Username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="Email">Email Address *</label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
              {errors.Email && <span className="error">{errors.Email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="PhoneNumber">Phone Number</label>
              <input
                type="tel"
                id="PhoneNumber"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Password">Password *</label>
                <input
                  type="password"
                  id="Password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                {errors.Password && <span className="error">{errors.Password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="Role">Account Type</label>
              <select
                id="Role"
                name="Role"
                value={formData.Role}
                onChange={handleChange}
              >
                <option value="volunteer">Volunteer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-link">
            <p>Already have an account?</p>
            <button onClick={navigateToLogin} className="login-link-button">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
