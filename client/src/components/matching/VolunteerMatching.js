import React, { useState, useEffect } from 'react';
import '../../styles/matching/VolunteerMatching.css';

const VolunteerMatching = ({ userData, navigateToHome }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/volunteer-matches');
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (volunteerId, eventId) => {
    try {
      const response = await fetch('/api/volunteer-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VolunteerID: volunteerId,
          EventID: eventId,
          AdminID: userData.UserID
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Volunteer matched successfully!');
        fetchMatches();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error matching volunteer:', error);
      alert('An error occurred while matching the volunteer.');
    }
  };

  const getFilteredMatches = () => {
    switch (filter) {
      case 'matched':
        return matches.filter(match => match.MatchStatus !== 'unmatched');
      case 'unmatched':
        return matches.filter(match => match.MatchStatus === 'unmatched');
      case 'skill-match':
        return matches.filter(match => match.SkillMatch);
      default:
        return matches;
    }
  };

  if (loading) return <div className="loading">Loading volunteer matches...</div>;

  return (
    <div className="volunteer-matching-container">
      <div className="matching-header">
        <h1>Volunteer Matching</h1>
        <p>Match volunteers to events based on their skills and availability</p>
      </div>

      <div className="filter-controls">
        <label>Filter by:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Matches</option>
          <option value="unmatched">Unmatched</option>
          <option value="matched">Already Matched</option>
          <option value="skill-match">Skill Matches</option>
        </select>
      </div>

      <div className="matches-list">
        {getFilteredMatches().length === 0 ? (
          <p>No matches found for the selected filter.</p>
        ) : (
          <div className="matches-grid">
            {getFilteredMatches().map((match, index) => (
              <div key={index} className="match-card">
                <div className="volunteer-info">
                  <h3>{match.FullName || `${match.FirstName} ${match.LastName}`}</h3>
                  <p><strong>Email:</strong> {match.Email}</p>
                  <p><strong>Location:</strong> {match.City}, {match.StateCode}</p>
                  <p><strong>Skills:</strong> {match.Skills?.join(', ') || 'None listed'}</p>
                </div>

                <div className="event-info">
                  <h4>{match.EventName}</h4>
                  <p><strong>Date:</strong> {new Date(match.EventDate).toLocaleDateString()}</p>
                  <p><strong>Urgency:</strong> {match.Urgency}</p>
                  <p><strong>Required Skills:</strong> {match.RequiredSkills?.join(', ') || 'None'}</p>
                </div>

                <div className="match-status">
                  {match.SkillMatch && (
                    <span className="skill-match-badge">Skill Match!</span>
                  )}
                  <span className={`status-badge ${match.MatchStatus}`}>
                    {match.MatchStatus}
                  </span>
                </div>

                {match.MatchStatus === 'unmatched' && (
                  <div className="match-actions">
                    <button
                      onClick={() => handleMatch(match.UserID, match.EventID)}
                      className="btn-match"
                    >
                      Match Volunteer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={navigateToHome} className="btn-back">
        Back to Home
      </button>
    </div>
  );
};

export default VolunteerMatching;
