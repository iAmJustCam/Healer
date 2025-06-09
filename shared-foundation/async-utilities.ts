/**
 * Async Utilities - Core asynchronous operation helpers
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import { Result, ApiError } from '';

// ============================================================================
// CORE ASYNC UTILITIES
// ============================================================================

/**
 * Creates a promise that resolves after specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Adds timeout to a promise
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms),
    ),
  ]);
}

/**
 * Retries an async operation with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;

      const delayMs = baseDelay * Math.pow(2, i);
      await delay(delayMs);
    }
  }
  throw new Error('Retry failed');
}

/**
 * Debounces an async function
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(fn: T, ms: number): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, ms);
    });
  }) as T;
}

/**
 * Throttles an async function
 */
export function throttle<T extends (...args: any[]) => Promise<any>>(fn: T, ms: number): T {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      const now = Date.now();

      if (now - lastCall >= ms) {
        lastCall = now;
        fn(...args)
          .then(resolve)
          .catch(reject);
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(
          () => {
            lastCall = Date.now();
            fn(...args)
              .then(resolve)
              .catch(reject);
          },
          ms - (now - lastCall),
        );
      }
    });
  }) as T;
}

/**
 * Executes promises in parallel with concurrency limit
 */
export async function parallelLimit<T>(
  items: T[],
  fn: (item: T) => Promise<any>,
  limit: number = 5,
): Promise<any[]> {
  const results: any[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, item] of items.entries()) {
    const promise = fn(item).then((result) => {
      results[index] = result;
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1,
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Executes promises in sequence (one after another)
 */
export async function sequence<T>(items: T[], fn: (item: T) => Promise<any>): Promise<any[]> {
  const results: any[] = [];

  for (const item of items) {
    const result = await fn(item);
    results.push(result);
  }

  return results;
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(operation: () => Promise<T>, fallback?: T): Promise<Result<T>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      data: fallback,
      error: {
        code: 'ASYNC_OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown async error',
        context: { operation: 'safeAsync' },
        timestamp: new Date().toISOString(),
        recoverable: true,
      } as ApiError,
    };
  }
}

/**
 * Wraps a callback-based function to return a promise
 */
export function promisify<T = any>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  return (...args: any[]) => {
    return new Promise<T>((resolve, reject) => {
      fn(...args, (error: Error | null, result: T) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };
}

/**
 * Creates a cancellable promise
 */
export function cancellable<T>(promise: Promise<T>): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let cancelled = false;

  const cancellablePromise = new Promise<T>((resolve, reject) => {
    promise
      .then((value) => {
        if (!cancelled) resolve(value);
      })
      .catch((error) => {
        if (!cancelled) reject(error);
      });
  });

  return {
    promise: cancellablePromise,
    cancel: () => {
      cancelled = true;
    },
  };
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const asyncUtils = {
  delay,
  timeout,
  retry,
  debounce,
  throttle,
  parallelLimit,
  sequence,
  safeAsync,
  promisify,
  cancellable,

  // Convenience methods
  sleep: delay, // Alias for delay
  wait: delay, // Another alias for delay
} as const;
