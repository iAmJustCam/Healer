/**
 * Pattern Detection Utilities
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions (R-01)
 * ✓ Canonical imports only (R-02)
 * ✓ Validated I/O with schemas (R-03)
 * ✓ Factory response pattern (R-04)
 * ✓ Environment-agnostic (R-05)
 *
 * Single Responsibility: Pure pattern detection and matching logic
 */

import { PatternMatchSchema } from '../shared-REFACTORED/schemas/pattern.schemas';
import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import {
  ApiResponse,
  ConfidenceScore,
  Framework,
  PatternMatch,
  Severity,
} from '../types/canonical-types';
import {
  DetectedPatterns,
  NextJS153Patterns,
  React19Patterns,
  Tailwind41Patterns,
  TypeScript58Patterns,
  TypeScriptDebtPatterns,
} from '../shared-REFACTORED/types/domain.types';
import { createApiSuccess, createApiError } from '';

// ============================================================================
// PATTERN DETECTION CORE
// ============================================================================

export const PatternDetector = {
  /**
   * Detect all framework patterns in content
   */
  detectPatterns: (content: string, fileName: string): ApiResponse<DetectedPatterns> => {
    const validation = validateWithSchema(
      { content: 'string', fileName: 'string' },
      { content, fileName },
    );

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid input parameters', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      const patterns: DetectedPatterns = {
        react19: detectReactPatterns(content),
        nextjs153: detectNextJSPatterns(content),
        typescript58: detectTypeScriptPatterns(content),
        tailwind41: detectTailwindPatterns(content),
        typescriptDebt: detectTypeScriptDebt(content),
      };

      return createApiSuccess(patterns);
    } catch (error) {
      return createApiError(
        createApiError('Pattern detection failed', 'DETECTION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Extract pattern matches with confidence scoring
   */
  extractMatches: (
    content: string,
    fileName: string,
    framework: Framework,
  ): ApiResponse<PatternMatch[]> => {
    const validation = validateWithSchema(
      { content: 'string', fileName: 'string', framework: 'string' },
      { content, fileName, framework },
    );

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid input parameters', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      const matches: PatternMatch[] = [];

      switch (framework) {
        case Framework.REACT19_19:
          matches.push(...extractReactMatches(content, fileName));
          break;
        case Framework.NEXTJS15JS_15:
          matches.push(...extractNextJSMatches(content, fileName));
          break;
        case Framework.TYPESCRIPT5_5:
          matches.push(...extractTypeScriptMatches(content, fileName));
          break;
        case Framework.TAILWIND4_4:
          matches.push(...extractTailwindMatches(content, fileName));
          break;
        default:
          return createApiError(
            createApiError(`Unsupported framework: ${framework}`, 'UNSUPPORTED_FRAMEWORK'),
          );
      }

      return createApiSuccess(matches);
    } catch (error) {
      return createApiError(
        createApiError('Pattern extraction failed', 'EXTRACTION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Calculate pattern confidence score
   */
  calculateConfidence: (patterns: DetectedPatterns): ApiResponse<ConfidenceScore> => {
    try {
      let totalScore = 0;
      let patternCount = 0;

      // Weight patterns by importance
      const weights = {
        react19: 0.3,
        nextjs153: 0.25,
        typescript58: 0.2,
        tailwind41: 0.15,
        typescriptDebt: 0.1,
      };

      if (patterns.react19.modernizationPotential > 0) {
        totalScore += patterns.react19.modernizationPotential * weights.react19;
        patternCount++;
      }

      if (patterns.nextjs153.modernizationPotential > 0) {
        totalScore += patterns.nextjs153.modernizationPotential * weights.nextjs153;
        patternCount++;
      }

      if (patterns.typescript58.modernizationPotential > 0) {
        totalScore += patterns.typescript58.modernizationPotential * weights.typescript58;
        patternCount++;
      }

      if (patterns.tailwind41.modernizationPotential > 0) {
        totalScore += patterns.tailwind41.modernizationPotential * weights.tailwind41;
        patternCount++;
      }

      if (patterns.typescriptDebt.modernizationPotential > 0) {
        totalScore += patterns.typescriptDebt.modernizationPotential * weights.typescriptDebt;
        patternCount++;
      }

      const confidence = patternCount > 0 ? totalScore / patternCount : 0;
      return createApiSuccess(Math.min(1, Math.max(0, confidence)) as ConfidenceScore);
    } catch (error) {
      return createApiError(
        createApiError('Confidence calculation failed', 'CALCULATION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
} as const;

// ============================================================================
// FRAMEWORK-SPECIFIC DETECTION (PRIVATE)
// ============================================================================

function detectReactPatterns(content: string): React19Patterns {
  return {
    hasForwardRef: /React\.forwardRef\s*\(/.test(content),
    hasUseRefWithoutParam: /useRef\s*\(\s*\)/.test(content),
    hasPropTypes: /\.propTypes\s*=/.test(content),
    hasReactFC: /React\.FC<|React\.FunctionComponent</.test(content),
    hasStringRefs: /ref\s*=\s*["'][^"']+["']/.test(content),
    modernizationPotential: calculateReactModernization(content),
  };
}

function detectNextJSPatterns(content: string): NextJS153Patterns {
  return {
    hasAsyncAPIUsage: /(?<!await\s+)(cookies|headers|params|draftMode)\(\)/.test(content),
    hasLegacyRouter: /from\s+["']next\/router["']/.test(content),
    hasImageComponent: /next\/image/.test(content),
    hasGeoIPUsage: /request\.(geo|ip)/.test(content),
    needsAwaitInjection: /(?<!await\s+)(cookies|headers)\(\)/.test(content),
    modernizationPotential: calculateNextJSModernization(content),
  };
}

function detectTypeScriptPatterns(content: string): TypeScript58Patterns {
  return {
    hasImportAssertions: /import\s+.*\s+assert\s*\{/.test(content),
    hasNamespaceImports: /import\s*\*\s+as\s+\w+/.test(content),
    hasInterfaceExtends: /interface\s+\w+\s+extends/.test(content),
    hasArrayGenericSyntax: /Array<\w+>/.test(content),
    modernizationPotential: calculateTypeScriptModernization(content),
  };
}

function detectTailwindPatterns(content: string): Tailwind41Patterns {
  return {
    hasProseClasses: /\bprose\b/.test(content),
    hasRing3Classes: /\bring-3\b/.test(content),
    hasBorderGrayClasses: /\bborder-gray-200\b/.test(content),
    hasOldTransitionSyntax: /\btransition-color\b/.test(content),
    hasTailwindDirectives: /@tailwind\s+(base|components|utilities)/.test(content),
    modernizationPotential: calculateTailwindModernization(content),
  };
}

function detectTypeScriptDebt(content: string): TypeScriptDebtPatterns {
  const anyTypes = (content.match(/:\s*any\b/g) || []).length;
  const unsafeAssertions = (content.match(/as\s+\w+/g) || []).length;
  const emptyCatches = (content.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) || []).length;
  const nonNullAssertions = (content.match(/!\./g) || []).length;

  const severityScore = Math.min(
    1,
    (anyTypes * 0.3 + unsafeAssertions * 0.25 + emptyCatches * 0.2 + nonNullAssertions * 0.25) / 10,
  );

  return {
    hasAnyTypes: anyTypes > 0,
    hasUnsafeAssertions: unsafeAssertions > 0,
    hasEmptyCatchBlocks: emptyCatches > 0,
    hasNonNullAssertions: nonNullAssertions > 0,
    hasMissingReturnTypes: /function\s+\w+\([^)]*\)\s*\{/.test(content),
    hasStrictModeViolations: /==\s*(null|undefined)/.test(content),
    hasImplicitAny: false, // Would need TypeScript compiler API
    hasUntypedObjects: /\{\s*\w+:\s*\w+/.test(content),
    hasTodoComments: /\/\/\s*TODO|\/\/\s*FIXME/.test(content),
    hasOutdatedSyntax: /var\s+\w+/.test(content),
    severityScore: severityScore as ConfidenceScore,
    modernizationPotential: severityScore as ConfidenceScore,
    typeSafetyGrade:
      severityScore < 0.2
        ? 'A'
        : severityScore < 0.4
          ? 'B'
          : severityScore < 0.6
            ? 'C'
            : severityScore < 0.8
              ? 'D'
              : 'F',
  };
}

// ============================================================================
// PATTERN EXTRACTION (PRIVATE)
// ============================================================================

function extractReactMatches(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const forwardRefPattern = /React\.forwardRef\s*\(/g;
  let match;

  while ((match = forwardRefPattern.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    const patternMatch: PatternMatch = {
      id: `react-forwardref-${line}-${column}` as any,
      location: {
        file: fileName as any,
        line,
        column,
        context: match[0],
      },
      confidence: 0.95 as ConfidenceScore,
      severity: Severity.HIGH,
      framework: Framework.REACT19_19,
    };

    const validation = validateWithSchema(PatternMatchSchema, patternMatch);
    if (validation.success) {
      matches.push(validation.data);
    }
  }

  return matches;
}

function extractNextJSMatches(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const asyncAPIPattern = /(?<!await\s+)(cookies|headers|params)\(\)/g;
  let match;

  while ((match = asyncAPIPattern.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    const patternMatch: PatternMatch = {
      id: `nextjs-async-${line}-${column}` as any,
      location: {
        file: fileName as any,
        line,
        column,
        context: match[0],
      },
      confidence: 0.9 as ConfidenceScore,
      severity: Severity.HIGH,
      framework: Framework.NEXTJS15JS_15,
    };

    const validation = validateWithSchema(PatternMatchSchema, patternMatch);
    if (validation.success) {
      matches.push(validation.data);
    }
  }

  return matches;
}

function extractTypeScriptMatches(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const assertPattern = /import\s+.*\s+assert\s*\{[^}]*\}/g;
  let match;

  while ((match = assertPattern.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    const patternMatch: PatternMatch = {
      id: `ts-assert-${line}-${column}` as any,
      location: {
        file: fileName as any,
        line,
        column,
        context: match[0],
      },
      confidence: 0.85 as ConfidenceScore,
      severity: Severity.MEDIUM,
      framework: Framework.TYPESCRIPT5_5,
    };

    const validation = validateWithSchema(PatternMatchSchema, patternMatch);
    if (validation.success) {
      matches.push(validation.data);
    }
  }

  return matches;
}

function extractTailwindMatches(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const deprecatedClasses = /\b(bg-opacity-\d+|text-opacity-\d+|transition-color)\b/g;
  let match;

  while ((match = deprecatedClasses.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    const patternMatch: PatternMatch = {
      id: `tailwind-deprecated-${line}-${column}` as any,
      location: {
        file: fileName as any,
        line,
        column,
        context: match[0],
      },
      confidence: 0.8 as ConfidenceScore,
      severity: Severity.MEDIUM,
      framework: Framework.TAILWIND4_4,
    };

    const validation = validateWithSchema(PatternMatchSchema, patternMatch);
    if (validation.success) {
      matches.push(validation.data);
    }
  }

  return matches;
}

// ============================================================================
// MODERNIZATION SCORING (PRIVATE)
// ============================================================================

function calculateReactModernization(content: string): ConfidenceScore {
  let score = 0;

  if (/React\.forwardRef/.test(content)) score += 0.3;
  if (/\.propTypes/.test(content)) score += 0.2;
  if (/\.defaultProps/.test(content)) score += 0.15;
  if (/React\.FC/.test(content)) score += 0.1;
  if (/useRef\(\)/.test(content)) score += 0.25;

  return Math.min(1, score) as ConfidenceScore;
}

function calculateNextJSModernization(content: string): ConfidenceScore {
  let score = 0;

  if (/(?<!await\s+)(cookies|headers)\(\)/.test(content)) score += 0.4;
  if (/next\/router/.test(content)) score += 0.3;
  if (/request\.(geo|ip)/.test(content)) score += 0.2;
  if (/getServerSideProps|getStaticProps/.test(content)) score += 0.1;

  return Math.min(1, score) as ConfidenceScore;
}

function calculateTypeScriptModernization(content: string): ConfidenceScore {
  let score = 0;

  if (/assert\s*\{/.test(content)) score += 0.3;
  if (/Array<\w+>/.test(content)) score += 0.2;
  if (/namespace\s+\w+/.test(content)) score += 0.15;
  if (/module\s+\w+/.test(content)) score += 0.1;

  return Math.min(1, score) as ConfidenceScore;
}

function calculateTailwindModernization(content: string): ConfidenceScore {
  let score = 0;

  if (/@tailwind/.test(content)) score += 0.3;
  if (/bg-opacity-|text-opacity-/.test(content)) score += 0.25;
  if (/transition-color/.test(content)) score += 0.2;
  if (/prose-/.test(content)) score += 0.15;
  if (/ring-3/.test(content)) score += 0.1;

  return Math.min(1, score) as ConfidenceScore;
}
