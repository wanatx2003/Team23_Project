import React, { useState, useEffect } from 'react';
import '../../styles/volunteers/VolunteerNotificationPanel.css';

const VolunteerNotificationPanel = ({ userData, navigateToHome }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [userData]);

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

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.NotificationID === notificationId 
              ? { ...notification, IsRead: 1 }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.IsRead);
      case 'assignments':
        return notifications.filter(n => n.NotificationType === 'assignment');
      case 'reminders':
        return notifications.filter(n => n.NotificationType === 'reminder');
      case 'updates':
        return notifications.filter(n => n.NotificationType === 'update');
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

  const getNotificationColor = (type) => {
    switch (type) {
      case 'assignment': return '#28a745';
      case 'reminder': return '#ffc107';
      case 'update': return '#17a2b8';
      case 'cancellation': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="notification-panel">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
        <p>Stay updated with your volunteer assignments and reminders</p>
      </div>

      <div className="notification-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={filter === 'unread' ? 'active' : ''} 
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.IsRead).length})
        </button>
        <button 
          className={filter === 'assignments' ? 'active' : ''} 
          onClick={() => setFilter('assignments')}
        >
          Assignments ({notifications.filter(n => n.NotificationType === 'assignment').length})
        </button>
        <button 
          className={filter === 'reminders' ? 'active' : ''} 
          onClick={() => setFilter('reminders')}
        >
          Reminders ({notifications.filter(n => n.NotificationType === 'reminder').length})
        </button>
      </div>

      <div className="notifications-list">
        {getFilteredNotifications().length === 0 ? (
          <div className="no-notifications">
            <p>📭 No notifications found</p>
            <small>You're all caught up!</small>
          </div>
        ) : (
          getFilteredNotifications().map(notification => (
            <div 
              key={notification.NotificationID} 
              className={`notification-item ${notification.IsRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon" style={{ color: getNotificationColor(notification.NotificationType) }}>
                {getNotificationIcon(notification.NotificationType)}
              </div>
              
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.Subject}</h4>
                  <span className={`type-badge ${notification.NotificationType}`}>
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
                      className="mark-read-btn"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="panel-actions">
        <button onClick={navigateToHome} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default VolunteerNotificationPanel;
