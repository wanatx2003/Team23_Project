const { login, register, getAllUsers } = require('../routes/authRoutes'); // adjust path if needed
const pool = require('../config/db');
const { parseRequestBody, sendJsonResponse } = require('../utils/requestUtils');

// Mock dependencies
jest.mock('../config/db', () => ({
  query: jest.fn()
}));

jest.mock('../utils/requestUtils', () => ({
  parseRequestBody: jest.fn(),
  sendJsonResponse: jest.fn()
}));

describe('Auth Route Handlers', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {};
    jest.clearAllMocks();
  });

  // ----------------- LOGIN -----------------
  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockBody = { email: 'test@example.com', password: '1234' };
      parseRequestBody.mockResolvedValue(mockBody);

      const mockUser = { UserID: 1, FirstName: 'Alice', Role: 'admin' };
      
      pool.query.mockImplementation((query, params, callback) => {
        callback(null, [mockUser]);
      });

      await login(req, res);

      expect(parseRequestBody).toHaveBeenCalled();
      expect(sendJsonResponse).toHaveBeenCalledWith(res, 200, { success: true, user: mockUser });
    });

    it('should return error for invalid credentials', async () => {
      parseRequestBody.mockResolvedValue({ email: 'bad@test.com', password: 'wrong' });

      pool.query.mockImplementation((q, p, cb) => cb(null, []));

      await login(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        200,
        { success: false, error: 'Invalid email or password' }
      );
    });

    it('should handle database error', async () => {
      parseRequestBody.mockResolvedValue({ email: 'a@b.com', password: '123' });

      pool.query.mockImplementation((q, p, cb) => cb(new Error('DB error'), null));

      await login(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        500,
        { success: false, error: 'Internal server error' }
      );
    });
  });

  // ----------------- REGISTER -----------------
  describe('register', () => {
    it('should register new user', async () => {
      const mockBody = {
        firstName: 'John', lastName: 'Doe',
        email: 'john@example.com', password: 'pass',
        phoneNumber: '111', role: 'volunteer'
      };
      parseRequestBody.mockResolvedValue(mockBody);

      // First query: user doesn't exist
      pool.query
        .mockImplementationOnce((q, p, cb) => cb(null, []))
        // Insert query returns insertId
        .mockImplementationOnce((q, p, cb) => cb(null, { insertId: 7 }));

      await register(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        200,
        {
          success: true,
          user: {
            UserID: 7,
            FirstName: 'John',
            LastName: 'Doe',
            Email: 'john@example.com',
            Role: 'volunteer'
          }
        }
      );
    });

    it('should fail if email already exists', async () => {
      parseRequestBody.mockResolvedValue({ email: 'taken@test.com' });

      // Mock user exists
      pool.query.mockImplementation((q, p, cb) => cb(null, [{ UserID: 1 }]));

      await register(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        400,
        { success: false, error: 'User with this email already exists' }
      );
    });

    it('should handle database error on check', async () => {
      parseRequestBody.mockResolvedValue({ email: 'test@test.com' });

      pool.query.mockImplementation((q, p, cb) => cb(new Error('DB fail'), null));

      await register(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        500,
        { success: false, error: 'Database error' }
      );
    });
  });

  // ----------------- GET USERS -----------------
  describe('getAllUsers', () => {
    it('should return all users', () => {
      const mockResults = [{ name: 'Alice' }, { name: 'Bob' }];

      pool.query.mockImplementation((q, cb) => cb(null, mockResults));

      getAllUsers(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(res, 200, mockResults);
    });

    it('should handle query error', () => {
      pool.query.mockImplementation((q, cb) => cb(new Error('Query error'), null));

      getAllUsers(req, res);

      expect(sendJsonResponse).toHaveBeenCalledWith(
        res,
        500,
        { error: 'Error executing query' }
      );
    });
  });
});
