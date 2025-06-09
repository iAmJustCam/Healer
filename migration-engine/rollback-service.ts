/**
 * Rollback Service Utility - Pure Functions
 *
 * SRP: Rollback pattern generation and execution only
 * - No local types (uses canonical types)
 * - Validates all inputs with schemas
 * - Returns via createApiSuccess/err pattern
 * - Environment detection for APIs
 * - Pure utility functions, no classes
 */

// CANONICAL TYPE IMPORTS ONLY
import { ApiResponse, FilePath, Framework, RiskLevel } from '';

import { createFilePath, isFramework, isRiskLevel } from '';

// VALIDATION AND UTILITY IMPORTS
import { apiUtils, contextUtils, safeUtils, validationUtils } from '@/utilities/result-utilities';
import { RiskLevel, FilePath, createApiError, createApiSuccess, Framework } from '../types/canonical-types';


// Minimal interfaces for rollback operations (no duplication with canonical types)
interface RollbackPlan {
  readonly patterns: Record<string, string>;
  readonly affectedFiles: readonly FilePath[];
  readonly checkpoints: readonly string[];
  readonly estimatedTime: string;
  readonly complexity: number;
  readonly riskLevel: RiskLevel;
}

interface ChangeRecord {
  readonly from: string;
  readonly to: string;
  readonly framework: Framework;
  readonly filePath: FilePath;
  readonly lineNumber: number;
}

interface RollbackConfig {
  readonly frameworks: Record<Framework, FrameworkRollbackConfig>;
  readonly safety: SafetyConfig;
  readonly performance: PerformanceConfig;
}

interface FrameworkRollbackConfig {
  readonly rollbackPatterns: Record<string, string>;
  readonly complexityWeight: number;
  readonly riskFactor: number;
}

interface SafetyConfig {
  readonly validateBeforeApply: boolean;
  readonly createCheckpoints: boolean;
  readonly maxRiskLevel: RiskLevel;
}

interface PerformanceConfig {
  readonly timeoutMs: number;
  readonly maxFileSize: number;
  readonly batchSize: number;
}

interface RollbackResult {
  readonly success: boolean;
  readonly filesProcessed: number;
  readonly patternsApplied: number;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly performance: {
    readonly duration: number;
    readonly filesPerSecond: number;
  };
}

interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly riskAssessment: RiskLevel;
}

// ============================================================================
// INPUT VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate rollback configuration
 */
function validateRollbackConfig(input: unknown): ApiResponse<RollbackConfig> {
  if (!input || typeof input !== 'object') {
    return createApiError('Rollback config must be an object', 'VALIDATION_ERROR');
  }

  const config = input as Record<string, unknown>;

  // Provide defaults
  const defaultConfig: RollbackConfig = {
    frameworks: getDefaultFrameworkConfigs(),
    safety: {
      validateBeforeApply: Boolean(config.validateBeforeApply ?? true),
      createCheckpoints: Boolean(config.createCheckpoints ?? true),
      maxRiskLevel: isRiskLevel(config.maxRiskLevel) ? config.maxRiskLevel : 'medium',
    },
    performance: {
      timeoutMs: typeof config.timeoutMs === 'number' ? config.timeoutMs : 30000,
      maxFileSize: typeof config.maxFileSize === 'number' ? config.maxFileSize : 1024 * 1024,
      batchSize: typeof config.batchSize === 'number' ? config.batchSize : 10,
    },
  };

  return createApiSuccess(defaultConfig);
}

/**
 * Validate change records
 */
function validateChangeRecords(input: unknown): ApiResponse<ChangeRecord[]> {
  if (!Array.isArray(input)) {
    return createApiError('Change records must be an array', 'VALIDATION_ERROR');
  }

  const validatedRecords: ChangeRecord[] = [];

  for (const record of input) {
    if (!record || typeof record !== 'object') {
      return createApiError('Each change record must be an object', 'VALIDATION_ERROR');
    }

    const r = record as Record<string, unknown>;

    const fromResult = validationUtils.nonEmpty(r.from as string, 'from pattern');
    if (!apiUtils.isOk(fromResult)) {
      return fromResult as ApiResponse<ChangeRecord[]>;
    }

    const toResult = validationUtils.nonEmpty(r.to as string, 'to pattern');
    if (!apiUtils.isOk(toResult)) {
      return toResult as ApiResponse<ChangeRecord[]>;
    }

    if (!isFramework(r.framework)) {
      return createApiError(`Invalid framework: ${r.framework}`, 'VALIDATION_ERROR');
    }

    const pathResult = validationUtils.nonEmpty(r.filePath as string, 'file path');
    if (!apiUtils.isOk(pathResult)) {
      return pathResult as ApiResponse<ChangeRecord[]>;
    }

    const lineNumber = typeof r.lineNumber === 'number' ? r.lineNumber : 0;

    validatedRecords.push({
      from: fromResult.data,
      to: toResult.data,
      framework: r.framework as Framework,
      filePath: createFilePath(pathResult.data),
      lineNumber,
    });
  }

  return createApiSuccess(validatedRecords);
}

