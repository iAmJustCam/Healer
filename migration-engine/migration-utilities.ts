/**
 * Migration Utilities - Pure Functions
 *
 * SRP: Migration-specific utility operations only
 * - No local types (uses canonical types)
 * - Validates all inputs with schemas
 * - Returns via createApiSuccess/err pattern
 * - Environment detection for APIs
 * - Pure utility functions, no classes
 */

import { RiskLevel, FilePath, ApiResponse, createApiError, createApiSuccess, createEntityId, createFilePath, createTimestamp, TransformationStrategy, Framework, ConfidenceScore, EntityId, Timestamp } from '../types/canonical-types';

// ============================================================================
// INPUT VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate migration context
 */
function validateMigrationContext(input: unknown): ApiResponse<MigrationContext> {
  if (!input || typeof input !== 'object') {
    return createApiError('Migration context must be an object', 'VALIDATION_ERROR');
  }

  const context = input as Record<string, unknown>;

  const sessionIdResult = validationUtils.nonEmpty(context.sessionId as string, 'session ID');
  if (!apiUtils.isOk(sessionIdResult)) {
    return sessionIdResult as ApiResponse<MigrationContext>;
  }

  const rootDirResult = validationUtils.nonEmpty(context.rootDir as string, 'root directory');
  if (!apiUtils.isOk(rootDirResult)) {
    return rootDirResult as ApiResponse<MigrationContext>;
  }

  const gitShaResult = validationUtils.nonEmpty(context.gitSha as string, 'git SHA');
  if (!apiUtils.isOk(gitShaResult)) {
    return gitShaResult as ApiResponse<MigrationContext>;
  }

  if (!Array.isArray(context.frameworks)) {
    return createApiError('Frameworks must be an array', 'VALIDATION_ERROR');
  }

  for (const framework of context.frameworks) {
    if (!isFramework(framework)) {
      return createApiError(`Invalid framework: ${framework}`, 'VALIDATION_ERROR');
    }
  }

  return createApiSuccess({
    sessionId: createEntityId(sessionIdResult.data),
    rootDir: rootDirResult.data,
    gitSha: gitShaResult.data,
    timestamp:
      typeof context.timestamp === 'string' ? (context.timestamp as Timestamp) : createTimestamp(),
    frameworks: context.frameworks as Framework[],
  });
}

/**
 * Validate validation configuration
 */
function validateValidationConfig(input: unknown): ApiResponse<ValidationConfig> {
  if (!input || typeof input !== 'object') {
    return createApiError('Validation config must be an object', 'VALIDATION_ERROR');
  }

  const config = input as Record<string, unknown>;

  const defaultConfig: ValidationConfig = {
    strictMode: Boolean(config.strictMode ?? true),
    enableLinting: Boolean(config.enableLinting ?? true),
    enableTypeChecking: Boolean(config.enableTypeChecking ?? true),
    customRules: Array.isArray(config.customRules) ? (config.customRules as string[]) : [],
    timeout: typeof config.timeout === 'number' ? config.timeout : 30000,
  };

  return createApiSuccess(defaultConfig);
}

// ============================================================================
// ENVIRONMENT DETECTION UTILITIES
// ============================================================================

/**
 * Check if Git is available
 */
