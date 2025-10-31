jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn(),
}));

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");
const {
  getUserNotifications,
  markNotificationRead,
  createNotification,
  getUnreadCount,
} = require("../routes/notificationRoutes");

beforeEach(() => {
  jest.clearAllMocks();
});


describe("Notification Routes", () => {

  // ---------------- GET USER NOTIFICATIONS ----------------
  test("getUserNotifications returns notifications", () => {
    const req = {}, res = {};
    
    pool.query.mockImplementation((q, params, cb) =>
      cb(null, [{ NotificationID: 1, Subject: "Test" }])
    );

    getUserNotifications(req, res, 5);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success: true, notifications: [{ NotificationID: 1, Subject: "Test" }] }
    );
  });

  test("getUserNotifications handles db error", () => {
    const req = {}, res = {};

    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("DB error"), null)
    );

    getUserNotifications(req, res, 5);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Internal server error" }
    );
  });


  // ---------------- MARK NOTIFICATION READ ----------------
  test("markNotificationRead updates notification", async () => {
    const req = {}, res = {};
    
    parseRequestBody.mockResolvedValue({ NotificationID: 10 });

    pool.query.mockImplementation((q, params, cb) =>
      cb(null, { affectedRows: 1 })
    );

    await markNotificationRead(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success: true, message: "Notification marked as read" }
    );
  });

  test("markNotificationRead handles db error", async () => {
    const req = {}, res = {};
    
    parseRequestBody.mockResolvedValue({ NotificationID: 10 });

    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("DB error"), null)
    );

    await markNotificationRead(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Failed to update notification" }
    );
  });


  // ---------------- CREATE NOTIFICATION ----------------
  test("createNotification resolves insert ID", async () => {
    pool.query.mockImplementation((q, params, cb) =>
      cb(null, { insertId: 77 })
    );

    const id = await createNotification(1, "Hi", "Msg", "alert");
    expect(id).toBe(77);
  });

  test("createNotification rejects on DB error", async () => {
    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("DB error"), null)
    );

    await expect(
      createNotification(1, "Hi", "Msg", "alert")
    ).rejects.toThrow("DB error");
  });


  // ---------------- GET UNREAD COUNT ----------------
  test("getUnreadCount returns count", () => {
    const req = {}, res = {};

    pool.query.mockImplementation((q, params, cb) =>
      cb(null, [{ unreadCount: 3 }])
    );

    getUnreadCount(req, res, 2);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success: true, unreadCount: 3 }
    );
  });

  test("getUnreadCount handles db error", () => {
    const req = {}, res = {};

    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("DB fail"), null)
    );

    getUnreadCount(req, res, 2);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Internal server error" }
    );
  });

});