/**
 * Validate file content input
 */
function validateFileContent(input: unknown): ApiResponse<string> {
  if (typeof input !== 'string') {
    return createApiError('File content must be a string', 'VALIDATION_ERROR');
  }

  return createApiSuccess(input);
}

// ============================================================================
// ROLLBACK PLAN GENERATION
// ============================================================================

/**
 * Generate comprehensive rollback plan
 */
export function generateRollbackPlan(
  changesInput: unknown,
  configInput: unknown = {},
): ApiResponse<RollbackPlan> {
  const changesResult = validateChangeRecords(changesInput);
  if (!apiUtils.isOk(changesResult)) {
    return changesResult as ApiResponse<RollbackPlan>;
  }

  const configResult = validateRollbackConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<RollbackPlan>;
  }

  const changes = changesResult.data;
  const config = configResult.data;

  return safeUtils.execute(
    () => {
      const patterns = generateRollbackPatterns(changes, config);
      const affectedFiles = [...new Set(changes.map((c) => c.filePath))];
      const checkpoints = generateCheckpoints(affectedFiles);
      const estimatedTime = estimateRollbackTime(changes.length, affectedFiles.length);
      const complexity = calculateRollbackComplexity(patterns, affectedFiles);
      const riskLevel = calculateRollbackRisk(changes, config);

      return {
        patterns,
        affectedFiles,
        checkpoints,
        estimatedTime,
        complexity,
        riskLevel,
      };
    },
    'ROLLBACK_PLAN_GENERATION_ERROR',
    contextUtils.sessionContext('generateRollbackPlan', 'system'),
  );
}

/**
 * Generate rollback patterns for changes
 */
export function generateRollbackPatterns(
  changesInput: unknown,
  configInput: unknown = {},
): ApiResponse<Record<string, string>> {
  const changesResult = validateChangeRecords(changesInput);
  if (!apiUtils.isOk(changesResult)) {
    return changesResult as ApiResponse<Record<string, string>>;
  }

  const configResult = validateRollbackConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<Record<string, string>>;
  }

  const changes = changesResult.data;
  const config = configResult.data;

  return safeUtils.execute(
    () => {
      const rollbackPatterns: Record<string, string> = {};

      for (const change of changes) {
        const frameworkConfig = config.frameworks[change.framework];

        if (frameworkConfig?.rollbackPatterns) {
          const rollbackPattern = frameworkConfig.rollbackPatterns[change.to];
          if (rollbackPattern) {
            rollbackPatterns[change.to] = rollbackPattern;
          } else {
            // Generate inverse pattern if no explicit rollback exists
            rollbackPatterns[change.to] = change.from;
          }
        } else {
          // Fallback to simple inverse
          rollbackPatterns[change.to] = change.from;
        }
      }

      return rollbackPatterns;
    },
    'ROLLBACK_PATTERNS_ERROR',
    contextUtils.sessionContext('generateRollbackPatterns', 'system'),
  );
}

/**
 * Apply rollback patterns to content
 */
export function applyRollback(contentInput: unknown, patternsInput: unknown): ApiResponse<string> {
  const contentResult = validateFileContent(contentInput);
  if (!apiUtils.isOk(contentResult)) {
    return contentResult;
  }

  if (!patternsInput || typeof patternsInput !== 'object') {
    return createApiError('Patterns must be an object', 'VALIDATION_ERROR');
  }

  const content = contentResult.data;
  const patterns = patternsInput as Record<string, string>;

  return safeUtils.execute(
    () => {
      let rolledBackContent = content;

      // Apply rollback patterns in reverse order for safety
      const sortedPatterns = Object.entries(patterns).reverse();

      for (const [currentPattern, rollbackPattern] of sortedPatterns) {
        try {
          // Escape special regex characters for safe replacement
          const escapedPattern = currentPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedPattern, 'g');
          rolledBackContent = rolledBackContent.replace(regex, rollbackPattern);
        } catch (error) {
          console.warn(`Failed to apply rollback pattern for ${currentPattern}:`, error);
        }
      }

      return rolledBackContent;
    },
    'ROLLBACK_APPLICATION_ERROR',
    contextUtils.sessionContext('applyRollback', 'system'),
  );
}

