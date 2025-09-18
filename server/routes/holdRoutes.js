const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Get holds for a specific user
const getUserHolds = (req, res, userId) => {
  console.log(`Fetching holds for user ID: ${userId}`);
  
  const query = `
    SELECT 
  H.HoldID, 
  U.FirstName, 
  U.LastName, 
  H.ItemType, 
  CASE 
    WHEN H.ItemType = 'book' THEN B.Title
    WHEN H.ItemType = 'media' THEN M.Title
    WHEN H.ItemType = 'device' THEN D.Model
    ELSE 'Unknown'
  END AS Title,
  CASE 
    WHEN H.ItemType = 'book' THEN B.Author
    WHEN H.ItemType = 'media' THEN M.Author
    WHEN H.ItemType = 'device' THEN D.Brand
    ELSE 'Unknown'
  END AS AuthorOrBrand,
  H.RequestAT,
  H.HoldStatus
FROM HOLD AS H
LEFT JOIN USER AS U ON H.UserID = U.UserID
LEFT JOIN BOOK AS B ON H.ItemID = B.BookID
LEFT JOIN MEDIA AS M ON H.ItemID = M.MediaID
LEFT JOIN DEVICE AS D ON H.ItemID = D.DeviceID
WHERE H.UserID = ?;
  `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching holds for user:', err);
      sendJsonResponse(res, 500, { success: false, error: 'Failed to fetch holds' });
      return;
    }

    console.log(`Retrieved ${results.length} holds for user ${userId}`);
    sendJsonResponse(res, 200, { success: true, holds: results });
  });
};

// BOOK SESSION
const holdBook = async (req, res) => {
  try {
    const { UserID, BookID } = await parseRequestBody(req);

    const roleQuery = `
      SELECT role FROM USER WHERE UserID = ? `;
    const [userRoleResult] = await pool.promise().query(roleQuery, [UserID]);
    const role = userRoleResult[0].role;
    const holdLimit = role === "Student" ? 2 : 3;

    const currentHoldsQuery = `
      SELECT COUNT(*) AS holdCount FROM HOLD
      WHERE UserID = ? AND HoldStatus = 'Pending' AND ItemType = 'Book'
    `;
    const [currentHolds] = await pool.promise().query(currentHoldsQuery, [UserID]);

    // Check if the user has reached the hold limit
    if (currentHolds[0].holdCount >= holdLimit) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: `You cannot place more than ${holdLimit} holds on book.`,
      });
    }
    
    // Check if the user has a pending hold on the book
    const checkHoldQuery = `
      SELECT * FROM HOLD WHERE UserID = ? AND ItemID = ? AND ItemType = 'Book' AND HoldStatus = 'Pending'
    `;
    const [existingHold] = await pool.promise().query(checkHoldQuery, [UserID, BookID]);
    
    if (existingHold.length > 0) {
      return sendJsonResponse(res, 400, { success: false, error: "You have already placed a hold on this book." });
    }

    // Check if the user has loaned the book and not returned it
    const activeLoanQuery = `
      SELECT * FROM LOAN 
      WHERE UserID = ? AND ItemID = ? AND ItemType = 'Book' AND ReturnedAt IS NULL
    `;
    const [activeLoan] = await pool.promise().query(activeLoanQuery, [UserID, BookID]);

    if (activeLoan.length > 0) {
      return sendJsonResponse(res, 400, { success: false, error: "You have borrowed this item." });
    }

    // Add entry to Hold table
    const holdQuery = `
      INSERT INTO HOLD (UserID, ItemType, ItemID, RequestAt, HoldStatus)
      VALUES (?, 'Book', ?, NOW(), 'Pending')
    `;
    await pool.promise().query(holdQuery, [UserID, BookID]);

    sendJsonResponse(res, 200, { success: true });
  } catch (error) {
    console.error("Error placing hold on book:", error);
    sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
  }
};


