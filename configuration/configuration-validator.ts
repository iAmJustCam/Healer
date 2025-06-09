/**
 * Configuration Validator - Pure Validation Logic
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on canonical types (Layer 0-1)
 * ✓ Pure utility functions only - no side effects
 * ✓ Single responsibility: Configuration validation only (SRP)
 * ✓ All types imported from canonical source (SSOT)
 */

import {
  ApiResponse,
  Framework,
  MigrationConfiguration,
  ValidationError,
  ValidationResult,
  createApiResponse,
  createApiError,
  isFramework,
} from '../types/canonical-types';

// ============================================================================
// CORE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates migration configuration structure and values
 */
export function validateConfiguration(config: unknown): ApiResponse<MigrationConfiguration> {
  if (typeof config !== 'object' || config === null) {
    return createApiResponse(
      undefined,
      createApiError(
        'INVALID_CONFIG_TYPE',
        'Configuration must be an object',
        'validateConfiguration',
      ),
    );
  }

  const c = config as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // Validate required boolean fields
  validateBooleanField(c, 'dryRun', errors);
  validateBooleanField(c, 'interactive', errors);
  validateBooleanField(c, 'force', errors);
  validateBooleanField(c, 'skipValidation', errors);

  // Validate frameworks array
  validateFrameworksArray(c.frameworks, errors);

  // Validate pattern arrays
  validateStringArray(c.includePatterns, 'includePatterns', errors);
  validateStringArray(c.excludePatterns, 'excludePatterns', errors);

  // Validate environment
  validateEnvironment(c.environment, errors);

  if (errors.length > 0) {
    return createApiResponse(
      undefined,
      createApiError(
        'CONFIG_VALIDATION_ERROR',
        'Configuration validation failed',
        'validateConfiguration',
        { validationErrors: errors },
      ),
    );
  }

  return createApiResponse(c as MigrationConfiguration);
}

/**
 * Validates configuration completeness and health
 */
export function validateConfigurationHealth(
  config: MigrationConfiguration,
): ApiResponse<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  let healthScore = 1.0;

  // Check for empty frameworks
  if (config.frameworks.length === 0) {
    errors.push({
      id: 'EMPTY_FRAMEWORKS',
      message: 'At least one framework must be specified',
      path: 'frameworks',
    });
    healthScore -= 0.3;
  }

  // Check for conflicting settings
  if (config.force && config.interactive) {
    warnings.push('Force mode conflicts with interactive mode');
    healthScore -= 0.1;
  }

  if (config.skipValidation && !config.dryRun) {
    warnings.push('Skipping validation without dry run is risky');
    healthScore -= 0.2;
  }

  // Check for missing exclude patterns
  if (config.excludePatterns.length === 0) {
    warnings.push('No exclude patterns specified - may process unintended files');
    healthScore -= 0.1;
  }

  const result: ValidationResult = {
    passed: errors.length === 0,
    errors,
    warnings,
  };

  return createApiResponse(result);
}

/**
 * Quick validation check for critical errors only
 */
export function quickValidateConfiguration(config: unknown): boolean {
  const result = validateConfiguration(config);
  return result.success && result.data !== undefined;
}

/**
 * Validates specific framework configuration
 */
export function validateFrameworkConfiguration(
  framework: string,
  config: unknown,
): ApiResponse<ValidationResult> {
  if (!isFramework(framework)) {
    return createApiResponse(
      undefined,
      createApiError(
        'INVALID_FRAMEWORK',
        `Unknown framework: ${framework}`,
        'validateFrameworkConfiguration',
      ),
    );
  }

  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Framework-specific validation
  switch (framework) {
    case Framework.REACT19_19:
      validateReactConfiguration(config, errors, warnings);
      break;
    case Framework.NEXTJS15JS_15:
      validateNextJSConfiguration(config, errors, warnings);
      break;
    case Framework.TYPESCRIPT5_5:
      validateTypeScriptConfiguration(config, errors, warnings);
      break;
    case Framework.TAILWIND4_4:
      validateTailwindConfiguration(config, errors, warnings);
      break;
  }

  const result: ValidationResult = {
    passed: errors.length === 0,
    errors,
    warnings,
  };

  return createApiResponse(result);
}

// ============================================================================
// PRIVATE VALIDATION HELPERS
// ============================================================================

function validateBooleanField(
  config: Record<string, unknown>,
  field: string,
  errors: ValidationError[],
): void {
  if (typeof config[field] !== 'boolean') {
    errors.push({
      id: 'INVALID_TYPE',
      message: `${field} must be a boolean`,
      path: field,
    });
  }
}

