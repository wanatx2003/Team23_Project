const pool = require("../config/db");
const { sendJsonResponse } = require("../utils/requestUtils");

const itemReport = (req, res, startDate, endDate) => {
  let dateFilterLoan = "";
  let dateFilterHold = "";

  console.log("Received startDate and endDate:", startDate, endDate);

  if (startDate && endDate) {
    endDate += ' 23:59:59';
    dateFilterLoan = `AND l.BorrowedAt BETWEEN '${startDate}' AND '${endDate}'`;
    dateFilterHold = `AND h.RequestAT BETWEEN '${startDate}' AND '${endDate}'`;
  }

  const sqlQuery = `
    SELECT 
      i.ItemType,
      i.ItemID,
      i.DisplayTitle,
      i.DisplayAuthor,
      COUNT(DISTINCT CASE WHEN 1=1 ${dateFilterLoan} THEN l.LoanID END) AS TotalBorrows,
      COUNT(DISTINCT CASE WHEN l.ReturnedAt IS NULL ${dateFilterLoan} THEN l.LoanID END) AS ActiveBorrows,
      COUNT(DISTINCT CASE WHEN 1=1 ${dateFilterHold} THEN h.HoldID END) AS TotalHolds,
      COUNT(DISTINCT CASE WHEN h.HoldStatus = 'Pending' ${dateFilterHold} THEN h.HoldID END) AS PendingHolds
    FROM (
      SELECT 'Book' AS ItemType, BookID AS ItemID, Title AS DisplayTitle, Author AS DisplayAuthor FROM BOOK
      UNION ALL
      SELECT 'Media', MediaID, Title, Author FROM MEDIA
      UNION ALL
      SELECT 'Device', DeviceID, Model AS DisplayTitle, Brand AS DisplayAuthor FROM DEVICE
    ) i
    LEFT JOIN LOAN l ON l.ItemID = i.ItemID AND l.ItemType = i.ItemType
    LEFT JOIN HOLD h ON h.ItemID = i.ItemID AND h.ItemType = i.ItemType
    GROUP BY i.ItemType, i.ItemID, i.DisplayTitle, i.DisplayAuthor
  `;

  console.log("Running SQL Query:\n", sqlQuery);

  pool.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching item stats report:", err);
      sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch item stats report",
      });
      return;
    }

    sendJsonResponse(res, 200, {
      success: true,
      data: results,
    });
  });
};



const userReport = (req, res) => {
  const query = `
    SELECT
      u.UserID,
      u.FirstName,
      u.LastName,
      u.Role,
      l.ItemType,
      -- Title and Author after ItemType
      CASE
        WHEN l.ItemType = 'Book' THEN b.Title
        WHEN l.ItemType = 'Media' THEN m.Title
        WHEN l.ItemType = 'Device' THEN d.Model
      END AS Title,
      CASE
        WHEN l.ItemType = 'Book' THEN b.Author
        WHEN l.ItemType = 'Media' THEN m.Author
        WHEN l.ItemType = 'Device' THEN d.Brand
      END AS Author,
      l.LoanID,
      l.BorrowedAt,
      l.DueAT,
      l.ReturnedAt,
      CASE 
        WHEN l.ReturnedAt IS NULL THEN 'Borrowed'
        ELSE 'Returned'
      END AS Status
    FROM
      LOAN l
    JOIN USER u ON u.UserID = l.UserID
    LEFT JOIN BOOK b ON l.ItemType = 'Book' AND l.ItemID = b.BookID
    LEFT JOIN MEDIA m ON l.ItemType = 'Media' AND l.ItemID = m.MediaID
    LEFT JOIN DEVICE d ON l.ItemType = 'Device' AND l.ItemID = d.DeviceID
    WHERE u.Role IN ('Student', 'Faculty')
    ORDER BY u.UserID, l.BorrowedAt DESC;
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching item stats report:", err);
      sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch item stats report",
      });
      return;
    }

    sendJsonResponse(res, 200, {
      success: true,
      data: results,
    });
  });
};

module.exports = {
  itemReport,
  userReport,
};
