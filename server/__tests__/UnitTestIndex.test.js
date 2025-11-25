jest.mock("../utils/requestUtils", () => ({
  sendJsonResponse: jest.fn()
}));

// Mock ALL route handler modules
jest.mock("./authRoutes", () => ({
  login: jest.fn(),
  register: jest.fn(),
  getAllUsers: jest.fn()
}));

jest.mock("./userRoutes", () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getStates: jest.fn(),
  getAvailableSkills: jest.fn()
}));

jest.mock("./eventRoutes", () => ({
  getAllEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn()
}));

jest.mock("./matchingRoutes", () => ({
  getVolunteerMatches: jest.fn(),
  createVolunteerMatch: jest.fn(),
  updateMatchStatus: jest.fn()
}));

jest.mock("./notificationRoutes", () => ({
  getUserNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markNotificationRead: jest.fn()
}));

jest.mock("./historyRoutes", () => ({
  getVolunteerHistory: jest.fn(),
  getAllVolunteerHistory: jest.fn(),
  addVolunteerHistory: jest.fn(),
  updateVolunteerHistory: jest.fn()
}));

jest.mock("./volunteerReportRoutes", () => ({
  getVolunteerParticipationReport: jest.fn(),
  getEventSummaryReport: jest.fn(),
  getVolunteerSummaryReport: jest.fn()
}));

const { sendJsonResponse } = require("../utils/requestUtils");

const auth = require("./authRoutes");
const user = require("./userRoutes");
const events = require("./eventRoutes");
const match = require("./matchingRoutes");
const note = require("./notificationRoutes");
const hist = require("./historyRoutes");
const report = require("./volunteerReportRoutes");

const handleRequest = require("./index");

// Helper request object
const mockReq = (url, method) => ({ url, method });
const mockRes = {};

