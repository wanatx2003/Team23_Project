const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get user profile with skills and preferences
const getUserProfile = async (req, res, userId) => {
  try {
    const query = `
      SELECT 
        uc.UserID, uc.FirstName, uc.LastName, uc.Email, uc.PhoneNumber, uc.Role,
        up.FullName, up.Address1, up.Address2, up.City, up.StateCode, up.Zipcode
      FROM UserCredentials uc
      LEFT JOIN UserProfile up ON uc.UserID = up.UserID
      WHERE uc.UserID = ?
    `;
    
    pool.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user profile:", err);
        sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
        return;
      }

      if (results.length > 0) {
        const profile = results[0];
        
        // Get user skills
        pool.query('SELECT SkillName FROM UserSkill WHERE UserID = ?', [userId], (skillErr, skillResults) => {
          if (skillErr) {
            console.error("Error fetching skills:", skillErr);
            sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
            return;
          }
          
          profile.skills = skillResults.map(skill => skill.SkillName);
          
          // Get user preferences
          pool.query('SELECT PreferenceText FROM UserPreference WHERE UserID = ?', [userId], (prefErr, prefResults) => {
            if (prefErr) {
              console.error("Error fetching preferences:", prefErr);
              sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
              return;
            }
            
            profile.preferences = prefResults.map(pref => pref.PreferenceText);
            
            // Get availability
            pool.query('SELECT DayOfWeek, StartTime, EndTime FROM UserAvailability WHERE UserID = ?', [userId], (availErr, availResults) => {
              if (availErr) {
                console.error("Error fetching availability:", availErr);
                sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
                return;
              }
              
              profile.availability = availResults;
              sendJsonResponse(res, 200, { success: true, profile });
            });
          });
        });
      } else {
        sendJsonResponse(res, 404, { success: false, error: "User not found" });
      }
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Update user profile with validation
const updateUserProfile = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { UserID, FullName, Address1, Address2, City, StateCode, Zipcode, Skills, Preferences, Availability } = data;
    
    // Validation
    if (!FullName || FullName.length > 100) {
      sendJsonResponse(res, 400, { success: false, error: "Full name is required and must be 100 characters or less" });
      return;
    }
    if (!Address1 || Address1.length > 100) {
      sendJsonResponse(res, 400, { success: false, error: "Address 1 is required and must be 100 characters or less" });
      return;
    }
    if (!City || City.length > 100) {
      sendJsonResponse(res, 400, { success: false, error: "City is required and must be 100 characters or less" });
      return;
    }
    if (!StateCode) {
      sendJsonResponse(res, 400, { success: false, error: "State is required" });
      return;
    }
    if (!Zipcode || Zipcode.length < 5 || Zipcode.length > 9) {
      sendJsonResponse(res, 400, { success: false, error: "Zip code is required and must be 5-9 characters" });
      return;
    }
    if (!Skills || Skills.length === 0) {
      sendJsonResponse(res, 400, { success: false, error: "At least one skill is required" });
      return;
    }
    
    // Check if profile exists
    const checkQuery = 'SELECT ProfileID FROM UserProfile WHERE UserID = ?';
    pool.query(checkQuery, [UserID], (err, results) => {
      if (err) {
        console.error("Error checking profile:", err);
        sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
        return;
      }

      const profileQuery = results.length > 0 
        ? `UPDATE UserProfile SET FullName = ?, Address1 = ?, Address2 = ?, City = ?, StateCode = ?, Zipcode = ? WHERE UserID = ?`
        : `INSERT INTO UserProfile (FullName, Address1, Address2, City, StateCode, Zipcode, UserID) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      pool.query(profileQuery, [FullName, Address1, Address2, City, StateCode, Zipcode, UserID], (err, result) => {
        if (err) {
          console.error("Error updating profile:", err);
          sendJsonResponse(res, 500, { success: false, error: "Failed to update profile" });
          return;
        }

        // Update skills
        pool.query('DELETE FROM UserSkill WHERE UserID = ?', [UserID], (err) => {
          if (err) console.error("Error deleting existing skills:", err);
          
          const skillPromises = Skills.map(skill => {
            return new Promise((resolve) => {
              pool.query('INSERT INTO UserSkill (UserID, SkillName) VALUES (?, ?)', [UserID, skill], resolve);
            });
          });
          
          Promise.all(skillPromises).then(() => {
            // Update preferences
            pool.query('DELETE FROM UserPreference WHERE UserID = ?', [UserID], (err) => {
              if (err) console.error("Error deleting existing preferences:", err);
              
              if (Preferences && Preferences.length > 0) {
                const prefPromises = Preferences.map(pref => {
                  return new Promise((resolve) => {
                    pool.query('INSERT INTO UserPreference (UserID, PreferenceText) VALUES (?, ?)', [UserID, pref], resolve);
                  });
                });
                Promise.all(prefPromises);
              }
              
              // Update availability
              pool.query('DELETE FROM UserAvailability WHERE UserID = ?', [UserID], (err) => {
                if (err) console.error("Error deleting existing availability:", err);
                
                if (Availability && Availability.length > 0) {
                  const availPromises = Availability.map(avail => {
                    return new Promise((resolve) => {
                      pool.query('INSERT INTO UserAvailability (UserID, DayOfWeek, StartTime, EndTime) VALUES (?, ?, ?, ?)', 
                        [UserID, avail.DayOfWeek, avail.StartTime, avail.EndTime], resolve);
                    });
                  });
                  Promise.all(availPromises);
                }
                
                sendJsonResponse(res, 200, { success: true, message: "Profile updated successfully" });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Get states for dropdown
const getStates = (req, res) => {
  pool.query('SELECT StateCode, StateName FROM States ORDER BY StateName', (err, results) => {
    if (err) {
      console.error("Error fetching states:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }
    sendJsonResponse(res, 200, { success: true, states: results });
  });
};

// Get available skills for dropdown
const getAvailableSkills = (req, res) => {
  const skills = [
    'First Aid/CPR',
    'Event Planning',
    'Teaching/Tutoring',
    'Construction/Manual Labor',
    'Food Service',
    'Administrative Support',
    'Technology/IT',
    'Transportation',
    'Languages (Spanish)',
    'Languages (French)',
    'Languages (Other)',
    'Social Media',
    'Photography',
    'Fundraising',
    'Childcare',
    'Animal Care',
    'Gardening/Landscaping',
    'Arts and Crafts',
    'Music/Performance',
    'Counseling/Listening'
  ];
  
  sendJsonResponse(res, 200, { success: true, skills });
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        uc.UserID,
        uc.Username,
        uc.Role,
        uc.AccountStatus,
        COALESCE(up.FullName, CONCAT(uc.FirstName, ' ', uc.LastName)) as FullName
      FROM UserCredentials uc
      LEFT JOIN UserProfile up ON uc.UserID = up.UserID
      ORDER BY uc.AccountCreatedAt DESC
    `;
    
    pool.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching all users:', err);
        sendJsonResponse(res, 500, { success: false, error: 'Internal server error' });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, users: results });
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    sendJsonResponse(res, 500, { success: false, error: 'Server error' });
  }
};

// Update user account status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { UserID, AccountStatus } = data;
    
    if (!UserID || !AccountStatus) {
      sendJsonResponse(res, 400, { success: false, error: 'UserID and AccountStatus are required' });
      return;
    }
    
    if (!['Active', 'Suspended'].includes(AccountStatus)) {
      sendJsonResponse(res, 400, { success: false, error: 'Invalid AccountStatus' });
      return;
    }
    
    const query = 'UPDATE UserCredentials SET AccountStatus = ? WHERE UserID = ?';
    pool.query(query, [AccountStatus, UserID], (err, result) => {
      if (err) {
        console.error('Error updating user status:', err);
        sendJsonResponse(res, 500, { success: false, error: 'Failed to update user status' });
        return;
      }
      
      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: 'User not found' });
        return;
      }
      
      sendJsonResponse(res, 200, { success: true, message: 'User status updated successfully' });
    });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    sendJsonResponse(res, 500, { success: false, error: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getStates,
  getAvailableSkills,
  getAllUsers,
  updateUserStatus
};