function validateFrameworksArray(frameworks: unknown, errors: ValidationError[]): void {
  if (!Array.isArray(frameworks)) {
    errors.push({
      id: 'INVALID_TYPE',
      message: 'frameworks must be an array',
      path: 'frameworks',
    });
    return;
  }

  const validFrameworks = Object.values(Framework);
  frameworks.forEach((framework, index) => {
    if (!validFrameworks.includes(framework as Framework)) {
      errors.push({
        id: 'INVALID_FRAMEWORK',
        message: `Invalid framework: ${framework}`,
        path: `frameworks[${index}]`,
      });
    }
  });
}

function validateStringArray(array: unknown, fieldName: string, errors: ValidationError[]): void {
  if (!Array.isArray(array)) {
    errors.push({
      id: 'INVALID_TYPE',
      message: `${fieldName} must be an array`,
      path: fieldName,
    });
    return;
  }

  array.forEach((item, index) => {
    if (typeof item !== 'string') {
      errors.push({
        id: 'INVALID_PATTERN_TYPE',
        message: `${fieldName} items must be strings`,
        path: `${fieldName}[${index}]`,
      });
    }
  });
}

function validateEnvironment(environment: unknown, errors: ValidationError[]): void {
  const validEnvironments = ['development', 'testing', 'staging', 'production'];
  if (!validEnvironments.includes(environment as string)) {
    errors.push({
      id: 'INVALID_ENVIRONMENT',
      message: `Invalid environment: ${environment}`,
      path: 'environment',
    });
  }
}

function validateReactConfiguration(
  config: unknown,
  errors: ValidationError[],
  warnings: string[],
): void {
  if (!config || typeof config !== 'object') {
    errors.push({
      id: 'MISSING_CONFIG',
      message: 'React configuration is missing',
      path: 'react',
    });
    return;
  }

  const reactConfig = config as Record<string, unknown>;

  if (!reactConfig.breakingChanges) {
    errors.push({
      id: 'MISSING_BREAKING_CHANGES',
      message: 'React breaking changes configuration missing',
      path: 'react.breakingChanges',
    });
  }

  if (!Array.isArray(reactConfig.astPatterns) || reactConfig.astPatterns.length === 0) {
    errors.push({
      id: 'MISSING_AST_PATTERNS',
      message: 'React AST patterns not defined',
      path: 'react.astPatterns',
    });
  }

  if (!reactConfig.stringReplacements) {
    warnings.push('React string replacement patterns not defined');
  }

  if (!reactConfig.rollbackPatterns) {
    warnings.push('React rollback patterns not defined - rollback will be limited');
  }
}

function validateNextJSConfiguration(
  config: unknown,
  errors: ValidationError[],
  warnings: string[],
): void {
  if (!config || typeof config !== 'object') {
    errors.push({
      id: 'MISSING_CONFIG',
      message: 'Next.js configuration is missing',
      path: 'nextjs',
    });
    return;
  }

  const nextjsConfig = config as Record<string, unknown>;

  if (!nextjsConfig.breakingChanges) {
    errors.push({
      id: 'MISSING_BREAKING_CHANGES',
      message: 'Next.js breaking changes configuration missing',
      path: 'nextjs.breakingChanges',
    });
  }

  if (!nextjsConfig.stringReplacements) {
    warnings.push('Next.js string replacement patterns not defined');
  }
}

function validateTypeScriptConfiguration(
  config: unknown,
  errors: ValidationError[],
  warnings: string[],
): void {
  if (!config || typeof config !== 'object') {
    errors.push({
      id: 'MISSING_CONFIG',
      message: 'TypeScript configuration is missing',
      path: 'typescript',
    });
    return;
  }

  const tsConfig = config as Record<string, unknown>;

  if (!tsConfig.breakingChanges) {
    errors.push({
      id: 'MISSING_BREAKING_CHANGES',
      message: 'TypeScript breaking changes configuration missing',
      path: 'typescript.breakingChanges',
    });
  }

  if (!tsConfig.stringReplacements) {
    warnings.push('TypeScript string replacement patterns not defined');
  }
}

function validateTailwindConfiguration(
  config: unknown,
  errors: ValidationError[],
  warnings: string[],
): void {
  if (!config || typeof config !== 'object') {
    errors.push({
      id: 'MISSING_CONFIG',
      message: 'Tailwind configuration is missing',
      path: 'tailwind',
    });
    return;
  }

  const tailwindConfig = config as Record<string, unknown>;

  if (!tailwindConfig.breakingChanges) {
    errors.push({
      id: 'MISSING_BREAKING_CHANGES',
      message: 'Tailwind breaking changes configuration missing',
      path: 'tailwind.breakingChanges',
    });
  }

  if (!tailwindConfig.classTranslation) {
    warnings.push('Tailwind class translation patterns not defined');
  }
}
