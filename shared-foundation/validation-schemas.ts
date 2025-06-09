/**
 * Validation Schemas - Runtime validation using Zod
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Zod schemas for runtime validation
 * ✓ Consistent with SSOT architecture principles
 */

import * as z from 'zod';

import {
  BusinessDomain,
  ComplexityLevel,
  Framework,
  OutputFormat,
  Result,
  RiskLevel,
  Severity,
  ApiError,
  TransformationStatus,
  TransformationStrategy,
  ValidationLevel,
} from "../types/canonical-types";

// ============================================================================
// PRIMITIVE SCHEMAS
// ============================================================================

export const EntityIdSchema = z.string().min(1, 'EntityId cannot be empty');
export const TimestampSchema = z.string().datetime('Invalid ISO timestamp');
export const FilePathSchema = z.string().min(1, 'FilePath cannot be empty');
export const OperationIdSchema = z
  .string()
  .regex(/^op_\d+_[a-z0-9]+$/, 'Invalid OperationId format');
export const ConfidenceScoreSchema = z.number().min(0).max(1);
export const ComplexityScoreSchema = z.number().int().min(1).max(10);

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const FrameworkSchema = z.nativeEnum(Framework);
export const RiskLevelSchema = z.nativeEnum(RiskLevel);
export const SeveritySchema = z.nativeEnum(Severity);
export const ValidationLevelSchema = z.nativeEnum(ValidationLevel);
export const ComplexityLevelSchema = z.nativeEnum(ComplexityLevel);
export const TransformationStrategySchema = z.nativeEnum(TransformationStrategy);
export const BusinessDomainSchema = z.nativeEnum(BusinessDomain);
export const OutputFormatSchema = z.nativeEnum(OutputFormat);
export const TransformationStatusSchema = z.nativeEnum(TransformationStatus);

// ============================================================================
// ERROR SCHEMAS
// ============================================================================

export const ErrorContextSchema = z.object({
  operation: z.string(),
  file: FilePathSchema.optional(),
  sessionId: EntityIdSchema.optional(),
  additionalInfo: z.record(z.unknown()).optional(),
});

export const ApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  context: ErrorContextSchema,
  timestamp: TimestampSchema,
  recoverable: z.boolean(),
});

export const ValidationErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  field: z.string().optional(),
  severity: SeveritySchema,
});

export const ValidationResultSchema = z.object({
  passed: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(z.string()),
});

// ============================================================================
// RESULT SCHEMAS
// ============================================================================

export const ResultSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
  });

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    timestamp: TimestampSchema,
  });

// ============================================================================
// DOMAIN OBJECT SCHEMAS
// ============================================================================

export const MigrationConfigurationSchema = z.object({
  dryRun: z.boolean(),
  interactive: z.boolean(),
  frameworks: z.array(FrameworkSchema),
  validation: ValidationLevelSchema,
  options: z.record(z.unknown()).optional(),
});

export const CodeLocationSchema = z.object({
  file: FilePathSchema,
  line: z.number().int().positive(),
  column: z.number().int().nonnegative(),
  context: z.string().optional(),
});

export const PatternMatchSchema = z.object({
  id: z.string().min(1),
  location: CodeLocationSchema,
  confidence: ConfidenceScoreSchema,
  severity: SeveritySchema,
  framework: FrameworkSchema.optional(),
});

export const RiskFactorSchema = z.object({
  type: z.string().min(1),
  weight: z.number().min(0).max(1),
  description: z.string().min(1),
});

export const RiskAssessmentSchema = z.object({
  level: RiskLevelSchema,
  score: z.number().min(0).max(10),
  factors: z.array(RiskFactorSchema),
  businessDomain: BusinessDomainSchema,
  confidence: ConfidenceScoreSchema,
});

export const ChangeRecordSchema = z.object({
  rule: z.string().min(1),
  framework: FrameworkSchema,
  line: z.number().int().positive(),
  before: z.string(),
  after: z.string(),
  riskLevel: RiskLevelSchema,
});

export const TransformationResultSchema = z.object({
  success: z.boolean(),
  originalContent: z.string(),
  transformedContent: z.string(),
  changes: z.array(ChangeRecordSchema),
  status: TransformationStatusSchema,
  timestamp: TimestampSchema,
});

export const MigrationSessionSchema = z.object({
  sessionId: EntityIdSchema,
  timestamp: TimestampSchema,
  configuration: MigrationConfigurationSchema,
});

// ============================================================================
// FILE SYSTEM SCHEMAS
// ============================================================================

export const FileContentSchema = z.object({
  path: FilePathSchema,
  content: z.string(),
  hash: z.string(),
  encoding: z.string().default('utf8'),
});

