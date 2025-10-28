const http = require("http");
const url = require("url");
const handleRequest = require("./routes/index");
const { sendJsonResponse } = require("./utils/requestUtils");

// Import the sendEmail function
const sendEmail = require("../sendEmail");

const server = http.createServer(async (req, res) => {
  // Parse the incoming URL for routing
  const parsedUrl = url.parse(req.url, true);
  const { method, url: reqUrl } = req;
  console.log(`${method} ${reqUrl}`);

  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Process the request with our main handler
  await handleRequest(req, res);
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Volunteer Management Server started on port ${PORT}`);
  console.log(`Database: volunteer_management on 127.0.0.1:3306`);
  console.log(`Frontend should run on http://localhost:3000`);
  console.log(`Email service should run separately on port 3001`);
});
