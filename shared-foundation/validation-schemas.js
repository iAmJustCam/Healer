"use strict";
/**
 * Validation Schemas - Runtime validation using Zod
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Zod schemas for runtime validation
 * ✓ Consistent with SSOT architecture principles
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.isValidSeverity = exports.isValidRiskLevel = exports.isValidFramework = exports.isValidFilePath = exports.isValidTimestamp = exports.isValidEntityId = exports.validateTransformationResult = exports.validateRiskAssessment = exports.validatePatternMatch = exports.validateMigrationConfiguration = exports.validateSeverity = exports.validateRiskLevel = exports.validateFramework = exports.validateComplexityScore = exports.validateConfidenceScore = exports.validateFilePath = exports.validateTimestamp = exports.validateEntityId = exports.DirectoryPathSchema = exports.FileContentSchema = exports.MigrationSessionSchema = exports.TransformationResultSchema = exports.ChangeRecordSchema = exports.RiskAssessmentSchema = exports.RiskFactorSchema = exports.PatternMatchSchema = exports.CodeLocationSchema = exports.MigrationConfigurationSchema = exports.ApiResponseSchema = exports.ResultSchema = exports.ValidationResultSchema = exports.ValidationErrorSchema = exports.ApiErrorSchema = exports.ErrorContextSchema = exports.TransformationStatusSchema = exports.OutputFormatSchema = exports.BusinessDomainSchema = exports.TransformationStrategySchema = exports.ComplexityLevelSchema = exports.ValidationLevelSchema = exports.SeveritySchema = exports.RiskLevelSchema = exports.FrameworkSchema = exports.ComplexityScoreSchema = exports.ConfidenceScoreSchema = exports.OperationIdSchema = exports.FilePathSchema = exports.TimestampSchema = exports.EntityIdSchema = void 0;
exports.typeGuards = exports.validators = void 0;
exports.validateWithSchema = validateWithSchema;
exports.validateMultiple = validateMultiple;
exports.createValidator = createValidator;
exports.createTypeGuard = createTypeGuard;
var z = require("zod");
var canonical_types_1 = require("../types/canonical-types");
// ============================================================================
// PRIMITIVE SCHEMAS
// ============================================================================
exports.EntityIdSchema = z.string().min(1, 'EntityId cannot be empty');
exports.TimestampSchema = z.string().datetime('Invalid ISO timestamp');
exports.FilePathSchema = z.string().min(1, 'FilePath cannot be empty');
exports.OperationIdSchema = z
    .string()
    .regex(/^op_\d+_[a-z0-9]+$/, 'Invalid OperationId format');
exports.ConfidenceScoreSchema = z.number().min(0).max(1);
exports.ComplexityScoreSchema = z.number().int().min(1).max(10);
// ============================================================================
// ENUM SCHEMAS
// ============================================================================
exports.FrameworkSchema = z.nativeEnum(canonical_types_1.Framework);
exports.RiskLevelSchema = z.nativeEnum(canonical_types_1.RiskLevel);
exports.SeveritySchema = z.nativeEnum(canonical_types_1.Severity);
exports.ValidationLevelSchema = z.nativeEnum(canonical_types_1.ValidationLevel);
exports.ComplexityLevelSchema = z.nativeEnum(canonical_types_1.ComplexityLevel);
exports.TransformationStrategySchema = z.nativeEnum(canonical_types_1.TransformationStrategy);
exports.BusinessDomainSchema = z.nativeEnum(canonical_types_1.BusinessDomain);
exports.OutputFormatSchema = z.nativeEnum(canonical_types_1.OutputFormat);
exports.TransformationStatusSchema = z.nativeEnum(canonical_types_1.TransformationStatus);
// ============================================================================
// ERROR SCHEMAS
// ============================================================================
exports.ErrorContextSchema = z.object({
    operation: z.string(),
    file: exports.FilePathSchema.optional(),
    sessionId: exports.EntityIdSchema.optional(),
    additionalInfo: z.record(z.unknown()).optional(),
});
exports.ApiErrorSchema = z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    context: exports.ErrorContextSchema,
    timestamp: exports.TimestampSchema,
    recoverable: z.boolean(),
});
exports.ValidationErrorSchema = z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    field: z.string().optional(),
    severity: exports.SeveritySchema,
});
exports.ValidationResultSchema = z.object({
    passed: z.boolean(),
    errors: z.array(exports.ValidationErrorSchema),
    warnings: z.array(z.string()),
});
// ============================================================================
// RESULT SCHEMAS
// ============================================================================
var ResultSchema = function (dataSchema) {
    return z.object({
        success: z.boolean(),
        data: dataSchema.optional(),
        error: exports.ApiErrorSchema.optional(),
    });
};
exports.ResultSchema = ResultSchema;
var ApiResponseSchema = function (dataSchema) {
    return z.object({
        success: z.boolean(),
        data: dataSchema.optional(),
        error: exports.ApiErrorSchema.optional(),
        timestamp: exports.TimestampSchema,
    });
};
exports.ApiResponseSchema = ApiResponseSchema;
// ============================================================================
// DOMAIN OBJECT SCHEMAS
// ============================================================================
exports.MigrationConfigurationSchema = z.object({
    dryRun: z.boolean(),
    interactive: z.boolean(),
    frameworks: z.array(exports.FrameworkSchema),
    validation: exports.ValidationLevelSchema,
    options: z.record(z.unknown()).optional(),
});
exports.CodeLocationSchema = z.object({
    file: exports.FilePathSchema,
    line: z.number().int().positive(),
    column: z.number().int().nonnegative(),
    context: z.string().optional(),
});
exports.PatternMatchSchema = z.object({
    id: z.string().min(1),
    location: exports.CodeLocationSchema,
    confidence: exports.ConfidenceScoreSchema,
    severity: exports.SeveritySchema,
    framework: exports.FrameworkSchema.optional(),
});
exports.RiskFactorSchema = z.object({
    type: z.string().min(1),
    weight: z.number().min(0).max(1),
    description: z.string().min(1),
});
exports.RiskAssessmentSchema = z.object({
    level: exports.RiskLevelSchema,
    score: z.number().min(0).max(10),
    factors: z.array(exports.RiskFactorSchema),
    businessDomain: exports.BusinessDomainSchema,
    confidence: exports.ConfidenceScoreSchema,
});
exports.ChangeRecordSchema = z.object({
    rule: z.string().min(1),
    framework: exports.FrameworkSchema,
    line: z.number().int().positive(),
    before: z.string(),
    after: z.string(),
    riskLevel: exports.RiskLevelSchema,
});
exports.TransformationResultSchema = z.object({
    success: z.boolean(),
    originalContent: z.string(),
    transformedContent: z.string(),
    changes: z.array(exports.ChangeRecordSchema),
    status: exports.TransformationStatusSchema,
    timestamp: exports.TimestampSchema,
});
exports.MigrationSessionSchema = z.object({
    sessionId: exports.EntityIdSchema,
    timestamp: exports.TimestampSchema,
    configuration: exports.MigrationConfigurationSchema,
});
// ============================================================================
// FILE SYSTEM SCHEMAS
// ============================================================================
exports.FileContentSchema = z.object({
    path: exports.FilePathSchema,
    content: z.string(),
    hash: z.string(),
    encoding: z.string().default('utf8'),
});
exports.DirectoryPathSchema = z.string().min(1);
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
/**
 * Generic validation function using Zod schemas
 */
