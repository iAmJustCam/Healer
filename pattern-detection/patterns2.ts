/**
 * Migration Pattern Definitions
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions
 * ✓ Pure data structures only
 * ✓ Environment-agnostic
 * ✓ Single source of truth for patterns
 */

import { DetectedPatterns, Framework } from '';

// ============================================================================
// FRAMEWORK VERSION INFORMATION
// ============================================================================

export const frameworkVersions = {
  react: {
    current: '19.0.0',
    previous: '18.3.1',
    releaseDate: '2024-12-05',
    breaking: true,
  },
  nextjs: {
    current: '15.3.0',
    previous: '14.2.18',
    releaseDate: '2024-11-21',
    breaking: true,
  },
  typescript: {
    current: '5.8.0',
    previous: '5.7.0',
    releaseDate: '2024-11-22',
    breaking: false,
  },
  tailwind: {
    current: '4.1.0',
    previous: '3.4.17',
    releaseDate: '2024-12-09',
    breaking: true,
  },
} as const;

// ============================================================================
// PATTERN CONFIGURATIONS
// ============================================================================

export const patterns = {
  patterns: {
    react19: {
      breakingChanges: {
        forwardRef: {
          description: 'forwardRef is deprecated in React 19',
          migration: 'Convert to function components with ref prop',
          risk: 'high',
        },
        propTypes: {
          description: 'PropTypes removed from React package',
          migration: 'Use TypeScript interfaces',
          risk: 'medium',
        },
        defaultProps: {
          description: 'defaultProps deprecated for function components',
          migration: 'Use default parameters',
          risk: 'low',
        },
      },
      stringReplacements: {
        'React.forwardRef': 'function component with ref',
        'Component.propTypes': '/ PropTypes removed',
        'Component.defaultProps': '/ Use default parameters',
      },
      astPatterns: [
        {
          source: 'forwardRef\\s*\\(',
          flags: 'g',
        },
        {
          source: '\\.propTypes\\s*=',
          flags: 'g',
        },
      ],
      rollbackPatterns: {
        'function component with ref': 'React.forwardRef',
      },
    },
    nextjs153: {
      breakingChanges: {
        asyncRequestAPIs: {
          description: 'Request APIs are now async',
          migration: 'Add await to cookies(), headers(), searchParams',
          risk: 'high',
        },
        routerChanges: {
          description: 'useRouter import path changed',
          migration: 'Import from next/navigation',
          risk: 'medium',
        },
      },
      stringReplacements: {
        'cookies()': 'await cookies()',
        'headers()': 'await headers()',
        'searchParams.': 'await searchParams.',
        'from "next/router"': 'from "next/navigation"',
      },
      astPatterns: [
        {
          source: '(?<!await\\s+)cookies\\(\\)',
          flags: 'g',
        },
        {
          source: '(?<!await\\s+)headers\\(\\)',
          flags: 'g',
        },
      ],
      rollbackPatterns: {
        'await cookies()': 'cookies()',
        'await headers()': 'headers()',
      },
    },
    typescript58: {
      breakingChanges: {
        importAssertions: {
          description: 'Import assertions syntax changed',
          migration: 'Replace assert with with',
          risk: 'low',
        },
      },
      stringReplacements: {
        'assert {': 'with {',
      },
      astPatterns: [
        {
          source: 'import\\s+.*\\s+assert\\s*\\{',
          flags: 'g',
        },
      ],
      rollbackPatterns: {
        'with {': 'assert {',
      },
    },
    tailwind41: {
      breakingChanges: {
        configurationFormat: {
          description: 'Config file uses CSS format',
          migration: 'Convert tailwind.config.js to tailwind.config.css',
          risk: 'high',
        },
        browserSupport: {
          description: 'Requires CSS Nesting support',
          migration: 'Update browser targets',
          risk: 'medium',
        },
      },
      classTranslation: {
        'bg-opacity-': 'bg-opacity-[value]',
        'text-opacity-': 'text-opacity-[value]',
        'border-opacity-': 'border-opacity-[value]',
        'transition-color': 'transition-colors',
        'flex-no-wrap': 'flex-nowrap',
        'flex-no-shrink': 'flex-shrink-0',
      },
      stringReplacements: {},
      rollbackPatterns: {
        'transition-colors': 'transition-color',
      },
    },
    typescriptDebt: {
      patterns: {
        anyType: /:\s*any\b/g,
        typeAssertion: /as\s+\w+/g,
        nonNullAssertion: /!\./g,
        emptyCatch: /catch\s*\([^)]*\)\s*\{\s*\}/g,
      },
      fixes: {
        anyType: 'Replace with specific type',
        typeAssertion: 'Use type guard instead',
        nonNullAssertion: 'Add null check',
        emptyCatch: 'Add error handling',
      },
    },
  },
} as const;

// ============================================================================
// PATTERN DETECTION HELPERS
// ============================================================================

export function createEmptyDetectedPatterns(): DetectedPatterns {
  return {
    react19: {
      hasForwardRef: false,
      hasUseRefWithoutParam: false,
      hasPropTypes: false,
      hasReactFC: false,
      hasStringRefs: false,
      modernizationPotential: 0,
    },
    nextjs153: {
      hasAsyncAPIUsage: false,
      hasLegacyRouter: false,
      hasImageComponent: false,
      hasGeoIPUsage: false,
      needsAwaitInjection: false,
      modernizationPotential: 0,
    },
    typescript58: {
      hasImportAssertions: false,
      hasNamespaceImports: false,
      hasInterfaceExtends: false,
      hasArrayGenericSyntax: false,
      modernizationPotential: 0,
    },
    tailwind41: {
      hasProseClasses: false,
      hasRing3Classes: false,
      hasBorderGrayClasses: false,
      hasOldTransitionSyntax: false,
      hasTailwindDirectives: false,
      modernizationPotential: 0,
    },
    typescriptDebt: {
      hasAnyTypes: false,
      hasUnsafeAssertions: false,
      hasEmptyCatchBlocks: false,
      hasNonNullAssertions: false,
      hasMissingReturnTypes: false,
      hasStrictModeViolations: false,
      hasImplicitAny: false,
      hasUntypedObjects: false,
      hasTodoComments: false,
      hasOutdatedSyntax: false,
      severityScore: 0,
      modernizationPotential: 0,
      typeSafetyGrade: 'A',
    },
  };
}

// ============================================================================
// PATTERN UTILITIES
// ============================================================================

export const PatternUtils = {
  /**
   * Get framework configuration
   */
  getFrameworkConfig: (framework: Framework) => {
    switch (framework) {
      case 'react':
        return patterns.patterns.react19;
      case 'nextjs':
        return patterns.patterns.nextjs153;
      case 'typescript':
        return patterns.patterns.typescript58;
      case 'tailwind':
        return patterns.patterns.tailwind41;
      case 'console':
      case 'typescript-debt':
        return patterns.patterns.typescriptDebt;
      default:
        return null;
    }
  },

  /**
   * Get all framework patterns
   */
  getAllPatterns: () => patterns.patterns,

  /**
   * Get framework version info
   */
  getFrameworkVersion: (framework: string) => {
    const key = framework.toLowerCase().replace(/[^a-z]/g, '');
    return frameworkVersions[key as keyof typeof frameworkVersions];
  },
} as const;
