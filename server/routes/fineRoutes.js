const pool = require('../config/db');
const { sendJsonResponse } = require('../utils/requestUtils');

// Get fines for a specific user
const getUserFines = (req, res, userId) => {
  console.log(`Fetching fines for user ID: ${userId}`);
  
  const query = `
    SELECT 
      F.FineID,
      L.ItemType, 
      CASE 
        WHEN L.ItemType = 'Book' THEN B.Title
        WHEN L.ItemType = 'Media' THEN M.Title
        WHEN L.ItemType = 'Device' THEN D.Model
        ELSE 'Unknown Item'
      END AS Title,
      CASE 
        WHEN L.ItemType = 'Book' THEN B.Author
        WHEN L.ItemType = 'Media' THEN M.Author
        WHEN L.ItemType = 'Device' THEN D.Brand
        ELSE 'Unknown Creator'
      END AS Author,
      L.BorrowedAt, 
      L.DueAT, 
      F.Amount, 
      F.PaymentStatus AS Status
    FROM LOAN AS L
    JOIN FINE AS F ON L.LoanID = F.LoanID
    LEFT JOIN BOOK AS B ON L.ItemType = 'Book' AND L.ItemID = B.BookID
    LEFT JOIN MEDIA AS M ON L.ItemType = 'Media' AND L.ItemID = M.MediaID
    LEFT JOIN DEVICE AS D ON L.ItemType = 'Device' AND L.ItemID = D.DeviceID
    WHERE L.UserID = ?
  `;
  
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching fines for user:', err);
      sendJsonResponse(res, 500, { success: false, error: 'Failed to fetch fines' });
      return;
    }

    console.log(`Retrieved ${results.length} fines for user ${userId}`);
    sendJsonResponse(res, 200, { success: true, fines: results });
  });
};

const updateFinePayment = (req, res) => {
  const { fineId } = req.body;
  console.log("Received fineId:", fineId);
  if (!fineId) {
    return sendJsonResponse(res, 400, { success: false, error: "fineId is required" });
  }
  const query = "UPDATE fine SET PaymentStatus = 'Paid' WHERE FineID = ?";
  pool.query(query, [fineId], (err, results) => {
    if (err) {
      console.error("Error updating fine:", err);
      return sendJsonResponse(res, 500, { success: false, error: "Database error" });
    }
    if (results.affectedRows === 0) {
      return sendJsonResponse(res, 404, { success: false, error: "Fine not found" });
    }
    sendJsonResponse(res, 200, { success: true });
  });
};

module.exports = { getUserFines, updateFinePayment };
