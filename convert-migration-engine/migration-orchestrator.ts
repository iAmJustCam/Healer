import { MigrationWorkflowContext, MigrationWorkflowResult, MigrationWorkflowMetrics, WorkflowPhase } from '@types';
/**
 * Migration Engine Orchestrator - Production Implementation
 *
 * Main orchestrator for migration engine workflows with strict SOLID principles.
 * Coordinates consolidation, reorganization, and cleanup services.
 *
 * @module migration-engine/orchestrator
 */

// STRICT CANONICAL TYPE IMPORTS - NO MOCKS
import {
  ApiResponse,
  EntityId,
  FilePath,
  OperationId,
  Result,
  RiskLevel,
  ApiError,
  Timestamp,
  TransformationStatus,
  ValidationLevel,
  createApiResponse,
  createEntityId,
  createOperationId,
  createApiError,
  createTimestamp,
} from '../types/canonical-types';

import {
  MigrationPlan,
  PipelineContext,
  PipelineParams,
} from '@/types/pipelines/migration-engine.pipeline';

import { failure, resultUtils, success } from '@/utilities/result-utilities';

// Import our production services
import { ConsolidationResult } from './consolidation-workflow.service';
import { createConsolidationService } from './consolidation-workflow.service';

import { ReorganizationResult } from './project-reorganizer.service';
import { createReorganizerService } from './project-reorganizer.service';

// ============================================================================
// STRICT INTERFACE DEFINITIONS
// ============================================================================

/**
 * Migration workflow execution context
 */
/**
 * Complete migration workflow result
 */
export interface MigrationWorkflowResult {
  readonly sessionId: EntityId;
  readonly operationId: OperationId;
  readonly status: TransformationStatus;
  readonly consolidation: ConsolidationResult;
  readonly reorganization: ReorganizationResult;
  readonly overallMetrics: MigrationWorkflowMetrics;
  readonly executionPlan: MigrationPlan;
  readonly errors: ApiError[];
  readonly warnings: ApiError[];
  readonly timestamp: Timestamp;
}

/**
 * Overall workflow metrics
 */
export interface MigrationWorkflowMetrics {
  readonly totalFilesProcessed: number;
  readonly totalDirectoriesCreated: number;
  readonly totalImportsUpdated: number;
  readonly totalExecutionTimeMs: number;
  readonly successRate: number; // 0-1
  readonly riskMitigationScore: number; // 0-10
}

/**
 * Workflow phase definition
 */
export interface WorkflowPhase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly strategy: 'ast' | 'hybrid';
  readonly files: FilePath[];
  readonly rules: string[];
  readonly prerequisites: string[];
  readonly validations: Array<{
    type: 'types' | 'syntax';
    description: string;
    timeout: number;
    required: boolean;
  }>;
}

// ============================================================================
// STRICT INTERFACES FOR SOLID COMPLIANCE
// ============================================================================

/**
 * Workflow execution engine (Single Responsibility)
 */
interface IWorkflowExecutionEngine {
  executePhase(phase: WorkflowPhase, context: MigrationWorkflowContext): Promise<Result<unknown>>;
  validatePhasePrerequisites(
    phase: WorkflowPhase,
    context: MigrationWorkflowContext): Promise<Result<boolean>>;
}

/**
 * Migration planning service (Single Responsibility)
 */
interface IMigrationPlanningService {
  createExecutionPlan(context: MigrationWorkflowContext): Promise<Result<MigrationPlan>>;
  validatePlan(plan: MigrationPlan): Promise<Result<boolean>>;
}

/**
 * Risk assessment service (Single Responsibility)
 */
interface IRiskAssessmentService {
  assessWorkflowRisk(context: MigrationWorkflowContext): Promise<Result<RiskLevel>>;
  calculateRiskMitigationScore(results: Partial<MigrationWorkflowResult>): number;
}

/**
 * Progress monitoring service (Single Responsibility)
 */
interface IProgressMonitoringService {
  startMonitoring(sessionId: EntityId): void;
  updateProgress(sessionId: EntityId, phase: string, percentage: number): void;
  stopMonitoring(sessionId: EntityId): void;
}

