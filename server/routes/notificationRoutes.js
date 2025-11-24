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

// Send event reminders (can be called manually or via cron job)
const sendEventReminders = async (req, res) => {
  try {
    // Get events happening in the next 24 hours
    const query = `
      SELECT DISTINCT
        vm.VolunteerID,
        ed.EventID,
        ed.EventName,
        ed.EventDate,
        ed.StartTime,
        ed.Location
      FROM VolunteerMatches vm
      JOIN EventDetails ed ON vm.EventID = ed.EventID
      WHERE vm.MatchStatus = 'confirmed'
        AND ed.EventDate = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND ed.EventStatus = 'published'
    `;
    
    pool.query(query, (err, events) => {
      if (err) {
        console.error("Error fetching events for reminders:", err);
        if (res) sendJsonResponse(res, 500, { success: false, error: "Failed to send reminders" });
        return;
      }
      
      if (events.length === 0) {
        console.log("No upcoming events to send reminders for");
        if (res) sendJsonResponse(res, 200, { success: true, message: "No reminders to send", count: 0 });
        return;
      }
      
      const notificationPromises = events.map(event => {
        const message = `Reminder: You have an upcoming volunteer event \"${event.EventName}\" tomorrow at ${event.StartTime || 'TBD'}. Location: ${event.Location}`;
        const notifQuery = `
          INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
          VALUES (?, 'Event Reminder - Tomorrow', ?, 'reminder')
        `;
        
        return new Promise((resolve, reject) => {
          pool.query(notifQuery, [event.VolunteerID, message], (notifErr, result) => {
            if (notifErr) {
              console.error("Error creating reminder notification:", notifErr);
              reject(notifErr);
            } else {
              resolve(result);
            }
          });
        });
      });
      
      Promise.all(notificationPromises)
        .then(() => {
          console.log(`Sent ${events.length} event reminders`);
          if (res) sendJsonResponse(res, 200, { success: true, message: "Reminders sent successfully", count: events.length });
        })
        .catch(err => {
          console.error("Error sending some reminders:", err);
          if (res) sendJsonResponse(res, 500, { success: false, error: "Some reminders failed to send" });
        });
    });
  } catch (error) {
    console.error('Error in sendEventReminders:', error);
    if (res) sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  createNotification,
  createNotificationEndpoint,
  getUnreadCount,
  sendEventReminders
};