function checkGitEnvironment(): ApiResponse<boolean> {
  return safeUtils.execute(
    () => {
      if (typeof execSync !== 'function') {
        return false;
      }

      try {
        execSync('git --version', { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    },
    'GIT_ENVIRONMENT_CHECK_ERROR',
    contextUtils.sessionContext('checkGitEnvironment', 'system'),
  );
}

/**
 * Check if Node.js development tools are available
 */
function checkNodeToolsEnvironment(): ApiResponse<boolean> {
  return safeUtils.execute(
    () => {
      const checks = [
        typeof execSync === 'function',
        typeof fs.readFile === 'function',
        typeof process !== 'undefined',
      ];

      return checks.every(Boolean);
    },
    'NODE_TOOLS_CHECK_ERROR',
    contextUtils.sessionContext('checkNodeToolsEnvironment', 'system'),
  );
}

// ============================================================================
// MIGRATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Create migration context
 */
export function createMigrationContext(
  rootDir: unknown,
  frameworks: unknown,
  sessionId?: unknown,
): ApiResponse<MigrationContext> {
  if (typeof rootDir !== 'string' || !rootDir.trim()) {
    return createApiError('Root directory must be a non-empty string', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(frameworks)) {
    return createApiError('Frameworks must be an array', 'VALIDATION_ERROR');
  }

  for (const framework of frameworks) {
    if (!isFramework(framework)) {
      return createApiError(`Invalid framework: ${framework}`, 'VALIDATION_ERROR');
    }
  }

  return safeUtils.execute(
    () => {
      const contextSessionId = sessionId
        ? createEntityId(sessionId as string)
        : createEntityId(`migration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

      const gitInfo = getGitInfo();

      return {
        sessionId: contextSessionId,
        rootDir,
        gitSha: gitInfo?.sha || 'unknown',
        timestamp: createTimestamp(),
        frameworks: frameworks as Framework[],
      };
    },
    'MIGRATION_CONTEXT_CREATION_ERROR',
    contextUtils.sessionContext('createMigrationContext', rootDir),
  );
}

/**
 * Get Git information
 */
export function getGitInfo(): ApiResponse<GitInfo> {
  const gitCheck = checkGitEnvironment();
  if (!apiUtils.isOk(gitCheck) || !gitCheck.data) {
    return createApiError('Git environment not available', 'ENVIRONMENT_ERROR');
  }

  return safeUtils.execute(
    () => {
      const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8',
      }).trim();

      let isDirty = false;
      try {
        const status = execSync('git status --porcelain', {
          encoding: 'utf-8',
        }).trim();
        isDirty = status.length > 0;
      } catch {
        // Assume clean if we can't check
      }

      let lastCommitMessage = '';
      let lastCommitDate = createTimestamp();
      try {
        lastCommitMessage = execSync('git log -1 --pretty=format:"%s"', {
          encoding: 'utf-8',
        }).trim();
        const commitDateStr = execSync('git log -1 --pretty=format:"%ai"', {
          encoding: 'utf-8',
        }).trim();
        lastCommitDate = new Date(commitDateStr).toISOString() as Timestamp;
      } catch {
        // Use defaults if we can't get commit info
      }

      return {
        sha,
        branch,
        isDirty,
        lastCommitMessage,
        lastCommitDate,
      };
    },
    'GIT_INFO_ERROR',
    contextUtils.sessionContext('getGitInfo', 'system'),
  );
}

/**
 * Calculate file checksum
 */
export function calculateFileChecksum(
  filePath: unknown,
  algorithm: unknown = 'sha256',
): ApiResponse<string> {
  const pathResult = validationUtils.nonEmpty(filePath as string, 'file path');
  if (!apiUtils.isOk(pathResult)) {
    return pathResult as ApiResponse<string>;
  }

  if (typeof algorithm !== 'string' || !['md5', 'sha1', 'sha256', 'sha512'].includes(algorithm)) {
    return createApiError('Algorithm must be md5, sha1, sha256, or sha512', 'VALIDATION_ERROR');
  }

  return safeUtils.executeAsync(
    async () => {
      const content = await fs.readFile(pathResult.data, 'utf-8');
      return crypto.createHash(algorithm).update(content).digest('hex');
    },
    'CHECKSUM_CALCULATION_ERROR',
    contextUtils.fileContext('calculateFileChecksum', createFilePath(pathResult.data)),
  );
}

/**
 * Validate file transformation
 */
export async function validateTransformation(
  transformationInput: unknown,
  configInput: unknown = {},
): Promise<ApiResponse<{ isValid: boolean; errors: string[]; warnings: string[] }>> {
  if (!transformationInput || typeof transformationInput !== 'object') {
    return createApiError('Transformation must be an object', 'VALIDATION_ERROR');
  }

  const configResult = validateValidationConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>;
  }

  const transformation = transformationInput as FileTransformation;
  const config = configResult.data;

  const nodeCheck = checkNodeToolsEnvironment();
  if (!apiUtils.isOk(nodeCheck) || !nodeCheck.data) {
    return createApiError('Node.js tools not available', 'ENVIRONMENT_ERROR');
  }

  return safeUtils.executeAsync(
    async () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Basic structure validation
      if (!transformation.filePath || !transformation.transformedContent) {
        errors.push('Transformation missing required fields');
      }

      // Write transformed content to temp file for validation
      const tempFile = path.join(process.cwd(), `temp-${Date.now()}.ts`);
      try {
        await fs.writeFile(tempFile, transformation.transformedContent, 'utf-8');

        // TypeScript validation
        if (config.enableTypeChecking) {
          try {
            execSync(`npx tsc --noEmit ${tempFile}`, {
              stdio: 'pipe',
              timeout: config.timeout,
            });
          } catch (error) {
            const output =
              error instanceof Error && 'stdout' in error
                ? (error as any).stdout?.toString() || error.message
                : String(error);

            if (output.includes('error TS')) {
              errors.push('TypeScript compilation errors detected');
            }
          }
        }

        // ESLint validation
        if (config.enableLinting) {
          try {
            execSync(`npx eslint ${tempFile}`, {
              stdio: 'pipe',
              timeout: config.timeout,
            });
          } catch (error) {
            const output =
              error instanceof Error && 'stdout' in error
                ? (error as any).stdout?.toString() || error.message
                : String(error);

            if (output.includes('warning') || output.includes('error')) {
              warnings.push('ESLint violations detected');
            }
          }
        }

        // Syntax validation
        try {
          new Function(transformation.transformedContent);
        } catch (error) {
          errors.push('Syntax errors in transformed content');
        }
      } finally {
        // Clean up temp file
        try {
          await fs.unlink(tempFile);
        } catch {
          // Ignore cleanup errors
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    'TRANSFORMATION_VALIDATION_ERROR',
    contextUtils.fileContext('validateTransformation', transformation.filePath),
  );
}

/**
 * Calculate complexity score for content
 */
export function calculateComplexity(
  content: unknown,
  framework: unknown,
): ApiResponse<ComplexityScore> {
  if (typeof content !== 'string') {
    return createApiError('Content must be a string', 'VALIDATION_ERROR');
  }

  if (!isFramework(framework)) {
    return createApiError(`Invalid framework: ${framework}`, 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      let complexity = 0;

      // Basic complexity factors
      const lines = content.split('\n').length;
      const characters = content.length;

      // Line count complexity (logarithmic scale)
      complexity += Math.log10(Math.max(1, lines)) * 0.1;

      // Character count complexity
      complexity += Math.log10(Math.max(1, characters)) * 0.05;

      // Framework-specific complexity
      switch (framework) {
        case 'react19':
          if (content.includes('forwardRef')) complexity += 0.3;
          if (content.includes('useRef')) complexity += 0.2;
          if (content.includes('React.FC')) complexity += 0.1;
          break;

        case 'nextjs15':
          if (content.includes('cookies()')) complexity += 0.2;
          if (content.includes('headers()')) complexity += 0.2;
          if (content.includes('params')) complexity += 0.1;
          break;

        case 'typescript5':
          if (content.includes(': any')) complexity += 0.4;
          if (content.includes('as ')) complexity += 0.3;
          if (content.includes('!')) complexity += 0.2;
          break;

        case 'tailwind4':
          if (content.includes('prose-')) complexity += 0.1;
          if (content.includes('ring-')) complexity += 0.1;
          break;
      }

      // General complexity patterns
      if (content.includes('try') && content.includes('catch')) complexity += 0.2;
      if (content.includes('async') && content.includes('await')) complexity += 0.1;
      if (content.includes('interface') || content.includes('type ')) complexity += 0.1;

      return Math.min(1, complexity) as ComplexityScore;
    },
    'COMPLEXITY_CALCULATION_ERROR',
    contextUtils.sessionContext('calculateComplexity', framework),
  );
}

/**
 * Generate confidence score for transformation
 */
export function calculateConfidence(
  transformationInput: unknown,
  contextInput: unknown,
): ApiResponse<ConfidenceScore> {
  if (!transformationInput || typeof transformationInput !== 'object') {
    return createApiError('Transformation must be an object', 'VALIDATION_ERROR');
  }

  const contextResult = validateMigrationContext(contextInput);
  if (!apiUtils.isOk(contextResult)) {
    return contextResult as ApiResponse<ConfidenceScore>;
  }

  const transformation = transformationInput as FileTransformation;
  const context = contextResult.data;

  return safeUtils.execute(
    () => {
      let confidence = 0.8; // Base confidence

      // Strategy appropriateness
      const contentLength = transformation.originalContent.length;
      if (transformation.strategy === 'ast' && contentLength > 1000) {
        confidence += 0.1; // AST better for complex files
      } else if (transformation.strategy === 'string' && contentLength < 500) {
        confidence += 0.1; // String better for simple files
      }

      // Change ratio (fewer changes usually more confident)
      const changeRatio =
        transformation.changes.length / transformation.originalContent.split('\n').length;
      if (changeRatio < 0.1) confidence += 0.1;
      else if (changeRatio > 0.5) confidence -= 0.2;

      // Framework support
      const supportedFrameworks = ['react19', 'nextjs15', 'typescript5', 'tailwind4'];
      const hasSupported = transformation.changes.some((change) =>
        supportedFrameworks.includes(change.framework),
      );
      if (hasSupported) confidence += 0.05;

      // Duration (reasonable time suggests good processing)
      if (transformation.duration > 0 && transformation.duration < 5000) {
        confidence += 0.05; // 0-5 seconds is good
      } else if (transformation.duration > 30000) {
        confidence -= 0.1; // Over 30 seconds suggests problems
      }

      return Math.max(0.1, Math.min(1.0, confidence)) as ConfidenceScore;
    },
    'CONFIDENCE_CALCULATION_ERROR',
    contextUtils.fileContext('calculateConfidence', transformation.filePath),
  );
}

/**
 * Assess transformation risk
 */
export function assessRisk(
  transformationInput: unknown,
  contextInput: unknown,
): ApiResponse<{ level: RiskLevel; factors: string[]; score: number }> {
  if (!transformationInput || typeof transformationInput !== 'object') {
    return createApiError('Transformation must be an object', 'VALIDATION_ERROR');
  }

  const contextResult = validateMigrationContext(contextInput);
  if (!apiUtils.isOk(contextResult)) {
    return contextResult as ApiResponse<{
      level: RiskLevel;
      factors: string[];
      score: number;
    }>;
  }

  const transformation = transformationInput as FileTransformation;
  const context = contextResult.data;

  return safeUtils.execute(
    () => {
      let riskScore = 0;
      const riskFactors: string[] = [];

      // Change volume risk
      const changeCount = transformation.changes.length;
      if (changeCount > 20) {
        riskScore += 0.3;
        riskFactors.push(`High number of changes: ${changeCount}`);
      } else if (changeCount > 10) {
        riskScore += 0.2;
        riskFactors.push(`Moderate number of changes: ${changeCount}`);
      }

      // File size risk
      const fileSize = transformation.originalContent.length;
      if (fileSize > 10000) {
        riskScore += 0.2;
        riskFactors.push('Large file size increases risk');
      }

      // Critical pattern risk
      const criticalPatterns = transformation.changes.filter(
        (change) =>
          change.oldText.includes('forwardRef') ||
          change.oldText.includes(': any') ||
          change.oldText.includes('as '),
      );
      if (criticalPatterns.length > 0) {
        riskScore += 0.4;
        riskFactors.push(`${criticalPatterns.length} critical pattern changes`);
      }

      // Framework-specific risks
      const reactChanges = transformation.changes.filter((c) => c.framework === 'react19');
      if (reactChanges.length > 5) {
        riskScore += 0.2;
        riskFactors.push('Multiple React component changes');
      }

      // Strategy mismatch risk
      const complexContent = fileSize > 5000 || changeCount > 15;
      if (complexContent && transformation.strategy === 'string') {
        riskScore += 0.3;
        riskFactors.push('String strategy used for complex content');
      }

      // Confidence risk
      if (transformation.confidence < 0.7) {
        riskScore += 0.2;
        riskFactors.push('Low transformation confidence');
      }

      // Determine risk level
      let level: RiskLevel;
      if (riskScore > 0.7) level = 'critical';
      else if (riskScore > 0.5) level = 'high';
      else if (riskScore > 0.3) level = 'medium';
      else level = 'low';

      return {
        level,
        factors: riskFactors,
        score: Math.min(1.0, riskScore),
      };
    },
    'RISK_ASSESSMENT_ERROR',
    contextUtils.fileContext('assessRisk', transformation.filePath),
  );
}

/**
 * Generate performance metrics
 */
export function generatePerformanceMetrics(
  startTime: unknown,
  endTime: unknown,
  filesProcessed: unknown,
  transformationsApplied: unknown,
): ApiResponse<PerformanceMetrics> {
  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    return createApiError('Start and end times must be ISO string timestamps', 'VALIDATION_ERROR');
  }

  if (typeof filesProcessed !== 'number' || typeof transformationsApplied !== 'number') {
    return createApiError(
      'Files processed and transformations applied must be numbers',
      'VALIDATION_ERROR',
    );
  }

  return safeUtils.execute(
    () => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = end.getTime() - start.getTime();

      // Get memory usage if available
      let memoryUsage = 0;
      let cpuUsage = 0;

      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memInfo = process.memoryUsage();
        memoryUsage = memInfo.heapUsed;
      }

      if (typeof process !== 'undefined' && process.cpuUsage) {
        const cpuInfo = process.cpuUsage();
        cpuUsage = cpuInfo.user + cpuInfo.system;
      }

      return {
        startTime: startTime as Timestamp,
        endTime: endTime as Timestamp,
        duration,
        filesProcessed,
        transformationsApplied,
        memoryUsage,
        cpuUsage,
      };
    },
    'PERFORMANCE_METRICS_ERROR',
    contextUtils.sessionContext('generatePerformanceMetrics', 'system'),
  );
}

/**
 * Sanitize file path for safe operations
 */
export function sanitizeFilePath(filePath: unknown): ApiResponse<FilePath> {
  if (typeof filePath !== 'string' || !filePath.trim()) {
    return createApiError('File path must be a non-empty string', 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      let sanitized = filePath.trim();

      // Remove dangerous path components
      sanitized = sanitized.replace(/\.\./g, ''); // Remove parent directory references
      sanitized = sanitized.replace(/^\/+/, ''); // Remove leading slashes
      sanitized = sanitized.replace(/\/{2,}/g, '/'); // Replace multiple slashes with single

      // Normalize path separators
      sanitized = path.normalize(sanitized);

      // Ensure it's a relative path
      if (path.isAbsolute(sanitized)) {
        sanitized = path.relative(process.cwd(), sanitized);
      }

      if (!sanitized || sanitized === '.' || sanitized === '..') {
        throw new Error('Invalid file path after sanitization');
      }

      return createFilePath(sanitized);
    },
    'FILE_PATH_SANITIZATION_ERROR',
    contextUtils.sessionContext('sanitizeFilePath', filePath),
  );
}

/**
 * Create backup filename with timestamp
 */
export function createBackupFilename(
  originalFilePath: unknown,
  suffix: unknown = 'backup',
): ApiResponse<string> {
  const pathResult = validationUtils.nonEmpty(originalFilePath as string, 'original file path');
  if (!apiUtils.isOk(pathResult)) {
    return pathResult as ApiResponse<string>;
  }

  if (typeof suffix !== 'string') {
    return createApiError('Suffix must be a string', 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      const originalPath = pathResult.data;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = path.extname(originalPath);
      const base = path.basename(originalPath, ext);
      const dir = path.dirname(originalPath);

      const backupName = `${base}.${suffix}-${timestamp}${ext}`;
      return path.join(dir, backupName);
    },
    'BACKUP_FILENAME_CREATION_ERROR',
    contextUtils.fileContext('createBackupFilename', createFilePath(pathResult.data)),
  );
}
