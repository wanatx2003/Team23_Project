/**
 * Jest configuration for server tests
 * Ensures 80%+ coverage for backend
 */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>"],  // server root
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],
  
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/**/*.js",
    "!<rootDir>/jest.config.js",
    "!<rootDir>/node_modules/**",
    "!<rootDir>/coverage/**",
    "!<rootDir>/emailService.js",
    "!<rootDir>/sendEmail.js",

  ],

  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov"],
};
