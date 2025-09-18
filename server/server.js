const http = require("http");
const url = require("url");
const { releaseExpiredReservations } = require("./routes/roomRoutes");
const handleRequest = require("./routes/index");
const { updateFinePayment } = require("./routes/fineRoutes");
const { sendJsonResponse } = require("./utils/requestUtils");

// Import the sendEmail function
const sendEmail = require("../sendEmail");

// Import the email notification service
const { startEmailNotificationService } = require("./emailNotificationService");

const server = http.createServer(async (req, res) => {
  // Parse the incoming URL for routing
  const parsedUrl = url.parse(req.url, true);
  const { method, url: reqUrl } = req;
  console.log(`${method} ${reqUrl}`);

  if (req.method === "POST" && parsedUrl.pathname === "/api/payFine") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        req.body = JSON.parse(body);
      } catch (error) {
        return sendJsonResponse(res, 400, { success: false, error: "Invalid JSON" });
      }
      // Call updateFinePayment from fineRoutes.js
      updateFinePayment(req, res);
    });
    return;
  }
  
  // No need to duplicate routes here - let routes/index.js handle everything
  // Process the request with our main handler
  await handleRequest(req, res);
});

// Schedule the task to run every minute
setInterval(() => {
  releaseExpiredReservations();
}, 60 * 1000); // Run every 60 seconds

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  
  // Start the email notification service when the server starts
  const emailService = startEmailNotificationService();
  
  // Set up graceful shutdown to stop the email service
  process.on("SIGINT", () => {
    console.log("Shutting down server...");
    emailService.stop();
    process.exit();
  });
});
