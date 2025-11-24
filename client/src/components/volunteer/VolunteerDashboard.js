import React, { useState, useEffect } from 'react';
import '../../styles/volunteer/VolunteerDashboard.css';

const VolunteerDashboard = ({ userData, onNavigateToProfile, onNavigateToEvents, onNavigateToHistory, onNavigateToNotifications, onNavigateToAssignments }) => {
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

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="volunteer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back!</h1>
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

      {/* Navigation Cards Section */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="navigation-cards">
          <div className="nav-card" onClick={onNavigateToAssignments}>
            <div className="nav-card-icon">📝</div>
            <div className="nav-card-content">
              <h3>My Assignments</h3>
              <p>View and manage your volunteer assignments</p>
              <span className="nav-card-count">{matchedEvents.length} active</span>
            </div>
            <div className="nav-card-arrow">→</div>
          </div>

          <div className="nav-card" onClick={onNavigateToEvents}>
            <div className="nav-card-icon">🎯</div>
            <div className="nav-card-content">
              <h3>Browse Events</h3>
              <p>Find and join volunteer opportunities</p>
              <span className="nav-card-count">{availableEvents.length} available</span>
            </div>
            <div className="nav-card-arrow">→</div>
          </div>

          <div className="nav-card" onClick={onNavigateToProfile}>
            <div className="nav-card-icon">👤</div>
            <div className="nav-card-content">
              <h3>My Profile</h3>
              <p>Update your skills and availability</p>
              <span className={`nav-card-status ${profileComplete ? 'complete' : 'incomplete'}`}>
                {profileComplete ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="nav-card-arrow">→</div>
          </div>

          <div className="nav-card" onClick={onNavigateToHistory}>
            <div className="nav-card-icon">📋</div>
            <div className="nav-card-content">
              <h3>My History</h3>
              <p>View your volunteer participation</p>
              <span className="nav-card-count">{stats.completedEvents} completed</span>
            </div>
            <div className="nav-card-arrow">→</div>
          </div>

          <div className="nav-card" onClick={onNavigateToNotifications}>
            <div className="nav-card-icon">🔔</div>
            <div className="nav-card-content">
              <h3>Notifications</h3>
              <p>Check your messages and updates</p>
              <span className="nav-card-count">{stats.unreadNotifications} unread</span>
            </div>
            <div className="nav-card-arrow">→</div>
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
              <p>No upcoming events. Browse available events to get started!</p>
              <button onClick={onNavigateToEvents} className="browse-events-btn">
                Browse Events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
