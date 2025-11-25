jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

const {
  getVolunteerMatches,
  createVolunteerMatch,
  updateMatchStatus,
  getSmartMatchesForEvent,
  autoMatchVolunteers
} = require("../routes/matchingRoutes");

beforeEach(() => jest.clearAllMocks());
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

/* -------------------------------------------------------------------------- */
/*                            getVolunteerMatches                              */
/* -------------------------------------------------------------------------- */

describe("getVolunteerMatches — coverage", () => {
  test("handles DB error", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("fail")));

    getVolunteerMatches({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("returns empty array successfully", () => {
    pool.query.mockImplementation((q, cb) => cb(null, []));

    getVolunteerMatches({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, matches: [] }
    );
  });

  test("returns formatted match objects with skill calculations", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(null, [
        {
          Skills: "A,B,C",
          RequiredSkills: "A,C",
          MatchStatus: "pending"
        }
      ])
    );

    getVolunteerMatches({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        matches: expect.any(Array)
      })
    );

    const payload = sendJsonResponse.mock.calls[0][2];
    expect(payload.matches[0].MatchingSkills).toEqual(["A", "C"]);
    expect(payload.matches[0].SkillMatchPercentage).toBe(100);
  });

  test("handles no required skills (percentage = 0)", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(null, [
        { Skills: "A,B", RequiredSkills: null }
      ])
    );

    getVolunteerMatches({}, {});

    const pct = sendJsonResponse.mock.calls[0][2].matches[0].SkillMatchPercentage;
    expect(pct).toBe(0);
  });

  test("handles missing Skills", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(null, [
        { Skills: null, RequiredSkills: "A,B" }
      ])
    );

    getVolunteerMatches({}, {});

    const m = sendJsonResponse.mock.calls[0][2].matches[0];
    expect(m.Skills).toEqual([]);
    expect(m.MatchingSkills).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/*                          createVolunteerMatch                               */
/* -------------------------------------------------------------------------- */

describe("createVolunteerMatch — coverage", () => {
  test("missing fields → 400", async () => {
    parseRequestBody.mockResolvedValue({});

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "VolunteerID and EventID are required" })
    );
  });

  test("DB error on existing check", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(new Error("fail")));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("existing match found", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(null, [{}]));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "Volunteer is already matched to this event" })
    );
  });

  test("insert error", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, []))
      .mockImplementationOnce((q, p, cb) => cb(new Error("insertFail")));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: expect.stringContaining("Failed to create match") })
    );
  });

  test("successful match insertion", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, []))
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 55 }))
      .mockImplementationOnce((q, p, cb) => cb(null, {}))
      .mockImplementationOnce((q, p, cb) => cb(null, {}));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                          updateMatchStatus                                  */
/* -------------------------------------------------------------------------- */

describe("updateMatchStatus — coverage", () => {
  test("parse error → 500", async () => {
    parseRequestBody.mockRejectedValue(new Error("bad"));

    await updateMatchStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Server error" })
    );
  });

  test("DB error", async () => {
    parseRequestBody.mockResolvedValue({ MatchID: 1, MatchStatus: "confirmed" });

    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    await updateMatchStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Failed to update match status" })
    );
  });

  test("successful update", async () => {
    parseRequestBody.mockResolvedValue({ MatchID: 1, MatchStatus: "confirmed" });

    pool.query.mockImplementation((q, p, cb) => cb(null, { affectedRows: 1 }));

    await updateMatchStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                        getSmartMatchesForEvent                              */
/* -------------------------------------------------------------------------- */

describe("getSmartMatchesForEvent — coverage", () => {
  const req = { url: "/smart/10" };
  const res = {};

  test("DB error", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    getSmartMatchesForEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("no results", () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, []));

    getSmartMatchesForEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ matches: [] })
    );
  });

  test("successful match scoring", () => {
    pool.query.mockImplementation((q, p, cb) =>
      cb(null, [
        {
          VolunteerSkills: "A,B",
          RequiredSkills: "A",
          Availability: "Mon:08:00-12:00",
          EventDate: "2025-01-13", // Monday
          StartTime: "09:00",
          StateCode: "TX",
          Location: "Houston TX",
          Urgency: "critical",
          MaxVolunteers: 10,
          CurrentVolunteers: 2,
          CurrentMatchStatus: "none"
        }
      ])
    );

    getSmartMatchesForEvent(req, res);

    const response = sendJsonResponse.mock.calls[0][2];
    expect(response.success).toBe(true);
    expect(response.matches.length).toBe(1);
    expect(response.matches[0].MatchScore).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/*                         autoMatchVolunteers                                 */
/* -------------------------------------------------------------------------- */

describe("autoMatchVolunteers — coverage", () => {
  test("missing EventID → 400", async () => {
    parseRequestBody.mockResolvedValue({});
    await autoMatchVolunteers({}, {});
    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "EventID is required" })
    );
  });

  test("DB error getting volunteers", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1 });
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("no available volunteers", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1 });
    pool.query.mockImplementation((q, p, cb) => cb(null, []));

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ matched: 0 })
    );
  });

  test("no volunteers meet MinMatchScore", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1, MinMatchScore: 90 });

    pool.query.mockImplementation((q, p, cb) =>
      cb(null, [
        {
          VolunteerSkills: "A",
          RequiredSkills: "A,B"
        }
      ])
    );

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ matched: 0 })
    );
  });

  test("successful auto-match of multiple volunteers", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1 });

    pool.query
      .mockImplementationOnce((q, p, cb) =>
        cb(null, [
          {
            UserID: 1,
            VolunteerSkills: "A,B",
            RequiredSkills: "A"
          }
        ])
      )
      .mockImplementation((q, p, cb) => cb(null, {}));

    await autoMatchVolunteers({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true })
    );
  });
});
