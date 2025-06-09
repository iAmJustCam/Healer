/**
 * Array Utilities - Core array manipulation functions
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import { Result, ApiError } from '';

// ============================================================================
// CORE ARRAY UTILITIES
// ============================================================================

/**
 * Removes duplicate values from an array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Groups array elements by a specified key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Splits an array into chunks of specified size
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [];

  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Safely gets the first element of an array
 */
export function first<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[0] : undefined;
}

/**
 * Safely gets the last element of an array
 */
export function last<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
}

/**
 * Finds the intersection of two arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Finds the difference between two arrays (elements in arr1 but not in arr2)
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Flattens nested arrays up to specified depth
 */
export function flatten<T>(arr: (T | T[])[], depth: number = 1): T[] {
  if (depth <= 0) return arr as T[];

  return arr.reduce((flat: T[], item) => {
    if (Array.isArray(item)) {
      flat.push(...flatten(item, depth - 1));
    } else {
      flat.push(item as T);
    }
    return flat;
  }, []);
}

/**
 * Safe array operation wrapper
 */
export function safeArrayOperation<T, R>(
  arr: T[],
  operation: (arr: T[]) => R,
  fallback: R,
): Result<R> {
  try {
    if (!Array.isArray(arr)) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Input is not an array',
          context: { operation: 'safeArrayOperation' },
          timestamp: new Date().toISOString(),
          recoverable: true,
        } as ApiError,
      };
    }

    const result = operation(arr);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      data: fallback,
      error: {
        code: 'OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        context: { operation: 'safeArrayOperation' },
        timestamp: new Date().toISOString(),
        recoverable: true,
      } as ApiError,
    };
  }
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const arrayUtils = {
  unique,
  groupBy,
  chunk,
  first,
  last,
  intersection,
  difference,
  flatten,
  safeArrayOperation,

  // Convenience methods
  isEmpty: <T>(arr: T[]): boolean => arr.length === 0,
  isNotEmpty: <T>(arr: T[]): boolean => arr.length > 0,

  // Type guards
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  isArrayOf: <T>(value: unknown, guard: (item: unknown) => item is T): value is T[] =>
    Array.isArray(value) && value.every(guard),
} as const;
