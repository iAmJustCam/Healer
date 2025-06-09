/**
 * Configuration Auto-Fixer - Pure Auto-Fix Logic
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on canonical types (Layer 0-1)
 * ✓ Pure utility functions only - no side effects
 * ✓ Single responsibility: Auto-fixing only (SRP)
 * ✓ All types imported from canonical source (SSOT)
 */

import { ApiResponse, Framework, MigrationConfiguration, createApiResponse, createApiError } from '../types/canonical-types';

// ============================================================================
// AUTO-FIX RESULT TYPES
// ============================================================================

// ============================================================================
// CORE AUTO-FIX FUNCTIONS
// ============================================================================

/**
 * Auto-fix common configuration issues
 */
export function autoFixConfiguration(config: MigrationConfiguration): ApiResponse<AutoFixResult> {
  try {
    const fixed: MigrationConfiguration = { ...config };
    const appliedFixes: string[] = [];
    const remainingIssues: string[] = [];

    // Fix empty frameworks
    if (fixed.frameworks.length === 0) {
      fixed.frameworks = getDefaultFrameworks();
      appliedFixes.push(
        'Added default frameworks (React 19, Next.js 15, TypeScript 5, Tailwind 4)',
      );
    }

    // Fix missing exclude patterns
    if (fixed.excludePatterns.length === 0) {
      fixed.excludePatterns = getDefaultExcludePatterns();
      appliedFixes.push('Added default exclude patterns (node_modules, dist, build, .git)');
    }

    // Fix conflicting settings
    if (fixed.force && fixed.interactive) {
      fixed.interactive = false;
      appliedFixes.push('Disabled interactive mode due to force flag conflict');
    }

    // Ensure dry run for dangerous operations
    if (fixed.skipValidation && !fixed.dryRun) {
      fixed.dryRun = true;
      appliedFixes.push('Enabled dry run due to skip validation being risky');
    }

    // Fix production environment without dry run
    if (fixed.environment === 'production' && !fixed.dryRun) {
      fixed.dryRun = true;
      appliedFixes.push('Enabled dry run for production environment safety');
    }

    // Add default include patterns if none specified
    if (fixed.includePatterns.length === 0) {
      fixed.includePatterns = getDefaultIncludePatterns();
      appliedFixes.push('Added default include patterns');
    }

    // Check for remaining issues that couldn't be auto-fixed
    if (fixed.force && fixed.environment === 'production') {
      remainingIssues.push('Force mode in production requires manual review');
    }

    if (fixed.frameworks.length > 3) {
      remainingIssues.push('Complex migration with many frameworks - consider phased approach');
    }

    const result: AutoFixResult = {
      config: fixed,
      appliedFixes,
      remainingIssues,
      wasModified: appliedFixes.length > 0,
    };

    return createApiResponse(result);
  } catch (error) {
    return createApiResponse(
      undefined,
      createApiError('CONFIG_AUTOFIX_ERROR', 'Auto-fix failed', 'autoFixConfiguration', {
        error,
      }),
    );
  }
}

/**
 * Merge configuration with defaults using specified strategy
 */
export function mergeWithDefaults(
  config: Partial<MigrationConfiguration>,
  options: MergeOptions = { strategy: 'merge', preserveUserChoices: true, addDefaults: true },
): ApiResponse<MigrationConfiguration> {
  try {
    const defaults = getDefaultConfiguration();

    let merged: MigrationConfiguration;

    switch (options.strategy) {
      case 'conservative':
        merged = mergeConservative(defaults, config, options);
        break;
      case 'aggressive':
        merged = mergeAggressive(defaults, config, options);
        break;
      case 'merge':
      default:
        merged = mergeIntelligent(defaults, config, options);
        break;
    }

    return createApiResponse(merged);
  } catch (error) {
    return createApiResponse(
      undefined,
      createApiError('CONFIG_MERGE_ERROR', 'Configuration merge failed', 'mergeWithDefaults', {
        error,
      }),
    );
  }
}

/**
 * Fix framework-specific configuration issues
 */
export function autoFixFrameworkConfiguration(
  framework: Framework,
  config: unknown,
): ApiResponse<Record<string, unknown>> {
  try {
    const fixed = { ...(config as Record<string, unknown>) };
    const appliedFixes: string[] = [];

    switch (framework) {
      case Framework.REACT19_19:
        fixReactConfiguration(fixed, appliedFixes);
        break;
      case Framework.NEXTJS15JS_15:
        fixNextJSConfiguration(fixed, appliedFixes);
        break;
      case Framework.TYPESCRIPT5_5:
        fixTypeScriptConfiguration(fixed, appliedFixes);
        break;
      case Framework.TAILWIND4_4:
        fixTailwindConfiguration(fixed, appliedFixes);
        break;
    }

    return createApiResponse(fixed);
  } catch (error) {
    return createApiResponse(
      undefined,
      createApiError(
        'FRAMEWORK_AUTOFIX_ERROR',
        `Framework auto-fix failed for ${framework}`,
        'autoFixFrameworkConfiguration',
        { error },
      ),
    );
  }
}

