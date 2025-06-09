/**
 * Factory Functions - Object creation utilities
 *
 * SSOT COMPLIANCE:
 * ✓ Uses canonical-types.ts for all type imports
 * ✓ No local type definitions
 * ✓ Pure utility functions with no business logic
 * ✓ Consistent with SSOT architecture principles
 */

import {
  BranchName,
  BusinessDomain,
  ChangeRecord,
  CodeLocation,
  CommitSHA,
  ComplexityScore,
  ConfidenceScore,
  EntityId,
  createApiResponse,
  createEntityId,
  createFilePath,
  createOperationId,
  createApiError,
  createTimestamp,
  EntityId,
  Framework,
  MigrationConfiguration,
  MigrationSession,
  OperationId,
  PatternId,
  PatternMatch,
  RiskAssessment,
  RiskLevel,
  Severity,
  TransformationId,
  TransformationResult,
  TransformationStatus,
  ValidationError,
  ValidationLevel,
  ValidationResult,
} from "../types/foundation.types";

// ============================================================================
// ID GENERATION FACTORIES
// ============================================================================

/**
 * Creates a unique entity ID with optional prefix
 */
export function createUniqueEntityId(prefix: string = 'entity'): EntityId {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return createEntityId(`${prefix}_${timestamp}_${random}`);
}

/**
 * Creates a pattern ID
 */
export function createPatternId(name: string, version: string = '1.0'): PatternId {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `pattern_${sanitized}_v${version}` as PatternId;
}

/**
 * Creates a transformation ID
 */
export function createTransformationId(rule: string, target: string): TransformationId {
  const sanitizedRule = rule.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const sanitizedTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const timestamp = Date.now().toString(36);
  return `transform_${sanitizedRule}_${sanitizedTarget}_${timestamp}` as TransformationId;
}

/**
 * Creates a correlation ID for tracking related operations
 */
export function createEntityId(): EntityId {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `corr_${timestamp}_${random}` as EntityId;
}

/**
 * Creates a commit SHA (mock for testing)
 */
export function createCommitSHA(): CommitSHA {
  const hash = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    '',
  );
  return hash as CommitSHA;
}

/**
 * Creates a branch name
 */
