import React, { useState } from 'react';
import '../../styles/auth/Auth.css';

const RegisterAsFaculty = ({ navigateToRegister }) => {
  const [newUser, setNewUser] = useState({
    Username: '',
    Password: '',
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: ''
  });

  const [phoneParts, setPhoneParts] = useState({ part1: '', part2: '', part3: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value) && value.length <= (name === 'part1' || name === 'part2' ? 3 : 4)) {
      setPhoneParts((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const combinedPhoneNumber = parseInt(`${phoneParts.part1}${phoneParts.part2}${phoneParts.part3}`, 10);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, PhoneNumber: combinedPhoneNumber, Role: 'Faculty' })
      });

      const data = await response.json();

      if (data.success) {
        alert('Faculty registration successful!');
        navigateToRegister();
      } else {
        alert('Failed to register as faculty: ' + data.error);
      }
    } catch (error) {
      console.error('Error registering as faculty:', error);
      alert('An error occurred while registering as faculty.');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-title">Faculty Registration</h2>
        <p className="register-subtitle">Create a Faculty Account</p>
        
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="FirstName"
              value={newUser.FirstName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your first name"
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="LastName"
              value={newUser.LastName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="Email"
            value={newUser.Email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="Username"
            value={newUser.Username}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Choose a username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="Password"
            value={newUser.Password}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Create a password"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <div className="phone-input-group">
            <input
              type="text"
              name="part1"
              value={phoneParts.part1}
              onChange={handlePhoneChange}
              required
              placeholder="XXX"
              maxLength="3"
              className="phone-input"
            />
            <span className="phone-separator">-</span>
            <input
              type="text"
              name="part2"
              value={phoneParts.part2}
              onChange={handlePhoneChange}
              required
              placeholder="XXX"
              maxLength="3"
              className="phone-input"
            />
            <span className="phone-separator">-</span>
            <input
              type="text"
              name="part3"
              value={phoneParts.part3}
              onChange={handlePhoneChange}
              required
              placeholder="XXXX"
              maxLength="4"
              className="phone-input"
            />
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">Register as Faculty</button>
        </div>
        
        <div className="form-links">
          <button type="button" onClick={navigateToRegister} className="btn-link">
            Back to Student Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterAsFaculty;