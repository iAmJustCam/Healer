/**
 * Object Utilities - Core object manipulation functions
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import { Result, ApiError } from '';

// ============================================================================
// CORE OBJECT UTILITIES
// ============================================================================

/**
 * Picks specified properties from an object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omits specified properties from an object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Deep clones an object (JSON-serializable objects only)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Deep merges two objects
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = { ...target } as T & U;

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = (target as any)[key];

      if (
        isObject(sourceValue) &&
        isObject(targetValue) &&
        !Array.isArray(sourceValue) &&
        !Array.isArray(targetValue)
      ) {
        (result as any)[key] = deepMerge(targetValue, sourceValue);
      } else {
        (result as any)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Gets a nested property value using dot notation
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

/**
 * Sets a nested property value using dot notation
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * Checks if an object has a nested property using dot notation
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * Gets all paths in an object as dot notation strings
 */
export function paths(obj: any, prefix: string = ''): string[] {
  const result: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (isObject(obj[key]) && !Array.isArray(obj[key])) {
        result.push(...paths(obj[key], path));
      } else {
        result.push(path);
      }
    }
  }

  return result;
}

/**
 * Flattens a nested object into dot notation keys
 */
export function flatten(obj: any, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (isObject(obj[key]) && !Array.isArray(obj[key])) {
        Object.assign(result, flatten(obj[key], path));
      } else {
        result[path] = obj[key];
      }
    }
  }

  return result;
}

/**
 * Unflatten a dot notation object back to nested structure
 */
export function unflatten(obj: Record<string, any>): any {
  const result: any = {};

  for (const path in obj) {
    if (obj.hasOwnProperty(path)) {
      set(result, path, obj[path]);
    }
  }

  return result;
}

/**
 * Transforms object values using a mapper function
 */
export function mapValues<T, U>(
  obj: Record<string, T>,
  mapper: (value: T, key: string) => U,
): Record<string, U> {
  const result: Record<string, U> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = mapper(obj[key], key);
    }
  }

  return result;
}

/**
 * Filters object properties based on predicate
 */
export function filterObject<T>(
  obj: Record<string, T>,
  predicate: (value: T, key: string) => boolean,
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key], key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Safe object operation wrapper
 */
export function safeObjectOperation<R>(
  obj: any,
  operation: (obj: any) => R,
  fallback: R,
): Result<R> {
  try {
    if (!isObject(obj)) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Input is not an object',
          context: { operation: 'safeObjectOperation' },
          timestamp: new Date().toISOString(),
          recoverable: true,
        } as ApiError,
      };
    }

    const result = operation(obj);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      data: fallback,
      error: {
        code: 'OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        context: { operation: 'safeObjectOperation' },
        timestamp: new Date().toISOString(),
        recoverable: true,
      } as ApiError,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const objectUtils = {
  pick,
  omit,
  deepClone,
  deepMerge,
  get,
  set,
  has,
  paths,
  flatten,
  unflatten,
  mapValues,
  filterObject,
  safeObjectOperation,

  // Convenience methods
  isEmpty: (obj: object): boolean => Object.keys(obj).length === 0,
  isNotEmpty: (obj: object): boolean => Object.keys(obj).length > 0,
  merge: <T extends object>(target: T, source: Partial<T>): T => ({
    ...target,
    ...source,
  }),

  // Type guards
  isObject: (value: unknown): value is object => isObject(value),
  isPlainObject: (value: unknown): value is Record<string, unknown> =>
    isObject(value) && Object.getPrototypeOf(value) === Object.prototype,
} as const;
