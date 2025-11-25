jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

const {
  createVolunteerMatch,
  getMyAssignments,
  submitAttendance,
} = require("../routes/volunteerRoutes");

beforeEach(() => jest.clearAllMocks());
jest.spyOn(console, "error").mockImplementation(() => {});

/* -------------------------------------------------------------------------- */
/*                         EXTRA TESTS: createVolunteerMatch                  */
/* -------------------------------------------------------------------------- */

describe("createVolunteerMatch — FULL COVERAGE", () => {
  test("returns 400 when missing fields", async () => {
    parseRequestBody.mockResolvedValue({}); // missing fields

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "VolunteerID and EventID are required" })
    );
  });

  test("handles DB error when checking existing matches", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(new Error("fail"), null));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("returns 400 if match already exists", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) => cb(null, [{}]));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "Volunteer is already matched to this event" })
    );
  });

  test("handles DB error inserting match", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [])) // no existing match
      .mockImplementationOnce((q, p, cb) => cb(new Error("fail"), null)); // insert error

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Failed to create match" })
    );
  });

  test("fully successful createVolunteerMatch flow", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, []))        // no existing match
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 55 })) // insert match
      .mockImplementationOnce((q, p, cb) => cb(null, {}))        // insert notification
      .mockImplementationOnce((q, p, cb) => cb(null, {}));       // update count

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true, matchID: 55 })
    );
  });

  test("handles DB error on updating volunteer count but still returns success", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, []))
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 55 }))
      .mockImplementationOnce((q, p, cb) => cb(null, {}))
      .mockImplementationOnce((q, p, cb) => cb(new Error("update fail")));

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                         EXTRA TESTS: getMyAssignments                      */
/* -------------------------------------------------------------------------- */

describe("getMyAssignments — EXTRA COVERAGE", () => {
  const { getMyAssignments } = require("../routes/volunteerRoutes");

  test("returns assignments with parsed RequiredSkills", () => {
    pool.query.mockImplementation((q, p, cb) =>
      cb(null, [{ MatchID: 1, RequiredSkills: "A,B" }])
    );

    getMyAssignments({}, {}, 10);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      {
        success: true,
        assignments: [{ MatchID: 1, RequiredSkills: ["A", "B"] }]
      }
    );
  });

  test("handles DB error", () => {
    pool.query.mockImplementation((q, p, cb) =>
      cb(new Error("fail"), null)
    );

    getMyAssignments({}, {}, 10);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                         EXTRA TESTS: submitAttendance                      */
/* -------------------------------------------------------------------------- */

describe("submitAttendance — FULL COVERAGE", () => {
  test("missing hours triggers 400", async () => {
    parseRequestBody.mockResolvedValue({ HoursVolunteered: 0 });

    await submitAttendance({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "Invalid hours volunteered" })
    );
  });

  test("existing attendance returns 400", async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1, EventID: 2, HoursVolunteered: 3
    });

    pool.query.mockImplementationOnce((q, p, cb) => cb(null, [{ HistoryID: 9 }]));

    await submitAttendance({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({ error: "Attendance already submitted for this event" })
    );
  });

  test("DB error checking existing attendance", async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1, EventID: 2, HoursVolunteered: 3
    });

    pool.query.mockImplementationOnce((q, p, cb) => cb(new Error("fail")));

    await submitAttendance({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("successful attendance submission", async () => {
    parseRequestBody.mockResolvedValue({
      MatchID: 5,
      VolunteerID: 1,
      EventID: 2,
      HoursVolunteered: 4,
      ParticipationDate: "2025-01-01"
    });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [])) // no existing attendance
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 9 })) // insert history
      .mockImplementationOnce((q, p, cb) => cb(null, {})) // update match
      .mockImplementationOnce((q, p, cb) => cb(null, {})) // update count
      .mockImplementationOnce((q, p, cb) => cb(null, {})); // notification

    await submitAttendance({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ historyID: 9 })
    );
  });

  test("handles DB error inserting history", async () => {
    parseRequestBody.mockResolvedValue({
      VolunteerID: 1, EventID: 2, HoursVolunteered: 3
    });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, []))
      .mockImplementationOnce((q, p, cb) => cb(new Error("fail")));

    await submitAttendance({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Failed to record attendance" })
    );
  });
});
