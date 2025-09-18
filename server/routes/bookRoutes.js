const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage – files will be stored in a 'public/images/books' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/public/images/books'));
  },
  filename: (req, file, cb) => {
    // Use Date.now() to generate a unique filename
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Get all books
const getRawBook = (req, res) => {
  console.log("Fetching all book items");

  const query = `
    SELECT 
      B.BookID, 
      B.Title,
      B.Author,
      B.Genre,
      B.PublicationYear,
      B.Publisher,
      B.Language,
      B.Format,
      B.ISBN,
      I.TotalCopies, 
      I.AvailableCopies,
      I.ShelfLocation
    FROM BOOK AS B
    JOIN BOOK_INVENTORY AS I ON B.BookID = I.BookID
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error executing book query:", err);
      sendJsonResponse(res, 500, { success: false, error: "Internal server error" });
      return;
    }

    console.log("Query executed successfully. Results:", results);
    sendJsonResponse(res, 200, { success: true, book: results });
  });
};

const getAllBooks = (req, res) => {
  console.log("Fetching all books");

  pool.query(
    "SELECT B.BookID, B.Title, B.Author, B.Genre, B.PublicationYear, I.AvailableCopies FROM BOOK AS B, BOOK_INVENTORY AS I WHERE B.BookID = I.BookID",
    (err, results) => {
      if (err) {
        console.error("Error executing books query:", err);
        sendJsonResponse(res, 500, { error: "Internal server error" });
        return;
      }

      const books = results.map((book) => ({
        bookID: book.BookID,
        title: book.Title,
        author: book.Author,
        genre: book.Genre,
        year: book.PublicationYear,
        copies: book.AvailableCopies,
        isLoaned: false, // Default values for non-logged in users
        userHasHold: false,
        otherUserHasHold: false,
      }));

      console.log(`Sending ${books.length} books to frontend`);
      sendJsonResponse(res, 200, books);
    }
  );
};

// Get books for a specific user
const getUserBooks = (req, res, userId) => {
  console.log(`Fetching books for user ID: ${userId}`);

  const query = `
    SELECT 
      B.BookID, 
      B.Title, 
      B.Author, 
      B.Genre, 
      B.PublicationYear, 
      I.AvailableCopies,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM LOAN AS L 
          WHERE L.ItemID = B.BookID 
            AND L.ItemType = 'Book' 
            AND L.ReturnedAt IS NULL
        ) THEN 1
        ELSE 0
      END AS isLoaned,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM HOLD AS H 
          WHERE H.ItemID = B.BookID 
            AND H.ItemType = 'Book' 
            AND H.HoldStatus = 'Active'
            AND H.UserID = ?
        ) THEN 1
        ELSE 0
      END AS UserHasHold,
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM HOLD AS H 
          WHERE H.ItemID = B.BookID 
            AND H.ItemType = 'Book' 
            AND H.HoldStatus = 'Active'
            AND H.UserID != ?
        ) THEN 1
        ELSE 0
      END AS OtherUserHasHold
    FROM BOOK AS B
    LEFT JOIN BOOK_INVENTORY AS I ON B.BookID = I.BookID
  `;

  pool.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching books for user:", err);
      sendJsonResponse(res, 500, { error: "Internal server error" });
      return;
    }

    const books = results.map((book) => ({
      bookID: book.BookID,
      title: book.Title,
      author: book.Author,
      genre: book.Genre,
      year: book.PublicationYear,
      copies: book.AvailableCopies,
      isLoaned: book.isLoaned === 1,
      userHasHold: book.UserHasHold === 1,
      otherUserHasHold: book.OtherUserHasHold === 1,
    }));

    console.log(`Sending ${books.length} books for user ${userId}`);
    sendJsonResponse(res, 200, books);
  });
};

// Add a new book
const addBook = async (req, res) => {
  try {
    // Use multer to process the cover image upload
    upload.single('coverImage')(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return sendJsonResponse(res, 500, { success: false, error: "File upload error" });
      }
      // Ensure req.body is not undefined
      const body = req.body || {};
      // Destructure text fields from req.body (defaults to undefined if not present)
      const {
        Title,
        Author,
        Genre,
        PublicationYear,
        Publisher,
        Language,
        Format,
        ISBN,
        TotalCopies,
        AvailableCopies,
        ShelfLocation
      } = body;
      
      if (!Title) {
        // Optionally, if required fields are missing then interpret as an error
        console.error("Missing Title in request body");
      }
      
      // Insert the book record; note that no cover image info is saved in the DB.
      const query =
        "INSERT INTO BOOK (Title, Author, Genre, PublicationYear, Publisher, Language, Format, ISBN) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      pool.query(
        query,
        [Title, Author, Genre, PublicationYear, Publisher, Language, Format, ISBN],
        (err, results) => {
          if (err) {
            console.error("Error adding book:", err);
          }
          const BookID = results.insertId;

          // If a cover image file was uploaded, rename it to match the new BookID.
          if (req.file) {
            const oldPath = req.file.path;
            const newPath = req.file.destination + "/" + BookID + ".jpg";
            fs.rename(oldPath, newPath, (renameErr) => {
              if (renameErr) {
                console.error("Error renaming file:", renameErr);
                // Continue on even if renaming fails.
              }
            });
          }

          // Insert the inventory record.
          const inventoryQuery =
            "INSERT INTO BOOK_INVENTORY (BookID, TotalCopies, AvailableCopies, ShelfLocation) VALUES (?, ?, ?, ?)";
          pool.query(
            inventoryQuery,
            [BookID, TotalCopies, AvailableCopies, ShelfLocation],
            (invErr, inventoryResults) => {
              if (invErr) {
                console.error("Error updating inventory:", invErr);
                return sendJsonResponse(res, 500, { success: false, error: "Failed to update inventory" });
              }
              sendJsonResponse(res, 200, { success: true, BookID });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error in addBook:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

//updateBook
const updateBook = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    console.log("Updating book with data:", data);

    const { BookID } = data;
    if (!BookID) {
      sendJsonResponse(res, 400, { success: false, error: "BookID is required" });
      return;
    }

    const bookFields = ["Title", "Author", "Genre", "PublicationYear", "Publisher", "Language", "Format", "ISBN"];
    const inventoryFields = ["TotalCopies", "AvailableCopies", "ShelfLocation"];

    const bookUpdates = [];
    const bookValues = [];
    bookFields.forEach(field => {
      if (data[field] !== undefined) {
        bookUpdates.push(`${field} = ?`);
        bookValues.push(data[field]);
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

    if (bookUpdates.length > 0) {
      const bookQuery = `UPDATE BOOK SET ${bookUpdates.join(", ")} WHERE BookID = ?`;
      updateQueries.push(new Promise((resolve, reject) => {
        pool.query(bookQuery, [...bookValues, BookID], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }));
    }

    if (inventoryUpdates.length > 0) {
      const inventoryQuery = `UPDATE BOOK_INVENTORY SET ${inventoryUpdates.join(", ")} WHERE BookID = ?`;
      updateQueries.push(new Promise((resolve, reject) => {
        pool.query(inventoryQuery, [...inventoryValues, BookID], (err, result) => {
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

    sendJsonResponse(res, 200, { success: true, message: "Book updated successfully" });
  } catch (error) {
    console.error("Error in updateBook:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { BookID } = data;

    if (!BookID) {
      sendJsonResponse(res, 400, { success: false, error: "BookID is required" });
      return;
    }

    console.log(`Deleting book with BookID: ${BookID}`);

    const deleteQuery = "DELETE FROM BOOK WHERE BookID = ?";
    pool.query(deleteQuery, [BookID], (err, result) => {
      if (err) {
        console.error("Error deleting book:", err);
        sendJsonResponse(res, 500, { success: false, error: "Failed to delete book" });
        return;
      }

      if (result.affectedRows === 0) {
        sendJsonResponse(res, 404, { success: false, error: "Book not found" });
        return;
      }

      sendJsonResponse(res, 200, {
        success: true,
        message: "Book deleted successfully",
        deletedDeviceId: BookID,
      });
    });
  } catch (error) {
    console.error("Error in deleteBook:", error);
    sendJsonResponse(res, 500, { success: false, error: "Server error" });
  }
};

module.exports = {
  getRawBook,
  getAllBooks,
  getUserBooks,
  addBook,
  updateBook,
  deleteBook,
};
