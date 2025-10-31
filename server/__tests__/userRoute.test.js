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
  getAvailableSkills
} = require("../routes/userRoutes");

beforeEach(() => jest.clearAllMocks());


describe("User Routes", () => {

  // ---------------- GET USER PROFILE ----------------
  test("getUserProfile returns full profile", () => {
    const req={},res={};

    // Mock queries pipeline
    pool.query
      .mockImplementationOnce((q, params, cb) => cb(null, [{ UserID: 1 }])) // profile
      .mockImplementationOnce((q, params, cb) => cb(null, [{ SkillName: "CPR" }])) // skills
      .mockImplementationOnce((q, params, cb) => cb(null, [{ PreferenceText: "Outdoor" }])) // prefs
      .mockImplementationOnce((q, params, cb) => cb(null, [{ DayOfWeek: "Mon", StartTime: "9", EndTime: "5" }])); // availability

    getUserProfile(req, res, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({
        success: true,
        profile: expect.objectContaining({
          skills: ["CPR"],
          preferences: ["Outdoor"],
          availability: [{ DayOfWeek: "Mon", StartTime: "9", EndTime: "5" }]
        })
      })
    );
  });

  test("getUserProfile returns 404 if no user", () => {
    const req={},res={};

    pool.query.mockImplementation((q,p,cb) => cb(null, []));

    getUserProfile(req, res, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      404,
      { success: false, error: "User not found" }
    );
  });

  test("getUserProfile handles DB error", () => {
    const req={},res={};

    pool.query.mockImplementation((q,p,cb) => cb(new Error(), null));

    getUserProfile(req, res, 1);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      { success: false, error: "Internal server error" }
    );
  });


  // ---------------- UPDATE USER PROFILE ----------------
  test("updateUserProfile fails validation", async () => {
    parseRequestBody.mockResolvedValue({
      FullName: "",
      Address1: "123",
      City: "A",
      StateCode: "TX",
      Zipcode: "77000",
      Skills: ["CPR"]
    });

    const req={},res={};

    await updateUserProfile(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      400,
      expect.any(Object)
    );
  });

  test("updateUserProfile updates existing profile", async () => {
    parseRequestBody.mockResolvedValue({
      UserID: 1, FullName: "A", Address1: "A", City: "A", StateCode: "TX",
      Zipcode: "77000", Skills:["CPR"], Preferences:["P"], Availability:[]
    });

    // profile exists → update path
    pool.query
      .mockImplementationOnce((q,p,cb)=>cb(null,[{ProfileID:1}])) // check
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // update
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // delete skills
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // insert skills
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // delete prefs
      .mockImplementationOnce((q,p,cb)=>cb(null,{})) // insert prefs
      .mockImplementationOnce((q,p,cb)=>cb(null,{})); // delete avail

    const req={},res={};
    await updateUserProfile(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success:true, message:"Profile updated successfully" }
    );
  });

  test("updateUserProfile handles DB error", async () => {
    parseRequestBody.mockResolvedValue({
      UserID: 1, FullName: "A", Address1: "A", City: "B",
      StateCode:"TX", Zipcode:"77000", Skills:["CPR"]
    });

    pool.query.mockImplementation((q,p,cb)=>cb(new Error(),[]));

    const req={},res={};
    await updateUserProfile(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.any(Object)
    );
  });


  // ---------------- GET STATES ----------------
  test("getStates returns list", () => {
    const req={},res={};
    
    pool.query.mockImplementation((q,cb)=>cb(null,[{StateCode:"TX"}]));

    getStates(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      { success:true, states:[{StateCode:"TX"}] }
    );
  });

  test("getStates error", () => {
    const req={},res={};

    pool.query.mockImplementation((q,cb)=>cb(new Error(),null));

    getStates(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      500,
      expect.any(Object)
    );
  });


  // ---------------- GET SKILLS ----------------
  test("getAvailableSkills returns predefined skills", () => {
    const req={},res={};

    getAvailableSkills(req,res);

    expect(sendJsonResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ success:true, skills: expect.any(Array) })
    );
  });

});