/**
 * Validate rollback plan
 */
export function validateRollbackPlan(planInput: unknown): ApiResponse<ValidationResult> {
  if (!planInput || typeof planInput !== 'object') {
    return createApiError('Rollback plan must be an object', 'VALIDATION_ERROR');
  }

  const plan = planInput as Record<string, unknown>;

  return safeUtils.execute(
    () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate patterns
      if (!plan.patterns || typeof plan.patterns !== 'object') {
        errors.push('Rollback plan must have patterns object');
      } else {
        const patterns = plan.patterns as Record<string, unknown>;
        if (Object.keys(patterns).length === 0) {
          errors.push('No rollback patterns defined');
        }

        // Validate pattern syntax
        for (const [pattern, replacement] of Object.entries(patterns)) {
          try {
            new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          } catch (error) {
            errors.push(`Invalid rollback pattern: ${pattern}`);
          }

          if (!replacement || (typeof replacement === 'string' && replacement.trim() === '')) {
            errors.push(`Empty rollback replacement for pattern: ${pattern}`);
          }
        }
      }

      // Validate affected files
      if (!Array.isArray(plan.affectedFiles)) {
        errors.push('Rollback plan must have affectedFiles array');
      } else if (plan.affectedFiles.length === 0) {
        warnings.push('No affected files identified');
      }

      // Validate complexity
      if (typeof plan.complexity === 'number' && plan.complexity > 80) {
        warnings.push('High rollback complexity detected - consider manual review');
      }

      // Determine risk level
      let riskAssessment: RiskLevel;
      if (errors.length > 2) riskAssessment = 'critical';
      else if (errors.length > 0) riskAssessment = 'high';
      else if (warnings.length > 2) riskAssessment = 'medium';
      else riskAssessment = 'low';

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskAssessment,
      };
    },
    'ROLLBACK_VALIDATION_ERROR',
    contextUtils.sessionContext('validateRollbackPlan', 'system'),
  );
}

/**
 * Generate emergency rollback plan
 */
export function generateEmergencyRollback(
  originalContentInput: unknown,
): ApiResponse<RollbackPlan> {
  if (!originalContentInput || typeof originalContentInput !== 'object') {
    return createApiError(
      'Original content must be an object mapping files to content',
      'VALIDATION_ERROR',
    );
  }

  const originalContent = originalContentInput as Record<string, string>;

  return safeUtils.execute(
    () => {
      const affectedFiles = Object.keys(originalContent).map(createFilePath);

      return {
        patterns: {}, // Emergency rollback doesn't use patterns
        affectedFiles,
        checkpoints: ['emergency-restore'],
        estimatedTime: estimateRollbackTime(0, affectedFiles.length),
        complexity: 20, // Low complexity for direct restoration
        riskLevel: 'low' as RiskLevel,
      };
    },
    'EMERGENCY_ROLLBACK_ERROR',
    contextUtils.sessionContext('generateEmergencyRollback', 'system'),
  );
}

/**
 * Calculate rollback complexity score
 */
