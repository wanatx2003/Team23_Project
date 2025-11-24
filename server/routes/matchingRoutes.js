const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get potential volunteer matches for events
const getVolunteerMatches = (req, res) => {
  const query = `
    SELECT DISTINCT
      uc.UserID, uc.Email,
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

// Smart matching algorithm - Get best volunteer matches for a specific event
const getSmartMatchesForEvent = (req, res) => {
  const eventId = req.url.split('/').pop().split('?')[0];
  
  // Query to get event details and all available volunteers with their skills and availability
  const query = `
    SELECT 
      uc.UserID,
      uc.Email,
      up.FullName,
      up.City,
      up.StateCode,
      GROUP_CONCAT(DISTINCT us.SkillName ORDER BY us.SkillName) as VolunteerSkills,
      GROUP_CONCAT(DISTINCT CONCAT(ua.DayOfWeek, ':', ua.StartTime, '-', ua.EndTime) SEPARATOR '|') as Availability,
      ed.EventID,
      ed.EventName,
      ed.EventDate,
      ed.StartTime,
      ed.EndTime,
      ed.Location,
      ed.Urgency,
      ed.MaxVolunteers,
      ed.CurrentVolunteers,
      GROUP_CONCAT(DISTINCT ers.SkillName ORDER BY ers.SkillName) as RequiredSkills,
      COALESCE(vm.MatchStatus, 'none') as CurrentMatchStatus,
      vm.MatchID
    FROM UserCredentials uc
    INNER JOIN UserProfile up ON uc.UserID = up.UserID
    LEFT JOIN UserSkill us ON uc.UserID = us.UserID
    LEFT JOIN UserAvailability ua ON uc.UserID = ua.UserID
    CROSS JOIN EventDetails ed
    LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
    LEFT JOIN VolunteerMatches vm ON uc.UserID = vm.VolunteerID AND ed.EventID = vm.EventID
    WHERE uc.Role = 'volunteer'
      AND uc.AccountStatus = 'Active'
      AND ed.EventID = ?
      AND ed.EventStatus = 'published'
      AND ed.EventDate >= CURDATE()
      AND (vm.MatchStatus IS NULL OR vm.MatchStatus NOT IN ('declined'))
    GROUP BY uc.UserID, ed.EventID
  `;
  
  pool.query(query, [eventId], (err, results) => {
    if (err) {
      console.error("Error fetching smart matches:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    
    if (results.length === 0) {
      sendJsonResponse(res, 200, { success: true, matches: [], message: "No event found or no available volunteers" });
      return;
    }
    
    // Calculate match score for each volunteer
    const matches = results.map(volunteer => {
      const volunteerSkills = volunteer.VolunteerSkills ? volunteer.VolunteerSkills.split(',') : [];
      const requiredSkills = volunteer.RequiredSkills ? volunteer.RequiredSkills.split(',') : [];
      const availability = volunteer.Availability ? volunteer.Availability.split('|') : [];
      
      let matchScore = 0;
      let matchReasons = [];
      
      // 1. SKILL MATCHING (40 points maximum)
      const matchingSkills = volunteerSkills.filter(skill => requiredSkills.includes(skill));
      if (requiredSkills.length > 0) {
        const skillMatchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
        const skillPoints = Math.round((skillMatchPercentage / 100) * 40);
        matchScore += skillPoints;
        
        if (skillMatchPercentage === 100) {
          matchReasons.push('✓ Has all required skills');
        } else if (skillMatchPercentage >= 75) {
          matchReasons.push(`✓ Has ${Math.round(skillMatchPercentage)}% of required skills`);
        } else if (skillMatchPercentage >= 50) {
          matchReasons.push(`~ Has ${Math.round(skillMatchPercentage)}% of required skills`);
        } else if (skillMatchPercentage > 0) {
          matchReasons.push(`~ Has some required skills (${Math.round(skillMatchPercentage)}%)`);
        }
      } else {
        // No specific skills required - everyone gets base points
        matchScore += 20;
        matchReasons.push('✓ No specific skills required');
      }
      
      // 2. AVAILABILITY MATCHING (30 points maximum)
      const eventDate = new Date(volunteer.EventDate);
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][eventDate.getDay()];
      const eventStartTime = volunteer.StartTime;
      
      let availabilityMatch = false;
      if (availability.length > 0 && eventStartTime) {
        for (const avail of availability) {
          const [day, timeRange] = avail.split(':');
          if (day === dayOfWeek) {
            const [availStart, availEnd] = timeRange.split('-');
            // Simple time comparison - check if event time falls within availability
            if (eventStartTime >= availStart && eventStartTime <= availEnd) {
              availabilityMatch = true;
              matchScore += 30;
              matchReasons.push(`✓ Available on ${dayOfWeek} at event time`);
              break;
            }
          }
        }
        if (!availabilityMatch) {
          // Check if available on the same day but different time
          const sameDayAvailable = availability.some(avail => avail.startsWith(dayOfWeek));
          if (sameDayAvailable) {
            matchScore += 15;
            matchReasons.push(`~ Available on ${dayOfWeek} (different time)`);
          } else {
            matchReasons.push(`✗ Not available on ${dayOfWeek}`);
          }
        }
      } else {
        // No availability data or event time - give neutral points
        matchScore += 15;
        matchReasons.push('~ Availability not specified');
      }
      
      // 3. LOCATION PROXIMITY (15 points maximum)
      // Same state = 15 points, same city = bonus (not calculated here without geocoding)
      const eventLocation = volunteer.Location || '';
      const volunteerState = volunteer.StateCode || '';
      
      if (eventLocation.includes(volunteerState)) {
        matchScore += 15;
        matchReasons.push(`✓ Located in same state (${volunteerState})`);
      } else if (volunteerState) {
        matchScore += 7;
        matchReasons.push(`~ Location: ${volunteer.City}, ${volunteerState}`);
      }
      
      // 4. URGENCY BONUS (15 points maximum)
      // For high urgency events, prioritize volunteers with ANY match
      if (volunteer.Urgency === 'critical') {
        matchScore += 10;
        matchReasons.push('! Critical urgency event');
      } else if (volunteer.Urgency === 'high') {
        matchScore += 7;
        matchReasons.push('! High urgency event');
      } else if (volunteer.Urgency === 'medium') {
        matchScore += 3;
      }
      
      // 5. CAPACITY CHECK (Penalty if event is near full)
      const capacityPercentage = volunteer.MaxVolunteers 
        ? (volunteer.CurrentVolunteers / volunteer.MaxVolunteers) * 100 
        : 0;
      
      if (volunteer.MaxVolunteers && volunteer.CurrentVolunteers >= volunteer.MaxVolunteers) {
        matchScore = 0; // Event is full
        matchReasons = ['✗ Event at full capacity'];
      } else if (capacityPercentage >= 80) {
        matchReasons.push('⚠ Event nearly full');
      }
      
      // 6. ALREADY MATCHED BONUS
      if (volunteer.CurrentMatchStatus === 'pending') {
        matchScore += 5;
        matchReasons.push('✓ Already requested to join');
      } else if (volunteer.CurrentMatchStatus === 'confirmed') {
        matchScore += 10;
        matchReasons.push('✓ Already confirmed');
      }
      
      return {
        UserID: volunteer.UserID,
        FullName: volunteer.FullName,
        Email: volunteer.Email,
        City: volunteer.City,
        StateCode: volunteer.StateCode,
        Skills: volunteerSkills,
        RequiredSkills: requiredSkills,
        MatchingSkills: matchingSkills,
        EventID: volunteer.EventID,
        EventName: volunteer.EventName,
        EventDate: volunteer.EventDate,
        EventTime: volunteer.StartTime,
        Location: volunteer.Location,
        Urgency: volunteer.Urgency,
        MaxVolunteers: volunteer.MaxVolunteers,
        CurrentVolunteers: volunteer.CurrentVolunteers,
        CurrentMatchStatus: volunteer.CurrentMatchStatus,
        MatchID: volunteer.MatchID,
        MatchScore: Math.min(matchScore, 100), // Cap at 100
        MatchPercentage: Math.min(matchScore, 100),
        MatchReasons: matchReasons,
        RecommendationLevel: matchScore >= 75 ? 'excellent' : matchScore >= 50 ? 'good' : matchScore >= 30 ? 'fair' : 'low'
      };
    });
    
    // Sort by match score (highest first)
    matches.sort((a, b) => b.MatchScore - a.MatchScore);
    
    sendJsonResponse(res, 200, { success: true, matches });
  });
};

// Auto-match best volunteers to an event
const autoMatchVolunteers = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { EventID, MinMatchScore = 50, MaxMatches = 5 } = data;
    
    if (!EventID) {
      sendJsonResponse(res, 400, { success: false, error: "EventID is required" });
      return;
    }
    
    // Use the smart matching algorithm to get suggestions
    const query = `
      SELECT 
        uc.UserID,
        uc.Email,
        up.FullName,
        GROUP_CONCAT(DISTINCT us.SkillName ORDER BY us.SkillName) as VolunteerSkills,
        ed.EventID,
        ed.EventName,
        ed.MaxVolunteers,
        ed.CurrentVolunteers,
        GROUP_CONCAT(DISTINCT ers.SkillName ORDER BY ers.SkillName) as RequiredSkills,
        COALESCE(vm.MatchStatus, 'none') as CurrentMatchStatus
      FROM UserCredentials uc
      INNER JOIN UserProfile up ON uc.UserID = up.UserID
      LEFT JOIN UserSkill us ON uc.UserID = us.UserID
      CROSS JOIN EventDetails ed
      LEFT JOIN EventRequiredSkill ers ON ed.EventID = ers.EventID
      LEFT JOIN VolunteerMatches vm ON uc.UserID = vm.VolunteerID AND ed.EventID = vm.EventID
      WHERE uc.Role = 'volunteer'
        AND uc.AccountStatus = 'Active'
        AND ed.EventID = ?
        AND (vm.MatchStatus IS NULL)
      GROUP BY uc.UserID, ed.EventID
      LIMIT ?
    `;
    
    pool.query(query, [EventID, MaxMatches], (err, volunteers) => {
      if (err) {
        console.error("Error in auto-match:", err);
        sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
        return;
      }
      
      if (volunteers.length === 0) {
        sendJsonResponse(res, 200, { success: true, matched: 0, message: "No available volunteers to match" });
        return;
      }
      
      // Calculate match scores and filter by minimum score
      const scoredVolunteers = volunteers.map(v => {
        const volunteerSkills = v.VolunteerSkills ? v.VolunteerSkills.split(',') : [];
        const requiredSkills = v.RequiredSkills ? v.RequiredSkills.split(',') : [];
        const matchingSkills = volunteerSkills.filter(s => requiredSkills.includes(s));
        const skillMatchPercentage = requiredSkills.length > 0 
          ? (matchingSkills.length / requiredSkills.length) * 100 
          : 50;
        
        return {
          UserID: v.UserID,
          MatchScore: skillMatchPercentage
        };
      }).filter(v => v.MatchScore >= MinMatchScore);
      
      if (scoredVolunteers.length === 0) {
        sendJsonResponse(res, 200, { success: true, matched: 0, message: `No volunteers meet minimum match score of ${MinMatchScore}%` });
        return;
      }
      
      // Create matches for qualified volunteers
      let matchedCount = 0;
      const matchPromises = scoredVolunteers.map(volunteer => {
        return new Promise((resolve) => {
          const insertQuery = 'INSERT INTO VolunteerMatches (VolunteerID, EventID, MatchStatus) VALUES (?, ?, "pending")';
          pool.query(insertQuery, [volunteer.UserID, EventID], (insertErr) => {
            if (!insertErr) {
              matchedCount++;
              
              // Send notification
              const notifQuery = `
                INSERT INTO Notifications (UserID, Subject, Message, NotificationType)
                SELECT ?, 'New Event Assignment', 
                  CONCAT('You have been matched to the event "', EventName, '". Please check your dashboard for details.'),
                  'assignment'
                FROM EventDetails WHERE EventID = ?
              `;
              pool.query(notifQuery, [volunteer.UserID, EventID], () => {});
            }
            resolve();
          });
        });
      });
      
      Promise.all(matchPromises).then(() => {
        // Update event volunteer count
        const updateQuery = `
          UPDATE EventDetails 
          SET CurrentVolunteers = (
            SELECT COUNT(DISTINCT VolunteerID) 
            FROM VolunteerMatches 
            WHERE EventID = ? AND MatchStatus IN ('pending', 'confirmed')
          )
          WHERE EventID = ?
        `;
        pool.query(updateQuery, [EventID, EventID], () => {});
        
        sendJsonResponse(res, 200, { 
          success: true, 
          matched: matchedCount,
          message: `Successfully matched ${matchedCount} volunteer(s) to the event`
        });
      });
    });
  } catch (error) {
    console.error('Error in autoMatchVolunteers:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getVolunteerMatches,
  createVolunteerMatch,
  updateMatchStatus,
  getSmartMatchesForEvent,
  autoMatchVolunteers
};
