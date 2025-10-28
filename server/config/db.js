const mysql = require('mysql2');

// Create connection pool for local MySQL
const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "!Mm042326323",
  database: "volunteer_management",
  port: 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
  } else {
    console.log('Connected to MySQL database as ID ' + connection.threadId);
    connection.release();
  }
});

module.exports = pool;
