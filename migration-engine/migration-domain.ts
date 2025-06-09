/**
 * Migration Domain Utilities - Pure Functions
 *
 * SRP: Migration domain operations only
 * - No local types (uses canonical types)
 * - Validates all inputs with schemas
 * - Returns via createApiSuccess/err pattern
 * - Pure utility functions for migration domain logic
 */

import { RiskLevel, FilePath, ApiResponse, createApiError, createApiSuccess, createEntityId, createFilePath, createTimestamp, Framework, ValidationLevel, EntityId, Timestamp } from '../types/canonical-types';

// ============================================================================
// INPUT VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate migration configuration
 */
function validateMigrationConfiguration(input: unknown): ApiResponse<MigrationConfiguration> {
  if (!input || typeof input !== 'object') {
    return createApiError('Migration configuration must be an object', 'VALIDATION_ERROR');
  }

  const config = input as Record<string, unknown>;

  // Validate boolean fields
  if (typeof config.dryRun !== 'boolean') {
    return createApiError('dryRun must be a boolean', 'VALIDATION_ERROR');
  }

  if (typeof config.interactive !== 'boolean') {
    return createApiError('interactive must be a boolean', 'VALIDATION_ERROR');
  }

  if (typeof config.force !== 'boolean') {
    return createApiError('force must be a boolean', 'VALIDATION_ERROR');
  }

  if (typeof config.skipValidation !== 'boolean') {
    return createApiError('skipValidation must be a boolean', 'VALIDATION_ERROR');
  }

  // Validate frameworks array
  if (!Array.isArray(config.frameworks)) {
    return createApiError('frameworks must be an array', 'VALIDATION_ERROR');
  }

  for (const framework of config.frameworks) {
    if (!isFramework(framework)) {
      return createApiError(`Invalid framework: ${framework}`, 'VALIDATION_ERROR');
    }
  }

  // Validate patterns arrays
  if (!Array.isArray(config.includePatterns)) {
    return createApiError('includePatterns must be an array', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(config.excludePatterns)) {
    return createApiError('excludePatterns must be an array', 'VALIDATION_ERROR');
  }

  // Validate validation level
  const validationLevels = ['basic', 'strict', 'comprehensive'];
  if (!validationLevels.includes(config.validation as string)) {
    return createApiError('validation must be basic, strict, or comprehensive', 'VALIDATION_ERROR');
  }

  return createApiSuccess({
    dryRun: config.dryRun,
    interactive: config.interactive,
    force: config.force,
    skipValidation: config.skipValidation,
    frameworks: config.frameworks as Framework[],
    includePatterns: config.includePatterns as string[],
    excludePatterns: config.excludePatterns as string[],
    validation: config.validation as ValidationLevel,
  });
}

/**
 * Validate migration session
 */
function validateMigrationSession(input: unknown): ApiResponse<MigrationSession> {
  if (!input || typeof input !== 'object') {
    return createApiError('Migration session must be an object', 'VALIDATION_ERROR');
  }

  const session = input as Record<string, unknown>;

  const sessionIdResult = validationUtils.nonEmpty(session.sessionId as string, 'session ID');
  if (!apiUtils.isOk(sessionIdResult)) {
    return sessionIdResult as ApiResponse<MigrationSession>;
  }

  const gitShaResult = validationUtils.nonEmpty(session.gitSha as string, 'git SHA');
  if (!apiUtils.isOk(gitShaResult)) {
    return gitShaResult as ApiResponse<MigrationSession>;
  }

  const startTimeResult = validationUtils.nonEmpty(session.startTime as string, 'start time');
  if (!apiUtils.isOk(startTimeResult)) {
    return startTimeResult as ApiResponse<MigrationSession>;
  }

  const validStatuses = ['analyzing', 'transforming', 'validating', 'completed', 'failed'];
  if (!validStatuses.includes(session.status as string)) {
    return createApiError('Invalid session status', 'VALIDATION_ERROR');
  }

  const configResult = validateMigrationConfiguration(session.configuration);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<MigrationSession>;
  }

  return createApiSuccess({
    sessionId: createEntityId(sessionIdResult.data),
    gitSha: gitShaResult.data,
    startTime: startTimeResult.data as Timestamp,
    endTime: typeof session.endTime === 'string' ? (session.endTime as Timestamp) : undefined,
    status: session.status as MigrationSession['status'],
    configuration: configResult.data,
  });
}

// ============================================================================
// MIGRATION DOMAIN FUNCTIONS
// ============================================================================

/**
 * Create migration configuration
 */
