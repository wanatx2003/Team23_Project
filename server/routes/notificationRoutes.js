const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get notifications for a user
const getUserNotifications = (req, res, userId) => {
  const query = `
    SELECT NotificationID, Subject, Message, NotificationType, IsRead, CreatedAt
    FROM Notifications
    WHERE UserID = ?
    ORDER BY CreatedAt DESC
    LIMIT 50
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    sendJsonResponse(res, 200, { success: true, notifications: results });
  });
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { NotificationID } = data;
    
    const query = 'UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ?';
    
    pool.query(query, [NotificationID], (err, result) => {
      if (err) {
        console.error("Error marking notification as read:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to update notification" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: "Notification marked as read" });
    });
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Create notification (HTTP endpoint for API calls)
const createNotificationEndpoint = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { UserID, Subject, Message, NotificationType } = data;
    
    if (!UserID || !Subject || !Message || !NotificationType) {
      sendJsonResponse(res, 400, { success: false, error: 'Missing required fields' });
      return;
    }
    
    const query = `
      INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
      VALUES (?, ?, ?, ?)
    `;
    
    pool.query(query, [UserID, Subject, Message, NotificationType], (err, result) => {
      if (err) {
        console.error("Error creating notification:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to create notification" });
        return;
      }
      
      sendJsonResponse(res, 200, { 
        success: true, 
        notificationID: result.insertId,
        message: "Notification created successfully" 
      });
    });
  } catch (error) {
    console.error('Error in createNotificationEndpoint:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Create notification (internal function for programmatic use)
const createNotification = async (userID, subject, message, type) => {
  const query = `
    INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
    VALUES (?, ?, ?, ?)
  `;
  
  return new Promise((resolve, reject) => {
    pool.query(query, [userID, subject, message, type], (err, result) => {
      if (err) {
        console.error("Error creating notification:", err);
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

// Get unread notification count
const getUnreadCount = (req, res, userId) => {
  const query = 'SELECT COUNT(*) as unreadCount FROM Notifications WHERE UserID = ? AND IsRead = 0';
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching unread count:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    sendJsonResponse(res, 200, { success: true, unreadCount: results[0].unreadCount });
  });
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  createNotification,
  createNotificationEndpoint,
  getUnreadCount
};
