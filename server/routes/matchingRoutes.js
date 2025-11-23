const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get potential volunteer matches for events
const getVolunteerMatches = (req, res) => {
  const query = `
    SELECT DISTINCT
      uc.UserID, uc.FirstName, uc.LastName, uc.Email,
      up.FullName, up.City, up.StateCode,
      GROUP_CONCAT(DISTINCT us.SkillName ORDER BY us.SkillName) as Skills,
      ed.EventID, ed.EventName, ed.EventDate, ed.StartTime, ed.EndTime, ed.Urgency, ed.Location, ed.Description,
      ed.MaxVolunteers, ed.CurrentVolunteers,
      GROUP_CONCAT(DISTINCT ers.SkillName ORDER BY ers.SkillName) as RequiredSkills,
      vm.MatchStatus,
      vm.MatchID,
      vm.RequestedAt
    FROM VolunteerMatches vm
    INNER JOIN UserCredentials uc ON vm.VolunteerID = uc.UserID
    INNER JOIN EventDetails ed ON vm.EventID = ed.EventID
    LEFT JOIN UserProfile up ON uc.UserID = up.UserID
    LEFT JOIN UserSkill us ON uc.UserID = us.UserID
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    WHERE ed.EventStatus = 'published'
      AND ed.EventDate >= CURDATE()
      AND vm.MatchStatus IN ('pending', 'confirmed')
    GROUP BY vm.MatchID, uc.UserID, ed.EventID
    ORDER BY vm.RequestedAt DESC, ed.EventDate, ed.Urgency DESC
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching volunteer matches:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    // Process and enhance the results
    const matches = results.map(match => {
      const volunteerSkills = match.Skills ? match.Skills.split(',') : [];
      const requiredSkills = match.RequiredSkills ? match.RequiredSkills.split(',') : [];
      
      // Calculate skill match percentage
      const matchingSkills = volunteerSkills.filter(skill => 
        requiredSkills.includes(skill)
      );
      
      const skillMatchPercentage = requiredSkills.length > 0 
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 0;
      
      return {
        ...match,
        Skills: volunteerSkills,
        RequiredSkills: requiredSkills,
        MatchingSkills: matchingSkills,
        SkillMatch: matchingSkills.length > 0,
        SkillMatchPercentage: skillMatchPercentage
      };
    });
    
    sendJsonResponse(res, 200, { success: true, matches });
  });
};

// Create volunteer match
const createVolunteerMatch = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { VolunteerID, EventID, AdminID } = data;
    
    // Validate required fields
    if (!VolunteerID || !EventID) {
      console.error("Missing required fields:", { VolunteerID, EventID });
      sendJsonResponse(res, 400, { success: false, error: "VolunteerID and EventID are required" });
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
        sendJsonResponse(res, 400, { success: false, error: "Volunteer is already matched to this event" });
        return;
      }
      
      const query = 'INSERT INTO VolunteerMatches (VolunteerID, EventID, MatchStatus) VALUES (?, ?, "pending")';
      
      pool.query(query, [VolunteerID, EventID], (err, result) => {
        if (err) {
          console.error("Error creating volunteer match:", err);
          console.error("Error details:", err.message);
          sendJsonResponse(res, 500, { success: false, error: "Failed to create match: " + err.message });
          return;
        }
        
        // Create notification for volunteer
        const notificationQuery = `
          INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
          VALUES (?, 'New Event Assignment', 'You have been assigned to a new volunteer event. Please check your dashboard for details.', 'assignment')
        `;
        
        pool.query(notificationQuery, [VolunteerID], (notifErr) => {
          if (notifErr) {
            console.error("Error creating notification:", notifErr);
          }
        });
        
        // Update CurrentVolunteers count for the event
        const updateCountQuery = `
          UPDATE EventDetails \n          SET CurrentVolunteers = (
            SELECT COUNT(DISTINCT vm.VolunteerID) 
            FROM VolunteerMatches vm 
            WHERE vm.EventID = ? AND vm.MatchStatus IN ('pending', 'confirmed')
          )
          WHERE EventID = ?
        `;
        
        pool.query(updateCountQuery, [EventID, EventID], (updateErr) => {
          if (updateErr) {
            console.error("Error updating volunteer count:", updateErr);
          }
          sendJsonResponse(res, 200, { success: true, message: "Volunteer matched successfully" });
        });
      });
    });
  } catch (error) {
    console.error('Error in createVolunteerMatch:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Update match status
const updateMatchStatus = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { MatchID, MatchStatus } = data;
    
    const query = 'UPDATE VolunteerMatches SET MatchStatus = ? WHERE MatchID = ?';
    
    pool.query(query, [MatchStatus, MatchID], (err, result) => {
      if (err) {
        console.error("Error updating match status:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to update match status" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: "Match status updated successfully" });
    });
  } catch (error) {
    console.error('Error in updateMatchStatus:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getVolunteerMatches,
  createVolunteerMatch,
  updateMatchStatus
};
