const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get all volunteer profiles with skills for matching
const getAllVolunteerProfiles = (req, res) => {
  const query = `
    SELECT 
      uc.UserID, uc.Email,
      up.FullName, up.City, up.StateCode, up.Zipcode,
      GROUP_CONCAT(DISTINCT us.SkillName) as skills,
      GROUP_CONCAT(DISTINCT upr.PreferenceText) as preferences
    FROM UserCredentials uc
    LEFT JOIN UserProfile up ON uc.UserID = up.UserID
    LEFT JOIN UserSkill us ON uc.UserID = us.UserID
    LEFT JOIN UserPreference upr ON uc.UserID = upr.UserID
    WHERE uc.Role = 'volunteer' AND uc.AccountStatus = 'Active'
    GROUP BY uc.UserID
    ORDER BY up.FullName
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
        
        // Create notification for volunteer
        const notificationQuery = `
          INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
          SELECT ?, 'Event Request Submitted', CONCAT('Your request to volunteer for "', ed.EventName, '" has been submitted. Please wait for admin confirmation.'), 'assignment'
          FROM EventDetails ed WHERE ed.EventID = ?
        `;
        
        pool.query(notificationQuery, [VolunteerID, EventID], (notifErr) => {
          if (notifErr) {
            console.error("Error creating notification:", notifErr);
          }
        });
        
        // Update event volunteer count based on actual matches
        const updateQuery = `
          UPDATE EventDetails 
          SET CurrentVolunteers = (
            SELECT COUNT(DISTINCT vm.VolunteerID) 
            FROM VolunteerMatches vm 
            WHERE vm.EventID = ? AND vm.MatchStatus IN ('pending', 'confirmed')
          )
          WHERE EventID = ?
        `;
        
        pool.query(updateQuery, [EventID, EventID], (updateErr) => {
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
    
    // Get volunteer and event info before updating
    const getInfoQuery = `
      SELECT vm.VolunteerID, vm.EventID, ed.EventName, vm.MatchStatus as OldStatus
      FROM VolunteerMatches vm
      JOIN EventDetails ed ON vm.EventID = ed.EventID
      WHERE vm.MatchID = ?
    `;
    
    pool.query(getInfoQuery, [matchId], (infoErr, infoResult) => {
      if (infoErr || infoResult.length === 0) {
        console.error("Error getting match info:", infoErr);
        sendJsonResponse(res, 404, { success: false, error: "Match not found" });
        return;
      }
      
      const matchInfo = infoResult[0];
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
        
        // Create notification based on status change
        let subject, message, notifType;
        
        if (MatchStatus === 'confirmed' && matchInfo.OldStatus === 'pending') {
          subject = 'Event Request Confirmed';
          message = `Your request to volunteer for "${matchInfo.EventName}" has been confirmed by an admin. Check your assignments for details.`;
          notifType = 'assignment';
        } else if (MatchStatus === 'declined') {
          subject = 'Event Request Declined';
          message = `Your request to volunteer for "${matchInfo.EventName}" was not approved. Please check other available events.`;
          notifType = 'update';
        } else if (MatchStatus === 'completed') {
          subject = 'Event Completed';
          message = `Thank you for volunteering at "${matchInfo.EventName}". Your participation has been recorded.`;
          notifType = 'update';
        }
        
        if (subject) {
          const notificationQuery = `
            INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
            VALUES (?, ?, ?, ?)
          `;
          
          pool.query(notificationQuery, [matchInfo.VolunteerID, subject, message, notifType], (notifErr) => {
            if (notifErr) {
              console.error("Error creating notification:", notifErr);
            }
          });
        }
        
        sendJsonResponse(res, 200, { success: true, message: "Match status updated successfully" });
      });
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
      (SELECT COUNT(DISTINCT vm.EventID) 
       FROM VolunteerMatches vm 
       JOIN EventDetails ed ON vm.EventID = ed.EventID 
       WHERE vm.VolunteerID = ? AND vm.MatchStatus IN ('pending', 'confirmed') 
       AND ed.EventDate >= CURDATE()) as upcomingEvents,
      (SELECT COUNT(DISTINCT vh.EventID) 
       FROM VolunteerHistory vh 
       WHERE vh.VolunteerID = ? AND vh.ParticipationStatus = 'attended') as completedEvents,
      (SELECT COALESCE(SUM(vh.HoursVolunteered), 0) 
       FROM VolunteerHistory vh 
       WHERE vh.VolunteerID = ? AND vh.ParticipationStatus = 'attended') as totalHours,
      (SELECT COUNT(*) 
       FROM Notifications 
       WHERE UserID = ? AND IsRead = 0) as unreadNotifications
  `;
  
  pool.query(statsQuery, [userId, userId, userId, userId], (err, results) => {
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
      ed.StartTime, ed.EndTime, ed.Urgency, vm.MatchStatus
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

// Get all assignments for volunteer (pending, confirmed, declined, completed)
const getMyAssignments = (req, res, userId) => {
  const query = `
    SELECT 
      vm.MatchID, vm.MatchStatus, vm.RequestedAt,
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate, 
      ed.StartTime, ed.EndTime, ed.Urgency, ed.MaxVolunteers, ed.CurrentVolunteers,
      GROUP_CONCAT(DISTINCT ers.SkillName) as RequiredSkills,
      vh.HoursVolunteered, vh.ParticipationStatus
    FROM VolunteerMatches vm
    JOIN EventDetails ed ON vm.EventID = ed.EventID
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    LEFT JOIN VolunteerHistory vh ON vm.EventID = vh.EventID AND vm.VolunteerID = vh.VolunteerID
    WHERE vm.VolunteerID = ?
    GROUP BY vm.MatchID, ed.EventID, vh.HoursVolunteered, vh.ParticipationStatus
    ORDER BY 
      CASE 
        WHEN vm.MatchStatus = 'pending' THEN 1
        WHEN vm.MatchStatus = 'confirmed' AND ed.EventDate >= CURDATE() THEN 2
        WHEN vm.MatchStatus = 'confirmed' AND ed.EventDate < CURDATE() THEN 3
        WHEN vm.MatchStatus = 'completed' THEN 4
        ELSE 5
      END,
      ed.EventDate ASC
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching volunteer assignments:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    const assignments = results.map(assignment => ({
      ...assignment,
      RequiredSkills: assignment.RequiredSkills ? assignment.RequiredSkills.split(',') : []
    }));
    
    sendJsonResponse(res, 200, { success: true, assignments });
  });
};

// Get matched events for volunteer
const getMatchedEvents = (req, res, userId) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate, 
      ed.StartTime, ed.EndTime, ed.Urgency, vm.MatchStatus, vm.RequestedAt
    FROM VolunteerMatches vm
    JOIN EventDetails ed ON vm.EventID = ed.EventID
    WHERE vm.VolunteerID = ? AND vm.MatchStatus IN ('pending', 'confirmed') 
    AND ed.EventDate >= CURDATE()
    ORDER BY ed.EventDate ASC
  `;
  
  pool.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching available events:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    sendJsonResponse(res, 200, { success: true, events: results });
  });
};

// Submit attendance after event completion
const submitAttendance = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { MatchID, VolunteerID, EventID, HoursVolunteered, ParticipationDate, Feedback } = data;
    
    // Validate hours
    if (!HoursVolunteered || HoursVolunteered <= 0) {
      sendJsonResponse(res, 400, { success: false, error: "Invalid hours volunteered" });
      return;
    }
    
    // Check if attendance already submitted
    const checkQuery = 'SELECT HistoryID FROM VolunteerHistory WHERE VolunteerID = ? AND EventID = ?';
    pool.query(checkQuery, [VolunteerID, EventID], (checkErr, existing) => {
      if (checkErr) {
        console.error("Error checking existing attendance:", checkErr);
        sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
        return;
      }
      
      if (existing.length > 0) {
        sendJsonResponse(res, 400, { success: false, error: "Attendance already submitted for this event" });
        return;
      }
      
      // Insert into VolunteerHistory
      const historyQuery = `
        INSERT INTO VolunteerHistory 
        (VolunteerID, EventID, ParticipationStatus, HoursVolunteered, ParticipationDate)
        VALUES (?, ?, 'attended', ?, ?)
      `;
      
      pool.query(historyQuery, [VolunteerID, EventID, HoursVolunteered, ParticipationDate], (histErr, histResult) => {
        if (histErr) {
          console.error("Error creating history record:", histErr);
          sendJsonResponse(res, 500, { success: false, error: "Failed to record attendance" });
          return;
        }
        
        // Update match status to 'completed'
        const updateMatchQuery = 'UPDATE VolunteerMatches SET MatchStatus = "completed" WHERE MatchID = ?';
        pool.query(updateMatchQuery, [MatchID], (matchErr) => {
          if (matchErr) {
            console.error("Error updating match status:", matchErr);
          }
          
          // Update CurrentVolunteers count
          const updateCountQuery = `
            UPDATE EventDetails 
            SET CurrentVolunteers = (
              SELECT COUNT(DISTINCT vm.VolunteerID) 
              FROM VolunteerMatches vm 
              WHERE vm.EventID = ? AND vm.MatchStatus IN ('pending', 'confirmed')
            )
            WHERE EventID = ?
          `;
          
          pool.query(updateCountQuery, [EventID, EventID], (countErr) => {
            if (countErr) {
              console.error("Error updating volunteer count:", countErr);
            }
            
            // Send success response immediately
            sendJsonResponse(res, 200, { 
              success: true, 
              message: "Attendance recorded successfully",
              historyID: histResult.insertId
            });
            
            // Create notification for admin (non-blocking, run after response)
            const notifQuery = `
              INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
              SELECT CreatedBy, 
                'Volunteer Attendance Submitted', 
                CONCAT('A volunteer has submitted attendance for ', ed.EventName, ' with ', ?, ' hours.'),
                'attendance'
              FROM EventDetails ed WHERE ed.EventID = ?
            `;
            
            pool.query(notifQuery, [HoursVolunteered, EventID], (notifErr) => {
              if (notifErr) {
                console.error("Error creating notification:", notifErr);
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in submitAttendance:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Get available events with skill matching for specific volunteer
const getAvailableEventsWithMatching = (req, res, userId) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.Urgency,
      ed.EventDate, ed.StartTime, ed.EndTime, ed.MaxVolunteers, ed.CurrentVolunteers,
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
  getAvailableEventsWithMatching,
  getMyAssignments,
  submitAttendance
};
