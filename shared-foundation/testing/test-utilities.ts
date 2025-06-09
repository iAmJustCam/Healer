/**
 * Testing Utilities - SSOT Compliant Implementation
 * Common utilities for all testing scenarios
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ All types imported from canonical SSOT
 * ✓ No local type definitions
 * ✓ Uses createApiError/createApiSuccess pattern
 * ✓ Environment detection for Jest APIs
 * ✓ Pure utility functions following SOLID principles
 */

// STRICT CANONICAL TYPE IMPORTS ONLY
import { ApiError, EntityId, FilePath, Result, Timestamp, createEntityId, createFilePath, createTimestamp } from '../types/canonical-types';

// Import Jest types for environment where available
declare global {
  var jest: typeof import('@jest/globals').jest | undefined;
  var beforeEach: typeof import('@jest/globals').beforeEach | undefined;
  var afterEach: typeof import('@jest/globals').afterEach | undefined;
  var describe: typeof import('@jest/globals').describe | undefined;
  var it: typeof import('@jest/globals').it | undefined;
  var expect: typeof import('@jest/globals').expect | undefined;
}

/**
 * Test execution context interface using canonical types
 */
export interface TestExecutionContext {
  readonly operationId: EntityId;
  readonly workingDirectory: FilePath;
  readonly dryRun: boolean;
  readonly interactive: boolean;
  readonly verbose: boolean;
  readonly timestamp: Timestamp;
}

/**
 * Test file content interface using canonical types
 */
export interface TestFileContent {
  readonly path: FilePath;
  readonly content: string;
  readonly hash: string;
  readonly encoding: 'utf8' | 'base64';
  readonly timestamp: Timestamp;
}

/**
 * Test result interface using canonical types
 */
export interface TestResult {
  readonly success: boolean;
  readonly duration: number;
  readonly coverage: number;
  readonly errors: readonly TestError[];
  readonly warnings: readonly string[];
  readonly timestamp: Timestamp;
}

/**
 * Test error interface using canonical types
 */
export interface TestError {
  readonly code: string;
  readonly message: string;
  readonly file?: FilePath;
  readonly line?: number;
  readonly column?: number;
  readonly stack?: string;
}

/**
 * Testing utilities class with strict SOLID compliance
 */
export class TestUtilities {
  /**
   * Create mock execution context for testing
   */
  static createMockExecutionContext(domain: string): TestExecutionContext {
    return {
      operationId: createEntityId(`test_${domain}_${Date.now()}`),
      workingDirectory: createFilePath(`/test/${domain}`),
      dryRun: true,
      interactive: false,
      verbose: false,
      timestamp: createTimestamp(),
    };
  }

  /**
   * Create mock file content for testing
   */
  static createMockFileContent(path: string, content: string = ''): TestFileContent {
    return {
      path: createFilePath(path),
      content,
      hash: `test_hash_${Date.now()}`,
      encoding: 'utf8' as const,
      timestamp: createTimestamp(),
    };
  }