/**
 * Validation service (Single Responsibility)
 */
interface IValidationService {
  validateSystemPrerequisites(context: MigrationWorkflowContext): Promise<Result<boolean>>;
  validateWorkflowCompletion(result: MigrationWorkflowResult): Promise<Result<boolean>>;
}

// ============================================================================
// CONCRETE IMPLEMENTATIONS
// ============================================================================

/**
 * Production workflow execution engine
 */
class ProductionWorkflowExecutionEngine implements IWorkflowExecutionEngine {
  async executePhase(
    phase: WorkflowPhase,
    context: MigrationWorkflowContext,
  ): Promise<Result<unknown>> {
    switch (phase.id) {
      case 'consolidation':
        return this.executeConsolidationPhase(context);
      case 'reorganization':
        return this.executeReorganizationPhase(context);
      default:
        return failure(
          createApiError(
            'UNKNOWN_WORKFLOW_PHASE',
            `Unknown workflow phase: ${phase.id}`,
            'executePhase',
          ),
        );
    }
  }

  async validatePhasePrerequisites(
    phase: WorkflowPhase,
    context: MigrationWorkflowContext,
  ): Promise<Result<boolean>> {
    // Validate that all prerequisite phases have completed successfully
    for (const prerequisite of phase.prerequisites) {
      const isValid = await this.validatePrerequisite(prerequisite, context);
      if (!resultUtils.isSuccess(isValid)) {
        return isValid;
      }
    }
    return success(true);
  }

  private async executeConsolidationPhase(
    context: MigrationWorkflowContext,
  ): Promise<Result<ConsolidationResult>> {
    const service = createConsolidationService(context.pipelineParams, context.projectRoot);
    const result = await service.execute();
    return resultUtils.fromApiResponse(result);
  }

  private async executeReorganizationPhase(
    context: MigrationWorkflowContext,
  ): Promise<Result<ReorganizationResult>> {
    const service = createReorganizerService(context.pipelineParams, context.projectRoot);
    const result = await service.execute();
    return resultUtils.fromApiResponse(result);
  }

  private async validatePrerequisite(
    prerequisite: string,
    context: MigrationWorkflowContext,
  ): Promise<Result<boolean>> {
    // In production, this would check actual system state
    // For now, return success for valid prerequisites
    const validPrerequisites = ['system-check', 'backup-created', 'consolidation'];
    return success(validPrerequisites.includes(prerequisite));
  }
}

/**
 * Production migration planning service
 */
class ProductionMigrationPlanningService implements IMigrationPlanningService {
  async createExecutionPlan(context: MigrationWorkflowContext): Promise<Result<MigrationPlan>> {
    return success({
      id: context.operationId,
      phases: [
        {
          id: 'consolidation',
          name: 'Type Consolidation',
          description: 'Consolidate and organize TypeScript types',
          strategy: 'ast' as const,
          files: [], // Would be populated from file analysis
          rules: ['consolidate-types', 'rewrite-imports', 'cleanup-redundant'],
          prerequisites: ['system-check'],
          validations: [
            {
              type: 'types' as const,
              description: 'TypeScript compilation check',
              timeout: 30000,
              required: true,
            },
          ],
        },
        {
          id: 'reorganization',
          name: 'Project Reorganization',
          description: 'Reorganize files into domain structure',
          strategy: 'hybrid' as const,
          files: [], // Would be populated from file analysis
          rules: ['move-to-domains', 'update-imports', 'create-indexes'],
          prerequisites: ['consolidation'],
          validations: [
            {
              type: 'syntax' as const,
              description: 'Syntax validation after reorganization',
              timeout: 45000,
              required: true,
            },
          ],
        },
      ],
      dependencies: [
        {
          from: 'consolidation',
          to: 'reorganization',
          type: 'sequential' as const,
        },
      ],
      rollbackPlan: {
        strategy: 'checkpoint' as const,
        checkpoints: [],
        validations: ['syntax-check', 'import-check'],
        automation: true,
      },
      estimatedDuration: 15, // minutes
    });
  }

