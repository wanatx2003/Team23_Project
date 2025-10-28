import React, { useState, useEffect } from "react";
import "../../styles/volunteers/VolunteerDashboard.css";

const VolunteerDashboard = ({ userData, navigateToHome, navigateToProfile, navigateToEvents, navigateToHistory }) => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({
    totalHours: 0,
    eventsAttended: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    fetchVolunteerData();
  }, [userData]);

  const fetchVolunteerData = async () => {
    try {
      // Fetch upcoming events for volunteer
      const eventsResponse = await fetch(`/api/volunteer-events/${userData.UserID}`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUpcomingEvents(eventsData.events || []);
      }

      // Fetch volunteer history/stats
      const historyResponse = await fetch(`/api/volunteer-history/${userData.UserID}`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const history = historyData.history || [];
        
        const totalHours = history.reduce((sum, event) => sum + (event.HoursVolunteered || 0), 0);
        const eventsAttended = history.filter(event => event.ParticipationStatus === 'attended').length;
        
        setVolunteerStats({
          totalHours,
          eventsAttended,
          upcomingEvents: upcomingEvents.length
        });
        setRecentActivity(history.slice(0, 5)); // Show last 5 activities
      }
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    }
  };

  return (
    <div className="volunteer-dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {userData.FirstName}!</h2>
        <p>Your volunteer dashboard</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{volunteerStats.totalHours}</h3>
          <p>Hours Volunteered</p>
        </div>
        <div className="stat-card">
          <h3>{volunteerStats.eventsAttended}</h3>
          <p>Events Completed</p>
        </div>
        <div className="stat-card">
          <h3>{volunteerStats.upcomingEvents}</h3>
          <p>Upcoming Events</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p>No upcoming events. <button onClick={navigateToEvents} className="link-button">Browse available events</button></p>
          ) : (
            <div className="events-list">
              {upcomingEvents.map(event => (
                <div key={event.EventID} className="event-card">
                  <h4>{event.EventName}</h4>
                  <p><strong>Date:</strong> {new Date(event.EventDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {event.Location}</p>
                  <span className={`urgency-badge ${event.Urgency}`}>{event.Urgency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p>No volunteer history yet.</p>
          ) : (
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.HistoryID} className="activity-item">
                  <h4>{activity.EventName}</h4>
                  <p>Status: <span className={`status ${activity.ParticipationStatus}`}>{activity.ParticipationStatus}</span></p>
                  <p>Date: {new Date(activity.ParticipationDate).toLocaleDateString()}</p>
                  {activity.HoursVolunteered && <p>Hours: {activity.HoursVolunteered}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-actions">
        <button onClick={navigateToProfile} className="btn-primary">Complete Profile</button>
        <button onClick={navigateToEvents} className="btn-secondary">Browse Events</button>
        <button onClick={navigateToHistory} className="btn-secondary">View Full History</button>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