export function createMigrationConfiguration(
  options: unknown,
): ApiResponse<MigrationConfiguration> {
  if (!options || typeof options !== 'object') {
    return createApiError('Configuration options must be an object', 'VALIDATION_ERROR');
  }

  const opts = options as Record<string, unknown>;

  const config = {
    dryRun: Boolean(opts.dryRun),
    interactive: Boolean(opts.interactive ?? true),
    force: Boolean(opts.force),
    skipValidation: Boolean(opts.skipValidation),
    frameworks: Array.isArray(opts.frameworks)
      ? opts.frameworks
      : ['react19', 'nextjs15', 'typescript5', 'tailwind4'],
    includePatterns: Array.isArray(opts.includePatterns)
      ? opts.includePatterns
      : ['src/**/*.{ts,tsx}', '**/*.{ts,tsx}'],
    excludePatterns: Array.isArray(opts.excludePatterns)
      ? opts.excludePatterns
      : ['**/node_modules/**', '**/*.d.ts'],
    validation: typeof opts.validation === 'string' ? opts.validation : 'strict',
  };

  return validateMigrationConfiguration(config);
}

/**
 * Create migration session
 */
export function createMigrationSession(
  sessionId: unknown,
  gitSha: unknown,
  configuration: unknown,
): ApiResponse<MigrationSession> {
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return createApiError('Session ID must be a non-empty string', 'VALIDATION_ERROR');
  }

  if (typeof gitSha !== 'string' || !gitSha.trim()) {
    return createApiError('Git SHA must be a non-empty string', 'VALIDATION_ERROR');
  }

  const configResult = validateMigrationConfiguration(configuration);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<MigrationSession>;
  }

  return safeUtils.execute(
    () => {
      return {
        sessionId: createEntityId(sessionId),
        gitSha,
        startTime: createTimestamp(),
        status: 'analyzing' as const,
        configuration: configResult.data,
      };
    },
    'MIGRATION_SESSION_CREATION_ERROR',
    contextUtils.sessionContext('createMigrationSession', sessionId),
  );
}

/**
 * Update migration session status
 */
export function updateMigrationSession(
  sessionInput: unknown,
  status: unknown,
  endTime?: unknown,
): ApiResponse<MigrationSession> {
  const sessionResult = validateMigrationSession(sessionInput);
  if (!apiUtils.isOk(sessionResult)) {
    return sessionResult;
  }

  const validStatuses = ['analyzing', 'transforming', 'validating', 'completed', 'failed'];
  if (!validStatuses.includes(status as string)) {
    return createApiError('Invalid session status', 'VALIDATION_ERROR');
  }

  if (endTime && typeof endTime !== 'string') {
    return createApiError('End time must be a string timestamp', 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      const session = sessionResult.data;

      return {
        ...session,
        status: status as MigrationSession['status'],
        endTime: endTime ? (endTime as Timestamp) : session.endTime,
      };
    },
    'MIGRATION_SESSION_UPDATE_ERROR',
    contextUtils.sessionContext('updateMigrationSession', session.sessionId),
  );
}

/**
 * Create migration summary
 */
