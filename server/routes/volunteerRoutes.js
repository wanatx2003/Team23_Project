const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get all volunteer profiles with skills for matching
const getAllVolunteerProfiles = (req, res) => {
  const query = `
    SELECT 
      uc.UserID, uc.FirstName, uc.LastName, uc.Email,
      up.FullName, up.City, up.StateCode, up.Zipcode,
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
    
    // Get availability for each volunteer
    const availabilityQuery = 'SELECT UserID, DayOfWeek, StartTime, EndTime FROM UserAvailability';
    pool.query(availabilityQuery, (availErr, availResults) => {
      if (availErr) {
        console.error("Error fetching availability:", availErr);
      }
      
      // Group availability by UserID
      const availabilityMap = {};
      if (availResults) {
        availResults.forEach(avail => {
          if (!availabilityMap[avail.UserID]) {
            availabilityMap[avail.UserID] = [];
          }
          availabilityMap[avail.UserID].push({
            DayOfWeek: avail.DayOfWeek,
            StartTime: avail.StartTime,
            EndTime: avail.EndTime
          });
        });
      }
      
      // Parse skills and preferences into arrays and add availability
      const volunteers = results.map(volunteer => ({
        ...volunteer,
        skills: volunteer.skills ? volunteer.skills.split(',') : [],
        preferences: volunteer.preferences ? volunteer.preferences.split(',') : [],
        availability: availabilityMap[volunteer.UserID] || []
      }));
      
      sendJsonResponse(res, 200, { success: true, volunteers });
    });
  });
};

// Create volunteer match (for admin matching volunteers to events)
const createVolunteerMatch = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { VolunteerID, EventID } = data;
    
    if (!VolunteerID || !EventID) {
      sendJsonResponse(res, 400, { success: false, error: 'VolunteerID and EventID are required' });
      return;
    }
    
    // Check if match already exists
    const checkQuery = 'SELECT MatchID FROM VolunteerMatches WHERE VolunteerID = ? AND EventID = ?';
    pool.query(checkQuery, [VolunteerID, EventID], (err, existing) => {
      if (err) {
        console.error("Error checking existing match:", err);
        sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
        return;
      }
      
      if (existing.length > 0) {
        sendJsonResponse(res, 400, { success: false, error: 'Volunteer is already matched to this event' });
        return;
      }
      
      // Create the match
      const insertQuery = 'INSERT INTO VolunteerMatches (VolunteerID, EventID, MatchStatus) VALUES (?, ?, "pending")';
      pool.query(insertQuery, [VolunteerID, EventID], (insertErr, result) => {
        if (insertErr) {
          console.error("Error creating match:", insertErr);
          sendJsonResponse(res, 500, { success: false, error: "Failed to create match" });
          return;
        }
        
        // Update event volunteer count
        const updateQuery = 'UPDATE EventDetails SET CurrentVolunteers = CurrentVolunteers + 1 WHERE EventID = ?';
        pool.query(updateQuery, [EventID], (updateErr) => {
          if (updateErr) {
            console.error("Error updating volunteer count:", updateErr);
          }
          
          sendJsonResponse(res, 200, { 
            success: true, 
            matchID: result.insertId,
            message: 'Volunteer matched successfully' 
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in createVolunteerMatch:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
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

// Get matched events for volunteer
const getMatchedEvents = (req, res, userId) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate, 
      ed.EventTime, ed.Urgency, vm.MatchStatus, vm.RequestedAt
    FROM VolunteerMatches vm
    JOIN EventDetails ed ON vm.EventID = ed.EventID
    WHERE vm.VolunteerID = ? AND vm.MatchStatus IN ('pending', 'confirmed') 
    AND ed.EventDate >= CURDATE()
    ORDER BY ed.EventDate ASC
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching matched events:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    sendJsonResponse(res, 200, { success: true, events: results });
  });
};

// Get available events with skill matching for specific volunteer
const getAvailableEventsWithMatching = (req, res, userId) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.Urgency,
      ed.EventDate, ed.EventTime, ed.MaxVolunteers, ed.CurrentVolunteers,
      GROUP_CONCAT(ers.SkillName) as RequiredSkills,
      (SELECT COUNT(*) FROM VolunteerMatches vm WHERE vm.EventID = ed.EventID AND vm.VolunteerID = ?) as AlreadyRequested
    FROM EventDetails ed
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    WHERE ed.EventStatus = 'published' 
    AND ed.EventDate >= CURDATE()
    AND ed.EventID NOT IN (
      SELECT vm2.EventID FROM VolunteerMatches vm2 WHERE vm2.VolunteerID = ?
    )
    GROUP BY ed.EventID
    ORDER BY ed.EventDate ASC, ed.Urgency DESC
    LIMIT 10
  `;
  
  pool.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching available events with matching:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    // Parse required skills into arrays
    const events = results.map(event => ({
      ...event,
      RequiredSkills: event.RequiredSkills ? event.RequiredSkills.split(',') : []
    }));
    
    sendJsonResponse(res, 200, { success: true, events });
  });
};

module.exports = {
  getAllVolunteerProfiles,
  createVolunteerMatch,
  updateMatchStatus,
  getVolunteerStats,
  getRecentEvents,
  getUpcomingEvents,
  getMatchedEvents,
  getAvailableEventsWithMatching
};
