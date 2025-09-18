const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Login route handler
const login = async (req, res) => {
  try {
    const body = await parseRequestBody(req);
    console.log('Login attempt for email:', body.email);
    
    pool.query(
      'SELECT UserID, FirstName, Role FROM USER WHERE Email = ? AND Password = ?',
      [body.email, body.password],
      (err, results) => {
        if (err) {
          console.error("Error in login query:", err);
          sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
          return;
        }

        if (results.length > 0) {
          const user = results[0];
          console.log('Login successful for user:', user.FirstName);
          sendJsonResponse(res, 200, { success: true, user });
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
    const { Username, Password, FirstName, LastName, Email, PhoneNumber, Role } = await parseRequestBody(req);
    console.log('Registration attempt for:', Email);
    
    const query = `
      INSERT INTO USER (Username, Password, FirstName, LastName, Email, PhoneNumber, Role, AccountCreateAt, AccountStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Active')
    `;

    pool.query(
      query,
      [Username, Password, FirstName, LastName, Email, PhoneNumber, Role],
      (err, results) => {
        if (err) {
          console.error('Error registering user:', err);
          sendJsonResponse(res, 500, { success: false, error: 'Failed to register user' });
          return;
        }

        console.log('User registered successfully:', Email);
        sendJsonResponse(res, 200, { success: true });
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
  
  pool.query('SELECT * FROM USER', (err, result) => {
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
