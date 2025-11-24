const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Login route handler
const login = async (req, res) => {
  try {
    const body = await parseRequestBody(req);
    console.log('Login attempt for email:', body.email);
    
    pool.query(
      'SELECT UserID, Email, Role, AccountStatus FROM UserCredentials WHERE Email = ? AND Password = ?',
      [body.email, body.password],
      (err, results) => {
        if (err) {
          console.error("Error in login query:", err);
          sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
          return;
        }

        if (results.length > 0) {
          const user = results[0];
          
          // Check if account is suspended
          if (user.AccountStatus === 'Suspended') {
            console.log('Login blocked: Account suspended for user:', user.Email);
            sendJsonResponse(res, 403, { success: false, error: "Your account has been suspended. Please contact an administrator." });
            return;
          }
          
          console.log('Login successful for user:', user.Email);
          // Don't send AccountStatus to client, only essential data
          sendJsonResponse(res, 200, { 
            success: true, 
            user: {
              UserID: user.UserID,
              Email: user.Email,
              Role: user.Role
            }
          });
        } else {
          console.log('Login failed: Invalid credentials');
          sendJsonResponse(res, 200, { success: false, error: "Invalid email or password" });
        }
      }
    );
  } catch (error) {
    console.error('Error in login:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Register route handler
const register = async (req, res) => {
  try {
    const { email, password, phoneNumber, role, adminPasscode } = await parseRequestBody(req);
    console.log('Registration attempt for:', email, 'Role:', role, 'Passcode provided:', adminPasscode);
    
    // Validate admin passcode if registering as admin - STRICT VALIDATION
    const ADMIN_PASSCODE = '775512'; // This is the ONLY valid admin passcode
    if (role === 'admin') {
      console.log('Admin registration detected - validating passcode...');
      if (!adminPasscode) {
        console.log('REJECTED: No passcode provided');
        sendJsonResponse(res, 400, { success: false, error: 'Admin security passcode is required' });
        return;
      }
      if (adminPasscode !== ADMIN_PASSCODE) {
        console.log('REJECTED: Invalid passcode. Expected:', ADMIN_PASSCODE, 'Received:', adminPasscode);
        sendJsonResponse(res, 403, { success: false, error: 'Invalid admin security passcode. Access denied.' });
        return;
      }
      console.log('APPROVED: Admin passcode validated successfully');
    }
    
    // Check if user already exists
    pool.query(
      'SELECT UserID FROM UserCredentials WHERE Email = ?',
      [email],
      (err, results) => {
        if (err) {
          console.error('Error checking existing user:', err);
          sendJsonResponse(res, 500, { success: false, error: 'Database error' });
          return;
        }
        
        if (results.length > 0) {
          sendJsonResponse(res, 400, { success: false, error: 'User with this email already exists' });
          return;
        }
        
        // Insert new user (using email as username)
        const query = `
          INSERT INTO UserCredentials (Username, Password, Email, PhoneNumber, Role, AccountCreatedAt, AccountStatus)
          VALUES (?, ?, ?, ?, ?, NOW(), 'Active')
        `;

        pool.query(
          query,
          [email, password, email, phoneNumber || null, role || 'volunteer'],
          (err, results) => {
            if (err) {
              console.error('Error registering user:', err);
              sendJsonResponse(res, 500, { success: false, error: 'Failed to register user' });
              return;
            }

            console.log('✅ User registered successfully:', email, 'as', role || 'volunteer');
            
            // Return user data for immediate login
            const newUser = {
              UserID: results.insertId,
              Email: email,
              Role: role || 'volunteer'
            };
            
            sendJsonResponse(res, 200, { success: true, user: newUser });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in registration:', error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Get all users
const getAllUsers = (req, res) => {
  console.log('Fetching all users');
  
  pool.query('SELECT * FROM UserCredentials', (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      sendJsonResponse(res, 500, { error: "Error executing query" });
      return;
    }
    
    console.log('User data fetched successfully');
    sendJsonResponse(res, 200, result);
  });
};

module.exports = {
  login,
  register,
  getAllUsers
};
