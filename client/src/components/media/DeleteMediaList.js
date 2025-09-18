import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import '../../styles/media/media.css';

const DeleteMediaList = ({ navigateToHome, navigateToDeleteMedia }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const data = await API.getMedia();
        if (data.success) {
          setMedia(data.media);
        } else {
          setError(data.error || 'Failed to fetch media');
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('An error occurred while fetching media');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  // Static media types for filter
  const mediaTypes = ['All', 'Movie', 'Music', 'VideoGame'];

  // Extract unique genres for the dropdown, based on filtered media
  const genres = [
    'All',
    ...new Set(
      media
        .filter((item) => selectedType === 'All' || item.Type === selectedType)
        .map((item) => item.Genre)
    ),
  ];

  // Filtered media based on selectedType and selectedGenre
  const filteredMedia = media.filter((item) => {
    const typeMatch = selectedType === 'All' || item.Type === selectedType;
    const genreMatch = selectedGenre === 'All' || item.Genre === selectedGenre;
    return typeMatch && genreMatch;
  });

  return (
    <div className="content-container">
      <h2>Delete Media</h2>
      
      <div className="header-actions">
        <button onClick={navigateToHome} className="btn-secondary">
          Back to Home
        </button>
      </div>

      {loading ? (
        <p>Loading media...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          {/* Enhanced Filter Controls */}
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="typeFilter">Type:</label>
              <select
                id="typeFilter"
                className="filter-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedGenre('All');
                }}
              >
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

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
                  <th>Type</th>
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
                {filteredMedia.length > 0 ? (
                  filteredMedia.map((mediaItem) => (
                    <tr key={mediaItem.MediaID}>
                      <td>{mediaItem.Type}</td>
                      <td>{mediaItem.Title}</td>
                      <td>{mediaItem.Author}</td>
                      <td>{mediaItem.Genre}</td>
                      <td>{mediaItem.PublicationYear}</td>
                      <td>{mediaItem.Language}</td>
                      <td>{mediaItem.TotalCopies}</td>
                      <td>{mediaItem.AvailableCopies}</td>
                      <td>
                        <button
                          className="action-button"
                          onClick={() => navigateToDeleteMedia(mediaItem)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No media items found for this type and genre.</td>
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

export default DeleteMediaList;
