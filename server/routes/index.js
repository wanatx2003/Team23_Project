const url = require('url');
const { sendJsonResponse } = require('../utils/requestUtils');

// Import volunteer management route handlers
const { login, register, getAllUsers } = require('./authRoutes');
const { getUserProfile, updateUserProfile, getStates, getAvailableSkills, getAllUsers: getAllUsersDetailed, updateUserStatus } = require('./userRoutes');
const { getAllEvents, createEvent, updateEvent, deleteEvent, updateEventStatus } = require('./eventRoutes');
const { getVolunteerMatches, createVolunteerMatch, updateMatchStatus, getSmartMatchesForEvent, autoMatchVolunteers } = require('./matchingRoutes');
const { getUserNotifications, markNotificationRead, getUnreadCount, sendEventReminders } = require('./notificationRoutes');
const { getVolunteerHistory, getAllVolunteerHistory, addVolunteerHistory, updateVolunteerHistory } = require('./historyRoutes');
const { getVolunteerParticipationReport, getEventSummaryReport, getVolunteerSummaryReport } = require('./volunteerReportRoutes');

const handleRequest = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const { method } = req;

  // Authentication routes
  if (pathname === '/api/login' && method === 'POST') {
    return login(req, res);
  }
  
  if (pathname === '/api/register' && method === 'POST') {
    return register(req, res);
  }

  if (pathname === '/api/users' && method === 'GET') {
    return getAllUsers(req, res);
  }

  // Profile management routes
  if (pathname.startsWith('/api/profile/') && method === 'GET') {
    const userId = pathname.split('/')[3];
    return getUserProfile(req, res, userId);
  }

  if (pathname === '/api/profile' && method === 'PUT') {
    return updateUserProfile(req, res);
  }

  // States and skills routes
  if (pathname === '/api/states' && method === 'GET') {
    return getStates(req, res);
  }

  if (pathname === '/api/skills' && method === 'GET') {
    return getAvailableSkills(req, res);
  }

  // Admin: User management routes
  if (pathname === '/api/admin/users' && method === 'GET') {
    return getAllUsersDetailed(req, res);
  }

  if (pathname === '/api/admin/users/status' && method === 'PUT') {
    return updateUserStatus(req, res);
  }

  // Event management routes
  if (pathname === '/api/events' && method === 'GET') {
    return getAllEvents(req, res);
  }

  if (pathname === '/api/events' && method === 'POST') {
    return createEvent(req, res);
  }

  if (pathname.match(/^\/api\/events\/\d+\/status$/) && method === 'PUT') {
    return updateEventStatus(req, res);
  }

  if (pathname.startsWith('/api/events/') && method === 'PUT') {
    const eventId = pathname.split('/')[3];
    return updateEvent(req, res, eventId);
  }

  if (pathname.startsWith('/api/events/') && method === 'DELETE') {
    const eventId = pathname.split('/')[3];
    return deleteEvent(req, res, eventId);
  }

  // Volunteer matching routes
  if (pathname === '/api/volunteer-matches' && method === 'GET') {
    return getVolunteerMatches(req, res);
  }

  if (pathname === '/api/volunteer-matches' && method === 'POST') {
    return createVolunteerMatch(req, res);
  }

  if (pathname === '/api/volunteer-matches/status' && method === 'PUT') {
    return updateMatchStatus(req, res);
  }

  // Smart matching routes
  if (pathname.match(/^\/api\/smart-matches\/\d+$/) && method === 'GET') {
    return getSmartMatchesForEvent(req, res);
  }

  if (pathname === '/api/auto-match' && method === 'POST') {
    return autoMatchVolunteers(req, res);
  }

  // Notification routes
  if (pathname.startsWith('/api/notifications/') && pathname.split('/')[3] && method === 'GET') {
    const userId = pathname.split('/')[3];
    return getUserNotifications(req, res, userId);
  }

  if (pathname.startsWith('/api/notifications/unread/') && method === 'GET') {
    const userId = pathname.split('/')[4];
    return getUnreadCount(req, res, userId);
  }

  if (pathname === '/api/notifications/read' && method === 'POST') {
    return markNotificationRead(req, res);
  }

  if (pathname === '/api/notifications/reminders' && method === 'POST') {
    return sendEventReminders(req, res);
  }

  // Volunteer history routes
  if (pathname.startsWith('/api/volunteer-history/') && method === 'GET') {
    const pathParts = pathname.split('/');
    if (pathParts[3] === 'all') {
      return getAllVolunteerHistory(req, res);
    } else {
      const userId = pathParts[3];
      return getVolunteerHistory(req, res, userId);
    }
  }

  if (pathname === '/api/volunteer-history' && method === 'POST') {
    return addVolunteerHistory(req, res);
  }

  if (pathname === '/api/volunteer-history' && method === 'PUT') {
    return updateVolunteerHistory(req, res);
  }

  // Reporting routes
  if (pathname === '/api/reports/volunteer-participation' && method === 'GET') {
    return getVolunteerParticipationReport(req, res);
  }

  if (pathname === '/api/reports/event-summary' && method === 'GET') {
    return getEventSummaryReport(req, res);
  }

  if (pathname === '/api/reports/volunteer-summary' && method === 'GET') {
    return getVolunteerSummaryReport(req, res);
  }

  // Health check route
  if (pathname === '/api/health' && method === 'GET') {
    return sendJsonResponse(res, 200, { 
      status: 'healthy', 
      service: 'VolunteerConnect API',
      timestamp: new Date().toISOString()
    });
  }

  // Route not found
  sendJsonResponse(res, 404, { 
    success: false, 
    error: 'Route not found',
    availableRoutes: [
      'POST /api/login',
      'POST /api/register',
      'GET /api/users',
      'GET /api/profile/:userId',
      'PUT /api/profile',
      'GET /api/states',
      'GET /api/skills',
      'GET /api/events',
      'POST /api/events',
      'PUT /api/events/:eventId',
      'DELETE /api/events/:eventId',
      'GET /api/volunteer-matches',
      'POST /api/volunteer-matches',
      'PUT /api/volunteer-matches/status',
      'GET /api/notifications/:userId',
      'GET /api/notifications/unread/:userId',
      'POST /api/notifications/read',
      'GET /api/volunteer-history/:userId',
      'GET /api/volunteer-history/all',
      'POST /api/volunteer-history',
      'PUT /api/volunteer-history'
    ]
  });
};

module.exports = handleRequest;
