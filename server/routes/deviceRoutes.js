const pool = require("../config/db");
const { sendJsonResponse, parseRequestBody } = require("../utils/requestUtils");

// Get all device items with inventory information
const getAllDevice = (req, res) => {
  console.log("Fetching all device items");

  const query = `
    SELECT 
      D.DeviceID, 
      D.Type,
      D.Brand, 
      D.Model, 
      D.SerialNumber,
      I.TotalCopies, 
      I.AvailableCopies,
      I.ShelfLocation
    FROM DEVICE AS D
    JOIN DEVICE_INVENTORY AS I ON D.DeviceID = I.DeviceID
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error executing device query:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }

    console.log("Query executed successfully. Results:", results);
    sendJsonResponse(res, 200, { success: true, devices: results });
  });
};

// Add a new device
const addDevice = async (req, res) => {
  try {
    const deviceData = await parseRequestBody(req); // Correctly parse the request body
    console.log("Adding new device:", deviceData);

    const {
      Type,
      Brand,
      Model,
      SerialNumber,
      TotalCopies,
      AvailableCopies,
      ShelfLocation,
    } = deviceData;

    const query =
      "INSERT INTO DEVICE (Type,Brand, Model, SerialNumber) VALUES (?, ?, ?, ?)";
    pool.query(
      query,
      [Type,Brand, Model, SerialNumber],
      (err, results) => {
        if (err) {
          console.error("Error adding device:", err);
          sendJsonResponse(res, 500, { success: false, error: "Database error" });
          return;
        }

        const DeviceID = results.insertId;
        const inventoryQuery =
          "INSERT INTO DEVICE_INVENTORY (DeviceID, TotalCopies, AvailableCopies, ShelfLocation) VALUES (?, ?, ?, ?)";
        pool.query(
          inventoryQuery,
          [DeviceID, TotalCopies, AvailableCopies, ShelfLocation],
          (err) => {
            if (err) {
              console.error("Error updating inventory:", err);
              sendJsonResponse(res, 500, { success: false, error: "Failed to update inventory" });
              return;
            }
            sendJsonResponse(res, 200, { success: true, DeviceID });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error in addDevice:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

const updateDevice = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    console.log("Updating device with data:", data);

    const { DeviceID } = data;
    if (!DeviceID) {
      sendJsonResponse(res, 400, { success: false, error: "DeviceID is required" });
      return;
    }

    const deviceFields = ["Type", "Brand", "Model", "SerialNumber"];
    const inventoryFields = ["TotalCopies", "AvailableCopies", "ShelfLocation"];

    const deviceUpdates = [];
    const deviceValues = [];
    deviceFields.forEach(field => {
      if (data[field] !== undefined) {
        deviceUpdates.push(`${field} = ?`);
        deviceValues.push(data[field]);
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

    if (deviceUpdates.length > 0) {
      const deviceQuery = `UPDATE DEVICE SET ${deviceUpdates.join(", ")} WHERE DeviceID = ?`;
      updateQueries.push(new Promise((resolve, reject) => {
        pool.query(deviceQuery, [...deviceValues, DeviceID], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }));
    }

    if (inventoryUpdates.length > 0) {
      const inventoryQuery = `UPDATE DEVICE_INVENTORY SET ${inventoryUpdates.join(", ")} WHERE DeviceID = ?`;
      updateQueries.push(new Promise((resolve, reject) => {
        pool.query(inventoryQuery, [...inventoryValues, DeviceID], (err, result) => {
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

    sendJsonResponse(res, 200, { success: true, message: "Device updated successfully" });
  } catch (error) {
    console.error("Error in updateDevice:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { DeviceID } = data;

    if (!DeviceID) {
      sendJsonResponse(res, 400, { success: false, error: "DeviceID is required" });
      return;
    }

    console.log(`Deleting device with DeviceID: ${DeviceID}`);

    const deleteQuery = "DELETE FROM DEVICE WHERE DeviceID = ?";
    pool.query(deleteQuery, [DeviceID], (err, result) => {
      if (err) {
        console.error("Error deleting device:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to delete device" });
        return;
      }

      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: "Device not found" });
        return;
      }

      sendJsonResponse(res, 200, {
        success: true,
        message: "Device deleted successfully",
        deletedDeviceId: DeviceID,
      });
    });
  } catch (error) {
    console.error("Error in deleteDevice:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};


module.exports = {
  getAllDevice,
  addDevice,
  updateDevice,
  deleteDevice,
};
