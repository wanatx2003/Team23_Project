const http = require("http");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");

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

// Set up email transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "databaselibrary7@gmail.com",
    pass: "jldyebqoowhipxrf",
  },
});

// Function to send emails from the email_notifications table
const sendEmails = async () => {
  try {
    // Fetch all notifications that have not been sent yet
    pool.query(
      "SELECT * FROM email_notifications WHERE Acknowledged = 0",
      async (err, results) => {
        if (err) {
          console.error("Error fetching notifications:", err);
          return;
        }

        for (const notification of results) {
          const mailOptions = {
            from: "Admin@gmail.com",
            to: notification.Email,
            subject: notification.Subject,
            text: notification.Body,
          };

          try {
            // Send email
            await transporter.sendMail(mailOptions);

            // Update the email notification status to 'Sent'
            pool.query(
              "UPDATE email_notifications SET Acknowledged = 1 WHERE NotificationID = ?",
              [notification.NotificationID],
              (err) => {
                if (err) {
                  console.error("Error updating notification status:", err);
                } else {
                  console.log("Email sent to:", notification.Email);
                }
              }
            );
          } catch (error) {
            console.error("Error sending email:", error);
          }
        }
      }
    );
  } catch (error) {
    console.error("Error in sendEmails:", error);
  }
};

// Run sendEmails every minute
setInterval(sendEmails, 60000); // Check for new emails every minute

// Create a simple HTTP server to allow accessing the email service 
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Email service running');
});

server.listen(3000, () => {
  console.log("Email service running on port 3000");
});
