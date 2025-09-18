require("dotenv").config(); // Load environment variables
const { Client } = require("pg"); // For PostgreSQL, use `mysql2` for MySQL
const nodemailer = require("nodemailer");

// Set up the email-sending function
function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

// Function to update Hold Status and send an email
async function updateHoldStatusAndNotify(userID, holdID) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // Your database connection string
  });

  try {
    await client.connect();

    // Update Hold Status in the database
    const updateQuery = `UPDATE holds SET HoldStatus = 'Active' WHERE HoldID = $1`;
    await client.query(updateQuery, [holdID]);

    // Fetch user's email after the status update
    const res = await client.query(
      "SELECT Email FROM users WHERE UserID = $1",
      [userID]
    );

    if (res.rows.length > 0) {
      const userEmail = res.rows[0].Email;

      // Send the email notification
      sendEmail(userEmail, "Hold Active", "Your hold is now active.");
    }
  } catch (err) {
    console.error("Error updating the hold:", err);
  } finally {
    await client.end();
  }
}

module.exports = { updateHoldStatusAndNotify };
//end
