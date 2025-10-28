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

        for (const notification of results) {
          const mailOptions = {
            from: "Volunteer Management System <databaselibrary7@gmail.com>",
            to: notification.Email,
            subject: notification.Subject,
            text: notification.Message,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Volunteer Management System</h2>
                <h3>${notification.Subject}</h3>
                <p>${notification.Message.replace(/\n/g, "<br>")}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                  This is an automated message from the Volunteer Management System.
                </p>
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
                    "Email sent to:",
                    notification.Email,
                    "for notification:",
                    notification.Subject
                  );
                }
              }
            );
          } catch (error) {
            console.error(
              "Error sending email to",
              notification.Email,
              ":",
              error
            );
          }
        }
      }
    );
  } catch (error) {
    console.error("Error in sendEmails:", error);
  }
};

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Email service: Error connecting to MySQL database:", err);
  } else {
    console.log("Email service: Connected to volunteer_management database");
    connection.release();
  }
});

// Run sendEmails every 2 minutes for volunteer notifications
setInterval(sendEmails, 120000); // Check for new emails every 2 minutes

// Create a simple HTTP server to allow accessing the email service
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "running",
      service: "Volunteer Management Email Service",
      database: "volunteer_management",
      host: "127.0.0.1:3306",
    })
  );
});

server.listen(3001, () => {
  console.log("Volunteer Management Email service running on port 3001");
});
