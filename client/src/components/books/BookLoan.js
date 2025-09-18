import React from 'react';
import '../../styles/books/Books.css';

const BookLoan = ({ selectedBook, userData, handleBorrowBook, navigateToBooks }) => {
  const borrowDays = userData.Role === "Student" ? 7 : 14;

  return (
    <div className="content-container">
      <h2>Borrow Confirmation</h2>
      <p>Are you sure you want to borrow this book? </p>
      <div className="book-details">
        <p><strong>Title:</strong> {selectedBook.title}</p>
        <p><strong>Author:</strong> {selectedBook.author}</p>
        <p><strong>Genre:</strong> {selectedBook.genre}</p>
        <p><strong>Borrow Duration:</strong> {borrowDays} days</p>
      </div>
      <div className="button-group">
        <button onClick={navigateToBooks} className="btn-secondary">Cancel</button>
        <button onClick={handleBorrowBook} className="btn-primary">Confirm</button>
      </div>
    </div>
  );
};

export default BookLoan;