export const DirectoryPathSchema = z.string().min(1);

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Generic validation function using Zod schemas
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  operation: string = 'validateWithSchema',
): Result<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: `Validation failed: ${message}`,
          context: { operation },
          timestamp: new Date().toISOString(),
          recoverable: true,
        } as ApiError,
      };
    }

    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        context: { operation },
        timestamp: new Date().toISOString(),
        recoverable: true,
      } as ApiError,
    };
  }
}

/**
 * Validates multiple schemas and collects all errors
 */
export function validateMultiple<T extends Record<string, unknown>>(
  validations: Array<{
    key: keyof T;
    schema: z.ZodSchema;
    data: unknown;
  }>,
): Result<T> {
  const results: Partial<T> = {};
  const errors: string[] = [];

  for (const { key, schema, data } of validations) {
    const result = validateWithSchema(schema, data, `validate_${String(key)}`);

    if (result.success) {
      results[key] = result.data as T[keyof T];
    } else {
      errors.push(`${String(key)}: ${result.error?.message || 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'MULTIPLE_VALIDATION_FAILURES',
        message: `Multiple validation failures: ${errors.join('; ')}`,
        context: { operation: 'validateMultiple' },
        timestamp: new Date().toISOString(),
        recoverable: true,
      } as ApiError,
    };
  }

  return { success: true, data: results as T };
}

/**
 * Creates a validator function for a specific schema
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): Result<T> => validateWithSchema(schema, data);
}

/**
 * Creates a type guard from a Zod schema
 */
export function createTypeGuard<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): data is T => {
    try {
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  };
}

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

export const validateEntityId = createValidator(EntityIdSchema);
export const validateTimestamp = createValidator(TimestampSchema);
export const validateFilePath = createValidator(FilePathSchema);
export const validateConfidenceScore = createValidator(ConfidenceScoreSchema);
export const validateComplexityScore = createValidator(ComplexityScoreSchema);
export const validateFramework = createValidator(FrameworkSchema);
export const validateRiskLevel = createValidator(RiskLevelSchema);
export const validateSeverity = createValidator(SeveritySchema);
export const validateMigrationConfiguration = createValidator(MigrationConfigurationSchema);
export const validatePatternMatch = createValidator(PatternMatchSchema);
export const validateRiskAssessment = createValidator(RiskAssessmentSchema);
export const validateTransformationResult = createValidator(TransformationResultSchema);

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isValidEntityId = createTypeGuard(EntityIdSchema);
export const isValidTimestamp = createTypeGuard(TimestampSchema);
export const isValidFilePath = createTypeGuard(FilePathSchema);
export const isValidFramework = createTypeGuard(FrameworkSchema);
export const isValidRiskLevel = createTypeGuard(RiskLevelSchema);
export const isValidSeverity = createTypeGuard(SeveritySchema);

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const schemas = {
  // Primitives
  entityId: EntityIdSchema,
  timestamp: TimestampSchema,
  filePath: FilePathSchema,
  operationId: OperationIdSchema,
  confidence: ConfidenceScoreSchema,
  complexity: ComplexityScoreSchema,

  // Enums
  framework: FrameworkSchema,
  riskLevel: RiskLevelSchema,
  severity: SeveritySchema,
  validationLevel: ValidationLevelSchema,
  complexityLevel: ComplexityLevelSchema,
  transformationStrategy: TransformationStrategySchema,
  businessDomain: BusinessDomainSchema,
  outputFormat: OutputFormatSchema,
  transformationStatus: TransformationStatusSchema,

  // Errors
  systemError: ApiErrorSchema,
  validationError: ValidationErrorSchema,
  validationResult: ValidationResultSchema,

  // Domain Objects
  migrationConfiguration: MigrationConfigurationSchema,
  codeLocation: CodeLocationSchema,
  patternMatch: PatternMatchSchema,
  riskAssessment: RiskAssessmentSchema,
  changeRecord: ChangeRecordSchema,
  transformationResult: TransformationResultSchema,
  migrationSession: MigrationSessionSchema,

  // File System
  fileContent: FileContentSchema,
  directoryPath: DirectoryPathSchema,
} as const;

export const validators = {
  validateWithSchema,
  validateMultiple,
  createValidator,
  createTypeGuard,

  // Common validators
  validateEntityId,
  validateTimestamp,
  validateFilePath,
  validateConfidenceScore,
  validateComplexityScore,
  validateFramework,
  validateRiskLevel,
  validateSeverity,
  validateMigrationConfiguration,
  validatePatternMatch,
  validateRiskAssessment,
  validateTransformationResult,
} as const;

export const typeGuards = {
  isValidEntityId,
  isValidTimestamp,
  isValidFilePath,
  isValidFramework,
  isValidRiskLevel,
  isValidSeverity,
} as const;
