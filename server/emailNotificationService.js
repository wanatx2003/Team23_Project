require("dotenv").config();
const nodemailer = require("nodemailer");
const mysql = require("mysql2");
const sendEmail = require("../sendEmail");

// Set up MySQL connection pool
const pool = mysql.createPool({
  host: "team7library.mysql.database.azure.com",
  user: "Team7Admin",
  password: "Admin123uma",
  database: "librarynew",
  connectionLimit: 5,
  ssl: {
    rejectUnauthorized: true, // Ensures SSL is used
  },
});

// Function to check for and send new email notifications
const processEmailNotifications = async () => {
  console.log("Checking for new email notifications...");

  try {
    // Use promises for better async handling
    const [results] = await pool
      .promise()
      .query("SELECT * FROM email_notifications WHERE Acknowledged = 0");

    if (results.length > 0) {
      console.log(`Found ${results.length} pending email notifications`);

      for (const notification of results) {
        try {
          // Use our sendEmail function
          await sendEmail(
            notification.Email,
            notification.Subject,
            notification.Body
          );

          // Mark as sent in the database
          await pool
            .promise()
            .query(
              "UPDATE email_notifications SET Acknowledged = 1 WHERE NotificationID = ?",
              [notification.NotificationID]
            );

          console.log(
            `Email notification processed for: ${notification.Email}`
          );
        } catch (error) {
          console.error(
            `Failed to process notification for ${notification.Email}:`,
            error
          );
        }
      }
    } else {
      console.log("No new email notifications found");
    }
  } catch (error) {
    console.error("Error processing email notifications:", error);
  }
};

// Start the email notification service
const startEmailNotificationService = (interval = 60000) => {
  console.log("Starting email notification service...");

  // Process any existing notifications immediately
  processEmailNotifications();

  // Then check periodically (default: every minute)
  const intervalId = setInterval(processEmailNotifications, interval);

  return {
    stop: () => {
      clearInterval(intervalId);
      console.log("Email notification service stopped");
    },
  };
};

module.exports = { startEmailNotificationService };
