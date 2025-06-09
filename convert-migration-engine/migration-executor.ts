#!/usr/bin/env npx ts-node

/**
 * Production Migration Engine Executor
 *
 * Single entry point for executing migration engine workflows.
 * Replaces all mock/simulation scripts with production implementation.
 *
 * Usage:
 *   npm run migrate              # Execute full workflow in dry-run mode
 *   npm run migrate -- --prod    # Execute in production mode
 *   npm run migrate -- --help    # Show help
 *
 * @module migration-engine/executor
 */

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

// STRICT CANONICAL TYPE IMPORTS - NO MOCKS
import { FilePath, ValidationLevel } from '';

import { PipelineParams } from '';

// Import production orchestrator
import { createMigrationEngineOrchestrator } from './migration-orchestrator';

/// ============================================================================
// CLI CONFIGURATION
/// ============================================================================

interface CLIOptions {
  prod: boolean;
  projectRoot: string;
  validationLevel: ValidationLevel;
  enableRollback: boolean;
  enableTelemetry: boolean;
  maxConcurrency: number;
  checkpointInterval: number;
  consolidationOnly: boolean;
  reorganizationOnly: boolean;
  skipValidation: boolean;
  verbose: boolean;
}

/// ============================================================================
// MAIN EXECUTION LOGIC
/// ============================================================================