export function calculateRollbackComplexity(
  patternsInput: unknown,
  affectedFilesInput: unknown,
): ApiResponse<number> {
  if (!patternsInput || typeof patternsInput !== 'object') {
    return createApiError('Patterns must be an object', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(affectedFilesInput)) {
    return createApiError('Affected files must be an array', 'VALIDATION_ERROR');
  }

  const patterns = patternsInput as Record<string, string>;
  const affectedFiles = affectedFilesInput as string[];

  return safeUtils.execute(
    () => {
      let complexity = 0;

      // Base complexity from number of patterns
      complexity += Object.keys(patterns).length * 2;

      // File count complexity
      complexity += affectedFiles.length;

      // Pattern complexity (regex patterns are more complex)
      for (const pattern of Object.keys(patterns)) {
        if (pattern.includes('(') || pattern.includes('[') || pattern.includes('*')) {
          complexity += 5;
        }
      }

      return Math.min(100, complexity);
    },
    'COMPLEXITY_CALCULATION_ERROR',
    contextUtils.sessionContext('calculateRollbackComplexity', 'system'),
  );
}

// ============================================================================
// PRIVATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get default framework configurations
 */
function getDefaultFrameworkConfigs(): Record<Framework, FrameworkRollbackConfig> {
  return {
    react19: {
      rollbackPatterns: {
        forwardRef: 'React.forwardRef',
        'useRef()': 'useRef<HTMLElement>(null)',
      },
      complexityWeight: 0.8,
      riskFactor: 0.6,
    },
    nextjs15: {
      rollbackPatterns: {
        'await cookies()': 'cookies()',
        'await headers()': 'headers()',
      },
      complexityWeight: 0.7,
      riskFactor: 0.5,
    },
    typescript5: {
      rollbackPatterns: {
        'import with': 'import assert',
        'string[]': 'Array<string>',
      },
      complexityWeight: 0.5,
      riskFactor: 0.3,
    },
    tailwind4: {
      rollbackPatterns: {
        prose: 'prose-lg',
        'ring-2': 'ring-3',
      },
      complexityWeight: 0.4,
      riskFactor: 0.2,
    },
  } as Record<Framework, FrameworkRollbackConfig>;
}

/**
 * Generate checkpoints for rollback
 */
function generateCheckpoints(affectedFiles: readonly FilePath[]): readonly string[] {
  const checkpoints: string[] = [];
  const fileGroups = groupFilesByType(affectedFiles);

  for (const [type, files] of Object.entries(fileGroups)) {
    if (files.length > 0) {
      checkpoints.push(`${type}-rollback`);
    }
  }

  checkpoints.push('final-verification');
  return checkpoints;
}

/**
 * Group files by type for checkpoint generation
 */
function groupFilesByType(files: readonly FilePath[]): Record<string, FilePath[]> {
  const groups: Record<string, FilePath[]> = {
    components: [],
    pages: [],
    apis: [],
    styles: [],
    configs: [],
    other: [],
  };

  for (const file of files) {
    if (file.includes('/components/') || file.endsWith('.tsx')) {
      groups.components.push(file);
    } else if (file.includes('/pages/') || file.includes('/app/')) {
      groups.pages.push(file);
    } else if (file.includes('/api/')) {
      groups.apis.push(file);
    } else if (file.endsWith('.css') || file.endsWith('.scss')) {
      groups.styles.push(file);
    } else if (file.includes('config') || file.endsWith('.json')) {
      groups.configs.push(file);
    } else {
      groups.other.push(file);
    }
  }

  return groups;
}

/**
 * Estimate rollback time
 */
function estimateRollbackTime(changeCount: number, fileCount: number): string {
  const baseTime = 2; // 2 minutes base time
  const changeTime = changeCount * 0.1; // 0.1 minutes per change
  const fileTime = fileCount * 0.5; // 0.5 minutes per file

  const totalMinutes = baseTime + changeTime + fileTime;

  if (totalMinutes < 5) return 'Under 5 minutes';
  if (totalMinutes < 15) return '5-15 minutes';
  if (totalMinutes < 30) return '15-30 minutes';
  if (totalMinutes < 60) return '30-60 minutes';
  return 'Over 1 hour';
}

/**
 * Calculate rollback risk level
 */
function calculateRollbackRisk(
  changes: readonly ChangeRecord[],
  config: RollbackConfig,
): RiskLevel {
  let riskScore = 0;

  // Framework-specific risk assessment
  for (const change of changes) {
    const frameworkConfig = config.frameworks[change.framework];
    if (frameworkConfig) {
      riskScore += frameworkConfig.riskFactor;
    }
  }

  // Change volume risk
  if (changes.length > 50) riskScore += 0.3;
  else if (changes.length > 20) riskScore += 0.2;
  else if (changes.length > 10) riskScore += 0.1;

  // File complexity risk
  const uniqueFiles = new Set(changes.map((c) => c.filePath)).size;
  if (uniqueFiles > 20) riskScore += 0.2;
  else if (uniqueFiles > 10) riskScore += 0.1;

  // Determine risk level
  if (riskScore > 0.8) return 'critical';
  if (riskScore > 0.6) return 'high';
  if (riskScore > 0.4) return 'medium';
  return 'low';
}
