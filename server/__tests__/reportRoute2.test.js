jest.mock("../../server/config/db", () => ({ query: jest.fn() }));
jest.mock("../../server/utils/requestUtils", () => ({
  sendJsonResponse: jest.fn(),
  parseRequestBody: jest.fn()
}));

const pool = require("../../server/config/db");
const { sendJsonResponse, parseRequestBody } = require("../../server/utils/requestUtils");

const {
  getDataReport,
  getFineReport,
  addRoom,
  getEventReport
} = require("../../server/routes/reportRoutes");

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

/* -------------------------------------------------------------------------- */
/*                               ✅ getDataReport                              */
/* -------------------------------------------------------------------------- */
test("getDataReport handles empty results", () => {
  pool.query.mockImplementation((q, cb) => cb(null, []));
  getDataReport({}, {});
  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    200,
    expect.objectContaining({ success: true })
  );
});

/* -------------------------------------------------------------------------- */
/*                              ✅ fineReport tests                            */
/* -------------------------------------------------------------------------- */
test("fineReport handles all filters and returns rows", () => {
  const req = {
    url: "/fine?startDate=2024-01-01&endDate=2024-02-01&role=Admin&itemType=Book&paymentStatus=Paid"
  };
  pool.query.mockImplementation((q, cb) => cb(null, [{ FineID: 1 }]));
  getFineReport(req, {});

  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    200,
    expect.objectContaining({ success: true, data: expect.any(Array) })
  );
});

test("fineReport handles SQL error", () => {
  const req = { url: "/fine?startDate=2024-01-01" };
  pool.query.mockImplementation((q, cb) => cb(new Error("bad")));
  getFineReport(req, {});

  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    500,
    expect.objectContaining({ error: expect.stringContaining("Failed to fetch fine report") })
  );
});

/* -------------------------------------------------------------------------- */
/*                                ✅ addRoom                                   */
/* -------------------------------------------------------------------------- */
test("addRoom DB error branch", async () => {
  parseRequestBody.mockResolvedValue({ RoomNumber: 1, RoomName: "A", Capacity: 10, Notes: "" });
  pool.query.mockImplementation((q, params, cb) => cb(new Error("fail")));

  await addRoom({}, {});
  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    500,
    expect.objectContaining({ error: "Failed to add room" })
  );
});

test("addRoom parse error", async () => {
  parseRequestBody.mockRejectedValue(new Error("boom"));
  await addRoom({}, {});
  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    500,
    expect.objectContaining({ error: "Server error" })
  );
});

/* -------------------------------------------------------------------------- */
/*                          ✅ getEventReport coverage                         */
/* -------------------------------------------------------------------------- */
test("getEventReport empty results returns []", () => {
  pool.query.mockImplementation((q, params, cb) => cb(null, []));
  getEventReport({ query: {} }, {});
  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    200,
    expect.objectContaining({ success: true, data: [] })
  );
});

test("getEventReport handles filters & post-processing", () => {
  const req = { query: { minAttendees: 2, maxAttendees: 10 } };

  const mockRows = [{
    EventID: 1,
    EventName: "Test",
    RegisteredAttendees: 5,
    CheckedInAttendees: 3,
    MaxAttendees: 20,
    RoomCapacity: 40,
    EventDurationHours: 3,
    EventDurationDays: 0,
    StartAt: "2024-10-01T10:00:00",
    EndAt: "2024-10-01T14:00:00",
    EarliestCheckIn: null,
    LatestCheckIn: null
  }];

  pool.query.mockImplementation((q, params, cb) => cb(null, mockRows));

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

test("getEventReport SQL error returns 500", () => {
  pool.query.mockImplementation((q, params, cb) => cb(new Error("SQL fail")));
  getEventReport({ query: {} }, {});
  expect(sendJsonResponse).toHaveBeenCalledWith(
    expect.anything(),
    500,
    expect.objectContaining({ error: expect.stringContaining("Failed to fetch event report") })
  );
});
