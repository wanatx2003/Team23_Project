const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get volunteer history for a user
const getVolunteerHistory = (req, res, userId) => {
  const query = `
    SELECT 
      vh.HistoryID, vh.ParticipationStatus, vh.HoursVolunteered, vh.ParticipationDate,
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate, ed.Urgency,
      GROUP_CONCAT(ers.SkillName) as RequiredSkills
    FROM VolunteerHistory vh
    JOIN EventDetails ed ON vh.EventID = ed.EventID
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    WHERE vh.VolunteerID = ?
    GROUP BY vh.HistoryID
    ORDER BY vh.ParticipationDate DESC
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching volunteer history:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    const history = results.map(record => ({
      ...record,
      RequiredSkills: record.RequiredSkills ? record.RequiredSkills.split(',') : []
    }));
    
    sendJsonResponse(res, 200, { success: true, history });
  });
};

// Get all volunteer history (admin only)
const getAllVolunteerHistory = (req, res) => {
  const query = `
    SELECT 
      vh.HistoryID, vh.ParticipationStatus, vh.HoursVolunteered, vh.ParticipationDate,
      uc.UserID, uc.FirstName, uc.LastName, up.FullName,
      ed.EventID, ed.EventName, ed.Description, ed.Location, ed.EventDate, ed.Urgency,
      GROUP_CONCAT(ers.SkillName) as RequiredSkills
    FROM VolunteerHistory vh
    JOIN UserCredentials uc ON vh.VolunteerID = uc.UserID
    LEFT JOIN UserProfile up ON uc.UserID = up.UserID
    JOIN EventDetails ed ON vh.EventID = ed.EventID
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    GROUP BY vh.HistoryID
    ORDER BY vh.ParticipationDate DESC
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all volunteer history:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    const history = results.map(record => ({
      ...record,
      RequiredSkills: record.RequiredSkills ? record.RequiredSkills.split(',') : []
    }));
    
    sendJsonResponse(res, 200, { success: true, history });
  });
};

// Add volunteer history record
const addVolunteerHistory = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { VolunteerID, EventID, ParticipationStatus, HoursVolunteered, ParticipationDate } = data;
    
    const query = `
      INSERT INTO VolunteerHistory (VolunteerID, EventID, ParticipationStatus, HoursVolunteered, ParticipationDate)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    pool.query(query, [VolunteerID, EventID, ParticipationStatus, HoursVolunteered, ParticipationDate], (err, result) => {
      if (err) {
        console.error("Error adding volunteer history:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to add volunteer history" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, historyID: result.insertId, message: "History record added successfully" });
    });
  } catch (error) {
    console.error('Error in addVolunteerHistory:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Update volunteer history record
const updateVolunteerHistory = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { HistoryID, ParticipationStatus, HoursVolunteered } = data;
    
    const query = 'UPDATE VolunteerHistory SET ParticipationStatus = ?, HoursVolunteered = ? WHERE HistoryID = ?';
    
    pool.query(query, [ParticipationStatus, HoursVolunteered, HistoryID], (err, result) => {
      if (err) {
        console.error("Error updating volunteer history:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to update volunteer history" });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: "History record updated successfully" });
    });
  } catch (error) {
    console.error('Error in updateVolunteerHistory:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getVolunteerHistory,
  getAllVolunteerHistory,
  addVolunteerHistory,
  updateVolunteerHistory
};
