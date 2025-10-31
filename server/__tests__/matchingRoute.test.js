const {
  getVolunteerMatches,
  createVolunteerMatch,
  updateMatchStatus
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

describe("Volunteer Matching Routes", () => {

  // -----------------------------------------------------
  // ✅ getVolunteerMatches
  // -----------------------------------------------------
  test("getVolunteerMatches returns formatted skill data", () => {
    const mockData = [
      {
        UserID: 1,
        FirstName: "John",
        LastName: "Doe",
        Skills: "CPR,Driving",
        RequiredSkills: "CPR,Teaching",
        MatchStatus: "unmatched"
      }
    ];

    pool.query.mockImplementation((q, cb) => cb(null, mockData));

    getVolunteerMatches({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        matches: expect.arrayContaining([
          expect.objectContaining({
            Skills: ["CPR", "Driving"],
            RequiredSkills: ["CPR", "Teaching"],
            SkillMatch: true
          })
        ])
      })
    );
  });

  test("getVolunteerMatches handles DB error", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("DB error"), null));

    getVolunteerMatches({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Internal server error" }
    );
  });

  // -----------------------------------------------------
  // ✅ createVolunteerMatch
  // -----------------------------------------------------
  test("createVolunteerMatch prevents duplicate match", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    // Simulate existing match
    pool.query.mockImplementationOnce((q, p, cb) => cb(null, [{}]));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      { success: false, error: "Volunteer is already matched to this event" }
    );
  });

  test("createVolunteerMatch inserts match and notification", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    // First query: no match exists
    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [])) // check match
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 5 })) // insert match
      .mockImplementation((q, p, cb) => cb(null)); // insert notification

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, message: "Volunteer matched successfully" }
    );
  });

  test("createVolunteerMatch handles DB query failure", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(new Error("DB error"), null));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Internal server error" }
    );
  });

  // -----------------------------------------------------
  // ✅ updateMatchStatus
  // -----------------------------------------------------
  test("updateMatchStatus updates match", async () => {
    parseRequestBody.mockResolvedValue({ MatchID: 99, MatchStatus: "approved" });

    pool.query.mockImplementation((q, p, cb) => cb(null, { affectedRows: 1 }));

    await updateMatchStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, message: "Match status updated successfully" }
    );
  });

  test("updateMatchStatus handles DB error", async () => {
    parseRequestBody.mockResolvedValue({ MatchID: 99, MatchStatus: "approved" });

    pool.query.mockImplementation((q, p, cb) => cb(new Error("DB error")));

    await updateMatchStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Failed to update match status" }
    );
  });
});
