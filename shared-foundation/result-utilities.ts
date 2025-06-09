/**
 * Result Utilities - Core result pattern helpers
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import {
  ApiResponse,
  createApiResponse,
  createApiError,
  Result,
  ApiError,
} from "../types/canonical-types";

// Type guard helper function
function isResult(value: unknown): value is Result<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (typeof (value as any).success === 'boolean')
  );
}

// ============================================================================
// RESULT CREATION UTILITIES
// ============================================================================

/**
 * Creates a successful result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Creates a failed result
 */
export function failure<T>(error: ApiError): Result<T> {
  return { success: false, error };
}

/**
 * Creates a failed result from an error message
 */
export function failureFromMessage<T>(
  code: string,
  message: string,
  operation: string = 'unknown',
): Result<T> {
  return failure(createApiError(code, message, operation));
}

/**
 * Creates a result from a potentially throwing operation
 */
export function fromTryCatch<T>(
  operation: () => T,
  errorCode: string = 'OPERATION_FAILED',
  operationName: string = 'fromTryCatch',
): Result<T> {
  try {
    const data = operation();
    return success(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return failureFromMessage(errorCode, message, operationName);
  }
}

/**
 * Creates a result from a promise
 */
export async function fromPromise<T>(
  promise: Promise<T>,
  errorCode: string = 'PROMISE_FAILED',
  operationName: string = 'fromPromise',
): Promise<Result<T>> {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return failureFromMessage(errorCode, message, operationName);
  }
}

// ============================================================================
// RESULT TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Maps the data of a successful result
 */
export function map<T, U>(result: Result<T>, mapper: (data: T) => U): Result<U> {
  if (result.success && result.data !== undefined) {
    return success(mapper(result.data));
  }
  return result as Result<U>;
}

/**
 * Maps the data of a successful result with another result
 */
export function flatMap<T, U>(result: Result<T>, mapper: (data: T) => Result<U>): Result<U> {
  if (result.success && result.data !== undefined) {
    return mapper(result.data);
  }
  return result as Result<U>;
}

/**
 * Maps the error of a failed result
 */
export function mapError<T>(
  result: Result<T>,
  mapper: (error: ApiError) => ApiError,
): Result<T> {
  if (!result.success && result.error) {
    return failure(mapper(result.error));
  }
  return result;
}

/**
 * Transforms a result to another type entirely
 */
export function fold<T, U>(
  result: Result<T>,
  onSuccess: (data: T) => U,
  onFailure: (error: ApiError) => U,
): U {
  if (result.success && result.data !== undefined) {
    return onSuccess(result.data);
  }
  if (result.error) {
    return onFailure(result.error);
  }
  throw new Error('Invalid result state');
}

/**
 * Provides a fallback value for failed results
 */
export function withDefault<T>(result: Result<T>, defaultValue: T): T {
  return result.success && result.data !== undefined ? result.data : defaultValue;
}

/**
 * Chains multiple results together, stopping at first failure
 */
export function chain<T, U>(result: Result<T>, next: (data: T) => Result<U>): Result<U> {
  return flatMap(result, next);
}

// ============================================================================
// RESULT COMBINATION UTILITIES
// ============================================================================

/**
 * Combines multiple results into a single result with an array of data
 */
export function combine<T>(results: Result<T>[]): Result<T[]> {
  const data: T[] = [];

  for (const result of results) {
    if (!result.success) {
      return result as Result<T[]>;
    }
    if (result.data !== undefined) {
      data.push(result.data);
    }
  }

  return success(data);
}

/**
 * Combines results of different types into a tuple
 */
export function combineHeterogeneous<T extends readonly unknown[]>(
  ...results: { [K in keyof T]: Result<T[K]> }
): Result<T> {
  const data: unknown[] = [];

  for (const result of results) {
    if (!result.success) {
      return result as Result<T>;
    }
    data.push(result.data);
  }

  return success(data as T);
}

/**
 * Takes the first successful result from an array
 */
export function firstSuccess<T>(results: Result<T>[]): Result<T> {
  for (const result of results) {
    if (result.success) {
      return result;
    }
  }

  return results.length > 0
    ? results[results.length - 1]
    : failureFromMessage('NO_RESULTS', 'No results provided');
}

// ============================================================================
// RESULT VALIDATION UTILITIES
// ============================================================================

/**
 * Validates result data with a predicate
 */
export function validate<T>(
  result: Result<T>,
  predicate: (data: T) => boolean,
  errorCode: string = 'VALIDATION_FAILED',
  errorMessage: string = 'Validation failed',
): Result<T> {
  if (result.success && result.data !== undefined) {
    if (predicate(result.data)) {
      return result;
    }
    return failureFromMessage(errorCode, errorMessage, 'validate');
  }
  return result;
}

/**
 * Ensures result data is not null or undefined
 */
export function requireData<T>(
  result: Result<T | null | undefined>,
  errorCode: string = 'MISSING_DATA',
  errorMessage: string = 'Required data is missing',
): Result<T> {
  return validate(result, (data): data is T => data != null, errorCode, errorMessage) as Result<T>;
}

// ============================================================================
// API RESPONSE UTILITIES
// ============================================================================

/**
 * Converts a Result to an ApiResponse
 */
export function toApiResponse<T>(result: Result<T>): ApiResponse<T> {
  return createApiResponse(result.data, result.error);
}

/**
 * Converts an ApiResponse to a Result
 */
export function fromApiResponse<T>(response: ApiResponse<T>): Result<T> {
  if (response.success) {
    return success(response.data as T);
  }
  return failure(response.error as ApiError);
}

// ============================================================================
// SIDE EFFECT UTILITIES
// ============================================================================

/**
 * Performs side effects on successful results
 */
export function onSuccess<T>(result: Result<T>, sideEffect: (data: T) => void): Result<T> {
  if (result.success && result.data !== undefined) {
    sideEffect(result.data);
  }
  return result;
}

/**
 * Performs side effects on failed results
 */
export function onFailure<T>(
  result: Result<T>,
  sideEffect: (error: ApiError) => void,
): Result<T> {
  if (!result.success && result.error) {
    sideEffect(result.error);
  }
  return result;
}

/**
 * Performs side effects regardless of result state
 */
export function onBoth<T>(result: Result<T>, sideEffect: (result: Result<T>) => void): Result<T> {
  sideEffect(result);
  return result;
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const resultUtils = {
  // Creation
  success,
  failure,
  failureFromMessage,
  fromTryCatch,
  fromPromise,

  // Transformation
  map,
  flatMap,
  mapError,
  fold,
  withDefault,
  chain,

  // Combination
  combine,
  combineHeterogeneous,
  firstSuccess,

  // Validation
  validate,
  requireData,

  // API Response
  toApiResponse,
  fromApiResponse,

  // Side Effects
  onSuccess,
  onFailure,
  onBoth,

  // Type Guards
  isResult: (value: unknown): value is Result<unknown> => isResult(value),
  isSuccess: <T>(result: Result<T>): result is Result<T> & { success: true; data: T } =>
    result.success && result.data !== undefined,
  isFailure: <T>(result: Result<T>): result is Result<T> & { success: false; error: ApiError } =>
    !result.success && !!result.error,
} as const;

// Do not create aliases - use canonical types directly
