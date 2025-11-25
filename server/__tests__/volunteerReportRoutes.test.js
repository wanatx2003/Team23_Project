jest.mock("../config/db", () => ({
  query: jest.fn()
}));

jest.mock("../utils/requestUtils", () => ({
  sendJsonResponse: jest.fn()
}));

const db = require("../config/db");
const { sendJsonResponse } = require("../utils/requestUtils");

const {
  getVolunteerParticipationReport,
  getEventSummaryReport,
  getVolunteerSummaryReport
} = require("../routes/volunteerReportRoutes");

const mockReq = (url) => ({ url });
const mockRes = {};

describe("Volunteer Report Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------
  // 1. getVolunteerParticipationReport
  // ----------------------------------------------------------
  test("returns participation report successfully", async () => {
    db.query.mockImplementation((query, params, cb) =>
      cb(null, [
        { HoursVolunteered: "5", ParticipationStatus: "attended" }
      ])
    );

    await getVolunteerParticipationReport(
      mockReq("/api/reports?p=1&startDate=2024-01-01&status=attended&skill=CPR"),
      mockRes
    );

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({
        success: true,
        summary: {
          totalRecords: 1,
          totalHours: 5,
          attended: 1
        }
      })
    );

    expect(db.query).toHaveBeenCalled();
  });

  test("handles DB error for participation report", async () => {
    db.query.mockImplementation((q, p, cb) => cb(new Error("DB error"), null));

    await getVolunteerParticipationReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      expect.objectContaining({ success: false })
    );
  });

  test("catches unexpected error in participation report", async () => {
    // Force an exception
    db.query.mockImplementation(() => {
      throw new Error("unexpected");
    });

    await getVolunteerParticipationReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      expect.objectContaining({ success: false, error: "Internal server error" })
    );
  });

  // ----------------------------------------------------------
  // 2. getEventSummaryReport
  // ----------------------------------------------------------
  test("returns event summary successfully", async () => {
    db.query.mockImplementation((query, params, cb) =>
      cb(null, [
        { CurrentVolunteers: 5, TotalHours: "12" }
      ])
    );

    await getEventSummaryReport(
      mockReq("/api/reports?startDate=2024-02-02&urgency=High"),
      mockRes
    );

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({
        success: true,
        summary: expect.objectContaining({
          totalEvents: 1,
          totalVolunteers: 5,
          totalHours: 12
        })
      })
    );
  });

  test("handles DB error for event summary", async () => {
    db.query.mockImplementation((q, p, cb) => cb(new Error("DB error"), null));

    await getEventSummaryReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      expect.objectContaining({ success: false })
    );
  });

  test("catches unexpected error in event summary", async () => {
    db.query.mockImplementation(() => {
      throw new Error("unexpected");
    });

    await getEventSummaryReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      expect.objectContaining({ success: false })
    );
  });

  // ----------------------------------------------------------
  // 3. getVolunteerSummaryReport
  // ----------------------------------------------------------
  test("returns volunteer summary successfully", async () => {
    db.query.mockImplementation((q, cb) =>
      cb(null, [
        { TotalEvents: 2, TotalHours: "8" }
      ])
    );

    await getVolunteerSummaryReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({
        success: true,
        summary: {
          totalVolunteers: 1,
          activeVolunteers: 1,
          totalHours: 8
        }
      })
    );
  });

  test("handles DB error for volunteer summary", async () => {
    db.query.mockImplementation((q, cb) => cb(new Error("DB error"), null));

    await getVolunteerSummaryReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      expect.objectContaining({ success: false })
    );
  });

  test("catches unexpected error in volunteer summary", async () => {
    db.query.mockImplementation(() => {
      throw new Error("unexpected");
    });

    await getVolunteerSummaryReport(mockReq("/x"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      500,
      expect.objectContaining({ success: false })
    );
  });

});
