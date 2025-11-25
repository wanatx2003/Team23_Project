jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn(),
}));

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

const {
  createNotificationEndpoint,
  sendEventReminders,
} = require("../routes/notificationRoutes");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Notification Routes — EXTRA COVERAGE", () => {
  // -------------------------------------------------------
  // 1. createNotificationEndpoint — missing fields branch
  // -------------------------------------------------------
  test("createNotificationEndpoint returns 400 when missing required fields", async () => {
    parseRequestBody.mockResolvedValue({}); // missing all fields

    await createNotificationEndpoint({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ success: false })
    );
  });

  // -------------------------------------------------------
  // 2. createNotificationEndpoint — success flow
  // -------------------------------------------------------
  test("createNotificationEndpoint creates notification", async () => {
    parseRequestBody.mockResolvedValue({
      UserID: 1,
      Subject: "Hello",
      Message: "World",
      NotificationType: "alert",
    });

    pool.query.mockImplementation((q, p, cb) =>
      cb(null, { insertId: 55 })
    );

    await createNotificationEndpoint({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        notificationID: 55,
      })
    );
  });

  // -------------------------------------------------------
  // 3. createNotificationEndpoint — DB error flow
  // -------------------------------------------------------
  test("createNotificationEndpoint handles DB error", async () => {
    parseRequestBody.mockResolvedValue({
      UserID: 2,
      Subject: "Test",
      Message: "Message",
      NotificationType: "alert",
    });

    pool.query.mockImplementation((q, p, cb) =>
      cb(new Error("DB fail"))
    );

    await createNotificationEndpoint({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ success: false })
    );
  });

  // -------------------------------------------------------
  // 4. sendEventReminders — NO upcoming events
  // -------------------------------------------------------
  test("sendEventReminders returns 200 when no reminders needed", () => {
    pool.query.mockImplementation((q, cb) => cb(null, []));

    sendEventReminders({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        message: "No reminders to send",
        count: 0,
      })
    );
  });

  // -------------------------------------------------------
  // 5. sendEventReminders — reminder success
  // -------------------------------------------------------
  test("sendEventReminders sends reminders successfully", () => {
    // first query returns one event
    pool.query
      .mockImplementationOnce((q, cb) =>
        cb(null, [
          {
            VolunteerID: 9,
            EventID: 1,
            EventName: "Cleanup",
            EventDate: "2025-03-01",
            StartTime: "10:00",
            Location: "Houston",
          },
        ])
      )
      // second query (insert notification)
      .mockImplementationOnce((q, params, cb) => cb(null, {}));

    sendEventReminders({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        message: "Reminders sent successfully",
        count: 1,
      })
    );
  });

  // -------------------------------------------------------
  // 6. sendEventReminders — error in notification insert
  // -------------------------------------------------------
  test("sendEventReminders handles notification insert error", () => {
    pool.query
      .mockImplementationOnce((q, cb) =>
        cb(null, [
          {
            VolunteerID: 9,
            EventID: 1,
            EventName: "Cleanup",
            EventDate: "2025-03-01",
            StartTime: "10:00",
            Location: "Houston",
          },
        ])
      )
      .mockImplementationOnce((q, p, cb) =>
        cb(new Error("notif fail"))
      );

    sendEventReminders({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ success: false })
    );
  });

  // -------------------------------------------------------
  // 7. sendEventReminders — error in FIRST query
  // -------------------------------------------------------
  test("sendEventReminders handles DB error for events", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(new Error("DB fail"), null)
    );

    sendEventReminders({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ success: false })
    );
  });
});

