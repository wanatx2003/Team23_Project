const { updateHoldStatusAndNotify, sendEmail } = require("../emailService");
const { Client } = require("pg");
const nodemailer = require("nodemailer");

jest.mock("pg", () => {
  const mClient = { connect: jest.fn(), query: jest.fn(), end: jest.fn() };
  return { Client: jest.fn(() => mClient) };
});

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((opts, cb) => cb(null, { response: "SENT" }))
  })
}));

describe("emailService", () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = new Client();
  });

  test("sendEmail calls nodemailer correctly", () => {
    sendEmail("x@test.com","Hi","Body");

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "x@test.com",
        subject: "Hi",
        text: "Body"
      }),
      expect.any(Function)
    );
  });

  test("updateHoldStatusAndNotify updates hold + emails user", async () => {
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ Email: "test@example.com" }] });

    await updateHoldStatusAndNotify(1, 10);

    expect(mockClient.query).toHaveBeenCalledWith(
      "UPDATE holds SET HoldStatus = 'Active' WHERE HoldID = $1",
      [10]
    );

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    expect(mockClient.end).toHaveBeenCalled();
  });

  test("no email if user not found", async () => {
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] });

    await updateHoldStatusAndNotify(1,10);

    expect(nodemailer.createTransport().sendMail).not.toHaveBeenCalled();
  });

  test("handles DB error", async () => {
    mockClient.query.mockRejectedValueOnce(new Error("fail"));
    await updateHoldStatusAndNotify(1,10);
    expect(mockClient.end).toHaveBeenCalled();
  });
});
