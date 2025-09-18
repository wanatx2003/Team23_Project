import React, { useState, useEffect } from 'react';
import '../../styles/events/EventDetail.css';

const EventDetail = ({ 
  event, 
  onBack, 
  userData, 
  onRegister, 
  attendees, 
  onCheckIn,
  attendeeCount 
}) => {
  // Add local state for attendance that can be updated immediately on user actions
  const [localAttendeeCount, setLocalAttendeeCount] = useState(attendeeCount);
  
  // Validate the event has basic required properties
  useEffect(() => {
    if (event && (!event.EventName || !event.StartAt || !event.EndAt)) {
      console.warn("Event is missing required properties:", event);
    }
  }, [event]);

  // Calculate accurate counts from the attendees array when it changes
  useEffect(() => {
    if (Array.isArray(attendees) && attendees.length > 0) {
      const total = attendees.length;
      const checked = attendees.filter(a => a.CheckedIn === 1).length;
      
      console.log(`Calculated from attendees: total=${total}, checked=${checked}`);
      
      // Update local state with counts derived from actual attendees array
      setLocalAttendeeCount({
        total,
        checked
      });
    }
  }, [attendees]);
  
  // Also sync with the attendeeCount prop when it changes
  useEffect(() => {
    console.log("Received updated attendee counts:", attendeeCount);
    
    // Only use attendeeCount if it seems valid and we don't have attendee array data
    if (attendeeCount && (attendees.length === 0 || 
        (attendeeCount.total >= attendees.length && attendeeCount.checked >= 0))) {
      setLocalAttendeeCount(attendeeCount);
    }
  }, [attendeeCount, attendees]);

  // For debugging - log when component renders with new counts
  useEffect(() => {
    console.log("EventDetail rendering with counts:", localAttendeeCount);
  }, [localAttendeeCount]);

  if (!event) {
    return (
      <div className="event-detail-container">
        <div className="error-message">
          <p>Event details not available.</p>
          <button onClick={onBack} className="btn-secondary">Back to Events</button>
        </div>
      </div>
    );
  }
  
  // Check if current user is registered and/or checked in
  const isUserRegistered = attendees.some(a => a.UserID === userData?.UserID);
  const isUserCheckedIn = attendees.some(a => a.UserID === userData?.UserID && a.CheckedIn === 1);

  // Calculate remaining spots using local state
  const remainingSpots = Math.max(0, event && event.MaxAttendees ? 
    event.MaxAttendees - localAttendeeCount.total : 0);
  const isFull = remainingSpots <= 0;
  
  // Check if event is past, today, or upcoming
  const getEventTimeStatus = () => {
    const now = new Date();
    const start = new Date(event.StartAt);
    const end = new Date(event.EndAt);
    
    if (end < now) {
      return "past";
    } else if (start.toDateString() === now.toDateString()) {
      return "today";
    } else {
      return "upcoming";
    }
  };
  
  const timeStatus = getEventTimeStatus();

  // Format check-in time
  const formatCheckInTime = (dateString) => {
    if (!dateString) return 'Not checked in';
    
    const date = new Date(dateString);
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    return `${date.toLocaleDateString(undefined, dateOptions)} at ${date.toLocaleTimeString(undefined, timeOptions)}`;
  };
  
  // Wrapper functions that update local state before calling the parent handlers
  const handleRegister = () => {
    if (!isUserRegistered) {
      // Optimistically update the local state immediately
      setLocalAttendeeCount(prev => ({
        ...prev, 
        total: prev.total + 1
      }));
      
      // Then call the original handler
      onRegister();
    }
  };
  
  const handleCheckIn = () => {
    if (isUserRegistered && !isUserCheckedIn) {
      // Optimistically update the local state immediately
      setLocalAttendeeCount(prev => ({
        ...prev, 
        checked: prev.checked + 1
      }));
      
      // Then call the original handler
      onCheckIn();
    }
  };
  
  return (
    <div className="event-detail-container">
      <div className="event-detail-card">
        <div className="event-detail-header">
          <h2>{event.EventName}</h2>
          {event.EventCategory && <div className="event-detail-category">{event.EventCategory}</div>}
          
          {/* Event status badge - simplified */}
          <div className="event-status-badge">
            {timeStatus === "past" && <span className="badge past-event">Past Event</span>}
            {timeStatus === "today" && <span className="badge today-event">Today</span>}
            {timeStatus === "upcoming" && <span className="badge upcoming-event">Upcoming</span>}
          </div>
        </div>
        
        <div className="event-detail-section">
          <h3>Event Details</h3>
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{new Date(event.StartAt).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">
              {new Date(event.StartAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
              {new Date(event.EndAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{event.RoomNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Organizer:</span>
            <span className="detail-value">{event.Organizer || 'Library Staff'}</span>
          </div>
          
          {/* Display event description if available */}
          {event.EventDescription && (
            <div className="event-description">
              <h3>Description</h3>
              <div className="description-content">
                {/* Split description by line breaks to preserve formatting */}
                {event.EventDescription.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
          
          <div className="event-capacity">
            <h3>Attendance</h3>
            <div className="capacity-stats">
              <div className="capacity-row">
                <span>Registered:</span>
                <span>{localAttendeeCount.total} of {event.MaxAttendees} {isFull ? '(Full)' : ''}</span>
              </div>
              {userData?.Role === 'Admin' && (
                <div className="capacity-row">
                  <span>Checked In:</span>
                  <span>{localAttendeeCount.checked} attendees</span>
                </div>
              )}
              <div className="capacity-row">
                <span>Availability:</span>
                <span className={isFull ? 'full-event' : (remainingSpots <= 3 ? 'low-spots' : 'available-spots')}>
                  {isFull ? 'Full' : `${remainingSpots} spot${remainingSpots !== 1 ? 's' : ''} remaining`}
                </span>
              </div>
              <div className="capacity-progress">
                <div 
                  className="progress-bar"
                  style={{
                    width: `${Math.min(100, (localAttendeeCount.total / event.MaxAttendees) * 100)}%`,
                    backgroundColor: isFull ? '#ef4444' : remainingSpots <= 3 ? '#f59e0b' : '#10b981'
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          {userData && timeStatus !== "past" && (
            <div className="registration-status">
              {isUserRegistered ? (
                <>
                  <div className="registered-message">
                    You are registered for this event.
                  </div>
                  
                  {!isUserCheckedIn && (
                    <button 
                      className="btn-checkin"
                      onClick={handleCheckIn}
                    >
                      Check In Now
                    </button>
                  )}
                  
                  {isUserCheckedIn && (
                    <div className="checked-in-message">
                      You are checked in for this event.
                    </div>
                  )}
                </>
              ) : (
                <button 
                  className="btn-register"
                  onClick={handleRegister}
                  disabled={isFull}
                  style={isFull ? { opacity: '0.7', cursor: 'not-allowed' } : {}}
                >
                  {isFull ? 'Event Full' : 'Register for this Event'}
                </button>
              )}
            </div>
          )}
          
          {timeStatus === "past" && (
            <div className="past-event-message">
              This event has already taken place.
            </div>
          )}
          
          {!userData && (
            <p className="login-prompt">
              Please log in to register for this event.
            </p>
          )}
          
          {userData?.Role === 'Admin' && (
            <div className="attendee-list">
              <h4>Registered Attendees ({localAttendeeCount.total})</h4>
              {attendees.length > 0 ? (
                <table className="attendees-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map(attendee => (
                      <tr key={attendee.EventAttendeeID} className={attendee.CheckedIn === 1 ? 'checked-in' : ''}>
                        <td>{attendee.FirstName} {attendee.LastName}</td>
                        <td>{attendee.Email}</td>
                        <td>{attendee.CheckedIn === 1 ? 'Checked In' : 'Registered'}</td>
                        <td>{formatCheckInTime(attendee.CheckedInAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No attendees yet.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="event-detail-actions">
          <button 
            onClick={onBack}
            className="btn-secondary"
          >
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
