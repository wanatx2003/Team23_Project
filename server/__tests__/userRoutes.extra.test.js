jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("../utils/requestUtils", () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

const pool = require("../config/db");
const { parseRequestBody, sendJsonResponse } = require("../utils/requestUtils");

const {
  getUserProfile,
  updateUserProfile,
  getStates,
  getAvailableSkills,
  getAllUsers,
  updateUserStatus
} = require("../routes/userRoutes");

beforeEach(() => jest.clearAllMocks());
jest.spyOn(console, "error").mockImplementation(() => {});

/* -------------------------------------------------------------------------- */
/*                            getUserProfile — missing branches                */
/* -------------------------------------------------------------------------- */

describe("getUserProfile – missing error branches", () => {
  test("skills query failure handled", () => {
    const req={}, res={};

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [{ UserID: 1 }])) // profile ok
      .mockImplementationOnce((q, p, cb) => cb(new Error("skill fail"))); // error

    getUserProfile(req, res, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Internal server error" }
    );
  });

  test("preferences query failure handled", () => {
    const req={}, res={};

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [{ UserID: 1 }])) 
      .mockImplementationOnce((q, p, cb) => cb(null, [{ SkillName: "CPR" }]))
      .mockImplementationOnce((q, p, cb) => cb(new Error("pref fail")));

    getUserProfile(req, res, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Internal server error" }
    );
  });

  test("availability query failure handled", () => {
    const req={}, res={};

    pool.query
      .mockImplementationOnce((q, p, cb) => cb(null, [{ UserID: 1 }]))
      .mockImplementationOnce((q, p, cb) => cb(null, [{ SkillName: "CPR" }]))
      .mockImplementationOnce((q, p, cb) => cb(null, [{ PreferenceText: "Outdoor" }]))
      .mockImplementationOnce((q, p, cb) => cb(new Error("availability fail")));

    getUserProfile(req, res, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Internal server error" }
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                   updateUserProfile — missing branches                      */
/* -------------------------------------------------------------------------- */

describe("updateUserProfile – remaining paths", () => {
  const valid = {
    UserID: 1,
    FullName: "X",
    Address1: "A",
    Address2: "B",
    City: "C",
    StateCode: "TX",
    Zipcode: "77001",
    Skills: ["CPR", "First Aid"],
    Preferences: ["Outdoor", "Kids"],
    Availability: [
      { DayOfWeek: "Mon", StartTime: "08:00", EndTime: "12:00" }
    ]
  };

  test("insert path (profile does not exist)", async () => {
    parseRequestBody.mockResolvedValue(valid);

    pool.query
      .mockImplementationOnce((q,p,cb)=>cb(null, [])) // no profile
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // insert profile
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // delete skills
      .mockImplementation((q,p,cb)=>cb(null,{})); // subsequent inserts

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      200,
      expect.objectContaining({ success: true })
    );
  });

  test("skill delete error (non-blocking)", async () => {
    parseRequestBody.mockResolvedValue(valid);

    pool.query
      .mockImplementationOnce((q,p,cb)=>cb(null,[{ProfileID:1}]))
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // update profile
      .mockImplementationOnce((q,p,cb)=>cb(new Error("delete error"))) // delete skills (ignored)
      .mockImplementation((q,p,cb)=>cb(null,{}));

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("preferences empty", async () => {
    const data = { ...valid, Preferences: [] };
    parseRequestBody.mockResolvedValue(data);

    pool.query
      .mockImplementationOnce((q,p,cb)=>cb(null,[{ProfileID:1}]))
      .mockImplementation((q,p,cb)=>cb(null,{}));

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("availability empty", async () => {
    const data = { ...valid, Availability: [] };
    parseRequestBody.mockResolvedValue(data);

    pool.query.mockImplementation((q,p,cb)=>cb(null,{}));

    await updateUserProfile({}, {});
    expect(sendJsonResponse).toHaveBeenCalled();
  });

  test("parse error", async () => {
    parseRequestBody.mockRejectedValue(new Error("bad"));

    await updateUserProfile({}, {});

    expect(sendJsonResponse).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({ error: "Server error" })
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                               getAllUsers                                   */
/* -------------------------------------------------------------------------- */

describe("getAllUsers", () => {
  test("returns list", () => {
    const req={}, res={};

    pool.query.mockImplementation((q,cb)=>cb(null, [{UserID:1}]));

    getAllUsers(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success:true, users:[{UserID:1}] }
    );
  });

  test("DB error", () => {
    const req={},res={};

    pool.query.mockImplementation((q,cb)=>cb(new Error()));

    getAllUsers(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.any(Object)
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                            updateUserStatus                                 */
/* -------------------------------------------------------------------------- */

describe("updateUserStatus", () => {
  const req={},res={};

  test("missing required fields", async () => {
    parseRequestBody.mockResolvedValue({});

    await updateUserStatus(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      400,
      expect.any(Object)
    );
  });

  test("invalid AccountStatus", async () => {
    parseRequestBody.mockResolvedValue({ UserID: 1, AccountStatus: "BANNED" });

    await updateUserStatus(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      400,
      expect.objectContaining({ error: "Invalid AccountStatus" })
    );
  });

  test("DB error", async () => {
    parseRequestBody.mockResolvedValue({ UserID: 1, AccountStatus: "Active" });

    pool.query.mockImplementation((q,p,cb)=>cb(new Error()));

    await updateUserStatus(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.any(Object)
    );
  });

  test("user not found", async () => {
    parseRequestBody.mockResolvedValue({ UserID: 1, AccountStatus: "Active" });

    pool.query.mockImplementation((q,p,cb)=>cb(null,{affectedRows:0}));

    await updateUserStatus(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      404,
      expect.any(Object)
    );
  });

  test("success update", async () => {
    parseRequestBody.mockResolvedValue({ UserID: 1, AccountStatus: "Active" });

    pool.query.mockImplementation((q,p,cb)=>cb(null,{affectedRows:1}));

    await updateUserStatus(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ success:true })
    );
  });

  test("parse error", async () => {
    parseRequestBody.mockRejectedValue(new Error("bad"));

    await updateUserStatus(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.objectContaining({ error:"Server error" })
    );
  });
});
