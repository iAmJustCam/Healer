import { } from '';

/**
 * Patterns Domain Types - Layer 1
 * 
 * Types for pattern detection and analysis.
 * These types define structures for detecting framework-specific patterns.
 */

import { ConfidenceScore, Violation } from '../types/canonical-types';

// ============================================================================
// PATTERN DETECTION DOMAIN
// ============================================================================

/**
 * Basic pattern detection result
 */
/**
 * React 19 specific patterns
 */
/**
 * Next.js 15.3 specific patterns
 */
/**
 * TypeScript 5.8 specific patterns
 */
/**
 * Tailwind 4.1 specific patterns
 */
/**
 * TypeScript debt patterns
 */
/**
 * All detected patterns in a file
 */
/**
 * Type guard to check if a file has React patterns
 */
export function hasReactPatterns(patterns: DetectedPatterns): boolean {
  return patterns.react19.hasForwardRef || 
    patterns.react19.hasUseRefWithoutParam ||
    patterns.react19.hasPropTypes ||
    patterns.react19.hasReactFC ||
    patterns.react19.hasStringRefs;
}

/**
 * Type guard to check if a file has TypeScript debt
 */
export function hasTypeScriptDebt(patterns: DetectedPatterns): boolean {
  return patterns.typescriptDebt.hasAnyTypes ||
    patterns.typescriptDebt.hasUnsafeAssertions ||
    patterns.typescriptDebt.hasEmptyCatchBlocks ||
    patterns.typescriptDebt.hasNonNullAssertions ||
    patterns.typescriptDebt.hasMissingReturnTypes ||
    patterns.typescriptDebt.hasStrictModeViolations ||
    patterns.typescriptDebt.hasImplicitAny ||
    patterns.typescriptDebt.hasUntypedObjects;
}

/**
 * Type guard to check if a file has modernization potential
 */
export function hasModernizationPotential(patterns: DetectedPatterns): boolean {
  return patterns.react19.modernizationPotential > 0.5 ||
    patterns.nextjs153.modernizationPotential > 0.5 ||
    patterns.typescript58.modernizationPotential > 0.5 ||
    patterns.tailwind41.modernizationPotential > 0.5 ||
    patterns.typescriptDebt.modernizationPotential > 0.5;
}
