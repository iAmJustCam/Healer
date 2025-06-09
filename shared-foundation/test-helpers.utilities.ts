// Test helper utilities
import { Result, ApiError } from '';
export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

export const createMockExecutionContext = () => ({
  operationId: 'test_op_123',
  workingDirectory: '/test/dir',
  dryRun: true,
  interactive: false,
  verbose: false
});

export const createMockFileContent = (path: string, content: string = '') => ({
  path,
  content,
  hash: 'test_hash_123',
  encoding: 'utf8'
});

export const TestHelpers = {
  mockLogger,
  createMockExecutionContext,
  createMockFileContent
};
