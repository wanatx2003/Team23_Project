import React, { useState, useEffect, useRef } from 'react';
import '../../styles/auth/Auth.css';

const PasscodeModal = ({ isOpen, onClose, onSubmit }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when modal opens
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300); // Delay to wait for animation
    }
  }, [isOpen]);

  useEffect(() => {
    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === '1234') {
      onSubmit();
    } else {
      setError('Incorrect passcode. Please try again.');
      setPasscode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="passcode-modal-overlay" onClick={handleClickOutside}>
      <div className="passcode-modal" ref={modalRef}>
        <h3 className="passcode-modal-title">Faculty Registration</h3>
        <p className="passcode-modal-subtitle">Please enter the faculty passcode to continue</p>
        
        <form onSubmit={handleSubmit}>
          <div className="passcode-input-container">
            <input
              ref={inputRef}
              type="password"
              value={passcode}
              onChange={(e) => {
                setError('');
                setPasscode(e.target.value);
              }}
              className="passcode-input"
              placeholder="Enter passcode"
              autoComplete="off"
            />
            {error && <p className="passcode-error">{error}</p>}
          </div>
          
          <div className="passcode-modal-buttons">
            <button 
              type="button" 
              className="passcode-button passcode-button-cancel" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="passcode-button passcode-button-submit"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeModal;
