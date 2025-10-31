jest.mock("mysql2", () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn((cb) => cb(null, { threadId: 123, release: jest.fn() }))
  }))
}));

const mysql = require("mysql2");

describe("Database Pool Configuration", () => {
  test("should create MySQL pool with correct config", () => {
    jest.isolateModules(() => {
      require("../config/db"); // Import your db config file
    });

    expect(mysql.createPool).toHaveBeenCalledWith({
      host: "127.0.0.1",
      user: "root",
      password: "!Mm042326323",   // consider using env var
      database: "volunteer_management",
      port: 3306,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });
  });

  test("should try to get connection from pool", () => {
    const mockPool = {
      getConnection: jest.fn((cb) => cb(null, { threadId: 123, release: jest.fn() }))
    };

    mysql.createPool.mockReturnValue(mockPool);

    jest.isolateModules(() => {
      require("../config/db");
    });

    expect(mockPool.getConnection).toHaveBeenCalled();
  });
});
