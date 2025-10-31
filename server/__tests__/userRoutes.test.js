const {
  getUserProfile,
  updateUserProfile,
  getStates,
  getAvailableSkills
} = require("../routes/userProfileRoutes");

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

beforeEach(() => jest.clearAllMocks());

/* -------------------------------------------------------------------------- */
/*                               ✅ getUserProfile                             */
/* -------------------------------------------------------------------------- */
describe("getUserProfile", () => {
  test("returns full user profile with skills, preferences, availability", async () => {
    const req = {}, res = {};
    const userId = 1;

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [{ UserID: 1, FirstName: "John" }])) // user
      .mockImplementationOnce((q, p, cb) => cb(null, [{ SkillName: "First Aid" }]))       // skills
      .mockImplementationOnce((q, p, cb) => cb(null, [{ PreferenceText: "Outdoor" }]))    // pref
      .mockImplementationOnce((q, p, cb) => cb(null, [{ DayOfWeek: "Mon" }]));            // avail

    await getUserProfile(req, res, userId);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res, 200,
      expect.objectContaining({
        success: true,
        profile: expect.objectContaining({
          skills: ["First Aid"],
          preferences: ["Outdoor"],
          availability: [{ DayOfWeek: "Mon" }]
        })
      })
    );
  });

  test("404 when no user found", async () => {
    pool.query.mockImplementation((q, p, cb) => cb(null, []));

    await getUserProfile({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 404, expect.objectContaining({ error: "User not found" })
    );
  });

  test("DB error on first query", async () => {
    pool.query.mockImplementation((q, p, cb) => cb(new Error("fail")));

    await getUserProfile({}, {}, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 500, expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                             ✅ updateUserProfile                            */
/* -------------------------------------------------------------------------- */
describe("updateUserProfile", () => {
  const validBody = {
    UserID: 1,
    FullName: "John",
    Address1: "123 St",
    City: "Houston",
    StateCode: "TX",
    Zipcode: "77001",
    Skills: ["First Aid"],
    Preferences: ["Outdoor"],
    Availability: [{ DayOfWeek: "Mon", StartTime: "09:00", EndTime: "12:00" }]
  };

  test("validation: missing FullName", async () => {
    parseRequestBody.mockResolvedValue({ ...validBody, FullName: "" });

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 400,
      expect.objectContaining({ error: expect.stringContaining("Full name") })
    );
  });

  test("successfully updates user profile", async () => {
    parseRequestBody.mockResolvedValue(validBody);

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [{ ProfileID: 1 }])) // existing profile
      .mockImplementation((q, p, cb) => cb(null)); // all subsequent ops succeed

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 200,
      expect.objectContaining({ success: true })
    );
  });

  test("DB error when checking profile", async () => {
    parseRequestBody.mockResolvedValue(validBody);

    pool.query.mockImplementationOnce((q, p, cb) => cb(new Error("fail")));

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });

  test("error inserting skill triggers 500", async () => {
    parseRequestBody.mockResolvedValue(validBody);

    pool.query
      .mockImplementationOnce((q,p,cb)=>cb(null,[{ProfileID:1}])) // exists
      .mockImplementationOnce((q,p,cb)=>cb(null))                 // update profile
      .mockImplementationOnce((q,p,cb)=>cb(null))                 // delete skills
      .mockImplementationOnce((q,p,cb)=>cb(new Error("fail")));   // insert skill

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 500,
      expect.objectContaining({ error: "Failed to update profile" })
    );
  });

  test("works when no Preferences or Availability", async () => {
    const body = { ...validBody, Preferences: [], Availability: [] };
    parseRequestBody.mockResolvedValue(body);

    pool.query.mockImplementation((q, p, cb) => cb(null));

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 200,
      expect.objectContaining({ success: true })
    );
  });

  test("parseRequestBody throws error", async () => {
    parseRequestBody.mockRejectedValue(new Error("oops"));

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 500,
      expect.objectContaining({ error: "Server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                                 ✅ getStates                               */
/* -------------------------------------------------------------------------- */
describe("getStates", () => {
  test("returns states list", () => {
    const states = [{ StateCode: "TX", StateName: "Texas" }];
    pool.query.mockImplementation((q, cb) => cb(null, states));

    getStates({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 200, { success: true, states }
    );
  });

  test("DB error", () => {
    pool.query.mockImplementation((q, cb) => cb(new Error("fail")));

    getStates({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 500,
      expect.objectContaining({ error: "Internal server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                          ✅ getAvailableSkills                              */
/* -------------------------------------------------------------------------- */
describe("getAvailableSkills", () => {
  test("returns skill list", () => {
    getAvailableSkills({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(), 200,
      expect.objectContaining({ success: true, skills: expect.any(Array) })
    );
  });
});
