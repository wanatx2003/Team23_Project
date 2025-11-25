const {
  getSmartMatchesForEvent,
  autoMatchVolunteers
} = require("../routes/matchingRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => jest.clearAllMocks());

describe("Smart Matching Algorithm (matchingRoutes.js)", () => {

  // ====================================================================
  // getSmartMatchesForEvent
  // ====================================================================

  test("getSmartMatchesForEvent returns match results with computed scores", () => {
    const req = { url: "/api/match/12" };

    const mockRows = [
      {
        UserID: 1,
        Email: "a@test.com",
        FullName: "John Doe",
        City: "Houston",
        StateCode: "TX",
        VolunteerSkills: "CPR,Driving",
        Availability: "Mon:08:00-12:00",
        EventID: 12,
        EventName: "Food Drive",
        EventDate: "2025-02-10",
        StartTime: "09:00",
        EndTime: "12:00",
        Location: "Houston TX",
        Urgency: "high",
        MaxVolunteers: 10,
        CurrentVolunteers: 3,
        RequiredSkills: "CPR,Teaching",
        CurrentMatchStatus: "none",
        MatchID: null
      }
    ];

    pool.query.mockImplementation((q, p, cb) => cb(null, mockRows));

    getSmartMatchesForEvent(req, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        matches: expect.any(Array)
      })
    );

    const result = sendJsonResponse.mock.calls[0][2].matches[0];

    expect(result.Skills).toEqual(["CPR", "Driving"]);
    expect(result.RequiredSkills).toEqual(["CPR", "Teaching"]);
    expect(result.MatchScore).toBeGreaterThan(0);
    expect(result.MatchReasons.length).toBeGreaterThan(0);
  });

  test("getSmartMatchesForEvent handles DB error", () => {
    pool.query.mockImplementation((q, p, cb) =>
      cb(new Error("DB error"), null)
    );

    getSmartMatchesForEvent({ url: "/api/match/12" }, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Internal server error" }
    );
  });

  test("getSmartMatchesForEvent returns empty when no volunteers found", () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, []));

    getSmartMatchesForEvent({ url: "/api/match/12" }, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        matches: []
      })
    );
  });

  // ====================================================================
  // autoMatchVolunteers
  // ====================================================================

  test("autoMatchVolunteers matches volunteers above MinMatchScore", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 10, MinMatchScore: 40, MaxMatches: 5 });

    const mockVolunteerRows = [
      {
        UserID: 1,
        VolunteerSkills: "CPR,Driving",
        RequiredSkills: "CPR,Teaching",
        EventID: 10,
        EventName: "Cleanup Event"
      }
    ];

    // First DB call → volunteers list
    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, mockVolunteerRows))
      // Second DB call → insertVolunteerMatch
      .mockImplementationOnce((q, p, cb) => cb(null))
      // Third → notification insert
      .mockImplementationOnce((q, p, cb) => cb(null))
      // Fourth → update event count
      .mockImplementation((q, p, cb) => cb(null));

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        matched: 1
      })
    );
  });

  test("autoMatchVolunteers handles DB failure", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 10 });

    pool.query.mockImplementationOnce((q, p, cb) =>
      cb(new Error("DB error"), null)
    );

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Internal server error" }
    );
  });

  test("autoMatchVolunteers returns early when no volunteers", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 10 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(null, []));

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        matched: 0
      })
    );
  });

});
