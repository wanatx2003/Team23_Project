import React from 'react';

const BooksNotLoggedIn = ({ navigateToLogin }) => {
  return (
    <div className="content-container">
      <h2>Browse Books</h2>
      <p>This is the browse books page for users who are not logged in.</p>
      <button onClick={navigateToLogin} className="btn-back">Back to Login</button>
    </div>
  );
};

export default BooksNotLoggedIn;