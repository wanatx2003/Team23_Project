const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get all volunteer profiles with skills for matching
const getAllVolunteerProfiles = (req, res) => {
  const query = `
    SELECT 
      uc.UserID, uc.FirstName, uc.LastName, uc.Email,
      up.FullName, up.City, up.StateCode,
      GROUP_CONCAT(DISTINCT us.SkillName) as skills,
      GROUP_CONCAT(DISTINCT upr.PreferenceText) as preferences
    FROM UserCredentials uc
    LEFT JOIN UserProfile up ON uc.UserID = up.UserID
    LEFT JOIN UserSkill us ON uc.UserID = us.UserID
    LEFT JOIN UserPreference upr ON uc.UserID = upr.UserID
    WHERE uc.Role = 'volunteer' AND uc.AccountStatus = 'Active'
    GROUP BY uc.UserID
    ORDER BY uc.FirstName, uc.LastName
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching volunteer profiles:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    // Parse skills and preferences into arrays
    const volunteers = results.map(volunteer => ({
      ...volunteer,
      skills: volunteer.skills ? volunteer.skills.split(',') : [],
      preferences: volunteer.preferences ? volunteer.preferences.split(',') : []
    }));
    
    sendJsonResponse(res, 200, { success: true, volunteers });
  });
};

// Update volunteer match status
const updateMatchStatus = async (req, res, matchId) => {
  try {
    const data = await parseRequestBody(req);
    const { MatchStatus } = data;
    
    const query = 'UPDATE VolunteerMatches SET MatchStatus = ? WHERE MatchID = ?';
    
    pool.query(query, [MatchStatus, matchId], (err, result) => {
      if (err) {
        console.error("Error updating match status:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to update match status" });
        return;
      }
      
      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: "Match not found" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: "Match status updated successfully" });
    });
  } catch (error) {
    console.error('Error in updateMatchStatus:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Get volunteer statistics for dashboard
const getVolunteerStats = (req, res, userId) => {
  const statsQuery = `
    SELECT 
      COUNT(CASE WHEN vm.MatchStatus = 'confirmed' AND ed.EventDate >= CURDATE() THEN 1 END) as upcomingEvents,
      COUNT(CASE WHEN vh.ParticipationStatus = 'attended' THEN 1 END) as completedEvents,
      COALESCE(SUM(CASE WHEN vh.ParticipationStatus = 'attended' THEN vh.HoursVolunteered END), 0) as totalHours,
      (SELECT COUNT(*) FROM Notifications WHERE UserID = ? AND IsRead = 0) as unreadNotifications
    FROM VolunteerMatches vm
    LEFT JOIN EventDetails ed ON vm.EventID = ed.EventID
    LEFT JOIN VolunteerHistory vh ON vm.VolunteerID = vh.VolunteerID
    WHERE vm.VolunteerID = ?
  `;
  
  pool.query(statsQuery, [userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching volunteer stats:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    const stats = results[0] || {
      upcomingEvents: 0,
      completedEvents: 0,
      totalHours: 0,
      unreadNotifications: 0
    };
    
    sendJsonResponse(res, 200, { success: true, stats });
  });
};

// Get recent events for volunteer
const getRecentEvents = (req, res, userId) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate,
      vh.ParticipationStatus, vh.HoursVolunteered
    FROM VolunteerHistory vh
    JOIN EventDetails ed ON vh.EventID = ed.EventID
    WHERE vh.VolunteerID = ?
    ORDER BY ed.EventDate DESC
    LIMIT 5
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching recent events:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    sendJsonResponse(res, 200, { success: true, events: results });
  });
};

// Get upcoming events for volunteer
const getUpcomingEvents = (req, res, userId) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate, 
      ed.EventTime, ed.Urgency, vm.MatchStatus
    FROM VolunteerMatches vm
    JOIN EventDetails ed ON vm.EventID = ed.EventID
    WHERE vm.VolunteerID = ? AND vm.MatchStatus = 'confirmed' AND ed.EventDate >= CURDATE()
    ORDER BY ed.EventDate ASC
    LIMIT 5
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching upcoming events:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    sendJsonResponse(res, 200, { success: true, events: results });
  });
};

module.exports = {
  getAllVolunteerProfiles,
  updateMatchStatus,
  getVolunteerStats,
  getRecentEvents,
  getUpcomingEvents
};
