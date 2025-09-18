const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
  }
});

// Fetch all rooms
const getRooms = (req, res) => {
  pool.query("SELECT * FROM rooms", (err, results) => {
    if (err) {
      console.error("Error fetching rooms:", err);
      sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch rooms",
      });
      return;
    }
    sendJsonResponse(res, 200, { success: true, rooms: results });
  });
};

const addRoom = async (req, res) => {
  try {
    const { RoomNumber, RoomName, Capacity, Notes } = await parseRequestBody(
      req
    );
    console.log("Request body:", { RoomNumber, RoomName, Capacity, Notes }); // Debugging log
    const query = `
      INSERT INTO rooms (RoomNumber, RoomName, Capacity, Notes)
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

// Borrow a room
const borrowRoom = async (req, res) => {
  try {
    const { RoomID, UserID, Duration } = await parseRequestBody(req);
    console.log("Borrowing room:", { RoomID, UserID, Duration }); // Debugging log

    // Check if the room is available
    const checkQuery = `
      SELECT * FROM rooms WHERE RoomID = ? AND IsAvailable = 1
    `;
    pool.query(checkQuery, [RoomID], (err, results) => {
      console.log("Check query results:", results); // Debugging log
      if (err || results.length === 0) {
        console.error("Room is not available or error occurred:", err);
        sendJsonResponse(res, 400, {
          success: false,
          error: "Room is not available",
        });
        return;
      }

      // Mark the room as reserved
      const reserveQuery = `
        UPDATE rooms SET IsAvailable = 0 WHERE RoomID = ?
      `;
      pool.query(reserveQuery, [RoomID], (err) => {
        if (err) {
          console.error("Error reserving room:", err);
          sendJsonResponse(res, 500, {
            success: false,
            error: "Failed to reserve room",
          });
          return;
        }

        // Insert a record into the ROOM_BORROWINGS table
        const borrowQuery = `
          INSERT INTO ROOM_BORROWINGS (RoomID, UserID, StartTime, EndTime)
          VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? HOUR))
        `;
        pool.query(borrowQuery, [RoomID, UserID, Duration], (err) => {
          if (err) {
            console.error("Error creating borrow record:", err);
            sendJsonResponse(res, 500, {
              success: false,
              error: "Failed to borrow room",
            });
            return;
          }

          sendJsonResponse(res, 200, { success: true });
        });
      });
    });
  } catch (error) {
    console.error("Error in borrowRoom:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

// Reserve a room
const reserveRoom = async (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      const { RoomID, UserID, Duration } = JSON.parse(body);

      if (!RoomID || !UserID || !Duration) {
        console.error("Missing required fields in request body:", {
          RoomID,
          UserID,
          Duration,
        });
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Invalid request body" })
        );
        return;
      }

      // NEW: Check if the user already has an active reservation
      const checkUserReservationQuery = `
        SELECT * FROM ROOM_RESERVATIONS 
        WHERE UserID = ? AND EndAT > NOW()
      `;
      const [existingReservations] = await pool
        .promise()
        .query(checkUserReservationQuery, [UserID]);
      if (existingReservations.length > 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "You already have a reserved room.",
          })
        );
        return;
      }

      // Check if the room is available
      const checkQuery = `
        SELECT * FROM rooms WHERE RoomID = ? AND IsAvailable = 1
      `;
      pool.query(checkQuery, [RoomID], (err, results) => {
        console.log("Check query results:", results); // Debugging log
        if (err || results.length === 0) {
          console.error("Room is not available or error occurred:", err);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Room is not available" })
          );
          return;
        }

        // Mark the room as reserved
        const reserveQuery = `
          UPDATE rooms SET IsAvailable = 0 WHERE RoomID = ?
        `;
        pool.query(reserveQuery, [RoomID], (err) => {
          if (err) {
            console.error("Error reserving room:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                error: "Failed to reserve room",
              })
            );
            return;
          }

          // Insert a record into the ROOM_RESERVATIONS table
          const reservationQuery = `
            INSERT INTO ROOM_RESERVATIONS (RoomID, UserID, StartAT, EndAT)
            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))
          `;
          pool.query(reservationQuery, [RoomID, UserID, Duration], (err) => {
            if (err) {
              console.error("Error creating reservation record:", err);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  error: "Failed to reserve room",
                })
              );
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in reserveRoom:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Server error" }));
  }
};

const releaseExpiredReservations = async () => {
  let connection = null;
  try {
    console.log("Running expired reservations cleanup...");

    connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    // Check if IsAvailable column exists in rooms table
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'rooms' AND COLUMN_NAME = 'IsAvailable'
    `);
    const hasIsAvailableColumn = columns.length > 0;

    if (!hasIsAvailableColumn) {
      console.log("IsAvailable column not found in rooms table. Adding the column...");
      await connection.query(`
        ALTER TABLE rooms
        ADD COLUMN IsAvailable BOOLEAN DEFAULT 1
      `);
      console.log("IsAvailable column added to rooms table");
    }

    // 1. Find all expired reservations (before deleting them)
    const [expiredReservations] = await connection.query(`
      SELECT RoomID FROM room_reservation WHERE EndAt <= NOW()
    `);

    if (expiredReservations.length === 0) {
      console.log("No expired reservations found");
      await connection.commit();
      return;
    }

    // 2. Set rooms as available for all expired reservations
    const roomIds = expiredReservations.map(r => r.RoomID);
    if (roomIds.length > 0) {
      await connection.query(
        `UPDATE rooms SET IsAvailable = 1 WHERE RoomID IN (${roomIds.map(() => '?').join(',')})`,
        roomIds
      );
      console.log(`Set IsAvailable=1 for RoomIDs: ${roomIds.join(', ')}`);
    }

    // 3. Delete expired reservations
    const [deleteResult] = await connection.query(
      `DELETE FROM room_reservation WHERE EndAt <= NOW()`
    );
    console.log(`Deleted ${deleteResult.affectedRows} expired reservations`);

    await connection.commit();
    console.log("Room cleanup transaction completed successfully");
  } catch (err) {
    console.error("Error processing expired reservations:", err);
    if (connection) {
      try {
        await connection.rollback();
        console.log("Transaction rolled back due to error");
      } catch (rollbackErr) {
        console.error("Error during rollback:", rollbackErr);
      }
    }
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseErr) {
        console.error("Error releasing connection:", releaseErr);
      }
    }
  }
};

