const pool = require("../config/db");
const { sendJsonResponse } = require("../utils/requestUtils");
const url = require("url"); // Add this import

const getDataReport = (req, res) => {
  const query = `
    SELECT 
      U.UserID, U.FirstName, U.LastName, 
      B.BookID, B.Title, B.Author, 
      L.LoanID, L.BorrowedAt, L.DueAT 
    FROM USER AS U
    LEFT JOIN LOAN AS L ON U.UserID = L.UserID
    LEFT JOIN BOOK AS B ON L.ItemID = B.BookID
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data report:", err);
      sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch data report",
      });
      return;
    }

    sendJsonResponse(res, 200, { success: true, data: results });
  });
};

const fineReport = (req, res) => {
  // Parse query parameters directly from URL
  const parsedUrl = url.parse(req.url, true);
  const queryParams = parsedUrl.query;
  
  console.log("Fetching fine report with query:", queryParams);
  
  // Extract filter parameters from parsed URL
  const { startDate, endDate, paymentStatus, role, itemType } = queryParams;
  
  console.log("Date filter parameters:", { startDate, endDate });
  
  // Define the date conditions to be applied to each part of the UNION
  let dateConditions = [];
  if (startDate) {
    // Ensure proper date format for MySQL
    dateConditions.push(`DATE(L.BorrowedAt) >= '${startDate}'`);
  }
  if (endDate) {
    // Ensure proper date format for MySQL and include the entire day
    dateConditions.push(`DATE(L.BorrowedAt) <= '${endDate}'`);
  }
  
  const dateCondition = dateConditions.length > 0 
    ? `AND ${dateConditions.join(' AND ')}` 
    : '';
  
  console.log("Generated date condition:", dateCondition);
  
  // Role condition if provided
  let roleCondition = '';
  if (role && role !== 'All') {
    roleCondition = `AND U.Role = '${role}'`;
  }
  
  // Item type condition - we'll handle this later with a WHERE clause on the final result
  let itemTypeWhere = '';
  if (itemType && itemType !== 'All') {
    itemTypeWhere = `WHERE ItemType = '${itemType}'`;
  }
  
  // Payment status condition - applied at the end
  let paymentStatusWhere = '';
  if (paymentStatus && paymentStatus !== 'All') {
    if (itemType && itemType !== 'All') {
      paymentStatusWhere = `AND Status = '${paymentStatus}'`;
    } else {
      paymentStatusWhere = `WHERE Status = '${paymentStatus}'`;
    }
  }
  
  let baseQuery = `
    SELECT
      F.FineID AS FineID,
      U.FirstName,
      U.LastName,
      U.Role,
      'Book' AS ItemType,
      B.Title,
      B.Author,
      DATE_FORMAT(L.BorrowedAt, '%Y-%m-%d %H:%i:%s') AS BorrowedAt, 
      DATE_FORMAT(L.DueAT, '%Y-%m-%d %H:%i:%s') AS DueAT, 
      F.Amount, 
      F.PaymentStatus AS Status
    FROM FINE AS F
    JOIN LOAN AS L ON F.LoanID = L.LoanID
    JOIN USER AS U ON L.UserID = U.UserID
    JOIN BOOK AS B ON L.ItemID = B.BookID
    WHERE L.ItemType = 'Book'
    ${dateCondition}
    ${roleCondition}
    
    UNION ALL
    
    SELECT
      F.FineID AS FineID,
      U.FirstName,
      U.LastName,
      U.Role,
      'Media' AS ItemType,
      M.Title,
      M.Author,
      DATE_FORMAT(L.BorrowedAt, '%Y-%m-%d %H:%i:%s') AS BorrowedAt, 
      DATE_FORMAT(L.DueAT, '%Y-%m-%d %H:%i:%s') AS DueAT, 
      F.Amount, 
      F.PaymentStatus AS Status
    FROM FINE AS F
    JOIN LOAN AS L ON F.LoanID = L.LoanID
    JOIN USER AS U ON L.UserID = U.UserID
    JOIN MEDIA AS M ON L.ItemID = M.MediaID
    WHERE L.ItemType = 'Media'
    ${dateCondition}
    ${roleCondition}
    
    UNION ALL
    
    SELECT
      F.FineID AS FineID,
      U.FirstName,
      U.LastName,
      U.Role,
      'Device' AS ItemType,
      D.Model AS Title,
      D.Brand AS Author,
      DATE_FORMAT(L.BorrowedAt, '%Y-%m-%d %H:%i:%s') AS BorrowedAt, 
      DATE_FORMAT(L.DueAT, '%Y-%m-%d %H:%i:%s') AS DueAT, 
      F.Amount, 
      F.PaymentStatus AS Status
    FROM FINE AS F
    JOIN LOAN AS L ON F.LoanID = L.LoanID
    JOIN USER AS U ON L.UserID = U.UserID
    JOIN DEVICE AS D ON L.ItemID = D.DeviceID
    WHERE L.ItemType = 'Device'
    ${dateCondition}
    ${roleCondition}
  `;
  
  // Apply the final filters for item type and payment status
  if (itemTypeWhere || paymentStatusWhere) {
    baseQuery = `SELECT * FROM (${baseQuery}) AS combined_results ${itemTypeWhere} ${paymentStatusWhere}`;
  }
  
  console.log("Executing SQL query:", baseQuery);
  
  pool.query(baseQuery, (err, results) => {
    if (err) {
      console.error("Error executing fine report query:", err);
      return sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch fine report: " + err.message,
      });
    }
    
    console.log(`Fine report generated with ${results?.length || 0} records`);
    
    // Always return success, with empty array if no results
    sendJsonResponse(res, 200, { 
      success: true, 
      data: results || [] 
    });
  });
};

const addRoom = async (req, res) => {
  try {
    const { RoomNumber, RoomName, Capacity, Notes } = await parseRequestBody(
      req
    );
    console.log("Request body:", { RoomNumber, RoomName, Capacity, Notes }); // Debugging log
    const query = `
      INSERT INTO ROOMS (RoomNumber, RoomName, Capacity, Notes)
      VALUES (?, ?, ?, ?)
    `;
    pool.query(query, [RoomNumber, RoomName, Capacity, Notes], (err) => {
      if (err) {
        console.error("Error adding room:", err); // Debugging log
        sendJsonResponse(res, 500, {
          success: false,
          error: "Failed to add room",
        });
        return;
      }
      sendJsonResponse(res, 200, { success: true });
    });
  } catch (error) {
    console.error("Error in addRoom:", error); // Debugging log
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

const getEventReport = (req, res) => {
  console.log("Fetching event report");
  
  // Make sure req.query exists before destructuring
  const query = req.query || {};
  
  // Log received query parameters for debugging
  console.log("Query parameters received:", query);
  
  // Get filter parameters from query string
  const { 
    startDate, 
    endDate, 
    category, 
    roomId,
    minAttendees,
    maxAttendees
  } = query;
  
  // Build WHERE clause based on filters
  let whereConditions = [];
  let queryParams = [];
  
  if (startDate) {
    whereConditions.push("e.StartAt >= ?");
    queryParams.push(startDate);
  }
  
  if (endDate) {
    whereConditions.push("e.EndAt <= ?");
    queryParams.push(endDate);
  }
  
  if (category && category !== 'all') {
    whereConditions.push("e.EventCategory = ?");
    queryParams.push(category);
  }
  
  if (roomId && roomId !== 'all') {
    whereConditions.push("e.RoomID = ?");
    queryParams.push(roomId);
  }
  
  // Construct the WHERE clause
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(" AND ")}` 
    : "";
  
  // Log the constructed WHERE clause for debugging
  console.log("Constructed WHERE clause:", whereClause);
  console.log("Query parameters:", queryParams);
  
  // Enhanced query with JOINs across multiple tables and more data points
  const queryText = `
    SELECT 
      e.EventID,
      e.EventName, 
      e.EventCategory,
      e.StartAt,
      e.EndAt,
      e.MaxAttendees,
      e.EventDescription,
      r.RoomID,
      r.RoomNumber,
      r.RoomName,
      r.Capacity AS RoomCapacity,
      u.FirstName AS OrganizerFirstName,
      u.LastName AS OrganizerLastName,
      COUNT(DISTINCT ea.EventAttendeeID) AS RegisteredAttendees,
      COUNT(CASE WHEN ea.CheckedIn = 1 THEN ea.EventAttendeeID END) AS CheckedInAttendees,
      
      # Additional metrics for data report
      DATEDIFF(e.EndAt, e.StartAt) AS EventDurationDays,
      TIMESTAMPDIFF(HOUR, e.StartAt, e.EndAt) AS EventDurationHours,
      
      # Get the most recent check-in time
      MAX(ea.CheckedInAt) AS LatestCheckIn,
      
      # Get the earliest check-in time
      MIN(CASE WHEN ea.CheckedIn = 1 THEN ea.CheckedInAt ELSE NULL END) AS EarliestCheckIn
      
    FROM 
      event e
    LEFT JOIN ROOMS r ON e.RoomID = r.RoomID
    LEFT JOIN user u ON e.UserID = u.UserID
    LEFT JOIN event_attendee ea ON e.EventID = ea.EventID
    ${whereClause}
    GROUP BY 
      e.EventID, e.EventName, e.EventCategory, e.StartAt, e.EndAt,
      e.MaxAttendees, e.EventDescription, r.RoomID, r.RoomNumber, 
      r.RoomName, r.Capacity, u.FirstName, u.LastName
    ORDER BY e.StartAt DESC
  `;

  console.log("Executing SQL query:", queryText);

  pool.query(queryText, queryParams, (err, results) => {
    if (err) {
      console.error("Error executing event report query:", err);
      sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch event report: " + err.message,
      });
      return;
    }

    console.log(`Raw query results returned ${results ? results.length : 0} events`);
    
    if (!results || results.length === 0) {
      console.log("No event data found in the database");
      // Return empty data array rather than error when no results found
      sendJsonResponse(res, 200, { success: true, data: [] });
      return;
    }

    // Apply post-query filters that can't be done easily in SQL
    let filteredResults = results;
    
    if (minAttendees !== undefined) {
      const minValue = parseInt(minAttendees);
      console.log(`Filtering by min attendees: ${minValue}`);
      filteredResults = filteredResults.filter(
        event => event.RegisteredAttendees >= minValue
      );
    }
    
    if (maxAttendees !== undefined) {
      const maxValue = parseInt(maxAttendees);
      console.log(`Filtering by max attendees: ${maxValue}`);
      filteredResults = filteredResults.filter(
        event => event.RegisteredAttendees <= maxValue
      );
    }

    // Format dates for frontend display and calculate enhanced metrics
    filteredResults = filteredResults.map(event => {
      // Log each event for debugging
      console.log(`Processing event ${event.EventID}: ${event.EventName}`);
      
      // Calculate attendance and check-in rates
      const attendanceRate = event.MaxAttendees > 0 
        ? parseFloat(((event.RegisteredAttendees / event.MaxAttendees) * 100).toFixed(1)) 
        : 0;
      
      const checkInRate = event.RegisteredAttendees > 0 
        ? parseFloat(((event.CheckedInAttendees / event.RegisteredAttendees) * 100).toFixed(1)) 
        : 0;
      
      // Calculate room utilization
      const roomUtilization = event.RoomCapacity > 0 && event.MaxAttendees > 0
        ? parseFloat(((event.MaxAttendees / event.RoomCapacity) * 100).toFixed(1))
        : 0;
      
      // Format event duration for display
      let eventDuration = "Unknown";
      if (event.EventDurationHours != null) {
        if (event.EventDurationDays >= 1) {
          eventDuration = `${event.EventDurationDays} day(s), ${event.EventDurationHours % 24} hr(s)`;
        } else {
          eventDuration = `${event.EventDurationHours} hour(s)`;
        }
      }
      
      return {
        ...event,
        StartAt: event.StartAt ? new Date(event.StartAt).toISOString() : null,
        EndAt: event.EndAt ? new Date(event.EndAt).toISOString() : null,
        EarliestCheckIn: event.EarliestCheckIn ? new Date(event.EarliestCheckIn).toISOString() : null,
        LatestCheckIn: event.LatestCheckIn ? new Date(event.LatestCheckIn).toISOString() : null,
        AttendanceRate: attendanceRate,
        CheckInRate: checkInRate,
        RoomUtilization: roomUtilization,
        EventDuration: eventDuration
      };
    });

    // Additional analytics for the report
    const analytics = {
      totalEvents: filteredResults.length,
      totalRegistrations: filteredResults.reduce((sum, event) => sum + event.RegisteredAttendees, 0),
      totalCheckIns: filteredResults.reduce((sum, event) => sum + event.CheckedInAttendees, 0),
      averageAttendance: filteredResults.length > 0 
        ? (filteredResults.reduce((sum, event) => sum + event.RegisteredAttendees, 0) / filteredResults.length).toFixed(1) 
        : 0,
      averageCheckInRate: filteredResults.length > 0 
        ? (filteredResults.reduce((sum, event) => sum + event.CheckInRate, 0) / filteredResults.length).toFixed(1) 
        : 0
    };

    console.log(`Event report generated with ${filteredResults.length} records after filtering`);
    sendJsonResponse(res, 200, { 
      success: true, 
      data: filteredResults,
      analytics: analytics 
    });
  });
};

module.exports = {
  getDataReport,
  getFineReport: fineReport,  // alias fineReport as getFineReport
  addRoom,
  getEventReport
};
