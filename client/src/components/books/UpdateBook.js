import React, { useState, useEffect } from 'react';
import '../../styles/books/Books.css';

const UpdateBook = ({ bookData, onUpdateBook, navigateToHome }) => {
  const [book, setBook] = useState({
    BookID: '',
    Title: '',
    Author: '',
    Genre: '',
    PublicationYear: '',
    Publisher: '',
    Language: '',
    Format: '',
    ISBN: '',
    TotalCopies: '',
    AvailableCopies: '',
    ShelfLocation: ''
  });

  useEffect(() => {
    if (bookData) {
      setBook(bookData); // Pre-fill form with existing data
    }
  }, [bookData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateBook(book); // Send updated book data to parent
  };

  return (
    <div className="content-container">
      <h2>Update Book</h2>
      <form onSubmit={handleSubmit} className="add-book-form">
      <div className="form-row">
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="Title"
              value={book.Title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Author:</label>
            <input
              type="text"
              name="Author"
              value={book.Author}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Genre:</label>
            <select
              name="Genre"
              value={book.Genre}
              onChange={handleChange}
              required
            >
              <option value="">Select Genre</option>
              <option value="Fiction">Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Romance">Romance</option>
              <option value="Thriller">Thriller</option>
              <option value="Novel">Novel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Publication Year:</label>
            <input
              type="number"
              name="PublicationYear"
              value={book.PublicationYear}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Publisher:</label>
            <input
              type="text"
              name="Publisher"
              value={book.Publisher}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Language:</label>
            <input
              type="text"
              name="Language"
              value={book.Language}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Format:</label>
            <input
              type="text"
              name="Format"
              value={book.Format}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>ISBN:</label>
            <input
              type="text"
              name="ISBN"
              value={book.ISBN}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Copies:</label>
            <input
              type="number"
              name="TotalCopies"
              value={book.TotalCopies}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Available Copies:</label>
            <input
              type="number"
              name="AvailableCopies"
              value={book.AvailableCopies}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Shelf Location:</label>
          <input
            type="text"
            name="ShelfLocation"
            value={book.ShelfLocation}
            onChange={handleChange}
            required
          />
        </div>
        <div className="button-group">
          <button type="button" onClick={navigateToHome} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Update</button>
        </div>
      </form>
    </div>
  );
};
export default UpdateBook;