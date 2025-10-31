const handleRequest = require("../routes/index");
const { sendJsonResponse } = require("../utils/requestUtils");

// Mock all route handlers
jest.mock("../routes/authRoutes", () => ({
  login: jest.fn(),
  register: jest.fn(),
  getAllUsers: jest.fn(),
}));

jest.mock("../routes/userRoutes", () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getStates: jest.fn(),
  getAvailableSkills: jest.fn(),
}));

jest.mock("../routes/eventRoutes", () => ({
  getAllEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
}));

jest.mock("../routes/matchingRoutes", () => ({
  getVolunteerMatches: jest.fn(),
  createVolunteerMatch: jest.fn(),
  updateMatchStatus: jest.fn(),
}));

jest.mock("../routes/notificationRoutes", () => ({
  getUserNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  getUnreadCount: jest.fn(),
}));

jest.mock("../routes/historyRoutes", () => ({
  getVolunteerHistory: jest.fn(),
  getAllVolunteerHistory: jest.fn(),
  addVolunteerHistory: jest.fn(),
  updateVolunteerHistory: jest.fn(),
}));

jest.mock("../utils/requestUtils", () => ({
  sendJsonResponse: jest.fn(),
}));


const buildReqRes = (url, method = "GET") => {
  const req = { url, method };
  const res = {};
  return { req, res };
};

beforeEach(() => {
  jest.clearAllMocks();
});


describe("index.js router", () => {
  test("routes login", async () => {
    const { req, res } = buildReqRes("/api/login", "POST");
    const { login } = require("../routes/authRoutes");

    await handleRequest(req, res);
    expect(login).toHaveBeenCalled();
  });

  test("routes get user profile", () => {
    const { req, res } = buildReqRes("/api/profile/5", "GET");
    const { getUserProfile } = require("../routes/userRoutes");

    handleRequest(req, res);
    expect(getUserProfile).toHaveBeenCalledWith(req, res, "5");
  });

  test("routes create event", () => {
    const { req, res } = buildReqRes("/api/events", "POST");
    const { createEvent } = require("../routes/eventRoutes");

    handleRequest(req, res);
    expect(createEvent).toHaveBeenCalled();
  });

  test("routes volunteer history user", () => {
    const { req, res } = buildReqRes("/api/volunteer-history/7", "GET");
    const { getVolunteerHistory } = require("../routes/historyRoutes");

    handleRequest(req, res);
    expect(getVolunteerHistory).toHaveBeenCalledWith(req, res, "7");
  });

  test("routes volunteer history all", () => {
    const { req, res } = buildReqRes("/api/volunteer-history/all", "GET");
    const { getAllVolunteerHistory } = require("../routes/historyRoutes");

    handleRequest(req, res);
    expect(getAllVolunteerHistory).toHaveBeenCalled();
  });

  test("unknown route returns 404", () => {
    const { req, res } = buildReqRes("/api/does-not-exist", "GET");

    handleRequest(req, res);
    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      404,
      expect.objectContaining({ success: false })
    );
  });

  test("routes health check", () => {
    const { req, res } = buildReqRes("/api/health", "GET");

    handleRequest(req, res);
    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ status: "healthy" })
    );
  });
});
