import React from 'react';
import '../../styles/home/Home.css';

const Welcome = ({ userData, navigateToHome }) => {
  return (
    <div className="content-container welcome-container">
      <h2>Welcome!</h2>
      <p>
        You are logged in as <strong>{userData.FirstName}</strong> with role{' '}
        <strong>{userData.Role}</strong>.
      </p>
      <button onClick={navigateToHome} className="btn-primary">Home</button>
    </div>
  );
};

export default Welcome;
