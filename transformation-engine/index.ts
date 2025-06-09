/**
 * Transformation Engine Domain - Production Implementation
 *
 * Main entry point for the transformation engine domain.
 * Exports transformation services for code transformation operations.
 *
 * @module transformation-engine
 */

// STRICT CANONICAL TYPE IMPORTS
import { 
  ApiResponse, 
  TransformationStatus,
  PipelineContext,
  TransformationResult,
  TransformationWorkflowMetrics,
  ASTTransformationSummary,
  StringTransformationSummary,
  TransformationExecutionPlan,
  TransformationPhase,
  ErrorResolutionOptions,
  ErrorResolutionResult,
  ErrorResolutionContext,
  MigrationError,
  ErrorFix,
  ErrorPattern,
  TypeScriptFixingOptions,
  TransformationResult,
  FileTemplate,
  ImportPathFix,
  ImportRewritingOptions,
  ImportRewritingContext,
  TypeAnalysisData,
  TypeGroup,
  ImportMapping,
  ImportValidationError
} from '../types/canonical-types';

// Re-export canonical types for convenience
export {
  PipelineContext, // Instead of PipelineContext<"transformation">
  TransformationResult,
  TransformationWorkflowMetrics,
  ASTTransformationSummary,
  StringTransformationSummary,
  TransformationExecutionPlan,
  TransformationPhase,
  ErrorResolutionOptions,
  ErrorResolutionResult,
  ErrorResolutionContext,
  MigrationError,
  ErrorFix,
  ErrorPattern,
  TypeScriptFixingOptions,
  TransformationResult, // Instead of TransformationResult
  FileTemplate,
  ImportPathFix,
  ImportRewritingOptions,
  TransformationResult as TransformationResult, // Using TransformationResult
  ImportRewritingContext,
  TypeAnalysisData,
  TypeGroup,
  ImportMapping,
  ImportValidationError
};

// Export transformation orchestrator
export {
  TransformationEngineOrchestrator,
  createTransformationEngineOrchestrator,
  executeTransformationWorkflow,
} from './transformation-orchestrator';

// Export transformation services
export { createErrorResolverService, MigrationErrorResolverService } from './error-resolver';
export { createTypeScriptFixerService, TypeScriptErrorFixerService } from './TS-error-fixer';
export { createImportRewriterService, ImportRewriterService } from './import-rewriter';