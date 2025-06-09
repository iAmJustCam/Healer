/**
 * TRANSFORMATION Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

// Extend the canonical PipelineParamMap via declaration merging
declare module '../types/canonical-types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'transformation': {
      readonly type: 'transformation';
      readonly errorResolution?: {
        readonly autoFix?: boolean;
        readonly patternMatching?: boolean;
        readonly businessPrioritySort?: boolean;
      };
      readonly importRewriting?: {
        readonly canonicalPathsOnly?: boolean;
        readonly validateImports?: boolean;
        readonly generateReport?: boolean;
      };
      readonly dryRun?: boolean;
      readonly validateOutput?: boolean;
      readonly enableRollback?: boolean;
      readonly strategy?: TransformationStrategy;
    };
  }

  // PipelineContext<"transformation"> replaced with PipelineContext<'transformation'>

  /** @internal L2 Pipeline Extension */
  interface TransformationResult {
    readonly sessionId: EntityId;
    readonly operationId: OperationId;
    readonly status: TransformationStatus;
    readonly strategy: TransformationStrategy;
    readonly errorResolution: ErrorResolutionResult;
    readonly typeScriptFixing: TransformationResult; // Using canonical TransformationResult
    readonly importRewriting: TransformationResult; // Using canonical TransformationResult
    readonly astTransformation: ASTTransformationSummary;
    readonly stringTransformation: StringTransformationSummary;
    readonly overallMetrics: TransformationWorkflowMetrics;
    readonly riskAssessment: RiskLevel;
    readonly executionPlan: TransformationExecutionPlan;
    readonly errors: ApiError[];
    readonly warnings: ApiError[];
    readonly timestamp: Timestamp;
  }

  /** @internal L2 Pipeline Extension */
  interface TransformationWorkflowMetrics {
    readonly totalFilesProcessed: number;
    readonly totalFilesModified: number;
    readonly totalTransformations: number;
    readonly totalErrorsFixed: number;
    readonly totalImportsRewritten: number;
    readonly totalExecutionTimeMs: number;
    readonly successRate: number; // 0-1
    readonly riskMitigationScore: number; // 0-10
  }

  /** @internal L2 Pipeline Extension */
  interface ASTTransformationSummary {
    readonly filesProcessed: number;
    readonly totalChanges: number;
    readonly breakdown: Record<string, number>;
    readonly executionTimeMs: number;
  }

  /** @internal L2 Pipeline Extension */
  interface StringTransformationSummary {
    readonly filesProcessed: number;
    readonly totalChanges: number;
    readonly breakdown: Record<string, number>;
    readonly executionTimeMs: number;
  }

  /** @internal L2 Pipeline Extension */
  interface TransformationExecutionPlan {
    readonly id: string;
    readonly phases: TransformationPhase[];
    readonly estimatedDurationMs: number;
    readonly riskLevel: RiskLevel;
  }

  /** @internal L2 Pipeline Extension */
  interface TransformationPhase {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly estimatedDurationMs: number;
    readonly riskLevel: RiskLevel;
    readonly prerequisites: readonly string[];
  }

  /** @internal L2 Pipeline Extension */
  interface ErrorResolutionResult {
    readonly operationId: OperationId;
    readonly status: TransformationStatus;
    readonly errorsFound: number;
    readonly errorsFixed: number;
    readonly errorsRemaining: number;
    readonly fixedErrors: readonly MigrationError[];
    readonly remainingErrors: readonly MigrationError[];
    readonly appliedFixes: readonly ErrorFix[];
    readonly executionTimeMs: number;
    readonly timestamp: Timestamp;
  }

  // TransformationResult replaced with TransformationResult

  // TransformationResult replaced with TransformationResult

  /** @internal L2 Pipeline Extension */
  interface ImportRewritingOptions {
    readonly canonicalPathsOnly: boolean;
    readonly validateImports: boolean;
    readonly generateReport: boolean;
    readonly validationLevel: ValidationLevel;
    readonly operationId: OperationId;
    readonly sessionId: EntityId;
    readonly dryRun: boolean;
  }

  /** @internal L2 Pipeline Extension */
  interface ImportMapping {
    readonly typeName: string;
    readonly oldPath: string;
    readonly newPath: string;
    readonly confidence: number;
  }

  /** @internal L2 Pipeline Extension */
  interface ImportValidationError {
    readonly file: FilePath;
    readonly line: number;
    readonly oldImport: string;
    readonly newImport: string;
    readonly error: string;
    readonly severity: string;
  }

  /** @internal L2 Pipeline Extension */
  interface MigrationError {
    readonly file: FilePath;
    readonly line: number;
    readonly column: number;
    readonly code: string;
    readonly message: string;
    readonly severity: Severity;
    readonly category: ErrorCategory;
    readonly fixable: boolean;
  }

  /** @internal L2 Pipeline Extension */
  interface ErrorFix {
    readonly id: string;
    readonly description: string;
    readonly pattern: string;
    readonly replacement: string;
    readonly category: ErrorCategory;
    readonly riskLevel: string;
    readonly autoApplicable: boolean;
  }

  /** @internal L2 Pipeline Extension */
  interface ErrorResolutionContext {
    readonly projectRoot: FilePath;
    readonly options: ErrorResolutionOptions;
    readonly timestamp: Timestamp;
  }

  /** @internal L2 Pipeline Extension */
  interface ErrorPattern {
    readonly pattern: string;
    readonly frequency: number;
    readonly category: ErrorCategory;
    readonly suggestedFix: string;
    readonly confidence: number;
  }

  /** @internal L2 Pipeline Extension */
  enum ErrorCategory {
    IMPORT_PATH = 'IMPORT_PATH',
    MODULE_RESOLUTION = 'MODULE_RESOLUTION',
    MISSING_EXPORT = 'MISSING_EXPORT',
    TYPE_DEFINITION = 'TYPE_DEFINITION',
    DUPLICATE_IDENTIFIER = 'DUPLICATE_IDENTIFIER'
  }
}
