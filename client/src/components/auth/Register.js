import React, { useState } from 'react';
import '../../styles/auth/Auth.css';
import PasscodeModal from './PasscodeModal';

const Register = ({ onRegister, navigateToLogin, navigateToRegisterAsFaculty }) => {
  const [newUser, setNewUser] = useState({
    Username: '',
    Password: '',
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: ''
  });

  const [phoneParts, setPhoneParts] = useState({ part1: '', part2: '', part3: '' });
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const combinedPhoneNumber = parseInt(`${phoneParts.part1}${phoneParts.part2}${phoneParts.part3}`, 10);
    onRegister({ ...newUser, PhoneNumber: combinedPhoneNumber });
  };

  const handleFacultyRegister = () => {
    setIsPasscodeModalOpen(true);
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join BookFinder</p>
        
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
          <button type="submit" className="btn btn-secondary">Register</button>
        </div>
        
        <div className="form-links">
          <button type="button" onClick={navigateToLogin} className="btn-link">
            Already have an account? Login
          </button>
          <button type="button" onClick={handleFacultyRegister} className="btn-link faculty-link">
            Register as Faculty
          </button>
        </div>
      </form>

      <PasscodeModal 
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSubmit={() => {
          setIsPasscodeModalOpen(false);
          navigateToRegisterAsFaculty();
        }}
      />
    </div>
  );
};

export default Register;
