const db = require('../config/db');
const { sendJsonResponse } = require('../utils/requestUtils');
const url = require('url');

/**
 * Generate volunteer participation report
 * GET /api/reports/volunteer-participation
 * Query params: startDate, endDate, status, skill
 */
const getVolunteerParticipationReport = async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const { startDate, endDate, status, skill } = parsedUrl.query;
    
    let query = `
      SELECT 
        vh.HistoryID,
        CONCAT(uc.FirstName, ' ', uc.LastName) as VolunteerName,
        uc.Email as VolunteerEmail,
        ed.EventName,
        ed.EventDate,
        ed.Location,
        ed.Urgency,
        vh.ParticipationStatus,
        vh.HoursVolunteered,
        vh.ParticipationDate,
        GROUP_CONCAT(DISTINCT ers.SkillName) as RequiredSkills,
        up.City,
        up.StateCode
      FROM VolunteerHistory vh
      JOIN UserCredentials uc ON vh.VolunteerID = uc.UserID
      JOIN EventDetails ed ON vh.EventID = ed.EventID
      LEFT JOIN UserProfile up ON uc.UserID = up.UserID
      LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND vh.ParticipationDate >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND vh.ParticipationDate <= ?';
      params.push(endDate);
    }
    
    if (status && status !== 'All') {
      query += ' AND vh.ParticipationStatus = ?';
      params.push(status);
    }
    
    if (skill && skill !== 'All') {
      query += ' AND EXISTS (SELECT 1 FROM EventRequiredSkill ers2 WHERE ers2.EventID = ed.EventID AND ers2.SkillName = ?)';
      params.push(skill);
    }
    
    query += ' GROUP BY vh.HistoryID ORDER BY vh.ParticipationDate DESC, ed.EventDate DESC';
    
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching volunteer participation report:', error);
        return sendJsonResponse(res, 500, { success: false, error: 'Failed to fetch report' });
      }
      
      sendJsonResponse(res, 200, { 
        success: true, 
        data: results,
        summary: {
          totalRecords: results.length,
          totalHours: results.reduce((sum, record) => sum + (parseFloat(record.HoursVolunteered) || 0), 0),
          attended: results.filter(r => r.ParticipationStatus === 'attended').length
        }
      });
    });
  } catch (error) {
    console.error('Error in getVolunteerParticipationReport:', error);
    sendJsonResponse(res, 500, { success: false, error: 'Internal server error' });
  }
};

/**
 * Generate event summary report
 * GET /api/reports/event-summary
 * Query params: startDate, endDate, urgency
 */
const getEventSummaryReport = async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const { startDate, endDate, urgency } = parsedUrl.query;
    
    let query = `
      SELECT 
        ed.EventID,
        ed.EventName,
        ed.Description,
        ed.Location,
        ed.Urgency,
        ed.EventDate,
        ed.StartTime,
        ed.EndTime,
        ed.MaxVolunteers,
        ed.CurrentVolunteers,
        ed.EventStatus,
        CONCAT(uc.FirstName, ' ', uc.LastName) as CreatedByName,
        GROUP_CONCAT(DISTINCT ers.SkillName) as RequiredSkills,
        COUNT(DISTINCT vh.HistoryID) as TotalParticipations,
        COUNT(DISTINCT CASE WHEN vh.ParticipationStatus = 'attended' THEN vh.HistoryID END) as AttendedCount,
        SUM(CASE WHEN vh.ParticipationStatus = 'attended' THEN vh.HoursVolunteered ELSE 0 END) as TotalHours
      FROM EventDetails ed
      JOIN UserCredentials uc ON ed.CreatedBy = uc.UserID
      LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
      LEFT JOIN VolunteerHistory vh ON ed.EventID = vh.EventID
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND ed.EventDate >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND ed.EventDate <= ?';
      params.push(endDate);
    }
    
    if (urgency && urgency !== 'All') {
      query += ' AND ed.Urgency = ?';
      params.push(urgency);
    }
    
    query += ' GROUP BY ed.EventID ORDER BY ed.EventDate DESC';
    
    db.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching event summary report:', error);
        return sendJsonResponse(res, 500, { success: false, error: 'Failed to fetch report' });
      }
      
      sendJsonResponse(res, 200, { 
        success: true, 
        data: results,
        summary: {
          totalEvents: results.length,
          totalVolunteers: results.reduce((sum, record) => sum + (record.CurrentVolunteers || 0), 0),
          totalHours: results.reduce((sum, record) => sum + (parseFloat(record.TotalHours) || 0), 0)
        }
      });
    });
  } catch (error) {
    console.error('Error in getEventSummaryReport:', error);
    sendJsonResponse(res, 500, { success: false, error: 'Internal server error' });
  }
};

/**
 * Generate volunteer profile summary report
 * GET /api/reports/volunteer-summary
 */
const getVolunteerSummaryReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        uc.UserID,
        CONCAT(uc.FirstName, ' ', uc.LastName) as VolunteerName,
        uc.Email,
        up.FullName,
        up.City,
        up.StateCode,
        up.Zipcode,
        GROUP_CONCAT(DISTINCT us.SkillName) as Skills,
        COUNT(DISTINCT vh.HistoryID) as TotalEvents,
        COUNT(DISTINCT CASE WHEN vh.ParticipationStatus = 'attended' THEN vh.HistoryID END) as EventsAttended,
        SUM(CASE WHEN vh.ParticipationStatus = 'attended' THEN vh.HoursVolunteered ELSE 0 END) as TotalHours,
        MAX(vh.ParticipationDate) as LastParticipation
      FROM UserCredentials uc
      LEFT JOIN UserProfile up ON uc.UserID = up.UserID
      LEFT JOIN UserSkill us ON uc.UserID = us.UserID
      LEFT JOIN VolunteerHistory vh ON uc.UserID = vh.VolunteerID
      WHERE uc.Role = 'volunteer'
      GROUP BY uc.UserID
      ORDER BY TotalHours DESC, EventsAttended DESC
    `;
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching volunteer summary report:', error);
        return sendJsonResponse(res, 500, { success: false, error: 'Failed to fetch report' });
      }
      
      sendJsonResponse(res, 200, { 
        success: true, 
        data: results,
        summary: {
          totalVolunteers: results.length,
          activeVolunteers: results.filter(r => r.TotalEvents > 0).length,
          totalHours: results.reduce((sum, record) => sum + (parseFloat(record.TotalHours) || 0), 0)
        }
      });
    });
  } catch (error) {
    console.error('Error in getVolunteerSummaryReport:', error);
    sendJsonResponse(res, 500, { success: false, error: 'Internal server error' });
  }
};

module.exports = {
  getVolunteerParticipationReport,
  getEventSummaryReport,
  getVolunteerSummaryReport
};
