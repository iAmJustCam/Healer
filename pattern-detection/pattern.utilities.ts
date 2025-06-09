/**
 * Pattern Utilities - Pure Pattern Detection & Matching
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on Foundation & Domain Types (Layers 0-1)
 * ✓ Pure utility functions only - no side effects
 * ✓ Environment-agnostic
 * ✓ Single responsibility: Pattern detection only (SRP)
 * ✓ Single source of truth for pattern operations (SSOT)
 */

import { DetectedPatterns, PatternMatch, Severity } from '';
import { ApiResponse, Framework } from '';
import { ApiUtils } from '';

// ============================================================================
// PATTERN DETECTION UTILITIES
// ============================================================================

export const PatternDetector = {
  /**
   * Find all migration patterns in content
   */
  findMatches: (
    content: string,
    fileName: string,
    patterns: DetectedPatterns,
  ): ApiResponse<PatternMatch[]> => {
    if (typeof content !== 'string' || typeof fileName !== 'string') {
      return ApiUtils.error('Invalid input parameters', 'INVALID_PARAMS', {
        contentType: typeof content,
        fileNameType: typeof fileName,
      });
    }

    try {
      const matches: PatternMatch[] = [];

      // React 19 patterns
      if (patterns.react19.hasForwardRef) {
        matches.push(...findReactForwardRefPatterns(content, fileName));
      }

      // Next.js 15.3 patterns
      if (patterns.nextjs153.hasAsyncAPIUsage) {
        matches.push(...findNextJSAsyncPatterns(content, fileName));
      }

      // TypeScript 5.8 patterns
      if (patterns.typescript58.hasImportAssertions) {
        matches.push(...findTypeScriptImportPatterns(content, fileName));
      }

      // Tailwind 4.1 patterns
      if (patterns.tailwind41.hasOldTransitionSyntax) {
        matches.push(...findTailwindTransitionPatterns(content, fileName));
      }

      return ApiUtils.ok(matches);
    } catch (error) {
      return ApiUtils.fromError(error, 'PATTERN_MATCH_ERROR');
    }
  },

  /**
   * Extract pattern statistics from matches
   */
  extractStatistics: (matches: PatternMatch[]): ApiResponse<Record<Framework, number>> => {
    try {
      const stats: Record<string, number> = {};

      for (const match of matches) {
        const framework = match.framework;
        stats[framework] = (stats[framework] || 0) + match.matches.length;
      }

      return ApiUtils.ok(stats as Record<Framework, number>);
    } catch (error) {
      return ApiUtils.fromError(error, 'STATS_EXTRACTION_ERROR');
    }
  },

  /**
   * Group patterns by framework
   */
  groupByFramework: (matches: PatternMatch[]): Record<Framework, PatternMatch[]> => {
    const groups: Record<string, PatternMatch[]> = {};

    for (const match of matches) {
      const framework = match.framework;
      if (!groups[framework]) {
        groups[framework] = [];
      }
      groups[framework].push(match);
    }

    return groups as Record<Framework, PatternMatch[]>;
  },

  /**
   * Filter patterns by severity
   */
  filterBySeverity: (matches: PatternMatch[], minSeverity: Severity): PatternMatch[] => {
    const severityOrder: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
      [Severity.LOW]: 1,
      [Severity.MEDIUM]: 2,
      [Severity.HIGH]: 3,
      [Severity.CRITICAL]: 4,
    };

    const minLevel = severityOrder[minSeverity] || 0;

    return matches.filter((match) =>
      match.matches.some((m) => (severityOrder[m.severity] || 0) >= minLevel),
    );
  },

  /**
   * Calculate pattern complexity score
   */
  calculateComplexity: (matches: PatternMatch[]): number => {
    let complexityScore = 0;

    for (const match of matches) {
      // Base score by type
      const typeScores = {
        string: 1,
        ast: 3,
        complex: 5,
      };

      const baseScore = typeScores[match.type] || 1;

      // Severity multiplier
      const severityMultipliers = {
        low: 1,
        medium: 1.5,
        high: 2,
        critical: 3,
        [Severity.LOW]: 1,
        [Severity.MEDIUM]: 1.5,
        [Severity.HIGH]: 2,
        [Severity.CRITICAL]: 3,
      };

      for (const matchDetails of match.matches) {
        const multiplier = severityMultipliers[matchDetails.severity] || 1;
        complexityScore += baseScore * multiplier;
      }
    }

    return Math.min(100, complexityScore);
  },
} as const;

// ============================================================================
// PATTERN VALIDATORS
// ============================================================================