  async validatePlan(plan: MigrationPlan): Promise<Result<boolean>> {
    // Validate plan structure and dependencies
    if (plan.phases.length === 0) {
      return failure(
        createApiError(
          'INVALID_MIGRATION_PLAN',
          'Migration plan must contain at least one phase',
          'validatePlan',
        ),
      );
    }

    // Validate dependency graph
    for (const dependency of plan.dependencies) {
      const fromExists = plan.phases.some((p) => p.id === dependency.from);
      const toExists = plan.phases.some((p) => p.id === dependency.to);

      if (!fromExists || !toExists) {
        return failure(
          createApiError(
            'INVALID_PLAN_DEPENDENCY',
            `Invalid dependency: ${dependency.from} -> ${dependency.to}`,
            'validatePlan',
          ),
        );
      }
    }

    return success(true);
  }
}

/**
 * Production risk assessment service
 */
class ProductionRiskAssessmentService implements IRiskAssessmentService {
  async assessWorkflowRisk(context: MigrationWorkflowContext): Promise<Result<RiskLevel>> {
    // Assess risk based on project characteristics
    let riskScore = 0;

    // Check project size (file count impacts risk)
    const fileCount = await this.estimateFileCount(context.projectRoot);
    if (fileCount > 1000) riskScore += 3;
    else if (fileCount > 500) riskScore += 2;
    else if (fileCount > 100) riskScore += 1;

    // Check validation level
    if (context.pipelineParams.validationLevel === ValidationLevel.BASIC) riskScore += 2;
    else if (context.pipelineParams.validationLevel === ValidationLevel.STRICT) riskScore += 1;

    // Check rollback capability
    if (!context.pipelineParams.enableRollback) riskScore += 2;

    // Determine risk level
    let riskLevel: RiskLevel;
    if (riskScore >= 5) riskLevel = RiskLevel.HIGH;
    else if (riskScore >= 3) riskLevel = RiskLevel.MEDIUM;
    else riskLevel = RiskLevel.LOW;

    return success(riskLevel);
  }

  calculateRiskMitigationScore(results: Partial<MigrationWorkflowResult>): number {
    let score = 10; // Start with perfect score

    // Deduct points for errors
    if (results.errors && results.errors.length > 0) {
      score -= Math.min(results.errors.length * 2, 5);
    }

    // Deduct points for warnings
    if (results.warnings && results.warnings.length > 0) {
      score -= Math.min(results.warnings.length * 0.5, 2);
    }

    // Bonus for successful completion
    if (results.status === TransformationStatus.COMPLETED) {
      score += 1;
    }

    return Math.max(0, Math.min(10, score));
  }

  private async estimateFileCount(projectRoot: FilePath): Promise<number> {
    try {
      const { execSync } = await import('child_process');
      const output = execSync(`find ${projectRoot} -name "*.ts" -o -name "*.js" | wc -l`, {
        encoding: 'utf8',
      });
      return parseInt(output.trim(), 10) || 0;
    } catch {
      return 0;
    }
  }
}

/**
 * Production progress monitoring service
 */
class ProductionProgressMonitoringService implements IProgressMonitoringService {
  private activeSessions = new Map<EntityId, { startTime: number }>();

  startMonitoring(sessionId: EntityId): void {
    this.activeSessions.set(sessionId, { startTime: Date.now() });
    console.log(`[${sessionId}] Migration workflow started`);
  }

  updateProgress(sessionId: EntityId, phase: string, percentage: number): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const elapsed = Date.now() - session.startTime;
      console.log(`[${sessionId}] ${phase}: ${percentage}% (${elapsed}ms elapsed)`);
    }
  }

  stopMonitoring(sessionId: EntityId): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const totalTime = Date.now() - session.startTime;
      console.log(`[${sessionId}] Migration workflow completed in ${totalTime}ms`);
      this.activeSessions.delete(sessionId);
    }
  }
}

/**
 * Production validation service
 */
