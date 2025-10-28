import React, { useState, useEffect } from 'react';
import '../../styles/volunteers/EventSignup.css';

const EventSignup = ({ userData, navigateToEvents }) => {
  const [availableEvents, setAvailableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAvailableEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      const response = await fetch('/api/events?status=published');
      const data = await response.json();
      if (data.success) {
        setAvailableEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const signupForEvent = async (eventId) => {
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
        alert('Successfully signed up for the event!');
        fetchAvailableEvents(); // Refresh the list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error signing up for event:', error);
      alert('An error occurred while signing up.');
    }
  };

  const getFilteredEvents = () => {
    let filtered = availableEvents;

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

    return filtered;
  };

  if (loading) return <div className="loading">Loading available events...</div>;

  return (
    <div className="event-signup-container">
      <div className="signup-header">
        <h1>Available Volunteer Opportunities</h1>
        <p>Find events that match your skills and availability</p>
      </div>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Urgency Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="events-grid">
        {getFilteredEvents().map(event => (
          <div key={event.EventID} className="event-card">
            <div className="event-header">
              <h3>{event.EventName}</h3>
              <span className={`urgency-badge ${event.Urgency}`}>
                {event.Urgency}
              </span>
            </div>
            
            <p><strong>Date:</strong> {new Date(event.EventDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.Location}</p>
            <p><strong>Description:</strong> {event.Description}</p>
            
            <div className="event-actions">
              <button
                onClick={() => signupForEvent(event.EventID)}
                className="signup-button"
              >
                Sign Up
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={navigateToEvents} className="btn-back">
        Back to Events
      </button>
    </div>
  );
};

export default EventSignup;