export function createBranchName(feature: string, type: string = 'feature'): BranchName {
  const sanitized = feature.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${type}/${sanitized}` as BranchName;
}

// ============================================================================
// SCORE FACTORIES
// ============================================================================

/**
 * Creates a confidence score (0-1)
 */
export function createConfidenceScore(value: number): ConfidenceScore {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped as ConfidenceScore;
}

/**
 * Creates a complexity score (1-10)
 */
export function createComplexityScore(value: number): ComplexityScore {
  const clamped = Math.max(1, Math.min(10, Math.round(value)));
  return clamped as ComplexityScore;
}

// ============================================================================
// ERROR FACTORIES
// ============================================================================

/**
 * Creates a validation error
 */
export function createValidationError(
  code: string,
  message: string,
  field?: string,
  severity: Severity = Severity.ERROR,
): ValidationError {
  return {
    code,
    message,
    field,
    severity,
  };
}

/**
 * Creates a validation result
 */
export function createValidationResult(
  passed: boolean,
  errors: ValidationError[] = [],
  warnings: string[] = [],
): ValidationResult {
  return {
    passed,
    errors,
    warnings,
  };
}

/**
 * Creates a successful validation result
 */
export function createSuccessfulValidation(warnings: string[] = []): ValidationResult {
  return createValidationResult(true, [], warnings);
}

/**
 * Creates a failed validation result
 */
export function createFailedValidation(
  errors: ValidationError[],
  warnings: string[] = [],
): ValidationResult {
  return createValidationResult(false, errors, warnings);
}

// ============================================================================
// DOMAIN OBJECT FACTORIES
// ============================================================================

/**
 * Creates a migration configuration
 */
export function createMigrationConfiguration(
  frameworks: Framework[],
  options: {
    dryRun?: boolean;
    interactive?: boolean;
    validation?: ValidationLevel;
    customOptions?: Record<string, unknown>;
  } = {},
): MigrationConfiguration {
  return {
    dryRun: options.dryRun ?? false,
    interactive: options.interactive ?? false,
    frameworks,
    validation: options.validation ?? ValidationLevel.BASIC,
    options: options.customOptions,
  };
}

/**
 * Creates a migration session
 */
export function createMigrationSession(
  configuration: MigrationConfiguration,
  sessionId?: EntityId,
): MigrationSession {
  return {
    sessionId: sessionId ?? createUniqueEntityId('session'),
    timestamp: createTimestamp(),
    configuration,
  };
}

/**
 * Creates a code location
 */
export function createCodeLocation(
  file: string,
  line: number,
  column: number,
  context?: string,
): CodeLocation {
  return {
    file: createFilePath(file),
    line,
    column,
    context,
  };
}

/**
 * Creates a pattern match
 */
export function createPatternMatch(
  patternId: string,
  location: CodeLocation,
  confidence: number,
  severity: Severity = Severity.INFO,
  framework?: Framework,
): PatternMatch {
  return {
    id: patternId as PatternId,
    location,
    confidence: createConfidenceScore(confidence),
    severity,
    framework,
  };
}

/**
 * Creates a risk assessment
 */
export function createRiskAssessment(
  level: RiskLevel,
  score: number,
  businessDomain: BusinessDomain,
  factors: Array<{ type: string; weight: number; description: string }> = [],
  confidence: number = 0.8,
): RiskAssessment {
  return {
    level,
    score: Math.max(0, Math.min(10, score)),
    factors,
    businessDomain,
    confidence: createConfidenceScore(confidence),
  };
}

/**
 * Creates a change record
 */
export function createChangeRecord(
  rule: string,
  framework: Framework,
  line: number,
  before: string,
  after: string,
  riskLevel: RiskLevel = RiskLevel.LOW,
): ChangeRecord {
  return {
    rule,
    framework,
    line,
    before,
    after,
    riskLevel,
  };
}

/**
 * Creates a transformation result
 */
export function createTransformationResult(
  success: boolean,
  originalContent: string,
  transformedContent: string,
  changes: ChangeRecord[] = [],
  status: TransformationStatus = success
    ? TransformationStatus.COMPLETED
    : TransformationStatus.FAILED,
): TransformationResult {
  return {
    success,
    originalContent,
    transformedContent,
    changes,
    status,
    timestamp: createTimestamp(),
  };
}

/**
 * Creates a successful transformation result
 */
export function createSuccessfulTransformation(
  originalContent: string,
  transformedContent: string,
  changes: ChangeRecord[] = [],
): TransformationResult {
  return createTransformationResult(
    true,
    originalContent,
    transformedContent,
    changes,
    TransformationStatus.COMPLETED,
  );
}

/**
 * Creates a failed transformation result
 */
export function createFailedTransformation(
  originalContent: string,
  reason?: string,
): TransformationResult {
  return createTransformationResult(
    false,
    originalContent,
    originalContent,
    [],
    TransformationStatus.FAILED,
  );
}

// ============================================================================
// EXECUTION CONTEXT FACTORIES
// ============================================================================

/**
 * Creates an execution context with common metadata
 */
export function createExecutionContext(
  options: {
    operation?: string;
    correlationId?: EntityId;
    sessionId?: EntityId;
    metadata?: Record<string, unknown>;
  } = {},
) {
  return {
    operationId: createOperationId(),
    correlationId: options.correlationId ?? createEntityId(),
    sessionId: options.sessionId ?? createUniqueEntityId('session'),
    timestamp: createTimestamp(),
    operation: options.operation ?? 'unknown',
    metadata: options.metadata ?? {},
  };
}

// ============================================================================
// BATCH OPERATION FACTORIES
// ============================================================================

/**
 * Creates multiple entities with a common pattern
 */
export function createBatch<T>(count: number, factory: (index: number) => T): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

/**
 * Creates a sequence of related operations
 */
export function createOperationSequence(
  operations: string[],
  correlationId?: EntityId,
): Array<{
  operationId: OperationId;
  correlationId: EntityId;
  operation: string;
  sequence: number;
}> {
  const corrId = correlationId ?? createEntityId();

  return operations.map((operation, index) => ({
    operationId: createOperationId(),
    correlationId: corrId,
    operation,
    sequence: index + 1,
  }));
}

// ============================================================================
// UTILITY OBJECT EXPORT
// ============================================================================

export const factories = {
  // IDs
  createUniqueEntityId,
  createPatternId,
  createTransformationId,
  createEntityId,
  createCommitSHA,
  createBranchName,

  // Scores
  createConfidenceScore,
  createComplexityScore,

  // Errors
  createValidationError,
  createValidationResult,
  createSuccessfulValidation,
  createFailedValidation,

  // Domain Objects
  createMigrationConfiguration,
  createMigrationSession,
  createCodeLocation,
  createPatternMatch,
  createRiskAssessment,
  createChangeRecord,
  createTransformationResult,
  createSuccessfulTransformation,
  createFailedTransformation,

  // Execution
  createExecutionContext,

  // Batch
  createBatch,
  createOperationSequence,

  // Re-export canonical factories
  createEntityId,
  createFilePath,
  createOperationId,
  createTimestamp,
  createApiResponse,
  createApiError,
} as const;