// MEDIA SESSION
const holdMedia = async (req, res) => {
  try {
    const { UserID, MediaID } = await parseRequestBody(req);

    const roleQuery = `
      SELECT role FROM USER WHERE UserID = ? `;
    const [userRoleResult] = await pool.promise().query(roleQuery, [UserID]);
    const role = userRoleResult[0].role;
    const holdLimit = role === "Student" ? 2 : 3;

    const currentHoldsQuery = `
      SELECT COUNT(*) AS holdCount FROM HOLD
      WHERE UserID = ? AND HoldStatus = 'Pending' AND ItemType = 'Media'
    `;
    const [currentHolds] = await pool.promise().query(currentHoldsQuery, [UserID]);

    // Check if the user has reached the hold limit
    if (currentHolds[0].holdCount >= holdLimit) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: `You cannot place more than ${holdLimit} holds on media.`,
      });
    }

    // Check if the user has a pending hold on the media
    const existingHoldQuery = `
      SELECT * FROM HOLD
      WHERE UserID = ? AND ItemID = ? AND ItemType = 'Media' AND HoldStatus = 'Pending'
    `;
    const [existingHold] = await pool.promise().query(existingHoldQuery, [UserID, MediaID]);

    if (existingHold.length > 0) {
      return sendJsonResponse(res, 400, { success: false, error: "You already have a pending hold on this item." });
    }

    // Check if the user has loaned the media and not returned it
    const activeLoanQuery = `
      SELECT * FROM LOAN 
      WHERE UserID = ? AND ItemID = ? AND ItemType = 'Media' AND ReturnedAt IS NULL
    `;
    const [activeLoan] = await pool.promise().query(activeLoanQuery, [UserID, MediaID]);

    if (activeLoan.length > 0) {
      return sendJsonResponse(res, 400, { success: false, error: "You have borrowed this item." });
    }

    // Add entry to Hold table
    const holdQuery = `
      INSERT INTO HOLD (UserID, ItemType, ItemID, RequestAt, HoldStatus)
      VALUES (?, 'Media', ?, NOW(), 'Pending')
    `;
    await pool.promise().query(holdQuery, [UserID, MediaID]);

    sendJsonResponse(res, 200, { success: true });
  } catch (error) {
    console.error("Error placing hold on media:", error);
    sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
  }
};

// DEVICE SESSION
const holdDevice = async (req, res) => {
  try {
    const { UserID, DeviceID } = await parseRequestBody(req);

    const roleQuery = `
      SELECT role FROM USER WHERE UserID = ? `;
    const [userRoleResult] = await pool.promise().query(roleQuery, [UserID]);
    const role = userRoleResult[0].role;
    const holdLimit = role === "Student" ? 2 : 3;

    const currentHoldsQuery = `
      SELECT COUNT(*) AS holdCount FROM HOLD
      WHERE UserID = ? AND HoldStatus = 'Pending' AND ItemType = 'Device'
    `;
    const [currentHolds] = await pool.promise().query(currentHoldsQuery, [UserID]);

    // Check if the user has reached the hold limit
    if (currentHolds[0].holdCount >= holdLimit) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: `You cannot place more than ${holdLimit} holds on device.`,
      });
    }

    // Check if the user has an pending hold on the device
    const existingHoldQuery = `
      SELECT * FROM HOLD
      WHERE UserID = ? AND ItemID = ? AND ItemType = 'Device' AND HoldStatus = 'Pending'
    `;
    const [existingHold] = await pool.promise().query(existingHoldQuery, [UserID, DeviceID]);

    if (existingHold.length > 0) {
      // If the user already has a pending hold, they cannot place another one
      return sendJsonResponse(res, 400, { success: false, error: "You already have a pending hold on this item." });
    }

    // Check if the user has loaned the device and not returned it
    const activeLoanQuery = `
      SELECT * FROM LOAN 
      WHERE UserID = ? AND ItemID = ? AND ItemType = 'Device' AND ReturnedAt IS NULL
    `;
    const [activeLoan] = await pool.promise().query(activeLoanQuery, [UserID, DeviceID]);

    if (activeLoan.length > 0) {
      return sendJsonResponse(res, 400, { success: false, error: "You have borrowed this item." });
    }

    // Add entry to Hold table
    const holdQuery = `
      INSERT INTO HOLD (UserID, ItemType, ItemID, RequestAt, HoldStatus)
      VALUES (?, 'Device', ?, NOW(), 'Pending')
    `;
    await pool.promise().query(holdQuery, [UserID, DeviceID]);

    sendJsonResponse(res, 200, { success: true });
  } catch (error) {
    console.error("Error placing hold on device:", error);
    sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
  }
};

// CANCEL HOLD
const cancelHold = async (req, res) => {
  try {
    const { HoldID } = await parseRequestBody(req);

    // Check if the hold exists and is in 'Pending' status
    const existingHoldQuery = `
      SELECT * FROM HOLD
      WHERE HoldID = ? AND HoldStatus = 'Pending'
    `;
    const [existingHold] = await pool.promise().query(existingHoldQuery, [HoldID]);

    if (existingHold.length === 0) {
      return sendJsonResponse(res, 400, { success: false, error: "No pending hold found for this ID." });
    }

    // Update the hold's status to 'Canceled'
    const cancelHoldQuery = `
      UPDATE HOLD
      SET HoldStatus = 'Canceled'
      WHERE HoldID = ? AND HoldStatus = 'Pending'
    `;
    
    await pool.promise().query(cancelHoldQuery, [HoldID]);

    sendJsonResponse(res, 200, { success: true, message: "Hold canceled successfully." });
  } catch (error) {
    console.error("Error canceling hold:", error);
    sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
  }
};

module.exports = {
  getUserHolds,
  holdBook,
  holdDevice,
  holdMedia,
  cancelHold,
};