export function createMigrationSummary(
  totalFiles: unknown,
  modifiedFiles: unknown,
  skippedFiles: unknown,
  errorFiles: unknown,
  breakdown: unknown,
  frameworkCounts: unknown,
): ApiResponse<MigrationSummary> {
  if (typeof totalFiles !== 'number' || totalFiles < 0) {
    return createApiError('Total files must be a non-negative number', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(modifiedFiles)) {
    return createApiError('Modified files must be an array', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(skippedFiles)) {
    return createApiError('Skipped files must be an array', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(errorFiles)) {
    return createApiError('Error files must be an array', 'VALIDATION_ERROR');
  }

  if (!breakdown || typeof breakdown !== 'object') {
    return createApiError('Breakdown must be an object', 'VALIDATION_ERROR');
  }

  if (!frameworkCounts || typeof frameworkCounts !== 'object') {
    return createApiError('Framework counts must be an object', 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      const validatedModifiedFiles = modifiedFiles.map((file: string) => createFilePath(file));
      const validatedSkippedFiles = skippedFiles.map((file: string) => createFilePath(file));
      const validatedErrorFiles = errorFiles.map((file: string) => createFilePath(file));

      const breakdownData = breakdown as Record<string, unknown>;
      const validatedBreakdown: MigrationBreakdown = {
        consoleUpdates:
          typeof breakdownData.consoleUpdates === 'number' ? breakdownData.consoleUpdates : 0,
        reactUpdates:
          typeof breakdownData.reactUpdates === 'number' ? breakdownData.reactUpdates : 0,
        nextjsUpdates:
          typeof breakdownData.nextjsUpdates === 'number' ? breakdownData.nextjsUpdates : 0,
        typescriptUpdates:
          typeof breakdownData.typescriptUpdates === 'number' ? breakdownData.typescriptUpdates : 0,
        tailwindUpdates:
          typeof breakdownData.tailwindUpdates === 'number' ? breakdownData.tailwindUpdates : 0,
        typescriptDebtFixes:
          typeof breakdownData.typescriptDebtFixes === 'number'
            ? breakdownData.typescriptDebtFixes
            : 0,
        stringTransformations:
          typeof breakdownData.stringTransformations === 'number'
            ? breakdownData.stringTransformations
            : 0,
        astTransformations:
          typeof breakdownData.astTransformations === 'number'
            ? breakdownData.astTransformations
            : 0,
      };

      const validatedFrameworkCounts: Record<Framework, number> = {} as Record<Framework, number>;
      const counts = frameworkCounts as Record<string, unknown>;

      for (const [framework, count] of Object.entries(counts)) {
        if (isFramework(framework) && typeof count === 'number') {
          validatedFrameworkCounts[framework] = count;
        }
      }

      return {
        totalFiles,
        modifiedFiles: validatedModifiedFiles,
        skippedFiles: validatedSkippedFiles,
        errorFiles: validatedErrorFiles,
        breakdown: validatedBreakdown,
        frameworkCounts: validatedFrameworkCounts,
      };
    },
    'MIGRATION_SUMMARY_CREATION_ERROR',
    contextUtils.sessionContext('createMigrationSummary', 'system'),
  );
}

/**
 * Assess migration readiness
 */
export function assessMigrationReadiness(
  projectRoot: unknown,
  configuration: unknown,
): ApiResponse<MigrationReadiness> {
  if (typeof projectRoot !== 'string' || !projectRoot.trim()) {
    return createApiError('Project root must be a non-empty string', 'VALIDATION_ERROR');
  }

  const configResult = validateMigrationConfiguration(configuration);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<MigrationReadiness>;
  }

  return safeUtils.execute(
    () => {
      const config = configResult.data;
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check for required tools
      if (config.frameworks.includes('typescript5')) {
        try {
          require.resolve('typescript');
        } catch {
          issues.push('TypeScript is not installed');
          recommendations.push('Install TypeScript: npm install typescript');
        }
      }

      if (config.frameworks.includes('react19')) {
        try {
          require.resolve('react');
        } catch {
          issues.push('React is not installed');
          recommendations.push('Install React: npm install react');
        }
      }

      // Check for backup capabilities
      if (!config.skipValidation) {
        recommendations.push('Consider running with --dry-run first to preview changes');
      }

      // Check for large project
      if (config.includePatterns.length > 10) {
        recommendations.push(
          'Consider using more specific include patterns for better performance',
        );
      }

      // Assess overall risk
      let riskLevel: RiskLevel = 'low';
      if (issues.length > 3) riskLevel = 'critical';
      else if (issues.length > 1) riskLevel = 'high';
      else if (config.frameworks.length > 3) riskLevel = 'medium';

      const isReady = issues.length === 0;

      return {
        isReady,
        issues,
        recommendations,
        riskLevel,
      };
    },
    'MIGRATION_READINESS_ERROR',
    contextUtils.sessionContext('assessMigrationReadiness', projectRoot),
  );
}

/**
 * Create migration phase
 */
export function createMigrationPhase(
  name: unknown,
  patterns: unknown,
  estimatedDuration: unknown,
  risk: unknown,
): ApiResponse<MigrationPhase> {
  const nameResult = validationUtils.nonEmpty(name as string, 'phase name');
  if (!apiUtils.isOk(nameResult)) {
    return nameResult as ApiResponse<MigrationPhase>;
  }

  if (!Array.isArray(patterns)) {
    return createApiError('Patterns must be an array', 'VALIDATION_ERROR');
  }

  const durationResult = validationUtils.nonEmpty(
    estimatedDuration as string,
    'estimated duration',
  );
  if (!apiUtils.isOk(durationResult)) {
    return durationResult as ApiResponse<MigrationPhase>;
  }

  if (!isRiskLevel(risk)) {
    return createApiError(`Invalid risk level: ${risk}`, 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      // Validate pattern structures
      const validatedPatterns: PatternMatch[] = [];

      for (const pattern of patterns) {
        if (pattern && typeof pattern === 'object') {
          const p = pattern as Record<string, unknown>;

          if (
            isFramework(p.framework) &&
            typeof p.pattern === 'string' &&
            ['ast', 'string', 'complex'].includes(p.type as string) &&
            Array.isArray(p.matches)
          ) {
            const validatedMatches: PatternMatchDetail[] = p.matches.map((match: any) => ({
              line: typeof match.line === 'number' ? match.line : 0,
              column: typeof match.column === 'number' ? match.column : 0,
              text: typeof match.text === 'string' ? match.text : '',
              severity: typeof match.severity === 'string' ? match.severity : 'low',
              suggestedFix: typeof match.suggestedFix === 'string' ? match.suggestedFix : undefined,
            }));

            validatedPatterns.push({
              framework: p.framework as Framework,
              pattern: p.pattern,
              type: p.type as 'ast' | 'string' | 'complex',
              matches: validatedMatches,
            });
          }
        }
      }

      return {
        name: nameResult.data,
        patterns: validatedPatterns,
        estimatedDuration: durationResult.data,
        risk: risk as RiskLevel,
      };
    },
    'MIGRATION_PHASE_CREATION_ERROR',
    contextUtils.sessionContext('createMigrationPhase', nameResult.data),
  );
}

/**
 * Check if migration session is completed
 */
export function isCompletedMigration(sessionInput: unknown): ApiResponse<boolean> {
  const sessionResult = validateMigrationSession(sessionInput);
  if (!apiUtils.isOk(sessionResult)) {
    return sessionResult as ApiResponse<boolean>;
  }

  return safeUtils.execute(
    () => {
      const session = sessionResult.data;
      return session.status === 'completed' && session.endTime !== undefined;
    },
    'MIGRATION_COMPLETION_CHECK_ERROR',
    contextUtils.sessionContext('isCompletedMigration', session.sessionId),
  );
}

/**
 * Check if migration session is in progress
 */
export function isInProgressMigration(sessionInput: unknown): ApiResponse<boolean> {
  const sessionResult = validateMigrationSession(sessionInput);
  if (!apiUtils.isOk(sessionResult)) {
    return sessionResult as ApiResponse<boolean>;
  }

  return safeUtils.execute(
    () => {
      const session = sessionResult.data;
      return ['analyzing', 'transforming', 'validating'].includes(session.status);
    },
    'MIGRATION_PROGRESS_CHECK_ERROR',
    contextUtils.sessionContext('isInProgressMigration', session.sessionId),
  );
}

/**
 * Check if migration session has failed
 */
export function isFailedMigration(sessionInput: unknown): ApiResponse<boolean> {
  const sessionResult = validateMigrationSession(sessionInput);
  if (!apiUtils.isOk(sessionResult)) {
    return sessionResult as ApiResponse<boolean>;
  }

  return safeUtils.execute(
    () => {
      const session = sessionResult.data;
      return session.status === 'failed';
    },
    'MIGRATION_FAILURE_CHECK_ERROR',
    contextUtils.sessionContext('isFailedMigration', session.sessionId),
  );
}

/**
 * Calculate migration duration
 */
export function calculateMigrationDuration(sessionInput: unknown): ApiResponse<number> {
  const sessionResult = validateMigrationSession(sessionInput);
  if (!apiUtils.isOk(sessionResult)) {
    return sessionResult as ApiResponse<number>;
  }

  return safeUtils.execute(
    () => {
      const session = sessionResult.data;

      if (!session.endTime) {
        // Calculate current duration for in-progress migrations
        const now = new Date();
        const start = new Date(session.startTime);
        return now.getTime() - start.getTime();
      }

      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      return end.getTime() - start.getTime();
    },
    'MIGRATION_DURATION_CALCULATION_ERROR',
    contextUtils.sessionContext('calculateMigrationDuration', session.sessionId),
  );
}

/**
 * Get migration progress percentage
 */
export function getMigrationProgress(sessionInput: unknown): ApiResponse<number> {
  const sessionResult = validateMigrationSession(sessionInput);
  if (!apiUtils.isOk(sessionResult)) {
    return sessionResult as ApiResponse<number>;
  }

  return safeUtils.execute(
    () => {
      const session = sessionResult.data;

      switch (session.status) {
        case 'analyzing':
          return 25;
        case 'transforming':
          return 50;
        case 'validating':
          return 75;
        case 'completed':
          return 100;
        case 'failed':
          return 0;
        default:
          return 0;
      }
    },
    'MIGRATION_PROGRESS_CALCULATION_ERROR',
    contextUtils.sessionContext('getMigrationProgress', session.sessionId),
  );
}
