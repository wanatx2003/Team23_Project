// __tests__/emailNotificationService.test.js
jest.mock("mysql2", () => ({
  createPool: jest.fn().mockReturnValue({
    promise: () => ({
      query: mockQuery
    })
  })
}));

jest.mock("../sendEmail", () => jest.fn());

const sendEmail = require("../sendEmail");
const { startEmailNotificationService } = require("../emailNotificationService");

let mockQuery;
let consoleLogSpy;
let consoleErrorSpy;

beforeEach(() => {
  jest.useFakeTimers();
  mockQuery = jest.fn();
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Email Notification Service", () => {
  test("processes pending email notifications & updates DB", async () => {
    // Mock DB select + update
    mockQuery
      .mockResolvedValueOnce([
        [
          {
            NotificationID: 1,
            Email: "test@example.com",
            Subject: "Hello",
            Body: "Test body",
          },
        ],
      ])
      .mockResolvedValueOnce([{}]); // DB UPDATE response

    sendEmail.mockResolvedValueOnce(true);

    const service = startEmailNotificationService(5000);

    // Run immediate run + interval execution logic
    await Promise.resolve(); // allow pending async
    jest.runOnlyPendingTimers();

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Hello",
      "Test body"
    );

    // Expect DB update called
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE email_notifications SET Acknowledged = 1 WHERE NotificationID = ?",
      [1]
    );

    service.stop();
  });

  test("logs when no new email notifications exist", async () => {
    mockQuery.mockResolvedValueOnce([[]]); // no rows

    const service = startEmailNotificationService(5000);

    await Promise.resolve();
    jest.runOnlyPendingTimers();

    expect(consoleLogSpy).toHaveBeenCalledWith("No new email notifications found");

    service.stop();
  });

  test("handles error during DB fetch", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const service = startEmailNotificationService(5000);

    await Promise.resolve();
    jest.runOnlyPendingTimers();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error processing email notifications:",
      expect.any(Error)
    );

    service.stop();
  });

  test("stop() clears interval", () => {
    const clearSpy = jest.spyOn(global, "clearInterval");
    const service = startEmailNotificationService(5000);

    service.stop();

    expect(clearSpy).toHaveBeenCalled();
  });
});