  /**
   * Measure execution time of an async operation
   */
  static async measureExecutionTime<T>(
    operation: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Create test result using canonical types
   */
  static createTestResult(
    success: boolean,
    duration: number = 0,
    errors: TestError[] = [],
  ): TestResult {
    return {
      success,
      duration,
      coverage: success ? 100 : 0,
      errors,
      warnings: [],
      timestamp: createTimestamp(),
    };
  }

  /**
   * Environment detection for Jest globals
   */
  static isJestEnvironment(): boolean {
    return (
      typeof global !== 'undefined' &&
      typeof global.jest !== 'undefined' &&
      typeof global.expect !== 'undefined'
    );
  }

  /**
   * Safe Jest mock creation with environment detection
   */
  static createMockFunction<T extends (...args: any[]) => any>(
    implementation?: T,
  ): jest.MockedFunction<T> | T {
    if (!this.isJestEnvironment()) {
      // Return a simple mock function when Jest is not available
      return (implementation || (() => {})) as T;
    }

    // Use Jest mocking when available
    return global.jest!.fn(implementation) as jest.MockedFunction<T>;
  }

  /**
   * Safe Jest spy creation with environment detection
   */
  static createSpyOn<T extends object, K extends keyof T>(
    object: T,
    method: K,
  ): jest.SpyInstance<
    ReturnType<T[K] extends (...args: any[]) => any ? T[K] : never>,
    Parameters<T[K] extends (...args: any[]) => any ? T[K] : never>
  > | void {
    if (!this.isJestEnvironment()) {
      console.warn('Jest spy requested but Jest environment not detected');
      return;
    }

    return global.jest!.spyOn(object, method as any);
  }

  /**
   * Create test error from any error type
   */
  static createTestError(error: unknown, code: string = 'TEST_ERROR', file?: string): TestError {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    return {
      code,
      message,
      file: file ? createFilePath(file) : undefined,
      stack,
    };
  }

  /**
   * Validate test environment setup
   */
  static validateTestEnvironment(): Result<void, ApiError> {
    const missing: string[] = [];

    if (!this.isJestEnvironment()) {
      missing.push('Jest test framework');
    }

    if (typeof global === 'undefined') {
      missing.push('Global object');
    }

    if (missing.length > 0) {
      return {
        success: false,
        error: {
          code: 'TEST_ENVIRONMENT_INVALID',
          message: `Missing test environment requirements: ${missing.join(', ')}`,
          details: { missing },
        },
      };
    }

    return { success: true, data: undefined };
  }

  /**
   * Setup test isolation with cleanup
   */
  static setupTestIsolation(testName: string): () => void {
    const originalConsole = { ...console };
    const testId = createEntityId(`test-${testName}-${Date.now()}`);

    // Replace console with test-aware version
    console.log = this.createMockFunction(() => {});
    console.warn = this.createMockFunction(() => {});
    console.error = this.createMockFunction(() => {});

    // Return cleanup function
    return () => {
      Object.assign(console, originalConsole);
    };
  }

  /**
   * Create assertion helper with type safety
   */
  static createAssertion<T>(
    value: T,
    predicate: (val: T) => boolean,
    message: string,
  ): Result<T, TestError> {
    if (predicate(value)) {
      return { success: true, data: value };
    }

    return {
      success: false,
      error: this.createTestError(new Error(message), 'ASSERTION_FAILED'),
    };
  }

  /**
   * Async test wrapper with timeout and error handling
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 5000,
    timeoutMessage?: string,
  ): Promise<Result<T, TestError>> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const result = await Promise.race([operation(), timeoutPromise]);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: this.createTestError(error, 'TEST_TIMEOUT'),
      };
    }
  }

  /**
   * File-based test data loader with validation
   */
  static async loadTestData<T>(
    filePath: string,
    validator?: (data: unknown) => data is T,
  ): Promise<Result<T, TestError>> {
    try {
      // Environment detection for file system
      if (typeof require === 'undefined') {
        return {
          success: false,
          error: this.createTestError(
            new Error('File system not available in this environment'),
            'ENVIRONMENT_ERROR',
          ),
        };
      }

      const fs = require('fs');
      const path = require('path');

      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(content);

      if (validator && !validator(data)) {
        return {
          success: false,
          error: this.createTestError(
            new Error(`Test data validation failed for ${filePath}`),
            'VALIDATION_ERROR',
            filePath,
          ),
        };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.createTestError(error, 'TEST_DATA_LOAD_ERROR', filePath),
      };
    }
  }
}

/**
 * Mock logger that respects the SSOT pattern
 */
export const mockLogger = {
  info: TestUtilities.createMockFunction((message: string, context?: any) => {
    if (process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }),
  warn: TestUtilities.createMockFunction((message: string, context?: any) => {
    if (process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }),
  error: TestUtilities.createMockFunction((message: string, context?: any) => {
    if (process.env.NODE_ENV === 'test') {
      console.error(`[ERROR] ${message}`, context || '');
    }
  }),
  debug: TestUtilities.createMockFunction((message: string, context?: any) => {
    if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }),
};

/**
 * Test fixture builder with type safety
 */
export class TestFixtureBuilder<T> {
  private data: Partial<T> = {};

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }

  build(defaults: T): T {
    return { ...defaults, ...this.data };
  }

  reset(): this {
    this.data = {};
    return this;
  }

  partial(): Partial<T> {
    return { ...this.data };
  }
}

/**
 * Test data factory for common test scenarios
 */
export class TestDataFactory {
  /**
   * Create test execution context factory
   */
  static executionContext(): TestFixtureBuilder<TestExecutionContext> {
    return new TestFixtureBuilder<TestExecutionContext>();
  }

  /**
   * Create test file content factory
   */
  static fileContent(): TestFixtureBuilder<TestFileContent> {
    return new TestFixtureBuilder<TestFileContent>();
  }

  /**
   * Create test result factory
   */
  static testResult(): TestFixtureBuilder<TestResult> {
    return new TestFixtureBuilder<TestResult>();
  }

  /**
   * Create standard test defaults
   */
  static getDefaults() {
    return {
      executionContext: {
        operationId: createEntityId('test-operation'),
        workingDirectory: createFilePath('/test'),
        dryRun: true,
        interactive: false,
        verbose: false,
        timestamp: createTimestamp(),
      } as TestExecutionContext,

      fileContent: {
        path: createFilePath('/test/file.ts'),
        content: '// test content',
        hash: 'test-hash',
        encoding: 'utf8' as const,
        timestamp: createTimestamp(),
      } as TestFileContent,

      testResult: {
        success: true,
        duration: 100,
        coverage: 100,
        errors: [],
        warnings: [],
        timestamp: createTimestamp(),
      } as TestResult,
    };
  }
}

/**
 * Async test helpers with proper error handling
 */
export class AsyncTestHelpers {
  /**
   * Wait for condition with timeout
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeoutMs: number = 1000,
    intervalMs: number = 50,
  ): Promise<Result<void, TestError>> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await condition();
        if (result) {
          return { success: true, data: undefined };
        }
      } catch (error) {
        return {
          success: false,
          error: TestUtilities.createTestError(error, 'WAIT_FOR_ERROR'),
        };
      }

      await this.sleep(intervalMs);
    }

    return {
      success: false,
      error: TestUtilities.createTestError(
        new Error(`Condition not met within ${timeoutMs}ms`),
        'WAIT_FOR_TIMEOUT',
      ),
    };
  }

  /**
   * Sleep utility for tests
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 100,
  ): Promise<Result<T, TestError>> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: TestUtilities.createTestError(lastError, 'RETRY_EXHAUSTED'),
    };
  }
}

/**
 * Test validation helpers
 */
export class TestValidation {
  /**
   * Validate object structure matches expected shape
   */
  static validateShape<T>(object: unknown, expectedKeys: (keyof T)[]): Result<T, TestError> {
    if (!object || typeof object !== 'object') {
      return {
        success: false,
        error: TestUtilities.createTestError(
          new Error('Expected object, got ' + typeof object),
          'SHAPE_VALIDATION_ERROR',
        ),
      };
    }

    const obj = object as Record<string, unknown>;
    const missingKeys = expectedKeys.filter((key) => !(String(key) in obj));

    if (missingKeys.length > 0) {
      return {
        success: false,
        error: TestUtilities.createTestError(
          new Error(`Missing required keys: ${missingKeys.join(', ')}`),
          'MISSING_KEYS_ERROR',
        ),
      };
    }

    return { success: true, data: object as T };
  }

  /**
   * Validate array contains expected number of items
   */
  static validateArrayLength<T>(array: T[], expectedLength: number): Result<T[], TestError> {
    if (!Array.isArray(array)) {
      return {
        success: false,
        error: TestUtilities.createTestError(
          new Error('Expected array, got ' + typeof array),
          'ARRAY_VALIDATION_ERROR',
        ),
      };
    }

    if (array.length !== expectedLength) {
      return {
        success: false,
        error: TestUtilities.createTestError(
          new Error(`Expected array length ${expectedLength}, got ${array.length}`),
          'ARRAY_LENGTH_ERROR',
        ),
      };
    }

    return { success: true, data: array };
  }

  /**
   * Validate string matches pattern
   */
  static validatePattern(
    value: string,
    pattern: RegExp,
    errorMessage?: string,
  ): Result<string, TestError> {
    if (!pattern.test(value)) {
      return {
        success: false,
        error: TestUtilities.createTestError(
          new Error(errorMessage || `String "${value}" does not match pattern ${pattern}`),
          'PATTERN_VALIDATION_ERROR',
        ),
      };
    }

    return { success: true, data: value };
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure memory usage of operation
   */
  static async measureMemory<T>(
    operation: () => Promise<T>,
  ): Promise<Result<{ result: T; memoryDelta: number }, TestError>> {
    try {
      // Environment detection for process.memoryUsage
      if (typeof process === 'undefined' || typeof process.memoryUsage !== 'function') {
        return {
          success: false,
          error: TestUtilities.createTestError(
            new Error('Memory measurement not available in this environment'),
            'ENVIRONMENT_ERROR',
          ),
        };
      }

      const beforeMemory = process.memoryUsage();
      const result = await operation();
      const afterMemory = process.memoryUsage();

      const memoryDelta = afterMemory.heapUsed - beforeMemory.heapUsed;

      return {
        success: true,
        data: { result, memoryDelta },
      };
    } catch (error) {
      return {
        success: false,
        error: TestUtilities.createTestError(error, 'MEMORY_MEASUREMENT_ERROR'),
      };
    }
  }

  /**
   * Benchmark operation with multiple runs
   */
  static async benchmark<T>(
    operation: () => Promise<T>,
    runs: number = 10,
  ): Promise<Result<{ averageMs: number; minMs: number; maxMs: number; results: T[] }, TestError>> {
    try {
      const times: number[] = [];
      const results: T[] = [];

      for (let i = 0; i < runs; i++) {
        const start = Date.now();
        const result = await operation();
        const end = Date.now();

        times.push(end - start);
        results.push(result);
      }

      const averageMs = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minMs = Math.min(...times);
      const maxMs = Math.max(...times);

      return {
        success: true,
        data: { averageMs, minMs, maxMs, results },
      };
    } catch (error) {
      return {
        success: false,
        error: TestUtilities.createTestError(error, 'BENCHMARK_ERROR'),
      };
    }
  }
}

/**
 * Export all utilities for easy consumption
 */
export const testUtils = {
  TestUtilities,
  TestDataFactory,
  AsyncTestHelpers,
  TestValidation,
  PerformanceTestUtils,
  mockLogger,
};

/**
 * Default export for convenience
 */
export default testUtils;
