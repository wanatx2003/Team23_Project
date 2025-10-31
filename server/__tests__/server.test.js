process.env.NODE_ENV = "test";

const http = require("http");

// ---- MOCK ROUTES BEFORE SERVER IMPORT ----
jest.mock("../routes/userRoutes", () => ({
  getUserProfile: jest.fn((req, res) => res.end("profile")),
  updateUserProfile: jest.fn((req, res) => res.end("profile-updated")),
  getStates: jest.fn((req, res) => res.end("states")),
  getAvailableSkills: jest.fn((req, res) => res.end("skills"))
}));

jest.mock("../routes/eventRoutes", () => ({
  getAllEvents: jest.fn((req, res) => res.end("all-events")),
  getAvailableEvents: jest.fn((req, res) => res.end("avail-events")),
  createEvent: jest.fn((req, res) => res.end("event-created")),
  updateEvent: jest.fn((req, res) => res.end("event-updated")),
  deleteEvent: jest.fn((req, res) => res.end("event-deleted")),
  getVolunteerMatches: jest.fn((req, res) => res.end("event-matches")),
  createVolunteerRequest: jest.fn((req, res) => res.end("vol-req"))
}));

jest.mock("../routes/notificationRoutes", () => ({
  createNotification: jest.fn((req, res) => res.end("notif-created")),
  getUnreadCount: jest.fn((req, res) => res.end("unread-count")),
  getUserNotifications: jest.fn((req, res) => res.end("user-notifs"))
}));

jest.mock("../routes/authRoutes", () => ({
  login: jest.fn((req, res) => res.end("login")),
  register: jest.fn((req, res) => res.end("register"))
}));

// ---- IMPORT SERVER AFTER MOCKS ----
let server;
beforeAll(() => {
  server = require("../server");
});

// ---- SHUTDOWN SERVER CLEANLY ----
afterAll(done => {
  server.close(done);
});

// ---- HTTP CALL HELPER ----
function request(path, method = "GET") {
  return new Promise(resolve => {
    const req = http.request(
      { hostname: "127.0.0.1", port: 5000, path, method },
      res => {
        let data = "";
        res.on("data", d => (data += d));
        res.on("end", () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      }
    );
    req.end();
  });
}

// ---- TESTS ----
describe("server.js routing", () => {

  test("OPTIONS returns CORS headers", done => {
    const req = http.request(
      { hostname: "127.0.0.1", port: 5000, path: "/api/user/profile/1", method: "OPTIONS" },
      res => {
        expect(res.statusCode).toBe(200);
        expect(res.headers["access-control-allow-origin"]).toBe("*");
        done();
      }
    );
    req.end();
  });

  test("GET /api/user/profile/10", async () => {
    const res = await request("/api/user/profile/10");
    expect(res.body).toBe("profile");
  });

  test("PUT /api/user/profile", async () => {
    const res = await request("/api/user/profile", "PUT");
    expect(res.body).toBe("profile-updated");
  });

  test("GET /api/user/states", async () => {
    const res = await request("/api/user/states");
    expect(res.body).toBe("states");
  });

  test("GET /api/user/skills", async () => {
    const res = await request("/api/user/skills");
    expect(res.body).toBe("skills");
  });

  test("POST /api/auth/login", async () => {
    const res = await request("/api/auth/login", "POST");
    expect(res.body).toBe("login");
  });

  test("POST /api/auth/register", async () => {
    const res = await request("/api/auth/register", "POST");
    expect(res.body).toBe("register");
  });

  test("GET /api/events", async () => {
    const res = await request("/api/events");
    expect(res.body).toBe("all-events");
  });

  test("GET /api/events/available", async () => {
    const res = await request("/api/events/available");
    expect(res.body).toBe("avail-events");
  });

  test("POST /api/events", async () => {
    const res = await request("/api/events", "POST");
    expect(res.body).toBe("event-created");
  });

  test("PUT /api/events", async () => {
    const res = await request("/api/events", "PUT");
    expect(res.body).toBe("event-updated");
  });

  test("DELETE /api/events/99", async () => {
    const res = await request("/api/events/99", "DELETE");
    expect(res.body).toBe("event-deleted");
  });

  test("GET /api/events/55/matches", async () => {
    const res = await request("/api/events/55/matches");
    expect(res.body).toBe("event-matches");
  });

  test("POST /api/volunteer/request", async () => {
    const res = await request("/api/volunteer/request", "POST");
    expect(res.body).toBe("vol-req");
  });

  test("POST /api/notifications", async () => {
    const res = await request("/api/notifications", "POST");
    expect(res.body).toBe("notif-created");
  });

  test("GET /api/notifications/unread/5", async () => {
    const res = await request("/api/notifications/unread/5");
    expect(res.body).toBe("unread-count");
  });

  test("GET /api/notifications/7", async () => {
    const res = await request("/api/notifications/7");
    expect(res.body).toBe("user-notifs");
  });

  test("Unknown route returns 404", async () => {
    const res = await request("/not-real");
    expect(res.status).toBe(404);
    expect(res.body).toContain("Route not found");
  });

});
