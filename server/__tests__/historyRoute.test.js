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

beforeEach(() => jest.clearAllMocks());

describe("History Routes", () => {

  test("getVolunteerHistory returns history", () => {
    pool.query.mockImplementation((q, params, cb) =>
      cb(null, [{ HistoryID: 1, RequiredSkills: "CPR,Driving" }])
    );

    getVolunteerHistory({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({
        success: true,
        history: [{ HistoryID: 1, RequiredSkills: ["CPR","Driving"] }]
      })
    );
  });

});
