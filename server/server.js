const http = require("http");
const url = require("url");
const handleRequest = require("./routes/index");
const { sendJsonResponse } = require("./utils/requestUtils");

// Import route modules
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const method = req.method;
  const requestUrl = req.url || '';  // Ensure url is always a string
  
  console.log(`${method} ${requestUrl}`);

  // User routes
  if (requestUrl.startsWith('/api/user/profile/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    userRoutes.getUserProfile(req, res, userId);
  } else if (requestUrl === '/api/user/profile' && method === 'PUT') {
    userRoutes.updateUserProfile(req, res);
  } else if (requestUrl === '/api/user/states' && method === 'GET') {
    userRoutes.getStates(req, res);
  } else if (requestUrl === '/api/user/skills' && method === 'GET') {
    userRoutes.getAvailableSkills(req, res);
  } else {
    // Process the request with our main handler
    handleRequest(req, res);
  }
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Volunteer Management Server started on port ${PORT}`);
  console.log(`Database: volunteer_management on 127.0.0.1:3306`);
  console.log(`Frontend should run on http://localhost:3000`);
  console.log(`Email service should run separately on port 3001`);
});
