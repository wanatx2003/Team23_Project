// __tests__/emailService.test.js

// ---------------------------------------------------
//  Mock nodemailer
// ---------------------------------------------------
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((opts, cb) => cb(null, { response: "SENT" }))
  })
}));

// ---------------------------------------------------
//  Mock pg (virtual because pg is not installed)
// ---------------------------------------------------
jest.mock(
  "pg",
  () => {
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn()
    };
    return { Client: jest.fn(() => mockClient) };
  },
  { virtual: true }
);

// ---------------------------------------------------
//  NOW import modules after mocks
// ---------------------------------------------------
const nodemailer = require("nodemailer");
const { Client } = require("pg");
const { updateHoldStatusAndNotify } = require("../emailService");

// Silence console output
let logSpy, errorSpy;

beforeEach(() => {
  jest.clearAllMocks();
  logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

let mockClient;

beforeEach(() => {
  mockClient = new Client();
});

describe("emailService", () => {

  test("updateHoldStatusAndNotify updates DB and emails user", async () => {
    // Mock DB update + fetch user email
    mockClient.query
      .mockResolvedValueOnce({})  // UPDATE
      .mockResolvedValueOnce({ rows: [{ Email: "test@example.com" }] }); // SELECT email

    await updateHoldStatusAndNotify(1, 10);

    // DB update
    expect(mockClient.query).toHaveBeenCalledWith(
      "UPDATE holds SET HoldStatus = 'Active' WHERE HoldID = $1",
      [10]
    );

    // Nodemailer should send email
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();

    // DB connection closed
    expect(mockClient.end).toHaveBeenCalled();
  });

  test("no email is sent if user not found", async () => {
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] }); // No user email

    await updateHoldStatusAndNotify(1, 10);

    expect(nodemailer.createTransport().sendMail).not.toHaveBeenCalled();
  });

  test("handles DB error gracefully", async () => {
    mockClient.query.mockRejectedValueOnce(new Error("fail"));

    await updateHoldStatusAndNotify(1, 10);

    // Should log the failure
    expect(console.error).toHaveBeenCalled();

    // DB connection closed
    expect(mockClient.end).toHaveBeenCalled();
  });
});
