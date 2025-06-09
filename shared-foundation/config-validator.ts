/**
 * Configuration Validator - Validates system configuration objects
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ Uses validation-schemas.ts for schema validation
 * ✓ No local type definitions
 * ✓ Consistent with SSOT architecture principles
 */

import * as z from 'zod';

import {
  Framework,
  MigrationConfiguration,
  Result,
  Severity,
  ApiError,
  ValidationError,
  ValidationLevel,
  ValidationResult,
} from "../types/canonical-types";
import {
  FrameworkSchema,
  MigrationConfigurationSchema,
  validateWithSchema,
} from './validation-schemas';

// ============================================================================
// CONFIGURATION VALIDATION SCHEMAS
// ============================================================================

const AIConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  model: z.string().optional(),
  timeout: z.number().positive().optional(),
  maxRetries: z.number().min(0).optional(),
  verbose: z.boolean().optional(),
});

const CLIConfigSchema = z.object({
  interactive: z.boolean().default(true),
  verbose: z.boolean().default(false),
  outputFormat: z.enum(['console', 'json', 'html']).default('console'),
  colorEnabled: z.boolean().default(true),
  progressBar: z.boolean().default(true),
});

const TransformationConfigSchema = z.object({
  strategy: z.enum(['string', 'ast', 'hybrid', 'ai-enhanced']).default('hybrid'),
  dryRun: z.boolean().default(false),
  backupEnabled: z.boolean().default(true),
  parallelism: z.number().positive().default(4),
  maxFileSize: z
    .number()
    .positive()
    .default(1024 * 1024), // 1MB
});

const PatternDetectionConfigSchema = z.object({
  frameworks: z.array(FrameworkSchema).min(1),
  minConfidence: z.number().min(0).max(1).default(0.7),
  includeDebt: z.boolean().default(true),
  scanDepth: z.enum(['surface', 'deep', 'exhaustive']).default('deep'),
  enableCaching: z.boolean().default(true),
});

const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  frameworks: z.array(FrameworkSchema),
  sourceDirectory: z.string().min(1),
  outputDirectory: z.string().min(1),
  excludePaths: z.array(z.string()).default([]),
  includePaths: z.array(z.string()).default([]),
});

