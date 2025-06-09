/**
 * String Utilities - Core string manipulation functions
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import { Result, ApiError } from '';

// ============================================================================
// CORE STRING UTILITIES
// ============================================================================

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts string to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Converts string to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts string to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_+|_+$/g, '');
}

/**
 * Converts string to PascalCase
 */
export function pascalCase(str: string): string {
  const camelCased = camelCase(str);
  return capitalize(camelCased);
}

/**
 * Truncates string to specified length with ellipsis
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (!str || str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Removes leading and trailing whitespace and normalizes internal whitespace
 */
export function normalize(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Pads string to specified length
 */
export function pad(str: string, length: number, char: string = ' ', left: boolean = true): string {
  if (str.length >= length) return str;
  const padding = char.repeat(length - str.length);
  return left ? padding + str : str + padding;
}

/**
 * Extracts words from a string
 */
export function words(str: string): string[] {
  return str.match(/\b\w+\b/g) || [];
}

/**
 * Checks if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Checks if string is a valid email format
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Checks if string is a valid URL
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escapes HTML characters in string
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Unescapes HTML characters in string
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };

  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlUnescapes[entity]);
}

/**
 * Safe string operation wrapper
 */
export function safeStringOperation<R>(
  str: string,
  operation: (str: string) => R,
  fallback: R,
): Result<R> {
  try {
    if (typeof str !== 'string') {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Input is not a string',
          context: { operation: 'safeStringOperation' },
          timestamp: new Date().toISOString(),
          recoverable: true,
        } as ApiError,
      };
    }

    const result = operation(str);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      data: fallback,
      error: {
        code: 'OPERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        context: { operation: 'safeStringOperation' },
        timestamp: new Date().toISOString(),
        recoverable: true,
      } as ApiError,
    };
  }
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const stringUtils = {
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  pascalCase,
  truncate,
  normalize,
  pad,
  words,
  isAlphanumeric,
  isEmail,
  isUrl,
  escapeHtml,
  unescapeHtml,
  safeStringOperation,

  // Convenience methods
  isEmpty: (str: string): boolean => !str || str.trim().length === 0,
  isNotEmpty: (str: string): boolean => !!str && str.trim().length > 0,

  // Type guards
  isString: (value: unknown): value is string => typeof value === 'string',
} as const;
