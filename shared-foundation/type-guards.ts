/**
 * Type Guards - Runtime type checking utilities
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import {
  ApiResponse,
  BusinessDomain,
  ComplexityLevel,
  ComplexityScore,
  ConfidenceScore,
  EntityId,
  FilePath,
  Framework,
  OperationId,
  PatternId,
  Result,
  RiskLevel,
  Severity,
  ApiError,
  Timestamp,
  TransformationStrategy,
  ValidationLevel,
} from "../types/foundation.types";

// ============================================================================
// PRIMITIVE TYPE GUARDS
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullish(value: unknown): value is null | undefined {
  return value == null;
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// ============================================================================
// BRANDED TYPE GUARDS
// ============================================================================

export function isEntityId(value: unknown): value is EntityId {
  return isString(value) && value.length > 0;
}

export function isFilePath(value: unknown): value is FilePath {
  return isString(value) && value.length > 0;
}

export function isOperationId(value: unknown): value is OperationId {
  return isString(value) && /^op_\d+_[a-z0-9]+$/.test(value);
}

export function isPatternId(value: unknown): value is PatternId {
  return isString(value) && value.length > 0;
}

export function isTimestamp(value: unknown): value is Timestamp {
  return isString(value) && !isNaN(Date.parse(value));
}

export function isConfidenceScore(value: unknown): value is ConfidenceScore {
  return isNumber(value) && value >= 0 && value <= 1;
}

export function isComplexityScore(value: unknown): value is ComplexityScore {
  return isNumber(value) && value >= 1 && value <= 10 && Number.isInteger(value);
}

// ============================================================================
// ENUM TYPE GUARDS
// ============================================================================

export function isFramework(value: unknown): value is Framework {
  return isString(value) && Object.values(Framework).includes(value as Framework);
}

export function isRiskLevel(value: unknown): value is RiskLevel {
  return isString(value) && Object.values(RiskLevel).includes(value as RiskLevel);
}

export function isSeverity(value: unknown): value is Severity {
  return isString(value) && Object.values(Severity).includes(value as Severity);
}

export function isValidationLevel(value: unknown): value is ValidationLevel {
  return isString(value) && Object.values(ValidationLevel).includes(value as ValidationLevel);
}

export function isComplexityLevel(value: unknown): value is ComplexityLevel {
  return isString(value) && Object.values(ComplexityLevel).includes(value as ComplexityLevel);
}

export function isTransformationStrategy(value: unknown): value is TransformationStrategy {
  return (
    isString(value) &&
    Object.values(TransformationStrategy).includes(value as TransformationStrategy)
  );
}

export function isBusinessDomain(value: unknown): value is BusinessDomain {
  return isString(value) && Object.values(BusinessDomain).includes(value as BusinessDomain);
}

// ============================================================================
// COMPLEX TYPE GUARDS
// ============================================================================

export function isResult<T>(value: unknown): value is Result<T> {
  return isObject(value) && 'success' in value && isBoolean(value.success);
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isObject(value) &&
    'code' in value &&
    'message' in value &&
    'context' in value &&
    'timestamp' in value &&
    'recoverable' in value &&
    isString(value.code) &&
    isString(value.message) &&
    isObject(value.context) &&
    isTimestamp(value.timestamp) &&
    isBoolean(value.recoverable)
  );
}

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    isObject(value) &&
    'success' in value &&
    'timestamp' in value &&
    isBoolean(value.success) &&
    isTimestamp(value.timestamp)
  );
}

// ============================================================================
// COLLECTION TYPE GUARDS
// ============================================================================

export function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return isArray(value) && value.every(guard);
}

export function isRecordOf<T>(
  value: unknown,
  valueGuard: (item: unknown) => item is T,
): value is Record<string, T> {
  return isObject(value) && Object.values(value).every(valueGuard);
}

export function isTupleOf<T extends readonly unknown[]>(
  value: unknown,
  guards: { [K in keyof T]: (item: unknown) => item is T[K] },
): value is T {
  return (
    isArray(value) &&
    value.length === guards.length &&
    guards.every((guard, index) => guard(value[index]))
  );
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return isArray(value) && value.length > 0;
}

export function isEmailString(value: unknown): value is string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return isString(value) && emailRegex.test(value);
}

export function isUrlString(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

// ============================================================================
// COMPOSITION UTILITIES
// ============================================================================

export function oneOf<T extends readonly unknown[]>(
  ...guards: { [K in keyof T]: (value: unknown) => value is T[K] }
): (value: unknown) => value is T[number] {
  return (value: unknown): value is T[number] => {
    return guards.some((guard) => guard(value));
  };
}

export function allOf<T>(
  ...guards: Array<(value: unknown) => value is T>
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return guards.every((guard) => guard(value));
  };
}

export function nullable<T>(
  guard: (value: unknown) => value is T,
): (value: unknown) => value is T | null {
  return (value: unknown): value is T | null => {
    return value === null || guard(value);
  };
}

export function optional<T>(
  guard: (value: unknown) => value is T,
): (value: unknown) => value is T | undefined {
  return (value: unknown): value is T | undefined => {
    return value === undefined || guard(value);
  };
}

export function nullish<T>(
  guard: (value: unknown) => value is T,
): (value: unknown) => value is T | null | undefined {
  return (value: unknown): value is T | null | undefined => {
    return value == null || guard(value);
  };
}

// ============================================================================
// ASSERTION UTILITIES
// ============================================================================

export function assert<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  message?: string,
): asserts value is T {
  if (!guard(value)) {
    throw new Error(message || 'Assertion failed');
  }
}

export function assertString(value: unknown, message?: string): asserts value is string {
  assert(value, isString, message || 'Expected string');
}

export function assertNumber(value: unknown, message?: string): asserts value is number {
  assert(value, isNumber, message || 'Expected number');
}

export function assertObject(value: unknown, message?: string): asserts value is object {
  assert(value, isObject, message || 'Expected object');
}

export function assertArray(value: unknown, message?: string): asserts value is unknown[] {
  assert(value, isArray, message || 'Expected array');
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const typeGuards = {
  // Primitives
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isObject,
  isArray,
  isFunction,
  isDate,
  isRegExp,
  isError,

  // Branded types
  isEntityId,
  isFilePath,
  isOperationId,
  isPatternId,
  isTimestamp,
  isConfidenceScore,
  isComplexityScore,

  // Enums
  isFramework,
  isRiskLevel,
  isSeverity,
  isValidationLevel,
  isComplexityLevel,
  isTransformationStrategy,
  isBusinessDomain,

  // Complex types
  isResult,
  isApiError,
  isApiResponse,

  // Collections
  isArrayOf,
  isRecordOf,
  isTupleOf,

  // Utilities
  isNonEmptyString,
  isNonEmptyArray,
  isEmailString,
  isUrlString,
  isPositiveNumber,
  isNonNegativeNumber,
  isInteger,
  isPositiveInteger,

  // Composition
  oneOf,
  allOf,
  nullable,
  optional,
  nullish,

  // Assertions
  assert,
  assertString,
  assertNumber,
  assertObject,
  assertArray,
} as const;
