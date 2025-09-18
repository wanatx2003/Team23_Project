import React from 'react';
import '../../styles/books/Books.css';

const DeleteBook = ({ bookData, onDeleteBook, navigateToHome}) => {
  const handleDelete = () => {
    onDeleteBook(bookData.BookID);
  };

  return (
    <div className="content-container">
      <div className="delete-confirmation-card">
        <div className="delete-header">
          <div className="warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>
          </div>
          <h2>Delete Book</h2>
        </div>
        
        <p className="delete-warning-text">
          Are you sure you want to delete this book? This action cannot be undone.
        </p>

        <div className="device-info-box">
          <div className="device-info-header">
            <h3>{bookData.Title}</h3>
            <span className="device-type-badge">Book</span>
          </div>
          
          <div className="device-info-grid">
            <div className="info-item">
              <span className="info-label">Author:</span>
              <span className="info-value">{bookData.Author}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Genre:</span>
              <span className="info-value">{bookData.Genre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Publication Year:</span>
              <span className="info-value">{bookData.PublicationYear}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Publisher:</span>
              <span className="info-value">{bookData.Publisher}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Language:</span>
              <span className="info-value">{bookData.Language}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Format:</span>
              <span className="info-value">{bookData.Format}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ISBN:</span>
              <span className="info-value">{bookData.ISBN}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Copies:</span>
              <span className="info-value">{bookData.TotalCopies}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Available Copies:</span>
              <span className="info-value">{bookData.AvailableCopies}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Shelf Location:</span>
              <span className="info-value">{bookData.ShelfLocation}</span>
            </div>
          </div>
        </div>

        <div className="button-group delete-actions">
          <button onClick={navigateToHome} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">
            <span className="delete-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path fill="currentColor" d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z"/>
              </svg>
            </span>
            Delete Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBook;
