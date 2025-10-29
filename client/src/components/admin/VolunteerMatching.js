import React, { useState, useEffect } from 'react';
import '../../styles/admin/VolunteerMatching.css';

const VolunteerMatching = () => {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchVolunteers();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchMatches(selectedEvent);
      findSuggestedVolunteers(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events.filter(event => event.EventStatus === 'published'));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteer/profiles');
      const data = await response.json();
      if (data.success) {
        setVolunteers(data.volunteers);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  const fetchMatches = async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/matches`);
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const findSuggestedVolunteers = (eventId) => {
    const event = events.find(e => e.EventID === eventId);
    if (!event) return;

    const alreadyMatched = matches.map(m => m.UserID);
    const eventSkills = event.RequiredSkills || [];

    const suggested = volunteers
      .filter(vol => !alreadyMatched.includes(vol.UserID))
      .map(vol => {
        const skillMatch = vol.skills ? vol.skills.filter(skill => 
          eventSkills.includes(skill)
        ).length : 0;
        
        const skillPercentage = eventSkills.length > 0 ? 
          (skillMatch / eventSkills.length) * 100 : 0;

        return {
          ...vol,
          skillMatch,
          skillPercentage,
          matchScore: skillPercentage
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    setVolunteers(suggested);
  };

  const handleMatchVolunteer = async (volunteerId) => {
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/volunteer/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          VolunteerID: volunteerId,
          EventID: selectedEvent
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Volunteer matched successfully!');
        fetchMatches(selectedEvent);
        findSuggestedVolunteers(selectedEvent);
        
        // Send notification
        await sendMatchNotification(volunteerId, selectedEvent);
      } else {
        setError(data.error || 'Failed to match volunteer');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const sendMatchNotification = async (volunteerId, eventId) => {
    try {
      const event = events.find(e => e.EventID === eventId);
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: volunteerId,
          Subject: 'New Event Assignment',
          Message: `You have been assigned to the event "${event.EventName}" scheduled for ${new Date(event.EventDate).toLocaleDateString()}. Please check your dashboard for more details.`,
          NotificationType: 'assignment'
        })
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const updateMatchStatus = async (matchId, status) => {
    try {
      const response = await fetch(`/api/volunteer/match/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ MatchStatus: status })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Match status updated to ${status}`);
        fetchMatches(selectedEvent);
      } else {
        setError(data.error || 'Failed to update match status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#f44336';
  };

  const selectedEventData = events.find(e => e.EventID === selectedEvent);

  return (
    <div className="volunteer-matching">
      <div className="matching-header">
        <h1>Volunteer Matching</h1>
        <p>Match volunteers to events based on their skills and preferences</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="event-selector">
        <label htmlFor="event-select">Select Event to Match Volunteers:</label>
        <select
          id="event-select"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Choose an event...</option>
          {events.map(event => (
            <option key={event.EventID} value={event.EventID}>
              {event.EventName} - {new Date(event.EventDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedEventData && (
        <div className="event-details">
          <h2>Event Details</h2>
          <div className="event-info-card">
            <h3>{selectedEventData.EventName}</h3>
            <p><strong>Date:</strong> {new Date(selectedEventData.EventDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {selectedEventData.Location}</p>
            <p><strong>Required Skills:</strong> {selectedEventData.RequiredSkills?.join(', ')}</p>
            <p><strong>Urgency:</strong> {selectedEventData.Urgency}</p>
            <p><strong>Current/Max Volunteers:</strong> {selectedEventData.CurrentVolunteers}/{selectedEventData.MaxVolunteers || '∞'}</p>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="matching-content">
          <div className="current-matches">
            <h2>Current Matches ({matches.length})</h2>
            {matches.length > 0 ? (
              <div className="matches-list">
                {matches.map(match => (
                  <div key={match.MatchID} className="match-card">
                    <div className="volunteer-info">
                      <h4>{match.FullName || `${match.FirstName} ${match.LastName}`}</h4>
                      <p>{match.Email}</p>
                      <p>{match.City}, {match.StateCode}</p>
                    </div>
                    <div className="match-status">
                      <span className={`status-badge status-${match.MatchStatus}`}>
                        {match.MatchStatus}
                      </span>
                      <div className="status-actions">
                        <button 
                          onClick={() => updateMatchStatus(match.MatchID, 'confirmed')}
                          disabled={match.MatchStatus === 'confirmed'}
                          className="confirm-btn"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => updateMatchStatus(match.MatchID, 'declined')}
                          disabled={match.MatchStatus === 'declined'}
                          className="decline-btn"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No volunteers matched yet.</p>
            )}
          </div>

          <div className="suggested-volunteers">
            <h2>Suggested Volunteers</h2>
            {volunteers.length > 0 ? (
              <div className="volunteers-list">
                {volunteers.slice(0, 10).map(volunteer => (
                  <div key={volunteer.UserID} className="volunteer-card">
                    <div className="volunteer-info">
                      <h4>{volunteer.FullName || `${volunteer.FirstName} ${volunteer.LastName}`}</h4>
                      <p>{volunteer.Email}</p>
                      <p>{volunteer.City}, {volunteer.StateCode}</p>
                      
                      <div className="skills-match">
                        <p><strong>Skills:</strong> {volunteer.skills?.join(', ') || 'No skills listed'}</p>
                        <div className="match-score">
                          <span>Match Score: </span>
                          <span 
                            style={{ color: getMatchScoreColor(volunteer.matchScore) }}
                            className="score-value"
                          >
                            {Math.round(volunteer.matchScore)}%
                          </span>
                        </div>
                      </div>

                      {volunteer.preferences && volunteer.preferences.length > 0 && (
                        <div className="preferences">
                          <p><strong>Preferences:</strong> {volunteer.preferences.join(', ')}</p>
                        </div>
                      )}

                      {volunteer.availability && volunteer.availability.length > 0 && (
                        <div className="availability">
                          <p><strong>Available:</strong> {volunteer.availability.map(a => 
                            `${a.DayOfWeek} ${a.StartTime}-${a.EndTime}`
                          ).join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="match-actions">
                      <button 
                        onClick={() => handleMatchVolunteer(volunteer.UserID)}
                        disabled={loading}
                        className="match-btn"
                      >
                        {loading ? 'Matching...' : 'Match'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No available volunteers found for this event.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerMatching;