/**
 * Optimize configuration for specific environment
 */
export function optimizeForEnvironment(
  config: MigrationConfiguration,
  targetEnvironment: string,
): ApiResponse<MigrationConfiguration> {
  try {
    const optimized = { ...config };
    optimized.environment = targetEnvironment as any;

    switch (targetEnvironment) {
      case 'production':
        optimizeForProduction(optimized);
        break;
      case 'staging':
        optimizeForStaging(optimized);
        break;
      case 'development':
        optimizeForDevelopment(optimized);
        break;
      case 'testing':
        optimizeForTesting(optimized);
        break;
    }

    return createApiResponse(optimized);
  } catch (error) {
    return createApiResponse(
      undefined,
      createApiError(
        'ENV_OPTIMIZATION_ERROR',
        'Environment optimization failed',
        'optimizeForEnvironment',
        { error },
      ),
    );
  }
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

function getDefaultConfiguration(): MigrationConfiguration {
  return {
    dryRun: true,
    interactive: false,
    force: false,
    skipValidation: false,
    frameworks: getDefaultFrameworks(),
    includePatterns: getDefaultIncludePatterns(),
    excludePatterns: getDefaultExcludePatterns(),
    environment: 'development',
  };
}

function getDefaultFrameworks(): Framework[] {
  return [Framework.REACT19_19, Framework.NEXTJS15JS_15, Framework.TYPESCRIPT5_5, Framework.TAILWIND4_4];
}

function getDefaultIncludePatterns(): string[] {
  return [
    'src/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
  ];
}

function getDefaultExcludePatterns(): string[] {
  return [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '**/*.test.*',
    '**/*.spec.*',
    'coverage/**',
  ];
}

function mergeConservative(
  defaults: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
  options: MergeOptions,
): MigrationConfiguration {
  return {
    ...defaults,
    ...override,
    // Always prefer safer options
    dryRun: override.dryRun ?? defaults.dryRun ?? true,
    force: (override.force ?? false) && (defaults.force ?? false),
    skipValidation: (override.skipValidation ?? false) && (defaults.skipValidation ?? false),
    interactive: override.interactive ?? defaults.interactive ?? false,
  };
}

function mergeAggressive(
  defaults: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
  options: MergeOptions,
): MigrationConfiguration {
  return {
    ...defaults,
    ...override,
  };
}

function mergeIntelligent(
  defaults: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
  options: MergeOptions,
): MigrationConfiguration {
  return {
    ...defaults,
    ...override,
    // Intelligent array merging
    frameworks: mergeArrays(defaults.frameworks, override.frameworks ?? []),
    includePatterns: mergeArrays(defaults.includePatterns, override.includePatterns ?? []),
    excludePatterns: mergeArrays(defaults.excludePatterns, override.excludePatterns ?? []),
  };
}

function mergeArrays<T>(base: readonly T[], override: readonly T[]): T[] {
  // Combine and deduplicate arrays
  return [...new Set([...base, ...override])];
}

function fixReactConfiguration(config: Record<string, unknown>, appliedFixes: string[]): void {
  if (!config.breakingChanges) {
    config.breakingChanges = {
      forwardRef: true,
      propTypes: true,
      defaultProps: true,
      stringRefs: true,
      legacyContext: true,
    };
    appliedFixes.push('Added default React breaking changes configuration');
  }

  if (!config.astPatterns || !Array.isArray(config.astPatterns)) {
    config.astPatterns = [
      /React\.forwardRef/,
      /\.propTypes\s*=/,
      /\.defaultProps\s*=/,
      /useRef\s*\(\s*null\s*\)/,
    ];
    appliedFixes.push('Added default React AST patterns');
  }

  if (!config.stringReplacements) {
    config.stringReplacements = {
      'React.forwardRef': 'forwardRef',
      PropTypes: '/ TODO: Remove PropTypes usage',
      defaultProps: '/ TODO: Use default parameters instead',
    };
    appliedFixes.push('Added default React string replacements');
  }

  if (!config.rollbackPatterns) {
    config.rollbackPatterns = {
      forwardRef: 'React.forwardRef',
      '/ TODO: Remove PropTypes usage': 'PropTypes',
      '/ TODO: Use default parameters instead': 'defaultProps',
    };
    appliedFixes.push('Added default React rollback patterns');
  }
}

function fixNextJSConfiguration(config: Record<string, unknown>, appliedFixes: string[]): void {
  if (!config.breakingChanges) {
    config.breakingChanges = {
      asyncRequestAPIs: true,
      cachingSemantics: true,
      removedAPIs: true,
      eslintSupport: true,
    };
    appliedFixes.push('Added default Next.js breaking changes configuration');
  }

  if (!config.stringReplacements) {
    config.stringReplacements = {
      'cookies()': 'await cookies()',
      'headers()': 'await headers()',
      searchParams: 'await searchParams',
    };
    appliedFixes.push('Added default Next.js string replacements');
  }

  if (!config.contextPatterns) {
    config.contextPatterns = {
      serverComponent: [/async\s+function.*Component/],
      routeHandler: [/export\s+async\s+function\s+(GET|POST|PUT|DELETE)/],
      middleware: [/export\s+function\s+middleware/],
    };
    appliedFixes.push('Added default Next.js context patterns');
  }

  if (!config.rollbackPatterns) {
    config.rollbackPatterns = {
      'await cookies()': 'cookies()',
      'await headers()': 'headers()',
      'await searchParams': 'searchParams',
    };
    appliedFixes.push('Added default Next.js rollback patterns');
  }
}

function fixTypeScriptConfiguration(config: Record<string, unknown>, appliedFixes: string[]): void {
  if (!config.breakingChanges) {
    config.breakingChanges = {
      importAssertions: true,
      esmInteroperability: true,
      typeInference: true,
      performanceChanges: true,
    };
    appliedFixes.push('Added default TypeScript breaking changes configuration');
  }

  if (!config.stringReplacements) {
    config.stringReplacements = {
      'import.*assert.*{.*type.*}': 'import type assertion syntax',
      'require\\(': 'import statement',
    };
    appliedFixes.push('Added default TypeScript string replacements');
  }

  if (!config.compatMode) {
    config.compatMode = {
      allowJs: true,
      checkJs: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    };
    appliedFixes.push('Added default TypeScript compatibility mode');
  }

  if (!config.rollbackPatterns) {
    config.rollbackPatterns = {
      'import assertion syntax': 'import.*assert.*{.*type.*}',
      'import statement': 'require\\(',
    };
    appliedFixes.push('Added default TypeScript rollback patterns');
  }
}

function fixTailwindConfiguration(config: Record<string, unknown>, appliedFixes: string[]): void {
  if (!config.breakingChanges) {
    config.breakingChanges = {
      configurationFormat: true,
      browserSupport: true,
      removedUtilities: true,
      newFeatures: true,
    };
    appliedFixes.push('Added default Tailwind breaking changes configuration');
  }

  if (!config.classTranslation) {
    config.classTranslation = {
      'space-x-': 'gap-x-',
      'space-y-': 'gap-y-',
      transform: 'transform-gpu',
      filter: 'backdrop-filter',
    };
    appliedFixes.push('Added default Tailwind class translations');
  }

  if (!config.stringReplacements) {
    config.stringReplacements = {
      'className="[^"]*space-[xy]-[^"]*"': 'gap utilities',
      'className="[^"]*transform[^"]*"': 'transform-gpu utilities',
    };
    appliedFixes.push('Added default Tailwind string replacements');
  }

  if (!config.rollbackPatterns) {
    config.rollbackPatterns = {
      'gap-x-': 'space-x-',
      'gap-y-': 'space-y-',
      'transform-gpu': 'transform',
      'backdrop-filter': 'filter',
    };
    appliedFixes.push('Added default Tailwind rollback patterns');
  }
}

function optimizeForProduction(config: MigrationConfiguration): void {
  // Production optimizations
  config.dryRun = true; // Always dry run first in production
  config.force = false; // Never force in production
  config.skipValidation = false; // Always validate in production
  config.interactive = false; // No interactive prompts in production

  // Add comprehensive exclude patterns
  config.excludePatterns = [
    ...config.excludePatterns,
    'logs/**',
    '*.log',
    '.env*',
    'tmp/**',
    'temp/**',
  ];
}

function optimizeForStaging(config: MigrationConfiguration): void {
  // Staging optimizations
  config.dryRun = false; // Can run actual changes in staging
  config.force = false; // Still avoid force mode
  config.skipValidation = false; // Validate to catch issues before production
  config.interactive = true; // Allow interactive review
}

function optimizeForDevelopment(config: MigrationConfiguration): void {
  // Development optimizations
  config.dryRun = false; // Faster iteration without dry run
  config.interactive = true; // Developer can make choices
  config.skipValidation = false; // Still validate for safety

  // More permissive include patterns for development
  config.includePatterns = [
    ...config.includePatterns,
    'src/**/*.{ts,tsx,js,jsx}',
    'test/**/*.{ts,tsx,js,jsx}',
    'stories/**/*.{ts,tsx,js,jsx}',
  ];
}

function optimizeForTesting(config: MigrationConfiguration): void {
  // Testing optimizations
  config.dryRun = true; // Safe testing with dry run
  config.force = false; // No force mode in tests
  config.skipValidation = false; // Validate everything in tests
  config.interactive = false; // No user interaction in automated tests

  // Include test files
  config.includePatterns = [
    ...config.includePatterns,
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
    '__tests__/**/*.{ts,tsx,js,jsx}',
  ];
}
