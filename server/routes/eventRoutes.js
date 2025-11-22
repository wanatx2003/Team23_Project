const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get all events with filtering
const getAllEvents = (req, res) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.Urgency,
      ed.EventDate, ed.StartTime, ed.EndTime, ed.MaxVolunteers, ed.CurrentVolunteers,
      ed.EventStatus, ed.CreatedAt,
      uc.FirstName as CreatedByName,
      GROUP_CONCAT(ers.SkillName) as RequiredSkills
    FROM EventDetails ed
    LEFT JOIN UserCredentials uc ON ed.CreatedBy = uc.UserID
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    GROUP BY ed.EventID
    ORDER BY ed.EventDate DESC
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
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

// Create new event with validation
const createEvent = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { EventName, Description, Location, RequiredSkills, Urgency, EventDate, StartTime, EndTime, CreatedBy, MaxVolunteers } = data;
    
    // Validation
    if (!EventName || EventName.length > 100) {
      sendJsonResponse(res, 400, { success: false, error: "Event name is required and must be 100 characters or less" });
      return;
    }
    if (!Description) {
      sendJsonResponse(res, 400, { success: false, error: "Event description is required" });
      return;
    }
    if (!Location) {
      sendJsonResponse(res, 400, { success: false, error: "Location is required" });
      return;
    }
    if (!RequiredSkills || RequiredSkills.length === 0) {
      sendJsonResponse(res, 400, { success: false, error: "At least one required skill must be selected" });
      return;
    }
    if (!['low', 'medium', 'high', 'critical'].includes(Urgency)) {
      sendJsonResponse(res, 400, { success: false, error: "Valid urgency level is required" });
      return;
    }
    if (!EventDate) {
      sendJsonResponse(res, 400, { success: false, error: "Event date is required" });
      return;
    }
    
    // Convert empty strings to null for optional fields
    const startTime = StartTime || null;
    const endTime = EndTime || null;
    const maxVol = MaxVolunteers || null;
    
    const query = `
      INSERT INTO EventDetails (EventName, Description, Location, Urgency, EventDate, StartTime, EndTime, CreatedBy, MaxVolunteers, EventStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `;
    
    pool.query(query, [EventName, Description, Location, Urgency, EventDate, startTime, endTime, CreatedBy, maxVol], (err, result) => {
      if (err) {
        console.error("Error creating event:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to create event" });
        return;
      }

      const eventID = result.insertId;
      
      // Insert required skills
      const skillPromises = RequiredSkills.map(skill => {
        return new Promise((resolve, reject) => {
          pool.query('INSERT INTO EventRequiredSkill (EventID, SkillName) VALUES (?, ?)', [eventID, skill], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
      
      Promise.all(skillPromises)
        .then(() => {
          sendJsonResponse(res, 200, { success: true, eventID, message: "Event created successfully" });
        })
        .catch(err => {
          console.error("Error adding required skills:", err);
          sendJsonResponse(res, 500, { success: false, error: "Event created but failed to add required skills" });
        });
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { EventID, EventName, Description, Location, RequiredSkills, Urgency, EventDate, StartTime, EndTime, MaxVolunteers } = data;
    
    console.log('Updating event:', EventID);
    console.log('StartTime:', StartTime, 'EndTime:', EndTime);
    
    // Convert empty strings to null for time fields
    const startTime = StartTime || null;
    const endTime = EndTime || null;
    const maxVol = MaxVolunteers || null;
    
    const query = `
      UPDATE EventDetails 
      SET EventName = ?, Description = ?, Location = ?, Urgency = ?, EventDate = ?, StartTime = ?, EndTime = ?, MaxVolunteers = ?
      WHERE EventID = ?
    `;
    
    pool.query(query, [EventName, Description, Location, Urgency, EventDate, startTime, endTime, maxVol, EventID], (err, result) => {
      if (err) {
        console.error("Error updating event:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to update event" });
        return;
      }
      
      // Update required skills
      pool.query('DELETE FROM EventRequiredSkill WHERE EventID = ?', [EventID], (err) => {
        if (err) {
          console.error("Error deleting existing skills:", err);
          sendJsonResponse(res, 500, { success: false, error: "Failed to update skills" });
          return;
        }
        
        const skillPromises = RequiredSkills.map(skill => {
          return new Promise((resolve) => {
            pool.query('INSERT INTO EventRequiredSkill (EventID, SkillName) VALUES (?, ?)', [EventID, skill], resolve);
          });
        });
        
        Promise.all(skillPromises).then(() => {
          sendJsonResponse(res, 200, { success: true, message: "Event updated successfully" });
        });
      });
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Delete event
const deleteEvent = async (req, res, eventId) => {
  try {
    const query = 'DELETE FROM EventDetails WHERE EventID = ?';
    
    pool.query(query, [eventId], (err, result) => {
      if (err) {
        console.error("Error deleting event:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to delete event" });
        return;
      }
      
      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: "Event not found" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: "Event deleted successfully" });
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Get volunteer matches for an event
const getVolunteerMatches = (req, res, eventId) => {
  const query = `
    SELECT 
      vm.MatchID, vm.MatchStatus, vm.RequestedAt,
      uc.UserID, uc.FirstName, uc.LastName, uc.Email,
      up.FullName, up.City, up.StateCode
    FROM VolunteerMatches vm
    JOIN UserCredentials uc ON vm.VolunteerID = uc.UserID
    LEFT JOIN UserProfile up ON uc.UserID = up.UserID
    WHERE vm.EventID = ?
    ORDER BY vm.RequestedAt DESC
  `;
  
  pool.query(query, [eventId], (err, results) => {
    if (err) {
      console.error("Error fetching volunteer matches:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    sendJsonResponse(res, 200, { success: true, matches: results });
  });
};

// Create volunteer match
const createVolunteerMatch = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { VolunteerID, EventID } = data;
    
    const query = 'INSERT INTO VolunteerMatches (VolunteerID, EventID, MatchStatus) VALUES (?, ?, "pending")';
    
    pool.query(query, [VolunteerID, EventID], (err, result) => {
      if (err) {
        console.error("Error creating volunteer match:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to create match" });
        return;
      }
      
      // Update CurrentVolunteers count
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
        sendJsonResponse(res, 200, { success: true, message: "Volunteer matched successfully" });
      });
    });
  } catch (error) {
    console.error('Error in createVolunteerMatch:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Get available events for volunteers (published events only)
const getAvailableEvents = (req, res) => {
  const query = `
    SELECT 
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.Urgency,
      ed.EventDate, ed.StartTime, ed.EndTime, ed.MaxVolunteers, ed.CurrentVolunteers,
      ed.EventStatus, ed.CreatedAt,
      uc.FirstName as CreatedByName,
      GROUP_CONCAT(ers.SkillName) as RequiredSkills
    FROM EventDetails ed
    LEFT JOIN UserCredentials uc ON ed.CreatedBy = uc.UserID
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    WHERE ed.EventStatus = 'published' AND ed.EventDate >= CURDATE()
    GROUP BY ed.EventID
    ORDER BY ed.EventDate ASC, ed.Urgency DESC
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching available events:", err);
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

// Update event status
const updateEventStatus = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { EventID, EventStatus } = data;
    
    // Validate status
    const validStatuses = ['draft', 'published', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(EventStatus)) {
      sendJsonResponse(res, 400, { success: false, error: "Invalid event status" });
      return;
    }
    
    const query = 'UPDATE EventDetails SET EventStatus = ? WHERE EventID = ?';
    
    pool.query(query, [EventStatus, EventID], (err, result) => {
      if (err) {
        console.error("Error updating event status:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to update event status" });
        return;
      }
      
      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: "Event not found" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: "Event status updated successfully" });
    });
  } catch (error) {
    console.error('Error in updateEventStatus:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Create volunteer request
const createVolunteerRequest = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { VolunteerID, EventID } = data;
    
    // Check if volunteer already requested this event
    pool.query(
      'SELECT MatchID FROM VolunteerMatches WHERE VolunteerID = ? AND EventID = ?',
      [VolunteerID, EventID],
      (err, existing) => {
        if (err) {
          console.error("Error checking existing match:", err);
          sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
          return;
        }
        
        if (existing.length > 0) {
          sendJsonResponse(res, 400, { success: false, error: "You have already requested to volunteer for this event" });
          return;
        }
        
        // Create the volunteer match
        const query = 'INSERT INTO VolunteerMatches (VolunteerID, EventID, MatchStatus) VALUES (?, ?, "pending")';
        
        pool.query(query, [VolunteerID, EventID], (err, result) => {
          if (err) {
            console.error("Error creating volunteer request:", err);
            sendJsonResponse(res, 500, { success: false, error: "Failed to create volunteer request" });
            return;
          }
          
          // Create notification for admin
          const notificationQuery = `
            INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
            SELECT uc.UserID, 'New Volunteer Request', 
            CONCAT('A volunteer has requested to join event: ', ed.EventName), 'assignment'
            FROM UserCredentials uc, EventDetails ed
            WHERE uc.Role = 'admin' AND ed.EventID = ?
          `;
          
          pool.query(notificationQuery, [EventID], (notifErr) => {
            if (notifErr) {
              console.error("Error creating notification:", notifErr);
            }
          });
          
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
          
          pool.query(updateCountQuery, [EventID, EventID], (updateErr) => {
            if (updateErr) {
              console.error("Error updating volunteer count:", updateErr);
            }
            sendJsonResponse(res, 200, { success: true, message: "Volunteer request sent successfully" });
          });
        });
      }
    );
  } catch (error) {
    console.error('Error in createVolunteerRequest:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getVolunteerMatches,
  createVolunteerMatch,
  getAvailableEvents,
  createVolunteerRequest,
  updateEventStatus
};