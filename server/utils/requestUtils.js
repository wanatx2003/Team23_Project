// Helper function to parse JSON request body
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      try {
        if (body.length) {
          const parsedBody = JSON.parse(Buffer.concat(body).toString());
          resolve(parsedBody);
        } else {
          resolve({});
        }
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};

// Helper function to send a JSON response
const sendJsonResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// CORS headers middleware
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = {
  parseRequestBody,
  sendJsonResponse,
  setCorsHeaders
};
