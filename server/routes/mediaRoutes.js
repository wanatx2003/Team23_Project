const pool = require("../config/db");
const { sendJsonResponse, parseRequestBody } = require("../utils/requestUtils");

// Get all media items with inventory information
const getAllMedia = (req, res) => {
  console.log("Fetching all media items");

  const query = `
    SELECT 
      M.MediaID, 
      M.Title, 
      M.Author, 
      M.Genre, 
      M.PublicationYear,
      M.Language,
      M.Type,  
      I.TotalCopies, 
      I.AvailableCopies
    FROM MEDIA AS M
    JOIN MEDIA_INVENTORY AS I ON M.MediaID = I.MediaID
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error executing media query:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }

    console.log(`Sending ${results.length} media items to frontend`);
    sendJsonResponse(res, 200, { success: true, media: results });
  });
};

const addMedia = async (req, res) => {
  try {
    const mediaData = await parseRequestBody(req); // Correctly parse the request body
    console.log("Adding new media:", mediaData);

    const {
      Type,
      Title,
      Author,
      Genre,
      PublicationYear,
      Language,
      TotalCopies,
      AvailableCopies,
    } = mediaData;

    const query =
      "INSERT INTO MEDIA (Type,Title, Author, Genre, PublicationYear, Language) VALUES (?, ?, ?, ?, ?, ?)";
    pool.query(
      query,
      [Type,Title, Author, Genre, PublicationYear, Language],
      (err, results) => {
        if (err) {
          console.error("Error adding media:", err);
          sendJsonResponse(res, 500, { success: false, error: "Database error" });
          return;
        }

        const MediaID = results.insertId;
        const inventoryQuery =
          "INSERT INTO MEDIA_INVENTORY (MediaID, TotalCopies, AvailableCopies) VALUES (?, ?, ?)";
        pool.query(
          inventoryQuery,
          [MediaID, TotalCopies, AvailableCopies],
          (err) => {
            if (err) {
              console.error("Error updating inventory:", err);
              sendJsonResponse(res, 500, { success: false, error: "Failed to update inventory" });
              return;
            }
            sendJsonResponse(res, 200, { success: true, MediaID });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error in addMedia:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

const updateMedia = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    console.log("Updating media with data:", data);

    const { MediaID } = data;
    if (!MediaID) {
      sendJsonResponse(res, 400, { success: false, error: "MediaID is required" });
      return;
    }

    const mediaFields = ["Type","Title", "Author", "Genre", "PublicationYear", "Language"];
    const inventoryFields = ["TotalCopies", "AvailableCopies"];

    const mediaUpdates = [];
    const mediaValues = [];
    mediaFields.forEach(field => {
      if (data[field] !== undefined) {
        mediaUpdates.push(`${field} = ?`);
        mediaValues.push(data[field]);
      }
    });

    const inventoryUpdates = [];
    const inventoryValues = [];
    inventoryFields.forEach(field => {
      if (data[field] !== undefined) {
        inventoryUpdates.push(`${field} = ?`);
        inventoryValues.push(data[field]);
      }
    });

    const updateQueries = [];

    if (mediaUpdates.length > 0) {
      const mediaQuery = `UPDATE MEDIA SET ${mediaUpdates.join(", ")} WHERE MediaID = ?`;
      updateQueries.push(new Promise((resolve, reject) => {
        pool.query(mediaQuery, [...mediaValues, MediaID], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }));
    }

    if (inventoryUpdates.length > 0) {
      const inventoryQuery = `UPDATE MEDIA_INVENTORY SET ${inventoryUpdates.join(", ")} WHERE MediaID = ?`;
      updateQueries.push(new Promise((resolve, reject) => {
        pool.query(inventoryQuery, [...inventoryValues, MediaID], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }));
    }

    if (updateQueries.length === 0) {
      sendJsonResponse(res, 400, { success: false, error: "No valid fields provided to update" });
      return;
    }

    await Promise.all(updateQueries);

    sendJsonResponse(res, 200, { success: true, message: "Media updated successfully" });
  } catch (error) {
    console.error("Error in updateMedia:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { MediaID } = data;

    if (!MediaID) {
      sendJsonResponse(res, 400, { success: false, error: "MediaID is required" });
      return;
    }

    console.log(`Deleting media with MediaID: ${MediaID}`);

    const deleteQuery = "DELETE FROM MEDIA WHERE MediaID = ?";
    pool.query(deleteQuery, [MediaID], (err, result) => {
      if (err) {
        console.error("Error deleting media:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to delete media" });
        return;
      }

      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: "Media not found" });
        return;
      }

      sendJsonResponse(res, 200, {
        success: true,
        message: "Media deleted successfully",
        deletedMediaID: MediaID,
      });
    });
  } catch (error) {
    console.error("Error in deleteMedia:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getAllMedia,
  addMedia,
  updateMedia,
  deleteMedia,
};
