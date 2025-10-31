const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');
const {
  getVolunteerHistory,
  getAllVolunteerHistory,
  addVolunteerHistory,
  updateVolunteerHistory
} = require('../controllers/historyRoutes');

// Mock DB + Util methods
jest.mock('../config/db', () => ({ query: jest.fn() }));

jest.mock('../utils/requestUtils', () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

// Mock req & res
const mockReq = {};
const mockRes = {};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe("getVolunteerHistory", () => {
  it("returns history successfully", () => {
    const mockResults = [{
      HistoryID: 1,
      RequiredSkills: "CPR,FirstAid"
    }];

    pool.query.mockImplementation((_q, _d, cb) => cb(null, mockResults));

    getVolunteerHistory(mockReq, mockRes, 5);

    expect(pool.query).toHaveBeenCalled();
    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      history: [{
        HistoryID: 1,
        RequiredSkills: ["CPR", "FirstAid"]
      }]
    });
  });

  it("handles DB error", () => {
    pool.query.mockImplementation((_q, _d, cb) => cb(new Error("DB Error")));

    getVolunteerHistory(mockReq, mockRes, 5);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Internal server error"
    });
  });
});

describe("getAllVolunteerHistory", () => {
  it("returns all history", () => {
    const mockResults = [{
      HistoryID: 3,
      RequiredSkills: "FoodPrep"
    }];

    pool.query.mockImplementation((_q, cb) => cb(null, mockResults));

    getAllVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      history: [{
        HistoryID: 3,
        RequiredSkills: ["FoodPrep"]
      }]
    });
  });
});

describe("addVolunteerHistory", () => {
  it("adds record successfully", async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1,
      EventID: 2,
      ParticipationStatus: "Completed",
      HoursVolunteered: 4,
      ParticipationDate: "2024-01-01"
    });

    pool.query.mockImplementation((_q, _d, cb) => cb(null, { insertId: 10 }));

    await addVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      historyID: 10,
      message: "History record added successfully"
    });
  });

  it("handles DB insert error", async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((_q, _d, cb) => cb(new Error()));

    await addVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Failed to add volunteer history"
    });
  });
});

describe("updateVolunteerHistory", () => {
  it("updates history successfully", async () => {
    parseRequestBody.mockResolvedValue({
      HistoryID: 7,
      ParticipationStatus: "Cancelled",
      HoursVolunteered: 2
    });

    pool.query.mockImplementation((_q, _d, cb) => cb(null));

    await updateVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      message: "History record updated successfully"
    });
  });

  it("handles update error", async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((_q, _d, cb) => cb(new Error()));

    await updateVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Failed to update volunteer history"
    });
  });
});
