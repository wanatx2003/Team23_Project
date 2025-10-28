import React, { useState, useEffect } from 'react';
import '../../styles/events/EventList.css';

const EventList = ({ userData, navigateToHome }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestToJoin = async (eventId) => {
    try {
      const response = await fetch('/api/volunteer-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          VolunteerID: userData.UserID,
          EventID: eventId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Your request to join this event has been submitted!');
        fetchEvents(); // Refresh events
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error requesting to join event:', error);
      alert('An error occurred while submitting your request.');
    }
  };

  const getFilteredEvents = () => {
    let filtered = events;

    // Filter by urgency
    if (filter !== 'all') {
      filtered = filtered.filter(event => event.Urgency === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.EventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.Location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Only show published events for volunteers
    if (userData.Role === 'volunteer') {
      filtered = filtered.filter(event => event.EventStatus === 'published');
    }

    return filtered;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h1>Available Volunteer Opportunities</h1>
        <p>Discover meaningful ways to contribute to your community</p>
      </div>

      <div className="event-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search events by name, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <label>Filter by urgency:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Events</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {getFilteredEvents().length === 0 ? (
        <div className="no-events">
          <p>No events found matching your criteria.</p>
        </div>
      ) : (
        <div className="events-grid">
          {getFilteredEvents().map(event => (
            <div key={event.EventID} className="event-card">
              <div className="event-header">
                <h3>{event.EventName}</h3>
                <span 
                  className="urgency-badge"
                  style={{ backgroundColor: getUrgencyColor(event.Urgency) }}
                >
                  {event.Urgency}
                </span>
              </div>

              <div className="event-details">
                <p><strong>Date:</strong> {new Date(event.EventDate).toLocaleDateString()}</p>
                {event.EventTime && (
                  <p><strong>Time:</strong> {event.EventTime}</p>
                )}
                <p><strong>Location:</strong> {event.Location}</p>
                <p><strong>Description:</strong> {event.Description}</p>
                
                {event.RequiredSkills && event.RequiredSkills.length > 0 && (
                  <div className="required-skills">
                    <strong>Required Skills:</strong>
                    <div className="skills-tags">
                      {event.RequiredSkills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="volunteer-info">
                  <p><strong>Volunteers:</strong> {event.CurrentVolunteers}</p>
                  {event.MaxVolunteers && (
                    <p><strong>Max Capacity:</strong> {event.MaxVolunteers}</p>
                  )}
                </div>
              </div>

              <div className="event-actions">
                {userData.Role === 'volunteer' && (
                  <button
                    onClick={() => requestToJoin(event.EventID)}
                    className="join-button"
                    disabled={event.MaxVolunteers && event.CurrentVolunteers >= event.MaxVolunteers}
                  >
                    {event.MaxVolunteers && event.CurrentVolunteers >= event.MaxVolunteers
                      ? 'Event Full'
                      : 'Request to Join'
                    }
                  </button>
                )}
              </div>

              <div className="event-footer">
                <small>Created by: {event.CreatedByName}</small>
                <small>Posted: {new Date(event.CreatedAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={navigateToHome} className="btn-back">
        Back to Dashboard
      </button>
    </div>
  );
};

export default EventList;
