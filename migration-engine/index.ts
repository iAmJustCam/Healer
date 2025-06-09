// CONSTITUTIONAL COMPLIANCE: Type import removed

/**
 * Migration Engine - Flat Export Structure
 *
 * SSOT Compliance:
// CONSTITUTIONAL COMPLIANCE: Type import removed
 * - No local type definitions
 * - Pure utility functions exported
 * - Follows Utilities Refactor Directive Constitution
 *
 * Usage:
 * import {
 *   createBackup,
 *   createMigrationSession,
 *   applyStringTransformations
 * } from '@/migration-engine';
 */

// ============================================================================
// BACKUP OPERATIONS
// ============================================================================

export {
  cleanup,
  createBackup,
  deleteSession,
  getSession,
  listSessions,
  restoreFiles,
} from './backup-manager';

// ============================================================================
// MIGRATION ORCHESTRATION
// ============================================================================

export {
  applyMigrations,
  calculateRiskAssessment,
  createMigrationSession,
  generateTelemetry,
  runDryMigration,
  setupBackupDirectory,
  validateResults,
} from './migration-orchestrator';

// ============================================================================
// STRATEGY SELECTION
// ============================================================================

export {
  analyzeFile,
  detectPatterns,
  determineTransformationStrategy,
  getFilesToAnalyze,
} from './strategy-selector';

// ============================================================================
// ROLLBACK OPERATIONS
// ============================================================================

export {
  applyRollback,
  calculateRollbackComplexity,
  generateEmergencyRollback,
  generateRollbackPatterns,
  generateRollbackPlan,
  validateRollbackPlan,
} from './rollback-service';

// ============================================================================
// RESTORE OPERATIONS
// ============================================================================

export {
  createRestoreSession,
  listBackups,
  restoreFiles as restoreFilesFromSession,
  restoreFromBackup,
  validateRestore,
} from './restore-service';

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

export {
  assessRisk,
  calculateComplexity,
  calculateConfidence,
  calculateFileChecksum,
  createBackupFilename,
  createMigrationContext,
  generatePerformanceMetrics,
  getGitInfo,
  sanitizeFilePath,
  validateTransformation,
} from './migration-utilities';

// ============================================================================
// MIGRATION DOMAIN
// ============================================================================

export {
  assessMigrationReadiness,
  calculateMigrationDuration,
  createMigrationSession as createDomainMigrationSession,
  createMigrationConfiguration,
  createMigrationPhase,
  createMigrationSummary,
  getMigrationProgress,
  isCompletedMigration,
  isFailedMigration,
  isInProgressMigration,
  updateMigrationSession,
} from './migration-domain';

// ============================================================================
// STRING TRANSFORMATIONS
// ============================================================================

export {
  addLoggerImport,
  applyStringTransformations,
  processFile as processFileWithStringTransforms,
  transformFiles,
} from './string-transformation';

// ============================================================================
// CANONICAL TYPE RE-EXPORTS (for convenience)
// ============================================================================

// Re-export commonly used canonical types for convenience
export const MIGRATION_ENGINE_ARCHITECTURE = {
  LAYER: 'Utility Functions',
  PRINCIPLES: ['SSOT', 'DRY', 'SRP', 'Pure Functions'],
  DEPENDENCIES: ['../types/foundation.types', '@/utilities/result-utilities'],
  EXPORTS: 'Flat utility functions only',
} as const;

/**
 * Migration Engine Capability Registry
 *
 * Documents all available capabilities for compile-time verification
 * Note: Now defined in canonical-types.ts
 */

/**
 * Default migration engine configuration
 *
 * Provides sensible defaults for all migration operations
 */
export const DEFAULT_MIGRATION_CONFIG = {
  backup: {
    maxRetentionDays: 30,
    compressionEnabled: false,
    checksumValidation: true,
  },
  orchestration: {
    timeout: 300000, // 5 minutes
    parallelism: 4,
    enableTelemetry: true,
  },
  strategy: {
    complexityThreshold: 0.7,
    confidenceThreshold: 0.8,
    enableCaching: true,
  },
  rollback: {
    validateBeforeApply: true,
    createCheckpoints: true,
    maxRiskLevel: 'medium' as const,
  },
  transformation: {
    preserveFormatting: true,
    validateSyntax: false,
    addLoggerImport: true,
    maxFileSize: 1024 * 1024, // 1MB
  },
} as const;

/**
 * Migration engine validation schema
 *
 * For runtime validation of migration engine usage
 */
export const MIGRATION_ENGINE_SCHEMA = {
  requiredCapabilities: [
    'backup',
    'orchestration',
    'strategy',
    'rollback',
    'restore',
    'utilities',
    'domain',
    'transformation',
  ],
  requiredTypes: [
    'ApiResponse',
    'EntityId',
    'FilePath',
    'Framework',
    'RiskLevel',
    'TransformationStrategy',
  ],
  prohibitedPatterns: [
    'interface.*{', // No local interfaces
    'type.*=', // No local type aliases
    'export.*interface', // No interface exports
    'class.*{', // No classes (pure functions only)
  ],
} as const;
