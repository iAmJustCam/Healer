// Domain mocks for testing
import { Result, ApiError } from '';
export const mockPatternDetection = {
  detectPatterns: jest.fn(),
  getPatternRegistry: jest.fn(),
  analyzeFile: jest.fn()
};

export const mockTransformationEngine = {
  transform: jest.fn(),
  selectStrategy: jest.fn(),
  validateResult: jest.fn()
};

export const mockAIVerification = {
  verifyTransformation: jest.fn(),
  assessRisk: jest.fn(),
  generateAnnotations: jest.fn()
};

export const DomainMocks = {
  patternDetection: mockPatternDetection,
  transformation: mockTransformationEngine,
  aiVerification: mockAIVerification
};
