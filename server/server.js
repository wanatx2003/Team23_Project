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
  } 
  
  // Auth routes
  else if (requestUrl === '/api/auth/login' && method === 'POST') {
    const authRoutes = require('./routes/authRoutes');
    authRoutes.login(req, res);
  } else if (requestUrl === '/api/auth/register' && method === 'POST') {
    const authRoutes = require('./routes/authRoutes');
    authRoutes.register(req, res);
  }
  
  // Event routes
  else if (requestUrl === '/api/events' && method === 'GET') {
    eventRoutes.getAllEvents(req, res);
  } else if (requestUrl === '/api/events/available' && method === 'GET') {
    eventRoutes.getAvailableEvents(req, res);
  } else if (requestUrl === '/api/events' && method === 'POST') {
    eventRoutes.createEvent(req, res);
  } else if (requestUrl === '/api/events' && method === 'PUT') {
    eventRoutes.updateEvent(req, res);
  } else if (requestUrl.startsWith('/api/events/') && requestUrl.endsWith('/matches') && method === 'GET') {
    const eventId = requestUrl.split('/')[3];
    eventRoutes.getVolunteerMatches(req, res, eventId);
  } else if (requestUrl.startsWith('/api/events/') && method === 'DELETE') {
    const eventId = requestUrl.split('/')[3];
    eventRoutes.deleteEvent(req, res, eventId);
  } else if (requestUrl.startsWith('/api/events/available-with-matching/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.getAvailableEventsWithMatching(req, res, userId);
  }
  
  // Volunteer routes
  else if (requestUrl === '/api/volunteer/request' && method === 'POST') {
    eventRoutes.createVolunteerRequest(req, res);
  } else if (requestUrl === '/api/volunteer/profiles' && method === 'GET') {
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.getAllVolunteerProfiles(req, res);
  } else if (requestUrl === '/api/volunteer/match' && method === 'POST') {
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.createVolunteerMatch(req, res);
  } else if (requestUrl.startsWith('/api/volunteer/match/') && method === 'PUT') {
    const matchId = requestUrl.split('/')[4];
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.updateMatchStatus(req, res, matchId);
  } else if (requestUrl.startsWith('/api/volunteer/stats/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.getVolunteerStats(req, res, userId);
  } else if (requestUrl.startsWith('/api/volunteer/matched-events/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.getMatchedEvents(req, res, userId);
  } else if (requestUrl.startsWith('/api/events/available-with-matching/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    const volunteerRoutes = require('./routes/volunteerRoutes');
    volunteerRoutes.getAvailableEventsWithMatching(req, res, userId);
  } 
  
  // Notification routes
  else if (requestUrl === '/api/notifications' && method === 'POST') {
    notificationRoutes.createNotificationEndpoint(req, res);
  } else if (requestUrl.startsWith('/api/notifications/unread/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    notificationRoutes.getUnreadCount(req, res, userId);
  } else if (requestUrl.startsWith('/api/notifications/') && method === 'GET') {
    const userId = requestUrl.split('/').pop();
    notificationRoutes.getUserNotifications(req, res, userId);
  }
  
  else {
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
