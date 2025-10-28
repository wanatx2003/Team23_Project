import React, { useState, useEffect } from 'react';
import '../../styles/events/EventManagement.css';

const EventManagement = ({ userData, navigateToHome }) => {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSkills, setAvailableSkills] = useState([]);
  
  const [eventForm, setEventForm] = useState({
    EventName: '',
    Description: '',
    Location: '',
    RequiredSkills: [],
    Urgency: 'medium',
    EventDate: '',
    EventTime: '',
    MaxVolunteers: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchAvailableSkills();
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

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (data.success) {
        setAvailableSkills(data.skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEvent ? `/api/events/${editingEvent.EventID}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          CreatedBy: userData.UserID
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
        fetchEvents();
        resetForm();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('An error occurred while saving the event.');
    }
  };

  const resetForm = () => {
    setEventForm({
      EventName: '',
      Description: '',
      Location: '',
      RequiredSkills: [],
      Urgency: 'medium',
      EventDate: '',
      EventTime: '',
      MaxVolunteers: ''
    });
    setShowCreateForm(false);
    setEditingEvent(null);
  };

  const handleEdit = (event) => {
    setEventForm({
      EventName: event.EventName,
      Description: event.Description,
      Location: event.Location,
      RequiredSkills: event.RequiredSkills || [],
      Urgency: event.Urgency,
      EventDate: event.EventDate.split('T')[0],
      EventTime: event.EventTime || '',
      MaxVolunteers: event.MaxVolunteers || ''
    });
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          alert('Event deleted successfully!');
          fetchEvents();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('An error occurred while deleting the event.');
      }
    }
  };

  const handleSkillChange = (skill) => {
    const newSkills = eventForm.RequiredSkills.includes(skill)
      ? eventForm.RequiredSkills.filter(s => s !== skill)
      : [...eventForm.RequiredSkills, skill];
    setEventForm({ ...eventForm, RequiredSkills: newSkills });
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="event-management-container">
      <div className="event-management-header">
        <h1>Event Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {showCreateForm && (
        <div className="event-form-container">
          <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                value={eventForm.EventName}
                onChange={(e) => setEventForm({ ...eventForm, EventName: e.target.value })}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={eventForm.Description}
                onChange={(e) => setEventForm({ ...eventForm, Description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <textarea
                value={eventForm.Location}
                onChange={(e) => setEventForm({ ...eventForm, Location: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="form-group">
              <label>Required Skills *</label>
              <div className="skills-grid">
                {availableSkills.map(skill => (
                  <label key={skill} className="skill-checkbox">
                    <input
                      type="checkbox"
                      checked={eventForm.RequiredSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Urgency *</label>
                <select
                  value={eventForm.Urgency}
                  onChange={(e) => setEventForm({ ...eventForm, Urgency: e.target.value })}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  value={eventForm.EventDate}
                  onChange={(e) => setEventForm({ ...eventForm, EventDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Event Time</label>
                <input
                  type="time"
                  value={eventForm.EventTime}
                  onChange={(e) => setEventForm({ ...eventForm, EventTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Max Volunteers</label>
                <input
                  type="number"
                  value={eventForm.MaxVolunteers}
                  onChange={(e) => setEventForm({ ...eventForm, MaxVolunteers: e.target.value })}
                  min="1"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="events-list">
        <h2>Existing Events</h2>
        {events.length === 0 ? (
          <p>No events created yet.</p>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.EventID} className="event-card">
                <div className="event-header">
                  <h3>{event.EventName}</h3>
                  <span className={`urgency-badge ${event.Urgency}`}>
                    {event.Urgency}
                  </span>
                </div>
                <p><strong>Date:</strong> {new Date(event.EventDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.Location}</p>
                <p><strong>Required Skills:</strong> {event.RequiredSkills?.join(', ') || 'None'}</p>
                <p><strong>Volunteers:</strong> {event.CurrentVolunteers}/{event.MaxVolunteers || '∞'}</p>
                
                <div className="event-actions">
                  <button onClick={() => handleEdit(event)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(event.EventID)} className="btn-delete">
                    Delete
                  </button>
                </div>
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

export default EventManagement;
