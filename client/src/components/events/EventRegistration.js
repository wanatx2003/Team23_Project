import React, { useState, useEffect } from 'react';
import '../../styles/events/Events.css';

const EventRegistration = ({ event, onConfirm, onCancel, userData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all events the user is registered for
    const fetchUserEvents = async () => {
      if (!userData || !userData.UserID) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/events/user/${userData.UserID}/registered`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setUserEvents(data.events || []);
        } else {
          console.error("Failed to fetch user registered events:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user registered events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEvents();
  }, [userData]);

  // Check if the new event overlaps with any existing registrations
  const checkForTimeOverlaps = () => {
    if (!event) return false;
    
    const newEventStart = new Date(event.StartAt);
    const newEventEnd = new Date(event.EndAt);
    
    // Find any overlapping events
    const overlappingEvents = userEvents.filter(userEvent => {
      // Skip the current event if it's in the user's events list
      if (userEvent.EventID === event.EventID) return false;
      
      const existingStart = new Date(userEvent.StartAt);
      const existingEnd = new Date(userEvent.EndAt);
      
      // Check for overlap:
      // (NewStart <= ExistingEnd) AND (NewEnd >= ExistingStart)
      return newEventStart <= existingEnd && newEventEnd >= existingStart;
    });
    
    return overlappingEvents.length > 0 ? overlappingEvents : false;
  };

  if (!event) {
    return (
      <div className="content-container">
        <h2>Registration Error</h2>
        <p>Event information is not available.</p>
        <div className="button-group">
          <button onClick={onCancel} className="btn-secondary">Back to Events</button>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check for time overlaps before proceeding
      const overlappingEvents = checkForTimeOverlaps();
      if (overlappingEvents) {
        // Format the overlapping event details for the error message
        const conflictDetails = overlappingEvents.map(e => 
          `"${e.EventName}" (${new Date(e.StartAt).toLocaleString()} - ${new Date(e.EndAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`
        ).join(', ');
        
        throw new Error(`Cannot register for this event due to time conflict with events you're already registered for: ${conflictDetails}`);
      }
      
      // If no overlaps, proceed with registration
      await onConfirm();
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('already registered')) {
          setError('You are already registered for this event.');
        } else if (error.message.includes('maximum capacity')) {
          setError('This event has reached maximum capacity.');
        } else if (error.message.includes('time conflict')) {
          setError(error.message);
        } else {
          setError(error.message || 'Failed to register for this event. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-container">
      <h2>Event Registration</h2>
      
      {isLoading ? (
        <div className="loading-message">Checking event schedule compatibility...</div>
      ) : (
        <>
          <div className="event-details">
            <p><strong>Event:</strong> {event.EventName}</p>
            <p><strong>Date:</strong> {new Date(event.StartAt).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date(event.StartAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
              {new Date(event.EndAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p><strong>Location:</strong> {event.RoomNumber}</p>
          </div>
          
          <p>Would you like to register for this event?</p>
          
          {error && (
            <div className="error-message" style={{ color: '#e53935', padding: '10px', marginBottom: '15px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
              <p>Error: You cannot register for this event due to a time conflict with an event you're already registered for.</p>
            </div>
          )}
          
          <div className="button-group">
            <button onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
            <button 
              onClick={handleConfirm} 
              className="btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Confirm Registration'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EventRegistration;