describe("index.js route handler", () => {
  beforeEach(() => jest.clearAllMocks());

  // ------------------------------ AUTH ---------------------------
  test("POST /api/login → login()", () => {
    handleRequest(mockReq("/api/login", "POST"), mockRes);
    expect(auth.login).toHaveBeenCalled();
  });

  test("POST /api/register → register()", () => {
    handleRequest(mockReq("/api/register", "POST"), mockRes);
    expect(auth.register).toHaveBeenCalled();
  });

  test("GET /api/users → getAllUsers()", () => {
    handleRequest(mockReq("/api/users", "GET"), mockRes);
    expect(auth.getAllUsers).toHaveBeenCalled();
  });

  // ------------------------------ PROFILE ------------------------
  test("GET /api/profile/:id → getUserProfile()", () => {
    handleRequest(mockReq("/api/profile/123", "GET"), mockRes);
    expect(user.getUserProfile).toHaveBeenCalledWith(mockReq("/api/profile/123","GET"), mockRes, "123");
  });

  test("PUT /api/profile → updateUserProfile()", () => {
    handleRequest(mockReq("/api/profile", "PUT"), mockRes);
    expect(user.updateUserProfile).toHaveBeenCalled();
  });

  // ------------------------------ STATES & SKILLS ----------------
  test("GET /api/states → getStates()", () => {
    handleRequest(mockReq("/api/states", "GET"), mockRes);
    expect(user.getStates).toHaveBeenCalled();
  });

  test("GET /api/skills → getAvailableSkills()", () => {
    handleRequest(mockReq("/api/skills", "GET"), mockRes);
    expect(user.getAvailableSkills).toHaveBeenCalled();
  });

  // ------------------------------ EVENTS -------------------------
  test("GET /api/events → getAllEvents()", () => {
    handleRequest(mockReq("/api/events", "GET"), mockRes);
    expect(events.getAllEvents).toHaveBeenCalled();
  });

  test("POST /api/events → createEvent()", () => {
    handleRequest(mockReq("/api/events", "POST"), mockRes);
    expect(events.createEvent).toHaveBeenCalled();
  });

  test("PUT /api/events/:id → updateEvent()", () => {
    handleRequest(mockReq("/api/events/99", "PUT"), mockRes);
    expect(events.updateEvent).toHaveBeenCalledWith(expect.any(Object), mockRes, "99");
  });

  test("DELETE /api/events/:id → deleteEvent()", () => {
    handleRequest(mockReq("/api/events/55", "DELETE"), mockRes);
    expect(events.deleteEvent).toHaveBeenCalledWith(expect.any(Object), mockRes, "55");
  });

  // ------------------------------ MATCHING -----------------------
  test("GET /api/volunteer-matches → getVolunteerMatches()", () => {
    handleRequest(mockReq("/api/volunteer-matches", "GET"), mockRes);
    expect(match.getVolunteerMatches).toHaveBeenCalled();
  });

  test("POST /api/volunteer-matches → createVolunteerMatch()", () => {
    handleRequest(mockReq("/api/volunteer-matches", "POST"), mockRes);
    expect(match.createVolunteerMatch).toHaveBeenCalled();
  });

  test("PUT /api/volunteer-matches/status → updateMatchStatus()", () => {
    handleRequest(mockReq("/api/volunteer-matches/status", "PUT"), mockRes);
    expect(match.updateMatchStatus).toHaveBeenCalled();
  });

  // ------------------------------ NOTIFICATIONS ------------------
  test("GET /api/notifications/:id → getUserNotifications()", () => {
    handleRequest(mockReq("/api/notifications/777", "GET"), mockRes);
    expect(note.getUserNotifications).toHaveBeenCalledWith(expect.any(Object), mockRes, "777");
  });

  test("GET /api/notifications/unread/:id → getUnreadCount()", () => {
    handleRequest(mockReq("/api/notifications/unread/888", "GET"), mockRes);
    expect(note.getUnreadCount).toHaveBeenCalledWith(expect.any(Object), mockRes, "888");
  });

  test("POST /api/notifications/read → markNotificationRead()", () => {
    handleRequest(mockReq("/api/notifications/read", "POST"), mockRes);
    expect(note.markNotificationRead).toHaveBeenCalled();
  });

  // ------------------------------ HISTORY -------------------------
  test("GET /api/volunteer-history/all → getAllVolunteerHistory()", () => {
    handleRequest(mockReq("/api/volunteer-history/all", "GET"), mockRes);
    expect(hist.getAllVolunteerHistory).toHaveBeenCalled();
  });

  test("GET /api/volunteer-history/:id → getVolunteerHistory()", () => {
    handleRequest(mockReq("/api/volunteer-history/12", "GET"), mockRes);
    expect(hist.getVolunteerHistory).toHaveBeenCalledWith(expect.any(Object), mockRes, "12");
  });

  test("POST /api/volunteer-history → addVolunteerHistory()", () => {
    handleRequest(mockReq("/api/volunteer-history", "POST"), mockRes);
    expect(hist.addVolunteerHistory).toHaveBeenCalled();
  });

  test("PUT /api/volunteer-history → updateVolunteerHistory()", () => {
    handleRequest(mockReq("/api/volunteer-history", "PUT"), mockRes);
    expect(hist.updateVolunteerHistory).toHaveBeenCalled();
  });

  // ------------------------------ REPORTS ------------------------
  test("GET /api/reports/volunteer-participation → function called", () => {
    handleRequest(mockReq("/api/reports/volunteer-participation", "GET"), mockRes);
    expect(report.getVolunteerParticipationReport).toHaveBeenCalled();
  });

  test("GET /api/reports/event-summary → function called", () => {
    handleRequest(mockReq("/api/reports/event-summary", "GET"), mockRes);
    expect(report.getEventSummaryReport).toHaveBeenCalled();
  });

  test("GET /api/reports/volunteer-summary → function called", () => {
    handleRequest(mockReq("/api/reports/volunteer-summary", "GET"), mockRes);
    expect(report.getVolunteerSummaryReport).toHaveBeenCalled();
  });

  // ------------------------------ HEALTH -------------------------
  test("GET /api/health → sendJsonResponse(healthy)", () => {
    handleRequest(mockReq("/api/health", "GET"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({ status: "healthy" })
    );
  });

  // ------------------------------ 404 FALLBACK -------------------
  test("Unknown route → 404", () => {
    handleRequest(mockReq("/api/unknown-path", "GET"), mockRes);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      mockRes,
      404,
      expect.objectContaining({
        success: false,
        error: "Route not found"
      })
    );
  });
});
