import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import '../../styles/books/Books.css';

const DeleteBookList = ({ navigateToHome, navigateToDeleteBook}) => {
  const [book, setBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await API.getRawBook();
        if (data.success) {
          setBook(data.book);
        } else {
          setError(data.error || 'Failed to fetch book');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('An error occurred while fetching book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, []);

  // Extract unique genres for dropdown
  const genres = ['All', ...new Set(book.map((b) => b.Genre))];

  // Filtered books based on selectedGenre
  const filteredBooks =
    selectedGenre === 'All'
      ? book
      : book.filter((b) => b.Genre === selectedGenre);

  return (
    <div className="content-container">
      <h2>Delete Book</h2>
      
      <div className="header-actions">
        <button onClick={navigateToHome} className="btn-secondary">
          Back to Home
        </button>
      </div>

      {loading ? (
        <p>Loading books...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          {/* Enhanced Filter Controls */}
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="genreFilter">Genre:</label>
              <select
                id="genreFilter"
                className="filter-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Redesigned Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Year</th>
                  <th>Language</th>
                  <th>Total Copies</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <tr key={book.BookID}>
                      <td>{book.Title}</td>
                      <td>{book.Author}</td>
                      <td>{book.Genre}</td>
                      <td>{book.PublicationYear}</td>
                      <td>{book.Language}</td>
                      <td>{book.TotalCopies}</td>
                      <td>{book.AvailableCopies}</td>
                      <td>
                        <button
                          className="action-button"
                          onClick={() => navigateToDeleteBook(book)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No books found for this genre.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DeleteBookList;
