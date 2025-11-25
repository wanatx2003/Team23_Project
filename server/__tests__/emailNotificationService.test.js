// __tests__/emailNotificationService.test.js

// -----------------------------
//  GLOBAL MOCKS (run first)
// -----------------------------
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "mocked" })
  })
}));

jest.mock("../sendEmail", () => jest.fn());

// Mock MySQL client BEFORE loading service
let mockQuery;
jest.mock("mysql2", () => ({
  createPool: jest.fn().mockReturnValue({
    promise: () => ({
      query: (...args) => mockQuery(...args)
    })
  })
}));

const sendEmail = require("../sendEmail");
const { startEmailNotificationService } = require("../emailNotificationService");

let consoleLogSpy;
let consoleErrorSpy;

// -----------------------------
beforeEach(() => {
  jest.useFakeTimers();
  mockQuery = jest.fn();
  jest.clearAllMocks();

  consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
});

// -----------------------------
//     TESTS
// -----------------------------
describe("Email Notification Service", () => {

  test("processes pending email notifications & updates DB", async () => {
    mockQuery
      .mockResolvedValueOnce([
        [
          {
            NotificationID: 1,
            Email: "test@example.com",
            Subject: "Hello",
            Body: "Test body"
          }
        ]
      ])
      .mockResolvedValueOnce([{}]);

    sendEmail.mockResolvedValueOnce(true);

    const service = startEmailNotificationService(5000);

    await Promise.resolve();  
    jest.runOnlyPendingTimers();

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Hello",
      "Test body"
    );

    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE email_notifications SET Acknowledged = 1 WHERE NotificationID = ?",
      [1]
    );

    service.stop();
  });

  test("logs when no new email notifications exist", async () => {
    mockQuery.mockResolvedValueOnce([[]]);

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

    expect(consoleErrorSpy).toHaveBeenCalled();

    service.stop();
  });

  test("stop() clears interval", () => {
    const clearSpy = jest.spyOn(global, "clearInterval");
    const service = startEmailNotificationService(5000);

    service.stop();

    expect(clearSpy).toHaveBeenCalled();
  });
});
