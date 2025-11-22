import React, { useState, useEffect } from 'react';
import '../../styles/volunteer/EventsList.css';

const EventsList = ({ userData, navigateToHome }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filter, skillFilter, urgencyFilter]);

  const fetchAvailableEvents = async () => {
    try {
      const response = await fetch('/api/events/available');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        setError('Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Filter by status
    if (filter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.EventDate) >= new Date());
    } else if (filter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(event => new Date(event.EventDate).toDateString() === today);
    }

    // Filter by skills
    if (skillFilter) {
      filtered = filtered.filter(event => 
        event.RequiredSkills && event.RequiredSkills.includes(skillFilter)
      );
    }

    // Filter by urgency
    if (urgencyFilter) {
      filtered = filtered.filter(event => event.Urgency === urgencyFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleVolunteerRequest = async (eventId) => {
    try {
      const response = await fetch('/api/volunteer/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          VolunteerID: userData.UserID,
          EventID: eventId
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Volunteer request sent successfully!');
        // Refresh events to update the volunteer count
        fetchAvailableEvents();
      } else {
        setError(data.error || 'Failed to send volunteer request');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return 'Time TBD';
    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }
    if (startTime) return `Starts at ${formatTime(startTime)}`;
    return `Ends at ${formatTime(endTime)}`;
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-medium';
    }
  };

  const uniqueSkills = [...new Set(events.flatMap(event => event.RequiredSkills || []))];

  if (loading) {
    return <div className="events-loading">Loading available events...</div>;
  }

  return (
    <div className="events-list-container">
      <div className="events-header">
        <h1>Available Volunteer Events</h1>
        <p>Find and join volunteer opportunities that match your interests and skills</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="events-filters">
        <div className="filter-group">
          <label>Show:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="today">Today's Events</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Skill:</label>
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}>
            <option value="">All Skills</option>
            {uniqueSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Urgency:</label>
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
            <option value="">All Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button 
          className="clear-filters-btn"
          onClick={() => {
            setFilter('all');
            setSkillFilter('');
            setUrgencyFilter('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Events List */}
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.EventID} className="event-card">
              <div className="event-card-header">
                <div className="event-title-section">
                  <h3>{event.EventName}</h3>
                  <span className={`urgency-badge ${getUrgencyClass(event.Urgency)}`}>
                    {event.Urgency}
                  </span>
                </div>
                <div className="event-date-section">
                  <div className="date-display">
                    <span className="date-day">{new Date(event.EventDate).getDate()}</span>
                    <span className="date-month">{new Date(event.EventDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                </div>
              </div>

              <div className="event-card-body">
                <div className="event-meta">
                  <div className="meta-item">
                    <span className="meta-icon">🕐</span>
                    <span className="meta-text">{formatTimeRange(event.StartTime, event.EndTime)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span className="meta-text">{event.Location}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span className="meta-text">
                      {event.CurrentVolunteers}/{event.MaxVolunteers || '∞'} volunteers
                      {event.MaxVolunteers && (
                        <span className="capacity-bar">
                          <span 
                            className="capacity-fill" 
                            style={{ width: `${(event.CurrentVolunteers / event.MaxVolunteers) * 100}%` }}
                          />
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="event-description">
                  <p>{event.Description}</p>
                </div>

                <div className="event-skills">
                  <span className="skills-label">Required Skills:</span>
                  <div className="skills-list">
                    {event.RequiredSkills?.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    )) || <span className="no-skills">No specific skills required</span>}
                  </div>
                </div>
              </div>

              <div className="event-card-footer">
                <button 
                  onClick={() => handleVolunteerRequest(event.EventID)}
                  className="volunteer-btn"
                  disabled={event.MaxVolunteers && event.CurrentVolunteers >= event.MaxVolunteers}
                >
                  {event.MaxVolunteers && event.CurrentVolunteers >= event.MaxVolunteers 
                    ? '🔒 Event Full' 
                    : '✨ Volunteer for this Event'
                  }
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No events found</h3>
            <p>
              {filter === 'all' 
                ? "No volunteer events are currently available. Check back later!"
                : "No events match your current filters. Try adjusting your search criteria."
              }
            </p>
          </div>
        )}
      </div>

      <button onClick={navigateToHome} className="btn-back">
        Back to Home
      </button>
    </div>
  );
};

export default EventsList;