function validateWithSchema(schema, data, operation) {
    if (operation === void 0) { operation = 'validateWithSchema'; }
    try {
        var result = schema.parse(data);
        return { success: true, data: result };
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            var message = error.errors.map(function (e) { return "".concat(e.path.join('.'), ": ").concat(e.message); }).join('; ');
            return {
                success: false,
                error: {
                    code: 'VALIDATION_FAILED',
                    message: "Validation failed: ".concat(message),
                    context: { operation: operation },
                    timestamp: new Date().toISOString(),
                    recoverable: true,
                },
            };
        }
        return {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: error instanceof Error ? error.message : 'Unknown validation error',
                context: { operation: operation },
                timestamp: new Date().toISOString(),
                recoverable: true,
            },
        };
    }
}
/**
 * Validates multiple schemas and collects all errors
 */
function validateMultiple(validations) {
    var _a;
    var results = {};
    var errors = [];
    for (var _i = 0, validations_1 = validations; _i < validations_1.length; _i++) {
        var _b = validations_1[_i], key = _b.key, schema = _b.schema, data = _b.data;
        var result = validateWithSchema(schema, data, "validate_".concat(String(key)));
        if (result.success) {
            results[key] = result.data;
        }
        else {
            errors.push("".concat(String(key), ": ").concat(((_a = result.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error'));
        }
    }
    if (errors.length > 0) {
        return {
            success: false,
            error: {
                code: 'MULTIPLE_VALIDATION_FAILURES',
                message: "Multiple validation failures: ".concat(errors.join('; ')),
                context: { operation: 'validateMultiple' },
                timestamp: new Date().toISOString(),
                recoverable: true,
            },
        };
    }
    return { success: true, data: results };
}
/**
 * Creates a validator function for a specific schema
 */
function createValidator(schema) {
    return function (data) { return validateWithSchema(schema, data); };
}
/**
 * Creates a type guard from a Zod schema
 */
function createTypeGuard(schema) {
    return function (data) {
        try {
            schema.parse(data);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
}
// ============================================================================
// COMMON VALIDATORS
// ============================================================================
exports.validateEntityId = createValidator(exports.EntityIdSchema);
exports.validateTimestamp = createValidator(exports.TimestampSchema);
exports.validateFilePath = createValidator(exports.FilePathSchema);
exports.validateConfidenceScore = createValidator(exports.ConfidenceScoreSchema);
exports.validateComplexityScore = createValidator(exports.ComplexityScoreSchema);
exports.validateFramework = createValidator(exports.FrameworkSchema);
exports.validateRiskLevel = createValidator(exports.RiskLevelSchema);
exports.validateSeverity = createValidator(exports.SeveritySchema);
exports.validateMigrationConfiguration = createValidator(exports.MigrationConfigurationSchema);
exports.validatePatternMatch = createValidator(exports.PatternMatchSchema);
exports.validateRiskAssessment = createValidator(exports.RiskAssessmentSchema);
exports.validateTransformationResult = createValidator(exports.TransformationResultSchema);
// ============================================================================
// TYPE GUARDS
// ============================================================================
exports.isValidEntityId = createTypeGuard(exports.EntityIdSchema);
exports.isValidTimestamp = createTypeGuard(exports.TimestampSchema);
exports.isValidFilePath = createTypeGuard(exports.FilePathSchema);
exports.isValidFramework = createTypeGuard(exports.FrameworkSchema);
exports.isValidRiskLevel = createTypeGuard(exports.RiskLevelSchema);
exports.isValidSeverity = createTypeGuard(exports.SeveritySchema);
// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================
exports.schemas = {
    // Primitives
    entityId: exports.EntityIdSchema,
    timestamp: exports.TimestampSchema,
    filePath: exports.FilePathSchema,
    operationId: exports.OperationIdSchema,
    confidence: exports.ConfidenceScoreSchema,
    complexity: exports.ComplexityScoreSchema,
    // Enums
    framework: exports.FrameworkSchema,
    riskLevel: exports.RiskLevelSchema,
    severity: exports.SeveritySchema,
    validationLevel: exports.ValidationLevelSchema,
    complexityLevel: exports.ComplexityLevelSchema,
    transformationStrategy: exports.TransformationStrategySchema,
    businessDomain: exports.BusinessDomainSchema,
    outputFormat: exports.OutputFormatSchema,
    transformationStatus: exports.TransformationStatusSchema,
    // Errors
    systemError: exports.ApiErrorSchema,
    validationError: exports.ValidationErrorSchema,
    validationResult: exports.ValidationResultSchema,
    // Domain Objects
    migrationConfiguration: exports.MigrationConfigurationSchema,
    codeLocation: exports.CodeLocationSchema,
    patternMatch: exports.PatternMatchSchema,
    riskAssessment: exports.RiskAssessmentSchema,
    changeRecord: exports.ChangeRecordSchema,
    transformationResult: exports.TransformationResultSchema,
    migrationSession: exports.MigrationSessionSchema,
    // File System
    fileContent: exports.FileContentSchema,
    directoryPath: exports.DirectoryPathSchema,
};
exports.validators = {
    validateWithSchema: validateWithSchema,
    validateMultiple: validateMultiple,
    createValidator: createValidator,
    createTypeGuard: createTypeGuard,
    // Common validators
    validateEntityId: exports.validateEntityId,
    validateTimestamp: exports.validateTimestamp,
    validateFilePath: exports.validateFilePath,
    validateConfidenceScore: exports.validateConfidenceScore,
    validateComplexityScore: exports.validateComplexityScore,
    validateFramework: exports.validateFramework,
    validateRiskLevel: exports.validateRiskLevel,
    validateSeverity: exports.validateSeverity,
    validateMigrationConfiguration: exports.validateMigrationConfiguration,
    validatePatternMatch: exports.validatePatternMatch,
    validateRiskAssessment: exports.validateRiskAssessment,
    validateTransformationResult: exports.validateTransformationResult,
};
exports.typeGuards = {
    isValidEntityId: exports.isValidEntityId,
    isValidTimestamp: exports.isValidTimestamp,
    isValidFilePath: exports.isValidFilePath,
    isValidFramework: exports.isValidFramework,
    isValidRiskLevel: exports.isValidRiskLevel,
    isValidSeverity: exports.isValidSeverity,
};
