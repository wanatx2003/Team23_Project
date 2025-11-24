import React, { useState, useEffect } from 'react';
import '../../styles/notifications/Notifications.css';

const Notifications = ({ userData, navigateToHome }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${userData.UserID}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NotificationID: notificationId })
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map(notification =>
          notification.NotificationID === notificationId
            ? { ...notification, IsRead: 1 }
            : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.IsRead);
    
    try {
      const promises = unreadNotifications.map(notification =>
        fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ NotificationID: notification.NotificationID })
        })
      );

      await Promise.all(promises);
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        IsRead: 1
      })));
      
      alert('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Failed to mark all notifications as read');
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notification => !notification.IsRead);
      case 'read':
        return notifications.filter(notification => notification.IsRead);
      case 'assignment':
        return notifications.filter(notification => notification.NotificationType === 'assignment');
      case 'reminder':
        return notifications.filter(notification => notification.NotificationType === 'reminder');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment': return '📋';
      case 'reminder': return '⏰';
      case 'update': return '📝';
      case 'cancellation': return '❌';
      default: return '📢';
    }
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <p>Stay updated with your volunteer assignments and reminders</p>
        {notifications.filter(n => !n.IsRead).length > 0 && (
          <button onClick={markAllAsRead} className="btn-mark-all-read">
            Mark All as Read
          </button>
        )}
      </div>

      <div className="filter-controls">
        <label>Filter by:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="assignment">Assignments</option>
          <option value="reminder">Reminders</option>
          <option value="update">Updates</option>
          <option value="cancellation">Cancellations</option>
        </select>
      </div>

      <div className="notifications-list">
        {getFilteredNotifications().length === 0 ? (
          <div className="no-notifications">
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="notifications-grid">
            {getFilteredNotifications().map(notification => (
              <div 
                key={notification.NotificationID} 
                className={`notification-card ${notification.IsRead ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.NotificationType)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.Subject}</h3>
                    <span className={`notification-type ${notification.NotificationType}`}>
                      {notification.NotificationType}
                    </span>
                  </div>
                  
                  <p className="notification-message">{notification.Message}</p>
                  
                  <div className="notification-footer">
                    <span className="notification-date">
                      {new Date(notification.CreatedAt).toLocaleString()}
                    </span>
                    
                    {!notification.IsRead && (
                      <button 
                        onClick={() => markAsRead(notification.NotificationID)}
                        className="btn-mark-read"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="notifications-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-number">
              {notifications.filter(n => !n.IsRead).length}
            </span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat">
            <span className="stat-number">
              {notifications.filter(n => n.NotificationType === 'assignment').length}
            </span>
            <span className="stat-label">Assignments</span>
          </div>
          <div className="stat">
            <span className="stat-number">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      <button onClick={navigateToHome} className="btn-back">
        Back to Home
      </button>
    </div>
  );
};

export default Notifications;
