import React, { useState, useEffect } from 'react';
import "../../styles/media/media.css";

// Genre options based on media type
const genreOptions = {
  Movie: ['Action', 'Comedy', 'Drama', 'Thriller', 'Crime'],
  Music: ['Pop', 'Rock', 'Folk', 'Classical', 'Hip-Hop'],
  Videogame: ['RPG', 'Action', 'Puzzle', 'Adventure', 'Sports']
};

const UpdateMedia = ({ mediaData, onUpdateMedia, navigateToHome }) => {
  const [media, setMedia] = useState({
    MediaID: '',
    Type: '',
    Title: '',
    Author: '',
    Genre: '',
    PublicationYear: '',
    Language: '',
    TotalCopies: '',
    AvailableCopies: '',
  });

  // Pre-fill the form with existing data
  useEffect(() => {
    if (mediaData) {
      setMedia(mediaData);
    }
  }, [mediaData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset genre if type changes
    if (name === 'Type') {
      setMedia(prev => ({
        ...prev,
        [name]: value,
        Genre: ''
      }));
    } else {
      setMedia(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateMedia(media);
  };

  // Get current genre options
  const currentGenres = genreOptions[media.Type] || [];

  return (
    <div className="content-container">
      <h2>Update Media</h2>
      <form onSubmit={handleSubmit} className="add-media-form">
        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select
              name="Type"
              value={media.Type}
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
              value={media.Title}
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
              value={media.Author}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Genre:</label>
            <select
              name="Genre"
              value={media.Genre}
              onChange={handleChange}
              required
              disabled={!media.Type}
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
              value={media.PublicationYear}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Language:</label>
            <input
              type="text"
              name="Language"
              value={media.Language}
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
              value={media.TotalCopies}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Available Copies:</label>
            <input
              type="number"
              name="AvailableCopies"
              value={media.AvailableCopies}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={navigateToHome} className="btn-secondary">Back</button>
          <button type="submit" className="btn-primary">Update</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMedia;
