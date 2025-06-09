// Test setup and global configuration
import { Result, ApiError } from '';
import { ApiError } from '../types/canonical-types';

// Global test configuration
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Mock console to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Keep errors and warnings, but suppress info/debug in tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error
};

// Restore console after tests
afterAll(() => {
  global.console = originalConsole;
});
