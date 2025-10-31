const {
  getAllVolunteerProfiles,
  updateMatchStatus,
  getVolunteerStats,
  getRecentEvents,
  getUpcomingEvents,
  getMatchedEvents,
  getAvailableEventsWithMatching
} = require("../routes/volunteerRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

beforeAll(() => jest.spyOn(console, "error").mockImplementation(() => {}));
beforeEach(() => jest.clearAllMocks());

/* -------------------------------------------------------------------------- */
/*                           ✅ getAllVolunteerProfiles                        */
/* -------------------------------------------------------------------------- */
describe("getAllVolunteerProfiles", () => {
  test("returns formatted volunteer profiles", () => {
    const req = {}, res = {};

    pool.query.mockImplementation((q, cb) =>
      cb(null, [
        { UserID: 1, FirstName: "John", skills: "Skill1,Skill2", preferences: "Pref1,Pref2" }
      ])
    );

    getAllVolunteerProfiles(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(res, 200, {
      success: true,
      volunteers: [
        { UserID: 1, FirstName: "John", skills: ["Skill1", "Skill2"], preferences: ["Pref1", "Pref2"] }
      ]
    });
  });

  test("handles DB error", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("DB Err")));

    getAllVolunteerProfiles({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                             ✅ updateMatchStatus                            */
/* -------------------------------------------------------------------------- */
describe("updateMatchStatus", () => {
  const req = {}, res = {}, matchId = 1;

  test("updates match successfully", async () => {
    parseRequestBody.mockResolvedValue({ MatchStatus: "confirmed" });

    pool.query.mockImplementation((q, p, cb) => cb(null, { affectedRows: 1 }));

    await updateMatchStatus(req, res, matchId);

    expect(sendJsonResponse).toHaveBeenCalledWith(res, 200, {
      success: true,
      message: "Match status updated successfully"
    });
  });

  test("match not found", async () => {
    parseRequestBody.mockResolvedValue({ MatchStatus: "confirmed" });

    pool.query.mockImplementation((q, p, cb) => cb(null, { affectedRows: 0 }));

    await updateMatchStatus(req, res, matchId);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      404,
      expect.objectContaining({ error: "Match not found" })
    );
  });

  test("DB error", async () => {
    parseRequestBody.mockResolvedValue({ MatchStatus: "confirmed" });

    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    await updateMatchStatus(req, res, matchId);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error: "Failed to update match status" })
    );
  });

  test("parse error", async () => {
    parseRequestBody.mockRejectedValue(new Error("bad JSON"));

    await updateMatchStatus(req, res, matchId);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error: "Server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                             ✅ getVolunteerStats                            */
/* -------------------------------------------------------------------------- */
describe("getVolunteerStats", () => {
  test("returns stats", () => {
    pool.query.mockImplementation((q, p, cb) =>
      cb(null, [{ upcomingEvents: 2, completedEvents: 3, totalHours: 4, unreadNotifications: 1 }])
    );

    getVolunteerStats({}, {}, 5);

    expect(sendJsonResponse).toHaveBeenCalledWith(expect.anything(), 200, {
      success: true,
      stats: { upcomingEvents: 2, completedEvents: 3, totalHours: 4, unreadNotifications: 1 }
    });
  });

  test("DB error", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    getVolunteerStats({}, {}, 5);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                              ✅ getRecentEvents                             */
/* -------------------------------------------------------------------------- */
describe("getRecentEvents", () => {
  test("returns events", () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, [{ EventID: 1 }]));

    getRecentEvents({}, {}, 3);

    expect(sendJsonResponse).toHaveBeenCalledWith(expect.anything(), 200, {
      success: true,
      events: [{ EventID: 1 }]
    });
  });

  test("DB error", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("err")));

    getRecentEvents({}, {}, 3);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                           ✅ getUpcomingEvents                              */
/* -------------------------------------------------------------------------- */
describe("getUpcomingEvents", () => {
  test("returns upcoming events", () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, [{ EventID: 10 }]));

    getUpcomingEvents({}, {}, 4);

    expect(sendJsonResponse).toHaveBeenCalledWith(expect.anything(), 200, {
      success: true,
      events: [{ EventID: 10 }]
    });
  });

  test("DB error", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    getUpcomingEvents({}, {}, 4);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                            ✅ getMatchedEvents                              */
/* -------------------------------------------------------------------------- */
describe("getMatchedEvents", () => {
  test("returns matched events", () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, [{ EventID: 20 }]));

    getMatchedEvents({}, {}, 7);

    expect(sendJsonResponse).toHaveBeenCalledWith(expect.anything(), 200, {
      success: true,
      events: [{ EventID: 20 }]
    });
  });

  test("DB error", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    getMatchedEvents({}, {}, 7);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                   ✅ getAvailableEventsWithMatching                         */
/* -------------------------------------------------------------------------- */
describe("getAvailableEventsWithMatching", () => {
  test("returns events with parsed required skills", () => {
    pool.query.mockImplementation((q, p, cb) =>
      cb(null, [{ EventID: 1, RequiredSkills: "A,B" }])
    );

    getAvailableEventsWithMatching({}, {}, 2);

    expect(sendJsonResponse).toHaveBeenCalledWith(expect.anything(), 200, {
      success: true,
      events: [{ EventID: 1, RequiredSkills: ["A", "B"] }]
    });
  });

  test("DB error", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    getAvailableEventsWithMatching({}, {}, 2);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});