async function main(): Promise<void> {
  // Configure CLI
  program
    .name('migration-engine')
    .description('Production migration engine for TypeScript project transformation')
    .version('2.0.0')
    .option('--prod', 'Run in production mode (default: dry-run)', false)
    .option('--project-root <path>', 'Project root directory', process.cwd())
    .option('--validation-level <level>', 'Validation level (basic|strict|comprehensive)', 'strict')
    .option('--no-rollback', 'Disable rollback capability', false)
    .option('--no-telemetry', 'Disable telemetry collection', false)
    .option('--max-concurrency <number>', 'Maximum concurrent operations', '4')
    .option('--checkpoint-interval <minutes>', 'Checkpoint interval in minutes', '5')
    .option('--consolidation-only', 'Run only consolidation workflow', false)
    .option('--reorganization-only', 'Run only reorganization workflow', false)
    .option('--skip-validation', 'Skip pre/post validation checks', false)
    .option('--verbose', 'Enable verbose logging', false)
    .parse();

  const options = program.opts<CLIOptions>();

  try {
    // Validate CLI options
    const validationResult = validateCLIOptions(options);
    if (!validationResult.valid) {
      console.error(`❌ Invalid options: ${validationResult.error}`);
      process.exit(1);
    }

    // Show execution summary
    showExecutionSummary(options);

    // Create pipeline parameters
    const pipelineParams = createPipelineParams(options);

    // Execute migration workflow
    const orchestrator = createMigrationEngineOrchestrator();
    const projectRoot = path.resolve(options.projectRoot) as FilePath;

    console.log(`🚀 Starting migration workflow...`);
    console.log(`📁 Project root: ${projectRoot}`);
    console.log(`⚙️  Mode: ${options.prod ? 'PRODUCTION' : 'DRY-RUN'}`);
    console.log('');

    const startTime = Date.now();
    const result = await orchestrator.executeWorkflow(pipelineParams, projectRoot);

    if (result.success && result.data) {
      const duration = Date.now() - startTime;
      showSuccessResults(result.data, duration, options);
    } else {
      showErrorResults(result.error, options);
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

/// ============================================================================
// VALIDATION FUNCTIONS
/// ============================================================================

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateCLIOptions(options: CLIOptions): ValidationResult {
  // Validate project root exists
  if (!fs.existsSync(options.projectRoot)) {
    return {
      valid: false,
      error: `Project root does not exist: ${options.projectRoot}`,
    };
  }

  // Validate validation level
  const validValidationLevels = ['basic', 'strict', 'comprehensive'];
  if (!validValidationLevels.includes(options.validationLevel)) {
    return {
      valid: false,
      error: `Invalid validation level: ${options.validationLevel}`,
    };
  }

  // Validate numeric options
  const maxConcurrency = parseInt(options.maxConcurrency.toString(), 10);
  if (isNaN(maxConcurrency) || maxConcurrency < 1 || maxConcurrency > 16) {
    return { valid: false, error: 'Max concurrency must be between 1 and 16' };
  }

  const checkpointInterval = parseInt(options.checkpointInterval.toString(), 10);
  if (isNaN(checkpointInterval) || checkpointInterval < 1 || checkpointInterval > 60) {
    return {
      valid: false,
      error: 'Checkpoint interval must be between 1 and 60 minutes',
    };
  }

  // Validate mutually exclusive options
  if (options.consolidationOnly && options.reorganizationOnly) {
    return {
      valid: false,
      error: 'Cannot specify both --consolidation-only and --reorganization-only',
    };
  }

  return { valid: true };
}

/// ============================================================================
// PIPELINE PARAMETER CREATION
/// ============================================================================

function createPipelineParams(options: CLIOptions): PipelineParams<'migration-engine'> {
  const validationLevel = options.validationLevel as ValidationLevel;

  return {
    strategySelector: 'hybrid' as const,
    riskTolerance: 'medium' as const,
    validationLevel,
    enableTelemetry: options.enableTelemetry,
    checkpointInterval: parseInt(options.checkpointInterval.toString(), 10),
    maxConcurrency: parseInt(options.maxConcurrency.toString(), 10),
    enableRollback: options.enableRollback,
    backupStrategy: 'filesystem' as const,
    atomicOperations: true,
    resourceLimits: {
      maxMemoryMB: 2048,
      maxCpuPercent: 80,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      timeoutMinutes: 30,
    },
    consolidation: {
      dryRun: !options.prod,
      backupEnabled: true,
      progressTracking: true,
    },
    reorganization: {
      validateStructure: !options.skipValidation,
      rollbackOnError: options.enableRollback,
      businessImpactAnalysis: true,
    },
  };
}

/// ============================================================================
// OUTPUT FORMATTING
/// ============================================================================

function showExecutionSummary(options: CLIOptions): void {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        Migration Engine v2.0.0          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  console.log('📋 Execution Configuration:');
  console.log(`   • Mode: ${options.prod ? '🔴 PRODUCTION' : '🟡 DRY-RUN'}`);
  console.log(`   • Validation: ${options.validationLevel.toUpperCase()}`);
  console.log(`   • Rollback: ${options.enableRollback ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   • Telemetry: ${options.enableTelemetry ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   • Concurrency: ${options.maxConcurrency}`);

  if (options.consolidationOnly) {
    console.log('   • Workflow: 🔄 Consolidation Only');
  } else if (options.reorganizationOnly) {
    console.log('   • Workflow: 📁 Reorganization Only');
  } else {
    console.log('   • Workflow: 🔄 Full Migration (Consolidation + Reorganization)');
  }

  console.log('');

  if (!options.prod) {
    console.log('⚠️  DRY-RUN MODE: No actual changes will be made');
    console.log('   Use --prod flag to execute actual migration');
    console.log('');
  }
}

function showSuccessResults(result: any, duration: number, options: CLIOptions): void {
  const durationSec = (duration / 1000).toFixed(2);

  console.log('');
  console.log('✅ Migration workflow completed successfully!');
  console.log('');
  console.log('📊 Results Summary:');
  console.log(`   • Duration: ${durationSec}s`);
  console.log(`   • Status: ${result.status}`);
  console.log(`   • Files Processed: ${result.overallMetrics.totalFilesProcessed}`);
  console.log(`   • Directories Created: ${result.overallMetrics.totalDirectoriesCreated}`);
  console.log(`   • Imports Updated: ${result.overallMetrics.totalImportsUpdated}`);
  console.log(`   • Success Rate: ${(result.overallMetrics.successRate * 100).toFixed(1)}%`);
  console.log(`   • Risk Mitigation Score: ${result.overallMetrics.riskMitigationScore}/10`);
  console.log('');

  if (result.consolidation) {
    console.log('🔄 Consolidation Results:');
    console.log(`   • Types Analyzed: ${result.consolidation.metrics.typesAnalyzed}`);
    console.log(`   • Imports Rewritten: ${result.consolidation.metrics.importsRewritten}`);
    console.log(`   • Files Removed: ${result.consolidation.metrics.filesRemoved}`);
    console.log(
      `   • Duration: ${(result.consolidation.metrics.executionTimeMs / 1000).toFixed(2)}s`,
    );
  }

  if (result.reorganization) {
    console.log('📁 Reorganization Results:');
    console.log(`   • Directories Created: ${result.reorganization.metrics.directoriesCreated}`);
    console.log(`   • Files Moved: ${result.reorganization.metrics.filesMoved}`);
    console.log(`   • Imports Updated: ${result.reorganization.metrics.importsUpdated}`);
    console.log(`   • Indexes Created: ${result.reorganization.metrics.indexesCreated}`);
    console.log(
      `   • Duration: ${(result.reorganization.metrics.executionTimeMs / 1000).toFixed(2)}s`,
    );

    if (result.reorganization.businessImpact) {
      const impact = result.reorganization.businessImpact;
      console.log(`   • Business Risk: ${impact.riskLevel.toUpperCase()}`);
      console.log(`   • Affected Domains: ${impact.affectedDomains.length}`);
      console.log(`   • Estimated Effort: ${impact.estimatedEffortHours}h`);
    }
  }

  if (result.warnings && result.warnings.length > 0) {
    console.log('');
    console.log('⚠️  Warnings:');
    result.warnings.forEach((warning: string) => {
      console.log(`   • ${warning}`);
    });
  }

  if (result.backupPath) {
    console.log('');
    console.log(`💾 Backup created: ${result.backupPath}`);
  }

  console.log('');

  if (options.prod) {
    console.log(
      '🎉 Production migration completed! Your project has been successfully modernized.',
    );
  } else {
    console.log('🎯 Dry-run completed! Review the results and run with --prod to apply changes.');
  }

  console.log('');
}

function showErrorResults(error: any, options: CLIOptions): void {
  console.log('');
  console.log('❌ Migration workflow failed!');
  console.log('');
  console.log('💥 Error Details:');
  console.log(`   • Code: ${error?.code || 'UNKNOWN_ERROR'}`);
  console.log(`   • Message: ${error?.message || 'Unknown error occurred'}`);

  if (error?.context?.operation) {
    console.log(`   • Operation: ${error.context.operation}`);
  }

  if (error?.context?.additionalInfo) {
    console.log('   • Additional Info:');
    Object.entries(error.context.additionalInfo).forEach(([key, value]) => {
      console.log(`     - ${key}: ${value}`);
    });
  }

  console.log('');
  console.log('🔧 Troubleshooting Tips:');
  console.log('   • Check that all prerequisites are installed (Node.js, TypeScript)');
  console.log('   • Verify project structure and permissions');
  console.log('   • Try running with --validation-level basic for debugging');
  console.log('   • Check the backup directory for recovery options');
  console.log('');
}

/// ============================================================================
// ENTRY POINT
/// ============================================================================

// Handle unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Execute main function
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
