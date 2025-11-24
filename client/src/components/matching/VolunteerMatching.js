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
      // Find the match to get the MatchID
      const match = matches.find(m => m.UserID === volunteerId && m.EventID === eventId);
      if (!match || !match.MatchID) {
        alert('Error: Match not found');
        return;
      }

      const response = await fetch(`/api/volunteer/match/${match.MatchID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MatchStatus: 'confirmed'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Volunteer request confirmed successfully!');
        fetchMatches();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error confirming request:', error);
      alert('An error occurred while confirming the request.');
    }
  };

  const getFilteredMatches = () => {
    let filtered = matches;
    
    switch (filter) {
      case 'matched':
        filtered = matches.filter(match => 
          match.MatchStatus === 'confirmed'
        );
        break;
      case 'unmatched':
        filtered = matches.filter(match => 
          match.MatchStatus === 'pending'
        );
        break;
      case 'skill-match':
        filtered = matches.filter(match => match.SkillMatch);
        break;
      case 'high-match':
        filtered = matches.filter(match => match.SkillMatchPercentage >= 75);
        break;
      default:
        filtered = matches;
    }
    
    return filtered;
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
          <option value="all">All Requests</option>
          <option value="unmatched">Pending Requests</option>
          <option value="matched">Confirmed</option>
          <option value="skill-match">Any Skill Matches</option>
          <option value="high-match">High Skill Match (75%+)</option>
        </select>
        <span className="match-count">{getFilteredMatches().length} matches found</span>
      </div>

      <div className="matches-list">
        {getFilteredMatches().length === 0 ? (
          <p>No matches found for the selected filter.</p>
        ) : (
          <div className="matches-grid">
            {getFilteredMatches().map((match, index) => (
              <div key={`${match.UserID}-${match.EventID}`} className="match-card">
                <div className="volunteer-info">
                  <h3>{match.FullName || match.Email}</h3>
                  <p><strong>Email:</strong> {match.Email}</p>
                  <p><strong>Location:</strong> {match.City}, {match.StateCode}</p>
                  <div className="skills-section">
                    <p><strong>Volunteer Skills:</strong></p>
                    <div className="skills-tags">
                      {match.Skills && match.Skills.length > 0 ? (
                        match.Skills.map(skill => (
                          <span 
                            key={skill} 
                            className={`skill-tag ${match.MatchingSkills?.includes(skill) ? 'matching' : ''}`}
                          >
                            {skill}
                            {match.MatchingSkills?.includes(skill) && ' ✓'}
                          </span>
                        ))
                      ) : (
                        <span className="no-skills">No skills listed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="event-info">
                  <h4>{match.EventName}</h4>
                  <p><strong>Date:</strong> {new Date(match.EventDate).toLocaleDateString()}</p>
                  {match.EventTime && (
                    <p><strong>Time:</strong> {match.EventTime}</p>
                  )}
                  <p><strong>Location:</strong> {match.Location}</p>
                  <p><strong>Urgency:</strong> <span className={`urgency-${match.Urgency}`}>{match.Urgency}</span></p>
                  <p><strong>Capacity:</strong> {match.CurrentVolunteers}/{match.MaxVolunteers || '∞'}</p>
                  <div className="required-skills-section">
                    <p><strong>Required Skills:</strong></p>
                    <div className="skills-tags">
                      {match.RequiredSkills && match.RequiredSkills.length > 0 ? (
                        match.RequiredSkills.map(skill => (
                          <span key={skill} className="skill-tag required">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span>No specific skills required</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="match-status">
                  {match.SkillMatch && (
                    <div className="skill-match-indicator">
                      <span className="skill-match-badge">
                        {match.SkillMatchPercentage}% Skill Match
                      </span>
                      <div className="match-bar">
                        <div 
                          className="match-bar-fill" 
                          style={{
                            width: `${match.SkillMatchPercentage}%`,
                            backgroundColor: match.SkillMatchPercentage >= 75 ? '#10B981' : 
                                           match.SkillMatchPercentage >= 50 ? '#F59E0B' : '#EF4444'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <span className={`status-badge status-${match.MatchStatus}`}>
                    {match.MatchStatus === 'pending' ? 'Pending Request' : match.MatchStatus.toUpperCase()}
                  </span>
                </div>

                {match.MatchStatus === 'pending' && (
                  <div className="match-actions">
                    <button
                      onClick={() => handleMatch(match.UserID, match.EventID)}
                      className="btn-match"
                      title={`Confirm ${match.FullName || match.FirstName} for ${match.EventName}`}
                    >
                      ✓ Confirm Request
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