export const PatternValidator = {
  /**
   * Validate pattern match structure
   */
  validatePattern: (pattern: unknown): ApiResponse<PatternMatch> => {
    if (typeof pattern !== 'object' || pattern === null) {
      return ApiUtils.error('Pattern must be an object', 'INVALID_PATTERN_TYPE');
    }

    const p = pattern as any;

    if (!p.framework || !p.pattern || !p.type || !Array.isArray(p.matches)) {
      return ApiUtils.error('Pattern missing required fields', 'INCOMPLETE_PATTERN', {
        hasFramework: !!p.framework,
        hasPattern: !!p.pattern,
        hasType: !!p.type,
        hasMatches: Array.isArray(p.matches),
      });
    }

    return ApiUtils.ok(p as PatternMatch);
  },

  /**
   * Validate pattern collection
   */
  validatePatterns: (patterns: unknown[]): ApiResponse<PatternMatch[]> => {
    if (!Array.isArray(patterns)) {
      return ApiUtils.error('Patterns must be an array', 'INVALID_PATTERNS_TYPE');
    }

    const validatedPatterns: PatternMatch[] = [];
    const errors: string[] = [];

    for (let i = 0; i < patterns.length; i++) {
      const result = PatternValidator.validatePattern(patterns[i]);
      if (result.success) {
        validatedPatterns.push(result.data);
      } else {
        errors.push(`Pattern ${i}: ${result.error.message}`);
      }
    }

    if (errors.length > 0) {
      return ApiUtils.error('Some patterns are invalid', 'PATTERN_VALIDATION_ERRORS', {
        errors,
        validCount: validatedPatterns.length,
        totalCount: patterns.length,
      });
    }

    return ApiUtils.ok(validatedPatterns);
  },
} as const;

// ============================================================================
// PATTERN TRANSFORMERS
// ============================================================================

export const PatternTransformer = {
  /**
   * Convert patterns to summary format
   */
  toSummary: (
    patterns: PatternMatch[],
  ): {
    totalPatterns: number;
    frameworkBreakdown: Record<Framework, number>;
    severityBreakdown: Record<string, number>;
    complexityScore: number;
  } => {
    const frameworkBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};

    for (const pattern of patterns) {
      // Framework breakdown
      frameworkBreakdown[pattern.framework] = (frameworkBreakdown[pattern.framework] || 0) + 1;

      // Severity breakdown
      for (const match of pattern.matches) {
        severityBreakdown[match.severity] = (severityBreakdown[match.severity] || 0) + 1;
      }
    }

    return {
      totalPatterns: patterns.length,
      frameworkBreakdown: frameworkBreakdown as Record<Framework, number>,
      severityBreakdown,
      complexityScore: PatternDetector.calculateComplexity(patterns),
    };
  },

  /**
   * Convert patterns to migration plan
   */
  toMigrationTasks: (
    patterns: PatternMatch[],
  ): {
    framework: Framework;
    taskCount: number;
    estimatedEffort: 'low' | 'medium' | 'high';
    patterns: string[];
  }[] => {
    const grouped = PatternDetector.groupByFramework(patterns);
    const tasks: any[] = [];

    for (const [framework, frameworkPatterns] of Object.entries(grouped)) {
      const taskCount = frameworkPatterns.reduce((sum, p) => sum + p.matches.length, 0);

      // Estimate effort based on pattern complexity
      const complexity = PatternDetector.calculateComplexity(frameworkPatterns);
      const estimatedEffort = complexity > 50 ? 'high' : complexity > 20 ? 'medium' : 'low';

      const uniquePatterns = [...new Set(frameworkPatterns.map((p) => p.pattern))];

      tasks.push({
        framework: framework as Framework,
        taskCount,
        estimatedEffort,
        patterns: uniquePatterns,
      });
    }

    return tasks;
  },
} as const;

// ============================================================================
// PATTERN MATCHING IMPLEMENTATIONS (PRIVATE)
// ============================================================================

function findReactForwardRefPatterns(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const forwardRefRegex = /forwardRef\s*\(/g;
  let match;

  while ((match = forwardRefRegex.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    matches.push({
      framework: Framework.REACT1919,
      pattern: 'forwardRef',
      type: 'ast',
      matches: [
        {
          line,
          column,
          text: match[0],
          severity: 'high',
          suggestedFix: 'Convert to function component with ref prop',
        },
      ],
    });
  }

  return matches;
}

function findNextJSAsyncPatterns(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const patterns = [
    { regex: /cookies\(\)/g, fix: 'await cookies()' },
    { regex: /headers\(\)/g, fix: 'await headers()' },
    { regex: /searchParams\./g, fix: 'await searchParams.' },
  ];

  for (const { regex, fix } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      matches.push({
        framework: Framework.NEXTJS15JS153,
        pattern: match[0],
        type: 'string',
        matches: [
          {
            line,
            column,
            text: match[0],
            severity: 'high',
            suggestedFix: fix,
          },
        ],
      });
    }
  }

  return matches;
}

function findTypeScriptImportPatterns(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const assertRegex = /import\s+.*\s+assert\s*\{[^}]*\}/g;
  let match;

  while ((match = assertRegex.exec(content)) !== null) {
    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    matches.push({
      framework: Framework.TYPESCRIPT558,
      pattern: 'import-assertion',
      type: 'string',
      matches: [
        {
          line,
          column,
          text: match[0],
          severity: 'medium',
          suggestedFix: match[0].replace('assert', 'with'),
        },
      ],
    });
  }

  return matches;
}

function findTailwindTransitionPatterns(content: string, fileName: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const oldClasses = [
    { old: 'transition-color', new: 'transition-colors' },
    { old: 'bg-opacity-', new: 'bg-opacity-[value]' },
  ];

  for (const { old, new: newClass } of oldClasses) {
    const regex = new RegExp(`\\b${old}\\b`, 'g');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      matches.push({
        framework: Framework.TAILWIND441,
        pattern: old,
        type: 'string',
        matches: [
          {
            line,
            column,
            text: match[0],
            severity: 'low',
            suggestedFix: newClass,
          },
        ],
      });
    }
  }

  return matches;
}