const FullConfigSchema = z.object({
  project: ProjectConfigSchema,
  migration: MigrationConfigurationSchema,
  ai: AIConfigSchema.optional(),
  cli: CLIConfigSchema.optional(),
  transformation: TransformationConfigSchema.optional(),
  patternDetection: PatternDetectionConfigSchema.optional(),
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates AI configuration
 */
export function validateAIConfig(config: unknown): Result<z.infer<typeof AIConfigSchema>> {
  return validateWithSchema(AIConfigSchema, config, 'validateAIConfig');
}

/**
 * Validates CLI configuration
 */
export function validateCLIConfig(config: unknown): Result<z.infer<typeof CLIConfigSchema>> {
  return validateWithSchema(CLIConfigSchema, config, 'validateCLIConfig');
}

/**
 * Validates transformation configuration
 */
export function validateTransformationConfig(
  config: unknown,
): Result<z.infer<typeof TransformationConfigSchema>> {
  return validateWithSchema(TransformationConfigSchema, config, 'validateTransformationConfig');
}

/**
 * Validates pattern detection configuration
 */
export function validatePatternDetectionConfig(
  config: unknown,
): Result<z.infer<typeof PatternDetectionConfigSchema>> {
  return validateWithSchema(PatternDetectionConfigSchema, config, 'validatePatternDetectionConfig');
}

/**
 * Validates project configuration
 */
export function validateProjectConfig(
  config: unknown,
): Result<z.infer<typeof ProjectConfigSchema>> {
  return validateWithSchema(ProjectConfigSchema, config, 'validateProjectConfig');
}

/**
 * Validates full system configuration
 */
export function validateFullConfig(config: unknown): Result<z.infer<typeof FullConfigSchema>> {
  return validateWithSchema(FullConfigSchema, config, 'validateFullConfig');
}

/**
 * Validates migration configuration with enhanced checks
 */
export function validateMigrationConfigurationEnhanced(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Basic schema validation
  const basicResult = validateWithSchema(
    MigrationConfigurationSchema,
    config,
    'validateMigrationConfiguration',
  );

  if (!basicResult.success) {
    errors.push({
      code: 'SCHEMA_VALIDATION_FAILED',
      message: basicResult.error?.message || 'Schema validation failed',
      severity: Severity.ERROR,
    });

    return {
      passed: false,
      errors,
      warnings,
    };
  }

  const migrationConfig = basicResult.data!;

  // Enhanced validation rules
  if (migrationConfig.frameworks.length === 0) {
    errors.push({
      code: 'NO_FRAMEWORKS_SPECIFIED',
      message: 'At least one framework must be specified',
      field: 'frameworks',
      severity: Severity.ERROR,
    });
  }

  if (migrationConfig.frameworks.length > 5) {
    warnings.push('More than 5 frameworks specified - this may impact performance');
  }

  if (migrationConfig.dryRun && migrationConfig.interactive) {
    warnings.push('Interactive mode has limited functionality in dry-run mode');
  }

  if (migrationConfig.validation === ValidationLevel.BASIC && !migrationConfig.dryRun) {
    warnings.push('Basic validation level recommended only for dry-run mode');
  }

  // Framework-specific validation
  const hasReact = migrationConfig.frameworks.includes(Framework.REACT19_19);
  const hasNextJS = migrationConfig.frameworks.includes(Framework.NEXTJS15JS_15);

  if (hasNextJS && !hasReact) {
    warnings.push(
      'Next.js 15 framework specified without React 19 - React will be automatically included',
    );
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// CONFIGURATION BUILDER UTILITIES
// ============================================================================

/**
 * Creates a default migration configuration
 */
export function createDefaultMigrationConfiguration(
  frameworks: Framework[] = [Framework.REACT19_19],
  overrides: Partial<MigrationConfiguration> = {},
): MigrationConfiguration {
  return {
    dryRun: false,
    interactive: true,
    frameworks,
    validation: ValidationLevel.STRICT,
    options: {},
    ...overrides,
  };
}

/**
 * Creates a default project configuration
 */
export function createDefaultProjectConfig(
  name: string,
  overrides: Partial<z.infer<typeof ProjectConfigSchema>> = {},
): z.infer<typeof ProjectConfigSchema> {
  return {
    name,
    version: '1.0.0',
    frameworks: [Framework.REACT19_19],
    sourceDirectory: './src',
    outputDirectory: './dist',
    excludePaths: ['node_modules', 'dist', '.git'],
    includePaths: [],
    ...overrides,
  };
}

/**
 * Merges configuration objects with validation
 */
export function mergeConfigurations<T>(
  base: T,
  override: Partial<T>,
  validator: (config: unknown) => Result<T>,
): Result<T> {
  const merged = { ...base, ...override };
  return validator(merged);
}

// ============================================================================
// CONFIGURATION ENVIRONMENT UTILITIES
// ============================================================================

/**
 * Loads configuration from environment variables
 */
export function loadConfigFromEnvironment(): Partial<z.infer<typeof FullConfigSchema>> {
  return {
    ai: {
      apiKey: process.env.AI_API_KEY,
      baseUrl: process.env.AI_BASE_URL,
      model: process.env.AI_MODEL,
      timeout: process.env.AI_TIMEOUT ? parseInt(process.env.AI_TIMEOUT, 10) : undefined,
      maxRetries: process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES, 10) : undefined,
      verbose: process.env.AI_VERBOSE === 'true',
    },
    cli: {
      interactive: process.env.CLI_INTERACTIVE !== 'false',
      verbose: process.env.CLI_VERBOSE === 'true',
      colorEnabled: process.env.CLI_COLOR !== 'false',
      progressBar: process.env.CLI_PROGRESS !== 'false',
    },
  };
}

/**
 * Validates environment configuration
 */
export function validateEnvironmentConfig(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Check for required environment variables
  const requiredVars = ['NODE_ENV'];
  const optionalVars = ['AI_API_KEY', 'AI_BASE_URL'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push({
        code: 'MISSING_ENV_VAR',
        message: `Required environment variable ${varName} is not set`,
        field: varName,
        severity: Severity.ERROR,
      });
    }
  }

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable ${varName} is not set`);
    }
  }

  // Validate specific environment values
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    warnings.push(`Unusual NODE_ENV value: ${nodeEnv}`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const configValidators = {
  validateAIConfig,
  validateCLIConfig,
  validateTransformationConfig,
  validatePatternDetectionConfig,
  validateProjectConfig,
  validateFullConfig,
  validateMigrationConfigurationEnhanced,
  validateEnvironmentConfig,
} as const;

export const configBuilders = {
  createDefaultMigrationConfiguration,
  createDefaultProjectConfig,
  mergeConfigurations,
  loadConfigFromEnvironment,
} as const;

export const configSchemas = {
  ai: AIConfigSchema,
  cli: CLIConfigSchema,
  transformation: TransformationConfigSchema,
  patternDetection: PatternDetectionConfigSchema,
  project: ProjectConfigSchema,
  full: FullConfigSchema,
} as const;

// Re-export for convenience
export { createValidator, validateWithSchema } from './validation-schemas';
