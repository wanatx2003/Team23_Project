const {
  getVolunteerHistory,
  getAllVolunteerHistory,
  addVolunteerHistory,
  updateVolunteerHistory
} = require("../routes/historyRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("History Routes", () => {

  // ---------------- GET VOLUNTEER HISTORY ----------------
  test("getVolunteerHistory returns history", () => {
    pool.query.mockImplementation((q, params, cb) =>
      cb(null, [{ HistoryID: 1, RequiredSkills: "CPR,Driving" }])
    );

    getVolunteerHistory({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      {
        success: true,
        history: [
          { HistoryID: 1, RequiredSkills: ["CPR", "Driving"] }
        ]
      }
    );
  });

  test("getVolunteerHistory handles DB error", () => {
    pool.query.mockImplementation((q, params, cb) =>
      cb(new Error("DB error"), null)
    );

    getVolunteerHistory({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Internal server error" }
    );
  });

  // ---------------- GET ALL HISTORY (ADMIN) ----------------
  test("getAllVolunteerHistory returns data", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(null, [{ HistoryID: 2, RequiredSkills: "Nursing" }])
    );

    getAllVolunteerHistory({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      {
        success: true,
        history: [
          { HistoryID: 2, RequiredSkills: ["Nursing"] }
        ]
      }
    );
  });

  test("getAllVolunteerHistory handles DB error", () => {
    pool.query.mockImplementation((q, cb) =>
      cb(new Error("DB fail"), null)
    );

    getAllVolunteerHistory({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Internal server error" }
    );
  });

  // ---------------- ADD HISTORY ----------------
  test("addVolunteerHistory adds record", async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1,
      EventID: 2,
      ParticipationStatus: "attended",
      HoursVolunteered: 5,
      ParticipationDate: "2025-01-01"
    });

    pool.query.mockImplementation((q, p, cb) => cb(null, { insertId: 10 }));

    await addVolunteerHistory({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, historyID: 10, message: "History record added successfully" }
    );
  });

  test("addVolunteerHistory handles DB error", async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((q, p, cb) =>
      cb(new Error("Insert fail"))
    );

    await addVolunteerHistory({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Failed to add volunteer history" }
    );
  });

  // ---------------- UPDATE HISTORY ----------------
  test("updateVolunteerHistory updates record", async () => {
    parseRequestBody.mockResolvedValue({
      HistoryID: 10,
      ParticipationStatus: "attended",
      HoursVolunteered: 4
    });

    pool.query.mockImplementation((q, p, cb) => cb(null));

    await updateVolunteerHistory({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      { success: true, message: "History record updated successfully" }
    );
  });

  test("updateVolunteerHistory handles DB error", async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((q, p, cb) =>
      cb(new Error("Update fail"))
    );

    await updateVolunteerHistory({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      { success: false, error: "Failed to update volunteer history" }
    );
  });

});
