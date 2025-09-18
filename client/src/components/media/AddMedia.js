import React, { useState } from 'react';
import '../../styles/media/media.css';

const genreOptions = {
  Movie: ['Action', 'Comedy', 'Drama', 'Thriller', 'Crime'],
  Music: ['Pop', 'Rock', 'Folk', 'Classical', 'Hip-Hop'],
  Videogame: ['RPG', 'Action', 'Puzzle', 'Adventure', 'Sports']
};

const AddMedia = ({ onAddMedia, navigateToHome }) => {
  const [newMedia, setnewMedia] = useState({
    Type: '',
    Title: '',
    Author: '',
    Genre: '',
    PublicationYear: '',
    Language: '',
    TotalCopies: '',
    AvailableCopies: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the type changes, reset the genre
    if (name === 'Type') {
      setnewMedia(prev => ({
        ...prev,
        [name]: value,
        Genre: '' // reset genre when type changes
      }));
    } else {
      setnewMedia(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMedia(newMedia);
  };

  const currentGenres = genreOptions[newMedia.Type] || [];

  return (
    <div className="content-container">
      <h2>Add New Media</h2>
      <form onSubmit={handleSubmit} className="add-device-form">
        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select
              name="Type"
              value={newMedia.Type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Movie">Movies</option>
              <option value="Music">Music</option>
              <option value="Videogame">Video games</option>
            </select>
          </div>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="Title"
              value={newMedia.Title}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Author:</label>
            <input
              type="text"
              name="Author"
              value={newMedia.Author}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Genre:</label>
            <select
              name="Genre"
              value={newMedia.Genre}
              onChange={handleChange}
              required
              disabled={!newMedia.Type}
            >
              <option value="">Select Genre</option>
              {currentGenres.map((genre, index) => (
                <option key={index} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>PublicationYear:</label>
            <input
              type="text"
              name="PublicationYear"
              value={newMedia.PublicationYear}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Language:</label>
            <input
              type="text"
              name="Language"
              value={newMedia.Language}
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
              value={newMedia.TotalCopies}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Available Copies:</label>
            <input
              type="number"
              name="AvailableCopies"
              value={newMedia.AvailableCopies}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={navigateToHome} className="btn-secondary">Back to Home</button>
          <button type="submit" className="btn-primary">Confirm</button>
        </div>
      </form>
    </div>
  );
};

export default AddMedia;
