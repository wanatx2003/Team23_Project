import React, { useState, useEffect } from 'react';
import '../../styles/admin/EventManagement.css';

const EventManagement = ({ userData }) => {
  const [events, setEvents] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    EventName: '',
    Description: '',
    Location: '',
    RequiredSkills: [],
    Urgency: 'medium',
    EventDate: '',
    StartTime: '',
    EndTime: '',
    MaxVolunteers: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchSkills();
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
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/user/skills');
      const data = await response.json();
      if (data.success) {
        setAvailableSkills(data.skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setMessage('');
  };

  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      RequiredSkills: prev.RequiredSkills.includes(skill)
        ? prev.RequiredSkills.filter(s => s !== skill)
        : [...prev.RequiredSkills, skill]
    }));
  };

  const validateForm = () => {
    if (!formData.EventName || formData.EventName.length > 100) {
      setError('Event name is required and must be 100 characters or less');
      return false;
    }
    if (!formData.Description) {
      setError('Event description is required');
      return false;
    }
    if (!formData.Location) {
      setError('Location is required');
      return false;
    }
    if (formData.RequiredSkills.length === 0) {
      setError('At least one required skill must be selected');
      return false;
    }
    if (!formData.EventDate) {
      setError('Event date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const url = editingEvent ? `/api/events/${editingEvent.EventID}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      
      const requestData = {
        ...formData,
        CreatedBy: userData.UserID,
        MaxVolunteers: formData.MaxVolunteers ? parseInt(formData.MaxVolunteers) : null
      };

      if (editingEvent) {
        requestData.EventID = editingEvent.EventID;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
        resetForm();
        fetchEvents();
      } else {
        setError(data.error || 'Failed to save event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      EventName: '',
      Description: '',
      Location: '',
      RequiredSkills: [],
      Urgency: 'medium',
      EventDate: '',
      StartTime: '',
      EndTime: '',
      MaxVolunteers: ''
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event) => {
    // Convert time from HH:MM:SS to HH:MM for HTML time input
    const formatTimeForInput = (time) => {
      if (!time) return '';
      // If time is in HH:MM:SS format, extract HH:MM
      return time.split(':').slice(0, 2).join(':');
    };

    setFormData({
      EventName: event.EventName,
      Description: event.Description,
      Location: event.Location,
      RequiredSkills: event.RequiredSkills || [],
      Urgency: event.Urgency,
      EventDate: event.EventDate.split('T')[0],
      StartTime: formatTimeForInput(event.StartTime),
      EndTime: formatTimeForInput(event.EndTime),
      MaxVolunteers: event.MaxVolunteers || ''
    });
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Event deleted successfully!');
        fetchEvents();
      } else {
        setError(data.error || 'Failed to delete event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const formatTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '';
    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }
    if (startTime) return `Starts at ${formatTime(startTime)}`;
    return `Ends at ${formatTime(endTime)}`;
  };

  return (
    <div className="event-management">
      <div className="event-management-header">
        <h1>Event Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="create-event-btn"
        >
          {showForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="event-form-container">
          <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
          
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label htmlFor="EventName">Event Name *</label>
              <input
                type="text"
                id="EventName"
                name="EventName"
                value={formData.EventName}
                onChange={handleChange}
                required
                maxLength="100"
                placeholder="Enter event name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Description">Event Description *</label>
              <textarea
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe the event details, goals, and requirements"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Location">Location *</label>
              <textarea
                id="Location"
                name="Location"
                value={formData.Location}
                onChange={handleChange}
                required
                rows="2"
                placeholder="Enter the event location and address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Urgency">Urgency *</label>
                <select
                  id="Urgency"
                  name="Urgency"
                  value={formData.Urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="EventDate">Event Date *</label>
                <input
                  type="date"
                  id="EventDate"
                  name="EventDate"
                  value={formData.EventDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="StartTime">Start Time</label>
                <input
                  type="time"
                  id="StartTime"
                  name="StartTime"
                  value={formData.StartTime}
                  onChange={handleChange}
                  placeholder="Event start time"
                />
              </div>

              <div className="form-group">
                <label htmlFor="EndTime">End Time</label>
                <input
                  type="time"
                  id="EndTime"
                  name="EndTime"
                  value={formData.EndTime}
                  onChange={handleChange}
                  placeholder="Event end time"
                />
              </div>

              <div className="form-group">
                <label htmlFor="MaxVolunteers">Max Volunteers</label>
                <input
                  type="number"
                  id="MaxVolunteers"
                  name="MaxVolunteers"
                  value={formData.MaxVolunteers}
                  onChange={handleChange}
                  min="1"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Required Skills *</label>
              <div className="skills-grid">
                {availableSkills.map(skill => (
                  <label key={skill} className="skill-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.RequiredSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="events-list">
        <h2>Existing Events</h2>
        {events.length > 0 ? (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.EventID} className="event-card">
                <div className="event-header">
                  <h3>{event.EventName}</h3>
                  <div className="event-badges">
                    <span className={`urgency-badge ${getUrgencyClass(event.Urgency)}`}>
                      {event.Urgency}
                    </span>
                    <span className="status-badge">
                      {event.EventStatus}
                    </span>
                  </div>
                </div>

                <p className="event-date">📅 {formatDate(event.EventDate)}</p>
                {(event.StartTime || event.EndTime) && (
                  <p className="event-time">🕐 {formatTimeRange(event.StartTime, event.EndTime)}</p>
                )}
                <p className="event-location">📍 {event.Location}</p>
                <p className="event-description">{event.Description}</p>

                <div className="event-details">
                  <p><strong>Required Skills:</strong> {event.RequiredSkills?.join(', ')}</p>
                  <p><strong>Volunteers:</strong> {event.CurrentVolunteers}/{event.MaxVolunteers || '∞'}</p>
                  <p><strong>Created by:</strong> {event.CreatedByName}</p>
                </div>

                <div className="event-actions">
                  <button 
                    onClick={() => handleEdit(event)} 
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(event.EventID)} 
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p>No events created yet. Create your first event to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