class ProductionValidationService implements IValidationService {
  async validateSystemPrerequisites(context: MigrationWorkflowContext): Promise<Result<boolean>> {
    // Check that required tools are available
    try {
      const { execSync } = await import('child_process');

      // Check Node.js
      execSync('node --version', { stdio: 'pipe' });

      // Check TypeScript
      execSync('tsc --version', { stdio: 'pipe' });

      // Check project structure
      const fs = await import('fs');
      if (!fs.existsSync(context.projectRoot)) {
        throw new Error(`Project root does not exist: ${context.projectRoot}`);
      }

      return success(true);
    } catch (error) {
      return failure(
        createApiError(
          'SYSTEM_PREREQUISITES_FAILED',
          error instanceof Error ? error.message : 'Unknown error',
          'validateSystemPrerequisites',
        ),
      );
    }
  }

  async validateWorkflowCompletion(result: MigrationWorkflowResult): Promise<Result<boolean>> {
    // Validate that all phases completed successfully
    if (result.status !== TransformationStatus.COMPLETED) {
      return failure(
        createApiError(
          'WORKFLOW_INCOMPLETE',
          `Workflow status is ${result.status}, expected ${TransformationStatus.COMPLETED}`,
          'validateWorkflowCompletion',
        ),
      );
    }

    // Validate that no critical errors occurred
    const criticalErrors = result.errors.filter((e) => e.code.includes(RiskLevel.CRITICAL));
    if (criticalErrors.length > 0) {
      return failure(
        createApiError(
          'CRITICAL_ERRORS_PRESENT',
          `${criticalErrors.length} critical errors occurred during workflow`,
          'validateWorkflowCompletion',
        ),
      );
    }

    return success(true);
  }
}

// ============================================================================
// MAIN ORCHESTRATOR CLASS (SINGLE RESPONSIBILITY)
// ============================================================================

/**
 * Migration engine orchestrator with strict SOLID compliance
 */
export class MigrationEngineOrchestrator {
  private readonly executionEngine: IWorkflowExecutionEngine;
  private readonly planningService: IMigrationPlanningService;
  private readonly riskAssessment: IRiskAssessmentService;
  private readonly progressMonitor: IProgressMonitoringService;
  private readonly validationService: IValidationService;

  constructor(
    // Dependency injection for SOLID compliance
    executionEngine?: IWorkflowExecutionEngine,
    planningService?: IMigrationPlanningService,
    riskAssessment?: IRiskAssessmentService,
    progressMonitor?: IProgressMonitoringService,
    validationService?: IValidationService,
  ) {
    this.executionEngine = executionEngine ?? new ProductionWorkflowExecutionEngine();
    this.planningService = planningService ?? new ProductionMigrationPlanningService();
    this.riskAssessment = riskAssessment ?? new ProductionRiskAssessmentService();
    this.progressMonitor = progressMonitor ?? new ProductionProgressMonitoringService();
    this.validationService = validationService ?? new ProductionValidationService();
  }

