/**
 * Jest configuration for server tests
 * Runs in Node environment and collects coverage for server files
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.js?(x)'],
  collectCoverage: true,
collectCoverageFrom: [
  '**/*.js',
  '!**/node_modules/**',
  '!coverage/**'
],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov']
};
