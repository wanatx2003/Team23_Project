/**
 * Unit test for db.js WITHOUT modifying the actual db.js file.
 */

jest.mock("mysql2", () => {
  const mockPool = {
    getConnection: jest.fn((cb) =>
      cb(null, { threadId: 123, release: jest.fn() })
    )
  };

  return {
    createPool: jest.fn(() => mockPool)
  };
});

const mysql = require("mysql2");

describe("Database Pool Configuration (Real db.js unchanged)", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Prevent console output noise
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("should create MySQL pool with the SAME config used in db.js", () => {
    jest.isolateModules(() => {
      require("../config/db");
    });

    expect(mysql.createPool).toHaveBeenCalledWith({
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
  });

  test("should test the DB connection and call release()", () => {
    const mockConnection = { threadId: 123, release: jest.fn() };
    const mockPool = {
      getConnection: jest.fn((cb) => cb(null, mockConnection))
    };

    // Mock pool from mysql.createPool()
    mysql.createPool.mockReturnValue(mockPool);

    jest.isolateModules(() => {
      require("../config/db");
    });

    expect(mockPool.getConnection).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Connected to MySQL database as ID " + mockConnection.threadId
    );
  });

  test("should log specific error messages on connection error", () => {
    const err = { code: "ECONNREFUSED" };

    const mockPool = {
      getConnection: jest.fn((cb) => cb(err, null))
    };

    mysql.createPool.mockReturnValue(mockPool);

    jest.isolateModules(() => {
      require("../config/db");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error connecting to MySQL database:",
      err
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Database connection was refused."
    );
  });
});