const cancelReservation = async (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const { RoomID, UserID } = JSON.parse(body);

      if (!RoomID || !UserID) {
        console.error("Missing required fields in request body:", {
          RoomID,
          UserID,
        });
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "Invalid request body" })
        );
        return;
      }

      console.log("Cancelling reservation for room:", { RoomID, UserID });

      // Delete the reservation from ROOM_RESERVATIONS
      const deleteQuery = `
        DELETE FROM ROOM_RESERVATIONS
        WHERE RoomID = ? AND UserID = ?
      `;
      pool.query(deleteQuery, [RoomID, UserID], (err, results) => {
        if (err || results.affectedRows === 0) {
          console.error(
            "Error cancelling reservation or no reservation found:",
            err
          );
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ success: false, error: "Reservation not found" })
          );
          return;
        }

        // Mark the room as available in rooms
        const updateQuery = `
          UPDATE rooms SET IsAvailable = 1 WHERE RoomID = ?
        `;
        pool.query(updateQuery, [RoomID], (err) => {
          if (err) {
            console.error("Error updating room availability:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                error: "Failed to update room availability",
              })
            );
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        });
      });
    });
  } catch (error) {
    console.error("Error in cancelReservation:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Server error" }));
  }
};

const updateRoom = async (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const { RoomID, RoomName, Capacity, Notes, IsAvailable } =
        JSON.parse(body);

      if (!RoomID) {
        console.error("RoomID is required to update a room.");
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, error: "RoomID is required." })
        );
        return;
      }

      const updateQuery = `
        UPDATE rooms
        SET RoomName = ?, Capacity = ?, Notes = ?, IsAvailable = ?
        WHERE RoomID = ?
      `;

      pool.query(
        updateQuery,
        [RoomName, Capacity, Notes, IsAvailable, RoomID],
        (err, results) => {
          if (err || results.affectedRows === 0) {
            console.error("Error updating room or no rows affected:", err);
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ success: false, error: "Room not found" })
            );
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              message: "Room updated successfully.",
            })
          );
        }
      );
    });
  } catch (error) {
    console.error("Error in updateRoom:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Server error." }));
  }
};

// Get user's active room reservations
const getUserReservations = (req, res) => {
  // Extract userId from the URL path
  const urlParts = req.url.split("/");
  const userId = urlParts[urlParts.length - 1];

  if (!userId || isNaN(parseInt(userId))) {
    sendJsonResponse(res, 400, {
      success: false,
      error: "Valid User ID is required",
    });
    return;
  }

  const query = `
    SELECT r.RoomID, r.RoomNumber, r.RoomName, r.Capacity, r.Notes,
           res.RoomReservationID, res.UserID, res.StartAt, res.EndAt
    FROM ROOM_RESERVATIONS res
    JOIN rooms r ON res.RoomID = r.RoomID
    WHERE res.UserID = ? AND res.EndAt > NOW()
    ORDER BY res.StartAt ASC
  `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user reservations:", err);
      sendJsonResponse(res, 500, {
        success: false,
        error: "Failed to fetch reservations",
      });
      return;
    }
    sendJsonResponse(res, 200, { success: true, reservations: results });
  });
};

module.exports = {
  getRooms,
  addRoom,
  borrowRoom,
  reserveRoom,
  releaseExpiredReservations,
  cancelReservation,
  updateRoom,
  getUserReservations, // Add this new export
};
