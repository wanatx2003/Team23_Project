// Try to load dotenv if available
let dotenvLoaded = false;
try {
  require("dotenv").config();
  dotenvLoaded = true;
} catch (err) {
  console.warn("dotenv package not found. Using default email configuration.");
  console.warn(
    "To enable email with environment variables, run: npm install dotenv"
  );
}

// Try to load nodemailer if available
let nodemailer;
let emailAvailable = false;
try {
  nodemailer = require("nodemailer");
  emailAvailable = true;
} catch (err) {
  console.warn(
    "IMPORTANT: nodemailer package not found. Email functionality is disabled."
  );
  console.warn("To enable email functionality, run: npm install nodemailer");
}

function sendEmail(to, subject, text) {
  // If nodemailer is not available, log the message but don't crash the application
  if (!emailAvailable) {
    console.log("EMAIL NOT SENT (nodemailer missing):");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Text: ${text}`);
    return Promise.resolve({
      response: "Email not sent - nodemailer not installed",
    });
  }

  // Use environment variables if dotenv loaded, otherwise use defaults
  const emailUser = process.env.EMAIL_USER || "databaselibrary7@gmail.com";
  const emailPass = process.env.EMAIL_PASS || "jldyebqoowhipxrf";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailUser,
    to: to,
    subject: subject,
    text: text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info);
      }
    });
  });
}

// Export the function instead of running it directly
module.exports = sendEmail;
