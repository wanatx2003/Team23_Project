const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

const {
  getVolunteerHistory,
  getAllVolunteerHistory,
  addVolunteerHistory,
  updateVolunteerHistory
} = require('../routes/historyRoutes'); // <-- your file

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../utils/requestUtils', () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

const mockReq = {};
const mockRes = {};

beforeEach(() => jest.clearAllMocks());

// ---- getVolunteerHistory ----
describe('getVolunteerHistory', () => {

  it('should return volunteer history successfully', () => {
    const mockRecords = [
      { HistoryID: 1, RequiredSkills: "FirstAid,CPR" }
    ];

    pool.query.mockImplementation((q, params, cb) => cb(null, mockRecords));

    getVolunteerHistory(mockReq, mockRes, 10);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      history: [
        { HistoryID: 1, RequiredSkills: ["FirstAid", "CPR"] }
      ],
    });
  });

  it('should handle DB error', () => {
    pool.query.mockImplementation((q, params, cb) => cb(new Error("DB fail")));

    getVolunteerHistory(mockReq, mockRes, 10);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Internal server error"
    });
  });
});

// ---- getAllVolunteerHistory ----
describe('getAllVolunteerHistory', () => {

  it('should return all volunteer history', () => {
    const mockRecords = [
      { HistoryID: 2, RequiredSkills: "Tutor" }
    ];

    pool.query.mockImplementation((q, cb) => cb(null, mockRecords));

    getAllVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      history: [
        { HistoryID: 2, RequiredSkills: ["Tutor"] }
      ],
    });
  });

  it('should handle DB error', () => {
    pool.query.mockImplementation((q, cb) => cb(new Error()));

    getAllVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Internal server error"
    });
  });
});

// ---- addVolunteerHistory ----
describe('addVolunteerHistory', () => {

  it('should add volunteer history successfully', async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1,
      EventID: 2,
      ParticipationStatus: "Completed",
      HoursVolunteered: 5,
      ParticipationDate: "2024-01-01"
    });

    pool.query.mockImplementation((q, params, cb) => cb(null, { insertId: 77 }));

    await addVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      historyID: 77,
      message: "History record added successfully"
    });
  });

  it('should handle DB insert error', async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((q, params, cb) => cb(new Error()));

    await addVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Failed to add volunteer history"
    });
  });
});

// ---- updateVolunteerHistory ----
describe('updateVolunteerHistory', () => {

  it('should update volunteer record successfully', async () => {
    parseRequestBody.mockResolvedValue({
      HistoryID: 3,
      ParticipationStatus: "Approved",
      HoursVolunteered: 6,
    });

    pool.query.mockImplementation((q, params, cb) => cb(null));

    await updateVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 200, {
      success: true,
      message: "History record updated successfully"
    });
  });

  it('should handle DB update error', async () => {
    parseRequestBody.mockResolvedValue({});
    pool.query.mockImplementation((q, params, cb) => cb(new Error()));

    await updateVolunteerHistory(mockReq, mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(mockRes, 500, {
      success: false,
      error: "Failed to update volunteer history"
    });
  });
});
