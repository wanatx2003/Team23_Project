const {
  getDataReport,
  getFineReport,
  addRoom,
  getEventReport
} = require("../routes/reportRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

// Silence console during unit tests
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
beforeEach(() => jest.clearAllMocks());

/* -------------------------------------------------------------------------- */
/*                               ✅ getDataReport                             */
/* -------------------------------------------------------------------------- */
describe("getDataReport", () => {
  test("returns data successfully", () => {
    const mockRows = [{ UserID: 1 }];
    pool.query.mockImplementation((q, cb) => cb(null, mockRows));

    getDataReport({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, data: mockRows }
    );
  });

  test("handles DB error", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("DB error")));

    getDataReport({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Failed to fetch data report" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                             ✅ getFineReport                               */
/* -------------------------------------------------------------------------- */
describe("getFineReport", () => {
  test("works with no query params & returns empty", () => {
    const req = { url: "/fine-report" };
    pool.query.mockImplementation((q, cb) => cb(null, []));

    getFineReport(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, data: [] }
    );
  });

  test("applies URL query params and returns data", () => {
    const req = {
      url: "/fine-report?startDate=2023-01-01&itemType=Book&paymentStatus=Paid"
    };

    const mockResult = [{ FineID: 1 }];
    pool.query.mockImplementation((q, cb) => cb(null, mockResult));

    getFineReport(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ data: mockResult })
    );
  });

  test("handles SQL error", () => {
    const req = { url: "/fine-report?startDate=2023-01-01" };

    pool.query.mockImplementation((q, cb) => cb(new Error("SQL fail")));

    getFineReport(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: expect.stringContaining("Failed to fetch fine report") })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                                  ✅ addRoom                                */
/* -------------------------------------------------------------------------- */
describe("addRoom", () => {
  test("successfully inserts room", async () => {
    parseRequestBody.mockResolvedValue({
      RoomNumber: 101,
      RoomName: "A",
      Capacity: 20,
      Notes: "Test"
    });

    pool.query.mockImplementation((q, params, cb) => cb(null));

    await addRoom({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true }
    );
  });

  test("DB insert error", async () => {
    parseRequestBody.mockResolvedValue({
      RoomNumber: 101,
      RoomName: "A",
      Capacity: 20,
      Notes: "Test"
    });

    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("insert fail"))
    );

    await addRoom({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Failed to add room" })
    );
  });

  test("parseRequestBody fails", async () => {
    parseRequestBody.mockRejectedValue(new Error("bad JSON"));

    await addRoom({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                             ✅ getEventReport                              */
/* -------------------------------------------------------------------------- */
describe("getEventReport", () => {
  test("returns empty result array when DB returns nothing", () => {
    const req = { query: {} };

    pool.query.mockImplementation((q, params, cb) => cb(null, []));

    getEventReport(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, data: [] }
    );
  });

  test("returns formatted event data", () => {
    const req = { query: {} };

    const mockDB = [
      {
        EventID: 1,
        EventName: "Test Event",
        RegisteredAttendees: 5,
        CheckedInAttendees: 4,
        MaxAttendees: 10,
        RoomCapacity: 20,
        EventDurationHours: 5,
        EventDurationDays: 0,
        StartAt: "2024-10-10T10:00:00",
        EndAt: "2024-10-10T15:00:00",
        EarliestCheckIn: null,
        LatestCheckIn: null
      }
    ];

    pool.query.mockImplementation((q, params, cb) => cb(null, mockDB));

    getEventReport(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
        analytics: expect.any(Object)
      })
    );
  });

  test("DB error in getEventReport", () => {
    const req = { query: {} };

    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("bad SQL"))
    );

    getEventReport(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: expect.stringContaining("Failed to fetch event report") })
    );
  });
});
