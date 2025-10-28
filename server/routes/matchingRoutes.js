const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get potential volunteer matches for events
const getVolunteerMatches = (req, res) => {
  const query = `
    SELECT DISTINCT
      uc.UserID, uc.FirstName, uc.LastName, uc.Email,
      up.FullName, up.City, up.StateCode,
      GROUP_CONCAT(DISTINCT us.SkillName) as Skills,
      ed.EventID, ed.EventName, ed.EventDate, ed.Urgency,
      GROUP_CONCAT(DISTINCT ers.SkillName) as RequiredSkills,
      CASE 
        WHEN vm.MatchID IS NOT NULL THEN vm.MatchStatus
        ELSE 'unmatched'
      END as MatchStatus
    FROM UserCredentials uc
    LEFT JOIN UserProfile up ON uc.UserID = up.UserID
    LEFT JOIN UserSkill us ON uc.UserID = us.UserID
    CROSS JOIN EventDetails ed
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    LEFT JOIN VolunteerMatches vm ON uc.UserID = vm.VolunteerID AND ed.EventID = vm.EventID
    WHERE uc.Role = 'volunteer' 
      AND ed.EventStatus = 'published'
      AND ed.EventDate >= CURDATE()
    GROUP BY uc.UserID, ed.EventID
    HAVING (
      FIND_IN_SET(ers.SkillName, Skills) > 0
      OR Skills IS NULL
      OR RequiredSkills IS NULL
    )
    ORDER BY ed.EventDate, ed.Urgency DESC, uc.LastName
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching volunteer matches:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    // Group by events and volunteers
    const matches = results.map(match => ({
      ...match,
      Skills: match.Skills ? match.Skills.split(',') : [],
      RequiredSkills: match.RequiredSkills ? match.RequiredSkills.split(',') : [],
      SkillMatch: match.Skills && match.RequiredSkills ? 
        match.RequiredSkills.split(',').some(reqSkill => 
          match.Skills.split(',').includes(reqSkill)
        ) : false
    }));
    
    sendJsonResponse(res, 200, { success: true, matches });
  });
};

// Create volunteer match
const createVolunteerMatch = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { VolunteerID, EventID, AdminID } = data;
    
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
          sendJsonResponse(res, 500, { success: false, error: "Failed to create match" });
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
        
        sendJsonResponse(res, 200, { success: true, message: "Volunteer matched successfully" });
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
