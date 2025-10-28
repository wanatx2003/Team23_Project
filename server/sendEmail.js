const http = require("http");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");

// Set up MySQL connection pool for local database
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "!Mm042326323",
  database: "volunteer_management",
  port: 3306,
  connectionLimit: 5,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
});

// Set up email transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "databaselibrary7@gmail.com",
    pass: "jldyebqoowhipxrf",
  },
});

// Function to send emails from the notifications table
const sendEmails = async () => {
  try {
    // Fetch all notifications that have not been sent yet for volunteer management
    pool.query(
      "SELECT n.NotificationID, n.Subject, n.Message, uc.Email FROM Notifications n JOIN UserCredentials uc ON n.UserID = uc.UserID WHERE n.IsRead = 0",
      async (err, results) => {
        if (err) {
          console.error("Error fetching notifications:", err);
          return;
        }

        console.log(`Found ${results.length} unread notifications to process`);

        for (const notification of results) {
          const mailOptions = {
            from: "VolunteerConnect System <databaselibrary7@gmail.com>",
            to: notification.Email,
            subject: notification.Subject,
            text: notification.Message,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #667eea; margin: 0;">VolunteerConnect</h1>
                  <p style="color: #666; margin: 5px 0;">Connecting volunteers with meaningful opportunities</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #333; margin: 0 0 15px 0;">${notification.Subject}</h2>
                  <div style="color: #555; line-height: 1.6;">
                    ${notification.Message.replace(/\n/g, "<br>")}
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    This is an automated message from the VolunteerConnect System.<br>
                    Please do not reply to this email.
                  </p>
                </div>
              </div>
            `,
          };

          try {
            // Send email
            await transporter.sendMail(mailOptions);

            // Update the notification status to 'Read' (sent)
            pool.query(
              "UPDATE Notifications SET IsRead = 1 WHERE NotificationID = ?",
              [notification.NotificationID],
              (err) => {
                if (err) {
                  console.error("Error updating notification status:", err);
                } else {
                  console.log(
                    `✓ Email sent to ${notification.Email} - Subject: "${notification.Subject}"`
                  );
                }
              }
            );
          } catch (error) {
            console.error(
              `✗ Failed to send email to ${notification.Email}:`,
              error.message
            );
          }
        }
      }
    );
  } catch (error) {
    console.error("Error in sendEmails function:", error);
  }
};

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Email service: Error connecting to MySQL database:", err);
  } else {
    console.log("✓ Email service: Connected to volunteer_management database");
    connection.release();
  }
});

// Run sendEmails every 2 minutes for volunteer notifications
console.log("Starting VolunteerConnect Email Service...");
console.log("Checking for notifications every 2 minutes");

// Send emails immediately on startup
sendEmails();

// Then check every 2 minutes
setInterval(sendEmails, 120000);

// Create a simple HTTP server to allow accessing the email service
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "running",
      service: "VolunteerConnect Email Service",
      database: "volunteer_management",
      host: "127.0.0.1:3306",
      checkInterval: "120 seconds",
      lastCheck: new Date().toISOString(),
    })
  );
});

server.listen(3001, () => {
  console.log("✓ VolunteerConnect Email service running on port 3001");
  console.log("  Visit http://localhost:3001 to check service status");
});
