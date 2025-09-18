const { createPool } = require('mysql2');

// Database connection
const pool = createPool({
  host: "team7library.mysql.database.azure.com",
  user: "Team7Admin",
  password: "Admin123uma",
  database: "librarynew",
  connectionLimit: 5,
  ssl: {
    rejectUnauthorized: true // Ensures SSL is used
  }
});

module.exports = pool;
