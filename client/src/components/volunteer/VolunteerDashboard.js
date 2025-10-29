import React, { useState, useEffect } from 'react';
import '../../styles/volunteer/VolunteerDashboard.css';

const VolunteerDashboard = ({ userData, onNavigateToProfile, onNavigateToEvents }) => {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    completedEvents: 0,
    totalHours: 0,
    unreadNotifications: 0
  });
  const [matchedEvents, setMatchedEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [userSkills, setUserSkills] = useState([]);
  const [userAvailability, setUserAvailability] = useState([]);

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
      checkProfileCompletion();
    }
  }, [userData]);

  const fetchDashboardData = async () => {
    try {
      // Fetch volunteer statistics
      const statsResponse = await fetch(`/api/volunteer/stats/${userData.UserID}`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch matched events for this volunteer
      const matchedResponse = await fetch(`/api/volunteer/matched-events/${userData.UserID}`);
      const matchedData = await matchedResponse.json();
      
      if (matchedData.success) {
        setMatchedEvents(matchedData.events);
      }

      // Fetch available events with skill matching
      const eventsResponse = await fetch(`/api/events/available-with-matching/${userData.UserID}`);
      const eventsData = await eventsResponse.json();
      
      if (eventsData.success) {
        setAvailableEvents(eventsData.events);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch(`/api/user/profile/${userData.UserID}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        const profile = data.profile;
        const isComplete = profile.FullName && 
                          profile.Address1 && 
                          profile.City && 
                          profile.StateCode && 
                          profile.Zipcode &&
                          profile.skills && 
                          profile.skills.length > 0 &&
                          profile.availability &&
                          profile.availability.length > 0;
        setProfileComplete(isComplete);
        setUserSkills(profile.skills || []);
        setUserAvailability(profile.availability || []);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
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
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to send volunteer request');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMatchScore = (event) => {
    if (!userSkills.length || !event.RequiredSkills) return 0;
    
    const matchingSkills = event.RequiredSkills.filter(skill => 
      userSkills.includes(skill)
    );
    
    return Math.round((matchingSkills.length / event.RequiredSkills.length) * 100);
  };

  const isDateAvailable = (eventDate) => {
    if (!userAvailability.length) return false;
    
    const eventDay = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'short' });
    const dayMap = {
      'Sun': 'Sun', 'Mon': 'Mon', 'Tue': 'Tue', 'Wed': 'Wed',
      'Thu': 'Thu', 'Fri': 'Fri', 'Sat': 'Sat'
    };
    
    return userAvailability.some(avail => avail.DayOfWeek === dayMap[eventDay]);
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

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="volunteer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userData.FirstName}!</h1>
        <p>Here's your volunteer activity overview</p>
      </div>

      {!profileComplete && (
        <div className="profile-incomplete-banner">
          <div className="banner-content">
            <h3>Complete Your Profile</h3>
            <p>Please complete your profile with skills and availability to get matched with volunteer opportunities</p>
            <button onClick={onNavigateToProfile} className="complete-profile-btn">
              Complete Profile
            </button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedEvents}</h3>
            <p>Completed Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.totalHours}</h3>
            <p>Total Hours</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{stats.unreadNotifications}</h3>
            <p>New Notifications</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Upcoming Events</h2>
            {matchedEvents.length > 0 && (
              <span className="event-count">{matchedEvents.length} events</span>
            )}
          </div>
          {matchedEvents.length > 0 ? (
            <div className="events-list">
              {matchedEvents.map(event => (
                <div key={event.EventID} className="event-card matched">
                  <div className="event-header">
                    <h3>{event.EventName}</h3>
                    <span className={`urgency-badge ${getUrgencyClass(event.Urgency)}`}>
                      {event.Urgency}
                    </span>
                  </div>
                  <p className="event-date">📅 {formatDate(event.EventDate)}</p>
                  <p className="event-location">📍 {event.Location}</p>
                  <p className="event-description">{event.Description}</p>
                  <div className="match-status">
                    <span className={`status-badge status-${event.MatchStatus}`}>
                      {event.MatchStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <p>No upcoming events. Browse available events below to get started!</p>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recommended Events for You</h2>
            <button onClick={onNavigateToEvents} className="view-all-btn">
              View All Events
            </button>
          </div>
          {availableEvents.length > 0 ? (
            <div className="events-list">
              {availableEvents.slice(0, 3).map(event => {
                const matchScore = getMatchScore(event);
                const dateAvailable = isDateAvailable(event.EventDate);
                
                return (
                  <div key={event.EventID} className="event-card available">
                    <div className="event-header">
                      <h3>{event.EventName}</h3>
                      <span className={`urgency-badge ${getUrgencyClass(event.Urgency)}`}>
                        {event.Urgency}
                      </span>
                    </div>
                    <p className="event-date">📅 {formatDate(event.EventDate)}</p>
                    <p className="event-location">📍 {event.Location}</p>
                    <p className="event-description">{event.Description}</p>
                    
                    <div className="event-matching">
                      <div className="match-indicators">
                        <div className={`match-indicator ${matchScore >= 50 ? 'good' : 'poor'}`}>
                          <span className="indicator-label">Skill Match:</span>
                          <span className="indicator-value">{matchScore}%</span>
                        </div>
                        <div className={`match-indicator ${dateAvailable ? 'good' : 'poor'}`}>
                          <span className="indicator-label">Available:</span>
                          <span className="indicator-value">{dateAvailable ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      
                      {event.RequiredSkills && (
                        <div className="skills-match">
                          <span className="skills-label">Required Skills:</span>
                          <div className="skills-list">
                            {event.RequiredSkills.map(skill => (
                              <span 
                                key={skill} 
                                className={`skill-tag ${userSkills.includes(skill) ? 'matched' : 'unmatched'}`}
                              >
                                {skill}
                                {userSkills.includes(skill) && ' ✓'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="event-actions">
                      <button 
                        onClick={() => handleVolunteerRequest(event.EventID)}
                        className="volunteer-btn"
                        disabled={event.MaxVolunteers && event.CurrentVolunteers >= event.MaxVolunteers}
                      >
                        {event.MaxVolunteers && event.CurrentVolunteers >= event.MaxVolunteers 
                          ? 'Event Full' 
                          : 'Request to Volunteer'
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-events">
              <p>No events available at the moment. Check back later for new opportunities!</p>
              <button onClick={onNavigateToEvents} className="view-all-btn">
                Browse All Events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
