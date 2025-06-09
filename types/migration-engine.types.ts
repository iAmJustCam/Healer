import type {
  ApiError,
  FilePath,
  Timestamp,
  ValidationLevel,
  OperationId,
  EntityId,
  TransformationStatus,
} from './canonical-types.js';

export interface PipelineParams {
  validationLevel: ValidationLevel;
  operationId: OperationId;
  sessionId: EntityId;
  dryRun: boolean;
  projectRoot: FilePath;
  timestamp: Timestamp;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  dependencies: string[];
  executor: string;
}

export interface MigrationWorkflowContext {
  sessionId: EntityId;
  operationId: OperationId;
  projectRoot: FilePath;
  pipelineParams: PipelineParams;
  timestamp: Timestamp;
}

export interface ConsolidationOptions {
  validateStructure: boolean;
  rollbackOnError: boolean;
  businessImpactAnalysis: boolean;
  validationLevel: ValidationLevel;
  operationId: OperationId;
  sessionId: EntityId;
  dryRun: boolean;
}

export interface ConsolidationContext {
  options: ConsolidationOptions;
  timestamp: Timestamp;
}

export interface ConsolidationResult {
  operationId: OperationId;
  status: TransformationStatus;
  filesProcessed: number;
  errors: ApiError[];
  duration: number;
  timestamp: Timestamp;
}

export interface ReorganizationOptions {
  validateStructure: boolean;
  rollbackOnError: boolean;
  businessImpactAnalysis: boolean;
  validationLevel: ValidationLevel;
  operationId: OperationId;
  sessionId: EntityId;
  dryRun: boolean;
}

export interface ReorganizationResult {
  operationId: OperationId;
  status: TransformationStatus;
  filesReorganized: number;
  errors: ApiError[];
  duration: number;
  timestamp: Timestamp;
}
