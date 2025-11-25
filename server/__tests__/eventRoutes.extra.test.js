jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getVolunteerMatches,
  createVolunteerMatch,
  updateEventStatus,
  createVolunteerRequest
} = require("../routes/eventRoutes");

beforeEach(() => jest.clearAllMocks());
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

/* -------------------------------------------------------------------------- */
/*                          CREATE EVENT – missing branches                    */
/* -------------------------------------------------------------------------- */

describe("createEvent extra coverage", () => {
  const base = {
    EventName: "Test",
    Description: "Desc",
    Location: "Loc",
    RequiredSkills: ["CPR"],
    Urgency: "high",
    EventDate: "2025-01-01",
    CreatedBy: 1
  };

  test("fails when Description missing", async () => {
    parseRequestBody.mockResolvedValue({ ...base, Description: "" });

    await createEvent({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.any(Object)
    );
  });

  test("fails when Location missing", async () => {
    parseRequestBody.mockResolvedValue({ ...base, Location: "" });

    await createEvent({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("fails when RequiredSkills empty", async () => {
    parseRequestBody.mockResolvedValue({ ...base, RequiredSkills: [] });

    await createEvent({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("fails when Urgency invalid", async () => {
    parseRequestBody.mockResolvedValue({ ...base, Urgency: "INVALID" });

    await createEvent({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("fails when EventDate missing", async () => {
    parseRequestBody.mockResolvedValue({ ...base, EventDate: "" });

    await createEvent({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("handles optional fields correctly", async () => {
    parseRequestBody.mockResolvedValue({
      ...base,
      StartTime: "",
      EndTime: "",
      MaxVolunteers: ""
    });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 10 }))
      .mockImplementation((q, p, cb) => cb(null));

    await createEvent({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ eventID: 10 })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                               UPDATE EVENT                                  */
/* -------------------------------------------------------------------------- */

describe("updateEvent extra", () => {
  const req = {}, res = {};
  const base = {
    EventID: 1,
    EventName: "X",
    Description: "D",
    Location: "L",
    RequiredSkills: ["CPR"],
    Urgency: "high",
    EventDate: "2025-01-01",
    StartTime: "",
    EndTime: "",
    MaxVolunteers: ""
  };

  test("fails when DB update fails", async () => {
    parseRequestBody.mockResolvedValue(base);

    pool.query.mockImplementationOnce((q, p, cb) =>
      cb(new Error("fail"))
    );

    await updateEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.any(Object)
    );
  });

  test("fails when deleting skills fails", async () => {
    parseRequestBody.mockResolvedValue(base);

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null)) // update OK
      .mockImplementationOnce((q, p, cb) => cb(new Error("fail"))); // delete skills

    await updateEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.any(Object)
    );
  });

  test("handles skill insert failure", async () => {
    parseRequestBody.mockResolvedValue(base);

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null))
      .mockImplementationOnce((q, p, cb) => cb(null)) // delete OK
      .mockImplementation((q, p, cb) => cb(new Error("insert fail")));

    await updateEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("covers notification error path", async () => {
    parseRequestBody.mockResolvedValue(base);

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null))
      .mockImplementationOnce((q, p, cb) => cb(null))
      .mockImplementationOnce((q, p, cb) => cb(null))
      .mockImplementation((q, p, cb) => cb(new Error("notif fail"))); // notification query

    await updateEvent(req, res);

    expect(sendJsonResponse).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/*                               DELETE EVENT                                  */
/* -------------------------------------------------------------------------- */

describe("deleteEvent extra", () => {
  test("DB error", async () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("bad")));

    await deleteEvent({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ success: false })
    );
  });

  test("catch block path", async () => {
    pool.query.mockImplementation(() => {
      throw new Error("explode");
    });

    await deleteEvent({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/*                        GET VOLUNTEER MATCHES                                */
/* -------------------------------------------------------------------------- */

describe("getVolunteerMatches extra", () => {
  test("DB error handled", () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    getVolunteerMatches({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                          CREATE VOLUNTEER MATCH                             */
/* -------------------------------------------------------------------------- */

describe("createVolunteerMatch extra", () => {
  test("match insert fails", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) =>
      cb(new Error("fail"))
    );

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.any(Object)
    );
  });

  test("volunteer count update fails (non-fatal)", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, {})) // match OK
      .mockImplementationOnce((q, p, cb) => cb(new Error("fail"))); // update count

    await createVolunteerMatch({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/*                             UPDATE EVENT STATUS                             */
/* -------------------------------------------------------------------------- */

describe("updateEventStatus", () => {
  test("invalid status rejected", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1, EventStatus: "INVALID" });

    await updateEventStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.any(Object)
    );
  });

  test("DB update fails", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1, EventStatus: "published" });

    pool.query.mockImplementationOnce((q, p, cb) => cb(new Error("fail")));

    await updateEventStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.any(Object)
    );
  });

  test("event not found", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1, EventStatus: "published" });

    pool.query.mockImplementationOnce((q, p, cb) =>
      cb(null, { affectedRows: 0 })
    );

    await updateEventStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      404,
      expect.any(Object)
    );
  });

  test("notification errors do not break flow", async () => {
    parseRequestBody.mockResolvedValue({ EventID: 1, EventStatus: "cancelled" });

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, { affectedRows: 1 })) // status OK
      .mockImplementationOnce((q, p, cb) => cb(null, [{ EventName: "X" }])) // get event
      .mockImplementation((q, p, cb) => cb(new Error("notif fail"))); // notification

    await updateEventStatus({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                           CREATE VOLUNTEER REQUEST                           */
/* -------------------------------------------------------------------------- */

describe("createVolunteerRequest extra", () => {
  test("DB error when checking duplicates", async () => {
    parseRequestBody.mockResolvedValue({ VolunteerID: 1, EventID: 2 });

    pool.query.mockImplementationOnce((q, p, cb) =>
      cb(new Error("fail"))
    );

    await createVolunteerRequest({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.any(Object)
    );
  });
});