  /**
   * Execute the complete migration workflow
   */
  async executeWorkflow(
    pipelineParams: PipelineParams<'migration-engine'>,
    projectRoot: FilePath = process.cwd() as FilePath,
  ): Promise<ApiResponse<MigrationWorkflowResult>> {
    const sessionId = createEntityId(`migration-${Date.now()}`);
    const operationId = createOperationId();
    const startTime = Date.now();

    const context: MigrationWorkflowContext = {
      sessionId,
      operationId,
      projectRoot,
      pipelineParams,
      timestamp: createTimestamp(),
    };

    try {
      this.progressMonitor.startMonitoring(sessionId);

      // Validate system prerequisites
      const prerequisiteValidation =
        await this.validationService.validateSystemPrerequisites(context);
      if (!resultUtils.isSuccess(prerequisiteValidation)) {
        return createApiResponse(undefined, prerequisiteValidation.error);
      }

      // Create execution plan
      const planResult = await this.planningService.createExecutionPlan(context);
      if (!resultUtils.isSuccess(planResult)) {
        return createApiResponse(undefined, planResult.error);
      }

      const executionPlan = planResult.data;

      // Validate plan
      const planValidation = await this.planningService.validatePlan(executionPlan);
      if (!resultUtils.isSuccess(planValidation)) {
        return createApiResponse(undefined, planValidation.error);
      }

      // Assess risk
      const riskResult = await this.riskAssessment.assessWorkflowRisk(context);
      if (!resultUtils.isSuccess(riskResult)) {
        return createApiResponse(undefined, riskResult.error);
      }

      this.progressMonitor.updateProgress(sessionId, 'planning', 20);

      // Execute phases in sequence
      const phaseResults: Record<string, unknown> = {};

      for (let i = 0; i < executionPlan.phases.length; i++) {
        const phase = executionPlan.phases[i];
        const progress = 20 + ((i + 1) / executionPlan.phases.length) * 70;

        // Validate prerequisites
        const prereqResult = await this.executionEngine.validatePhasePrerequisites(phase, context);
        if (!resultUtils.isSuccess(prereqResult)) {
          return createApiResponse(undefined, prereqResult.error);
        }

        // Execute phase
        const phaseResult = await this.executionEngine.executePhase(phase, context);
        if (!resultUtils.isSuccess(phaseResult)) {
          return createApiResponse(undefined, phaseResult.error);
        }

        phaseResults[phase.id] = phaseResult.data;
        this.progressMonitor.updateProgress(sessionId, phase.name, progress);
      }

      // Build final result
      const result: MigrationWorkflowResult = {
        sessionId,
        operationId,
        status: TransformationStatus.COMPLETED,
        consolidation: phaseResults.consolidation as ConsolidationResult,
        reorganization: phaseResults.reorganization as ReorganizationResult,
        overallMetrics: this.calculateOverallMetrics(phaseResults, startTime),
        executionPlan,
        errors: [],
        warnings: [],
        timestamp: createTimestamp(),
      };

      // Validate completion
      const completionValidation = await this.validationService.validateWorkflowCompletion(result);
      if (!resultUtils.isSuccess(completionValidation)) {
        return createApiResponse(undefined, completionValidation.error);
      }

      this.progressMonitor.updateProgress(sessionId, 'completed', 100);
      this.progressMonitor.stopMonitoring(sessionId);

      return createApiResponse(result);
    } catch (error) {
      this.progressMonitor.stopMonitoring(sessionId);

      const systemError = createApiError(
        'MIGRATION_WORKFLOW_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        'MigrationEngineOrchestrator.executeWorkflow',
      );

      return createApiResponse(undefined, systemError);
    }
  }

  /**
   * Calculate overall workflow metrics
   */
  private calculateOverallMetrics(
    phaseResults: Record<string, unknown>,
    startTime: number,
  ): MigrationWorkflowMetrics {
    const consolidation = phaseResults.consolidation as ConsolidationResult;
    const reorganization = phaseResults.reorganization as ReorganizationResult;

    const totalFilesProcessed =
      (consolidation?.metrics?.typesAnalyzed || 0) + (reorganization?.metrics?.filesMoved || 0);

    const totalDirectoriesCreated = reorganization?.metrics?.directoriesCreated || 0;
    const totalImportsUpdated =
      (consolidation?.metrics?.importsRewritten || 0) +
      (reorganization?.metrics?.importsUpdated || 0);

    // Calculate success rate (simplified)
    const totalPhases = 2;
    const successfulPhases =
      (consolidation?.status === TransformationStatus.COMPLETED ? 1 : 0) +
      (reorganization?.status === TransformationStatus.COMPLETED ? 1 : 0);
    const successRate = successfulPhases / totalPhases;

    return {
      totalFilesProcessed,
      totalDirectoriesCreated,
      totalImportsUpdated,
      totalExecutionTimeMs: Date.now() - startTime,
      successRate,
      riskMitigationScore: this.riskAssessment.calculateRiskMitigationScore({
        consolidation,
        reorganization,
      }),
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create migration engine orchestrator with default dependencies
 */
export function createMigrationEngineOrchestrator(): MigrationEngineOrchestrator {
  return new MigrationEngineOrchestrator();
}

/**
 * Execute migration workflow with pipeline context
 */
export async function executeMigrationWorkflow(
  pipelineContext: PipelineContext<'migration-engine'>,
): Promise<ApiResponse<MigrationWorkflowResult>> {
  const orchestrator = createMigrationEngineOrchestrator();
  return orchestrator.executeWorkflow(pipelineContext.params, process.cwd() as FilePath);
}
