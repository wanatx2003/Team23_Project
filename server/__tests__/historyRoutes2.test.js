// Correct imports
const {
  getVolunteerHistory,
  getAllVolunteerHistory,
  addVolunteerHistory,
  updateVolunteerHistory
} = require("../routes/historyRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

// Mock DB + utils
jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

let consoleSpy;

beforeEach(() => {
  jest.clearAllMocks();

  // Suppress console.error output during tests
  consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleSpy.mockRestore();
});

// Mock req/res objects
const mockReq = {};
const mockRes = {};

describe("History Routes", () => {

  // ------------------------------------------------------
  // 🔹 getVolunteerHistory
  // ------------------------------------------------------
  test("getVolunteerHistory returns history", () => {
    pool.query.mockImplementation((_q, _params, cb) =>
      cb(null, [{ HistoryID: 1, RequiredSkills: "CPR,Driving" }])
    );

    getVolunteerHistory(mockReq, mockRes, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({
        success: true,
        history: [
          { HistoryID: 1, RequiredSkills: ["CPR", "Driving"] }
        ]
      })
    );
  });

  test("getVolunteerHistory handles DB error", () => {
    pool.query.mockImplementation((_q, _params, cb) =>
      cb(new Error("DB Error"), null)
    );

    getVolunteerHistory(mockReq, mockRes, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      { success: false, error: "Internal server error" }
    );
  });

  // ------------------------------------------------------
  // 🔹 getAllVolunteerHistory
  // ------------------------------------------------------
  test("getAllVolunteerHistory returns all history", () => {
    pool.query.mockImplementation((_q, cb) =>
      cb(null, [{ HistoryID: 2, RequiredSkills: "FoodPrep" }])
    );

    getAllVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({
        success: true,
        history: [
          { HistoryID: 2, RequiredSkills: ["FoodPrep"] }
        ]
      })
    );
  });

  test("getAllVolunteerHistory handles DB error", () => {
    pool.query.mockImplementation((_q, cb) =>
      cb(new Error("DB Error"), null)
    );

    getAllVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      { success: false, error: "Internal server error" }
    );
  });

  // ------------------------------------------------------
  // 🔹 addVolunteerHistory
  // ------------------------------------------------------
  test("addVolunteerHistory adds record successfully", async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1,
      EventID: 2,
      ParticipationStatus: "Completed",
      HoursVolunteered: 4,
      ParticipationDate: "2024-01-01"
    });

    pool.query.mockImplementation((_q, _d, cb) =>
      cb(null, { insertId: 10 })
    );

    await addVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      {
        success: true,
        historyID: 10,
        message: "History record added successfully"
      }
    );
  });

  test("addVolunteerHistory handles DB insert error", async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((_q, _d, cb) =>
      cb(new Error("Insert Error"), null)
    );

    await addVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      { success: false, error: "Failed to add volunteer history" }
    );
  });

  // ------------------------------------------------------
  // 🔹 updateVolunteerHistory
  // ------------------------------------------------------
  test("updateVolunteerHistory updates successfully", async () => {
    parseRequestBody.mockResolvedValue({
      HistoryID: 7,
      ParticipationStatus: "Cancelled",
      HoursVolunteered: 3
    });

    pool.query.mockImplementation((_q, _d, cb) =>
      cb(null, {})
    );

    await updateVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      { success: true, message: "History record updated successfully" }
    );
  });

  test("updateVolunteerHistory handles error", async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((_q, _d, cb) =>
      cb(new Error("Update Error"), null)
    );

    await updateVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      { success: false, error: "Failed to update volunteer history" }
    );
  });
});
