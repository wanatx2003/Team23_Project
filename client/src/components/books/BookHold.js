import React from 'react';
import '../../styles/books/Books.css';

const BookHold = ({ selectedBook, handleHoldBook, navigateToBooks }) => {
  return (
    <div className="content-container">
      <h2>Hold Confirmation</h2>
      <p>Are you sure you want to place a hold on this book?</p>
      <div className="media-details">
        <p><strong>Title:</strong> {selectedBook.title}</p>
        <p><strong>Author:</strong> {selectedBook.author}</p>
        <p><strong>Genre:</strong> {selectedBook.genre}</p>
      </div>
      <p>We will notify you when this item becomes available.</p>
      <div className="button-group">
        <button onClick={navigateToBooks} className="btn-secondary">Cancel</button>
        <button onClick={handleHoldBook} className="btn-primary">Confirm</button>
      </div>
    </div>
  );
};

export default BookHold;
