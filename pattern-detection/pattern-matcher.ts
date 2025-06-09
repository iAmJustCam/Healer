/**
 * Pattern Matcher Service
 *
 * Single Responsibility: Pattern detection and matching across frameworks.
 * Adheres to SRP by focusing solely on pattern recognition logic.
 */

import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import { Framework, PatternMatch, PatternMatchResult, PatternMatchSchema } from '';

export class PatternMatcherService {
  /**
   * Find all pattern matches in content for all frameworks
   */
  static findAllMatches(content: string, fileName: string): PatternMatchResult {
    const allMatches: PatternMatch[] = [];

    // React 19 patterns
    allMatches.push(...this.findReactPatterns(content, fileName));

    // Next.js 15.3 patterns
    allMatches.push(...this.findNextJSPatterns(content, fileName));

    // TypeScript 5.8 patterns
    allMatches.push(...this.findTypeScriptPatterns(content, fileName));

    // Tailwind 4.1 patterns
    allMatches.push(...this.findTailwindPatterns(content, fileName));

    return this.aggregateResults(allMatches);
  }

  /**
   * Find patterns for specific framework
   */
  static findFrameworkMatches(
    content: string,
    fileName: string,
    framework: Framework,
  ): PatternMatch[] {
    switch (framework) {
      case 'react19':
        return this.findReactPatterns(content, fileName);
      case 'nextjs153':
        return this.findNextJSPatterns(content, fileName);
      case 'typescript58':
        return this.findTypeScriptPatterns(content, fileName);
      case 'tailwind41':
        return this.findTailwindPatterns(content, fileName);
      default:
        return [];
    }
  }

  private static findReactPatterns(content: string, fileName: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    // ForwardRef pattern detection
    const forwardRefPattern = /React\.forwardRef\s*\(/g;
    let match;

    while ((match = forwardRefPattern.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      const patternMatch: PatternMatch = {
        framework: 'React 19',
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
      };

      const validatedMatch = validateWithSchema(PatternMatchSchema, patternMatch);
      if (validatedMatch.success) {
        matches.push(validatedMatch.data);
      }
    }

    // PropTypes pattern detection
    const propTypesPattern = /\.propTypes\s*=/g;

    while ((match = propTypesPattern.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      const patternMatch: PatternMatch = {
        framework: 'React 19',
        pattern: 'propTypes',
        type: 'string',
        matches: [
          {
            line,
            column,
            text: match[0],
            severity: 'medium',
            suggestedFix: 'Remove propTypes, use TypeScript interfaces',
          },
        ],
      };

      const validatedMatch = validateWithSchema(PatternMatchSchema, patternMatch);
      if (validatedMatch.success) {
        matches.push(validatedMatch.data);
      }
    }

    return matches;
  }

  private static findNextJSPatterns(content: string, fileName: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    // Async request API patterns
    const cookiesPattern = /(?<!await\s+)cookies\(\)/g;
    let match;

    while ((match = cookiesPattern.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      const patternMatch: PatternMatch = {
        framework: 'Next.js 15.3',
        pattern: 'cookies()',
        type: 'string',
        matches: [
          {
            line,
            column,
            text: match[0],
            severity: 'high',
            suggestedFix: 'await cookies()',
          },
        ],
      };

      const validatedMatch = validateWithSchema(PatternMatchSchema, patternMatch);
      if (validatedMatch.success) {
        matches.push(validatedMatch.data);
      }
    }

    // Headers pattern
    const headersPattern = /(?<!await\s+)headers\(\)/g;

    while ((match = headersPattern.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      const patternMatch: PatternMatch = {
        framework: 'Next.js 15.3',
        pattern: 'headers()',
        type: 'string',
        matches: [
          {
            line,
            column,
            text: match[0],
            severity: 'high',
            suggestedFix: 'await headers()',
          },
        ],
      };

      const validatedMatch = validateWithSchema(PatternMatchSchema, patternMatch);
      if (validatedMatch.success) {
        matches.push(validatedMatch.data);
      }
    }

    return matches;
  }

  private static findTypeScriptPatterns(content: string, fileName: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    // Import assertion patterns
    const assertPattern = /import\s+.*\s+assert\s*\{[^}]*\}/g;
    let match;

    while ((match = assertPattern.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;

      const patternMatch: PatternMatch = {
        framework: 'TypeScript 5.8',
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
      };

      const validatedMatch = validateWithSchema(PatternMatchSchema, patternMatch);
      if (validatedMatch.success) {
        matches.push(validatedMatch.data);
      }
    }

    return matches;
  }

  private static findTailwindPatterns(content: string, fileName: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    // Deprecated class patterns
    const deprecatedClasses = {
      'bg-opacity-': 'bg-*/opacity-*',
      'text-opacity-': 'text-*/opacity-*',
      'border-opacity-': 'border-*/opacity-*',
    };

    for (const [oldClass, newClass] of Object.entries(deprecatedClasses)) {
      const pattern = new RegExp(`\\b${oldClass}\\d+\\b`, 'g');
      let match;

      while ((match = pattern.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length;

        const patternMatch: PatternMatch = {
          framework: 'Tailwind 4.1',
          pattern: oldClass,
          type: 'string',
          matches: [
            {
              line,
              column,
              text: match[0],
              severity: 'medium',
              suggestedFix: `Update to ${newClass} syntax`,
            },
          ],
        };

        const validatedMatch = validateWithSchema(PatternMatchSchema, patternMatch);
        if (validatedMatch.success) {
          matches.push(validatedMatch.data);
        }
      }
    }

    return matches;
  }

  private static aggregateResults(matches: PatternMatch[]): PatternMatchResult {
    const byFramework: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    matches.forEach((match) => {
      // Count by framework
      byFramework[match.framework] = (byFramework[match.framework] || 0) + match.matches.length;

      // Count by severity
      match.matches.forEach((m) => {
        bySeverity[m.severity] = (bySeverity[m.severity] || 0) + 1;
      });
    });

    return {
      matches,
      totalMatches: matches.reduce((sum, match) => sum + match.matches.length, 0),
      byFramework: byFramework as Record<Framework, number>,
      bySeverity: bySeverity as Record<'low' | 'medium' | 'high', number>,
    };
  }
}
