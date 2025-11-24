import React, { useState, useEffect } from 'react';
import '../../styles/matching/VolunteerMatching.css';

const VolunteerMatching = ({ userData, navigateToHome }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [smartMatches, setSmartMatches] = useState([]);
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('requests'); // 'requests' or 'smart-match'

  useEffect(() => {
    fetchMatches();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        // Filter for published events
        const publishedEvents = data.events.filter(e => e.EventStatus === 'published' && new Date(e.EventDate) >= new Date());
        setEvents(publishedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

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

  const fetchSmartMatches = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/smart-matches/${eventId}`);
      const data = await response.json();
      if (data.success) {
        setSmartMatches(data.matches);
        setSelectedEvent(eventId);
      }
    } catch (error) {
      console.error('Error fetching smart matches:', error);
      alert('Error loading smart matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartMatch = async (volunteerId, eventId) => {
    try {
      const response = await fetch('/api/volunteer-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VolunteerID: volunteerId,
          EventID: eventId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Volunteer matched successfully!');
        fetchSmartMatches(eventId); // Refresh the list
        fetchMatches(); // Refresh regular matches too
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error matching volunteer:', error);
      alert('An error occurred while matching the volunteer.');
    }
  };

  const handleAutoMatch = async (eventId) => {
    if (!window.confirm('This will automatically match the top volunteers to this event. Continue?')) {
      return;
    }

    try {
      const response = await fetch('/api/auto-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EventID: eventId,
          MinMatchScore: 50,
          MaxMatches: 5
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || `Matched ${data.matched} volunteer(s) successfully!`);
        fetchSmartMatches(eventId);
        fetchMatches();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error in auto-match:', error);
      alert('An error occurred during auto-matching.');
    }
  };

  if (loading) return <div className="loading">Loading volunteer matches...</div>;

  return (
    <div className="volunteer-matching-container">
      <div className="matching-header">
        <h1>Volunteer Matching</h1>
        <p>Match volunteers to events based on their skills and availability</p>
        
        <div className="view-mode-toggle">
          <button 
            className={`btn-toggle ${viewMode === 'requests' ? 'active' : ''}`}
            onClick={() => setViewMode('requests')}
          >
            📋 View Requests
          </button>
          <button 
            className={`btn-toggle ${viewMode === 'smart-match' ? 'active' : ''}`}
            onClick={() => setViewMode('smart-match')}
          >
            🤖 Smart Matching
          </button>
        </div>
      </div>

      {viewMode === 'requests' ? (
        <>
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
        </>
      ) : (
        <>
          <div className="smart-match-section">
            <div className="event-selector">
              <label><strong>Select Event to Find Best Matches:</strong></label>
              <select 
                value={selectedEvent || ''} 
                onChange={(e) => fetchSmartMatches(e.target.value)}
                className="event-dropdown"
              >
                <option value="">-- Choose an Event --</option>
                {events.map(event => (
                  <option key={event.EventID} value={event.EventID}>
                    {event.EventName} ({new Date(event.EventDate).toLocaleDateString()}) - {event.CurrentVolunteers}/{event.MaxVolunteers || '∞'} volunteers
                  </option>
                ))}
              </select>
              {selectedEvent && (
                <button 
                  className="btn-auto-match"
                  onClick={() => handleAutoMatch(selectedEvent)}
                  title="Automatically match top 5 volunteers"
                >
                  ⚡ Auto-Match Top Volunteers
                </button>
              )}
            </div>

            {smartMatches.length > 0 && (
              <>
                <div className="smart-match-info">
                  <h3>🎯 Recommended Volunteers (Sorted by Match Score)</h3>
                  <p>Our algorithm considers skills, availability, location, and urgency to find the best matches.</p>
                </div>

                <div className="matches-grid">
                  {smartMatches.map((match) => (
                    <div key={match.UserID} className={`match-card smart-match ${match.RecommendationLevel}`}>
                      <div className="recommendation-badge">
                        <span className={`rec-level ${match.RecommendationLevel}`}>
                          {match.RecommendationLevel === 'excellent' ? '⭐ Excellent Match' :
                           match.RecommendationLevel === 'good' ? '👍 Good Match' :
                           match.RecommendationLevel === 'fair' ? '✓ Fair Match' : '• Low Match'}
                        </span>
                      </div>

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

                      <div className="match-score-section">
                        <div className="match-score">
                          <div className="score-circle" style={{
                            background: `conic-gradient(
                              ${match.MatchPercentage >= 75 ? '#10B981' : 
                                match.MatchPercentage >= 50 ? '#F59E0B' : 
                                match.MatchPercentage >= 30 ? '#F97316' : '#EF4444'} 
                              ${match.MatchPercentage * 3.6}deg, 
                              #e5e7eb ${match.MatchPercentage * 3.6}deg
                            )`
                          }}>
                            <div className="score-inner">
                              <span className="score-number">{match.MatchPercentage}</span>
                              <span className="score-label">Match</span>
                            </div>
                          </div>
                        </div>

                        <div className="match-reasons">
                          <p><strong>Why this match?</strong></p>
                          <ul>
                            {match.MatchReasons.map((reason, idx) => (
                              <li key={idx} className={
                                reason.startsWith('✓') ? 'positive' :
                                reason.startsWith('~') ? 'neutral' :
                                reason.startsWith('!') ? 'urgent' : 'negative'
                              }>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {match.CurrentMatchStatus === 'none' ? (
                        <div className="match-actions">
                          <button
                            onClick={() => handleSmartMatch(match.UserID, match.EventID)}
                            className="btn-match"
                            title={`Match ${match.FullName} to this event`}
                          >
                            ✓ Match to Event
                          </button>
                        </div>
                      ) : (
                        <div className="match-status">
                          <span className={`status-badge status-${match.CurrentMatchStatus}`}>
                            {match.CurrentMatchStatus === 'pending' ? 'Already Requested' :
                             match.CurrentMatchStatus === 'confirmed' ? 'Already Confirmed' :
                             match.CurrentMatchStatus.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedEvent && smartMatches.length === 0 && !loading && (
              <div className="no-matches">
                <p>No available volunteers found for this event.</p>
              </div>
            )}
          </div>
        </>
      )}

      <button onClick={navigateToHome} className="btn-back">
        Back to Home
      </button>
    </div>
  );
};

export default VolunteerMatching;
