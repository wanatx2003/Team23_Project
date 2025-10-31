const { Readable } = require('stream');
const { parseRequestBody, sendJsonResponse, setCorsHeaders } = require('../utils/requestUtils');

describe('requestUtils', () => {
  describe('parseRequestBody', () => {
    test('parses JSON body from a readable stream', async () => {
      const payload = { name: 'Alice', age: 30 };
      const req = new Readable({ read() {} });
      // push buffer chunks and end
      req.push(Buffer.from(JSON.stringify(payload)));
      req.push(null);

      const result = await parseRequestBody(req);
      expect(result).toEqual(payload);
    });

    test('resolves to empty object for empty body', async () => {
      const req = new Readable({ read() {} });
      req.push(null);

      const result = await parseRequestBody(req);
      expect(result).toEqual({});
    });

    test('rejects on invalid JSON', async () => {
      const req = new Readable({ read() {} });
      req.push('not-json');
      req.push(null);

      await expect(parseRequestBody(req)).rejects.toBeInstanceOf(Error);
    });
  });

  describe('sendJsonResponse', () => {
    test('writes head and ends with JSON string', () => {
      const res = {
        writeHead: jest.fn(),
        end: jest.fn()
      };

      sendJsonResponse(res, 201, { ok: true });

      expect(res.writeHead).toHaveBeenCalledWith(201, { 'Content-Type': 'application/json' });
      expect(res.end).toHaveBeenCalledWith(JSON.stringify({ ok: true }));
    });
  });

  describe('setCorsHeaders', () => {
    test('sets expected CORS headers', () => {
      const headers = {};
      const res = {
        setHeader: (k, v) => { headers[k] = v; }
      };

      setCorsHeaders(res);

      expect(headers['Access-Control-Allow-Origin']).toBe('*');
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
    });
  });
});
