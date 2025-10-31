beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

const {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getVolunteerMatches,
  createVolunteerMatch,
  getAvailableEvents,
  createVolunteerRequest
} = require("../routes/eventRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

let req = {}, res = {};

beforeEach(() => {
  req = {};
  res = {};
  jest.clearAllMocks();
});

//
// ✅ TEST SUITE
//
describe("Event Routes", () => {

  // ---------------- GET ALL EVENTS ----------------
  it("should return all events", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(null, [{ EventID: 1, RequiredSkills: "CPR,Leadership" }])
    );

    getAllEvents(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      {
        success: true,
        events: [
          expect.objectContaining({
            EventID: 1,
            RequiredSkills: ["CPR", "Leadership"]
          })
        ]
      }
    );
  });

  it("should handle DB error on getAllEvents", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("DB failure")));

    getAllEvents(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  // ---------------- CREATE EVENT ----------------
  it("should validate missing EventName", async () => {
    parseRequestBody.mockResolvedValue({ EventName: "" });

    await createEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      400,
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  it("should create event successfully", async () => {
    parseRequestBody.mockResolvedValue({
      EventName: "Cleanup",
      Description: "Park cleanup",
      Location: "City Park",
      RequiredSkills: ["Teamwork"],
      Urgency: "high",
      EventDate: "2025-05-01",
      EventTime: "10:00",
      CreatedBy: 1,
      MaxVolunteers: 10
    });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 50 })) // event
      .mockImplementation((q, p, cb) => cb(null)); // skills

    await createEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ eventID: 50 })
    );
  });

  it("should handle error adding skills", async () => {
    parseRequestBody.mockResolvedValue({
      EventName: "Cleanup",
      Description: "Park cleanup",
      Location: "City Park",
      RequiredSkills: ["Teamwork"],
      Urgency: "high",
      EventDate: "2025-05-01",
      EventTime: "10:00",
      CreatedBy: 1
    });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 3 }))
      .mockImplementationOnce((q, p, cb) => cb(new Error("fail")));

    await createEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ success: false })
    );
  });

  it("should handle exception in createEvent", async () => {
    parseRequestBody.mockRejectedValue(new Error("bad request"));

    await createEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  // ---------------- UPDATE EVENT ----------------
  it("should update event", async () => {
    parseRequestBody.mockResolvedValue({
      EventID: 10,
      EventName: "Update",
      Description: "New",
      Location: "Here",
      RequiredSkills: ["CPR"],
      Urgency: "low",
      EventDate: "2025-01-01",
      EventTime: "10:00",
      MaxVolunteers: 20
    });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null)) // update
      .mockImplementationOnce((q, p, cb) => cb(null)) // delete skills
      .mockImplementation((q, p, cb) => cb(null)); // insert skills

    await updateEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success: true, message: "Event updated successfully" }
    );
  });

  // ---------------- DELETE EVENT ----------------
  it("should delete event", async () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, { affectedRows: 1 }));

    await deleteEvent(req, res, 10);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ success: true })
    );
  });

  it("should return 404 when event not found", async () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, { affectedRows: 0 }));

    await deleteEvent(req, res, 10);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      404,
      expect.objectContaining({ error: "Event not found" })
    );
  });

  // ---------------- GET VOLUNTEER MATCHES ----------------
  it("should return volunteer matches", () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, [{ MatchID: 1 }]));

    getVolunteerMatches(req, res, 5);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success: true, matches: [{ MatchID: 1 }] }
    );
  });

  // ---------------- CREATE VOLUNTEER MATCH ----------------
  it("should create volunteer match", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });
    pool.query.mockImplementation((q, p, cb) => cb(null));

    await createVolunteerMatch(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ success: true })
    );
  });

  it("should handle DB error in createVolunteerMatch", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    await createVolunteerMatch(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ success: false })
    );
  });

  // ---------------- GET AVAILABLE EVENTS ----------------
  it("should return available events", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(null, [{ EventID: 1, RequiredSkills: "CPR" }])
    );

    getAvailableEvents(req, res);

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  it("should handle error in getAvailableEvents", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("DB err")));

    getAvailableEvents(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  // ---------------- CREATE VOLUNTEER REQUEST ----------------
  it("should block duplicate volunteer request", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(null, [{}]));

    await createVolunteerRequest(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      400,
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  it("should create volunteer request successfully", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, []))
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 100 }))
      .mockImplementationOnce((q, p, cb) => cb(null));

    await createVolunteerRequest(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ success: true })
    );
  });

});

// ✅ Stop open handles
afterAll(() => {
  jest.useRealTimers();
});
