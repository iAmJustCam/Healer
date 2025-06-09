/**
 * Restore Service Utility - Pure Functions
 *
 * SRP: Backup restoration operations only
 * - No local types (uses canonical types)
 * - Validates all inputs with schemas
 * - Returns via createApiSuccess/err pattern
 * - Environment detection for APIs
 * - Pure utility functions, no classes
 */

import { promises as fs } from 'fs';
import path from 'path';

// CANONICAL TYPE IMPORTS ONLY
import { ApiResponse, EntityId, FilePath, RiskLevel, Timestamp, createApiError, createApiSuccess, createFilePath, createTimestamp } from '../types/canonical-types';

import { createEntityId, createFilePath, createTimestamp } from '';

// VALIDATION AND UTILITY IMPORTS
import { apiUtils, contextUtils, safeUtils, validationUtils } from '@/utilities/result-utilities';


// Minimal interfaces for restore operations (no duplication with canonical types)
interface RestoreSession {
  readonly sessionId: EntityId;
  readonly backupId: string;
  readonly timestamp: Timestamp;
  readonly files: readonly RestoreFile[];
  readonly options: RestoreOptions;
}

interface RestoreFile {
  readonly path: FilePath;
  readonly originalContent: string;
  readonly size: number;
  readonly checksum: string;
  readonly lastModified: Timestamp;
}

interface RestoreOptions {
  readonly dryRun: boolean;
  readonly overwriteExisting: boolean;
  readonly createBackup: boolean;
  readonly validateChecksums: boolean;
  readonly skipLargeFiles: boolean;
  readonly maxFileSize: number;
}

interface RestoreResult {
  readonly sessionId: EntityId;
  readonly success: boolean;
  readonly filesRestored: number;
  readonly filesSkipped: number;
  readonly errors: readonly RestoreError[];
  readonly warnings: readonly string[];
  readonly performance: RestorePerformance;
}

interface RestoreError {
  readonly file: FilePath;
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
}

interface RestorePerformance {
  readonly startTime: Timestamp;
  readonly endTime: Timestamp;
  readonly totalDuration: number;
  readonly filesPerSecond: number;
  readonly bytesProcessed: number;
}

interface BackupMetadata {
  readonly id: string;
  readonly timestamp: Timestamp;
  readonly gitSha: string;
  readonly totalFiles: number;
  readonly totalSize: number;
  readonly tags: readonly string[];
}

interface RestoreFilter {
  readonly includePatterns?: readonly string[];
  readonly excludePatterns?: readonly string[];
  readonly modifiedAfter?: Timestamp;
  readonly modifiedBefore?: Timestamp;
  readonly maxFileSize?: number;
  readonly fileTypes?: readonly string[];
}

// ============================================================================
// INPUT VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate restore options
 */
function validateRestoreOptions(input: unknown): ApiResponse<RestoreOptions> {
  if (!input || typeof input !== 'object') {
    return createApiError('Restore options must be an object', 'VALIDATION_ERROR');
  }

  const options = input as Record<string, unknown>;

  const defaultOptions: RestoreOptions = {
    dryRun: Boolean(options.dryRun),
    overwriteExisting: Boolean(options.overwriteExisting ?? true),
    createBackup: Boolean(options.createBackup ?? true),
    validateChecksums: Boolean(options.validateChecksums ?? true),
    skipLargeFiles: Boolean(options.skipLargeFiles),
    maxFileSize: typeof options.maxFileSize === 'number' ? options.maxFileSize : 10 * 1024 * 1024, // 10MB
  };

  return createApiSuccess(defaultOptions);
}

/**
 * Validate restore files array
 */
function validateRestoreFiles(input: unknown): ApiResponse<RestoreFile[]> {
  if (!Array.isArray(input)) {
    return createApiError('Restore files must be an array', 'VALIDATION_ERROR');
  }

  const validatedFiles: RestoreFile[] = [];

  for (const file of input) {
    if (!file || typeof file !== 'object') {
      return createApiError('Each restore file must be an object', 'VALIDATION_ERROR');
    }

    const f = file as Record<string, unknown>;

    const pathResult = validationUtils.nonEmpty(f.path as string, 'file path');
    if (!apiUtils.isOk(pathResult)) {
      return pathResult as ApiResponse<RestoreFile[]>;
    }

    const contentResult = validationUtils.required(f.originalContent, 'original content');
    if (!apiUtils.isOk(contentResult)) {
      return contentResult as ApiResponse<RestoreFile[]>;
    }

    const size = typeof f.size === 'number' ? f.size : 0;
    const checksum = typeof f.checksum === 'string' ? f.checksum : '';
    const lastModified =
      typeof f.lastModified === 'string' ? (f.lastModified as Timestamp) : createTimestamp();

    validatedFiles.push({
      path: createFilePath(pathResult.data),
      originalContent: contentResult.data as string,
      size,
      checksum,
      lastModified,
    });
  }

  return createApiSuccess(validatedFiles);
}

/**
 * Validate backup metadata
 */
function validateBackupMetadata(input: unknown): ApiResponse<BackupMetadata> {
  if (!input || typeof input !== 'object') {
    return createApiError('Backup metadata must be an object', 'VALIDATION_ERROR');
  }

  const metadata = input as Record<string, unknown>;

  const idResult = validationUtils.nonEmpty(metadata.id as string, 'backup ID');
  if (!apiUtils.isOk(idResult)) {
    return idResult as ApiResponse<BackupMetadata>;
  }

  const timestampResult = validationUtils.nonEmpty(metadata.timestamp as string, 'timestamp');
  if (!apiUtils.isOk(timestampResult)) {
    return timestampResult as ApiResponse<BackupMetadata>;
  }

  const gitShaResult = validationUtils.nonEmpty(metadata.gitSha as string, 'git SHA');
  if (!apiUtils.isOk(gitShaResult)) {
    return gitShaResult as ApiResponse<BackupMetadata>;
  }

  return createApiSuccess({
    id: idResult.data,
    timestamp: timestampResult.data as Timestamp,
    gitSha: gitShaResult.data,
    totalFiles: typeof metadata.totalFiles === 'number' ? metadata.totalFiles : 0,
    totalSize: typeof metadata.totalSize === 'number' ? metadata.totalSize : 0,
    tags: Array.isArray(metadata.tags) ? (metadata.tags as string[]) : [],
  });
}

/**
 * Validate restore filter
 */
function validateRestoreFilter(input: unknown): ApiResponse<RestoreFilter> {
  if (!input) {
    return createApiSuccess({});
  }

  if (typeof input !== 'object') {
    return createApiError('Restore filter must be an object', 'VALIDATION_ERROR');
  }

  const filter = input as Record<string, unknown>;

  const result: RestoreFilter = {};

  if (Array.isArray(filter.includePatterns)) {
    result.includePatterns = filter.includePatterns as string[];
  }

  if (Array.isArray(filter.excludePatterns)) {
    result.excludePatterns = filter.excludePatterns as string[];
  }

  if (typeof filter.modifiedAfter === 'string') {
    result.modifiedAfter = filter.modifiedAfter as Timestamp;
  }

  if (typeof filter.modifiedBefore === 'string') {
    result.modifiedBefore = filter.modifiedBefore as Timestamp;
  }

  if (typeof filter.maxFileSize === 'number') {
    result.maxFileSize = filter.maxFileSize;
  }

  if (Array.isArray(filter.fileTypes)) {
    result.fileTypes = filter.fileTypes as string[];
  }

  return createApiSuccess(result);
}

// ============================================================================
// ENVIRONMENT DETECTION UTILITIES
// ============================================================================

/**
 * Check if file system APIs are available
 */
function checkFileSystemEnvironment(): ApiResponse<boolean> {
  const checks = [
    typeof fs.readFile === 'function',
    typeof fs.writeFile === 'function',
    typeof fs.mkdir === 'function',
    typeof fs.stat === 'function',
  ];

  if (!checks.every(Boolean)) {
    return createApiError('File system APIs not available', 'ENVIRONMENT_ERROR');
  }

  return createApiSuccess(true);
}

// ============================================================================
// RESTORE OPERATION FUNCTIONS
// ============================================================================

/**
 * Create restore session
 */
export function createRestoreSession(
  backupId: unknown,
  filesInput: unknown,
  optionsInput: unknown = {},
): ApiResponse<RestoreSession> {
  if (typeof backupId !== 'string' || !backupId.trim()) {
    return createApiError('Backup ID must be a non-empty string', 'VALIDATION_ERROR');
  }

  const filesResult = validateRestoreFiles(filesInput);
  if (!apiUtils.isOk(filesResult)) {
    return filesResult as ApiResponse<RestoreSession>;
  }

  const optionsResult = validateRestoreOptions(optionsInput);
  if (!apiUtils.isOk(optionsResult)) {
    return optionsResult as ApiResponse<RestoreSession>;
  }

  return safeUtils.execute(
    () => {
      const sessionId = createEntityId(
        `restore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      );
      const timestamp = createTimestamp();

      return {
        sessionId,
        backupId,
        timestamp,
        files: filesResult.data,
        options: optionsResult.data,
      };
    },
    'RESTORE_SESSION_CREATION_ERROR',
    contextUtils.sessionContext('createRestoreSession', backupId),
  );
}

/**
 * Restore files from session
 */
export async function restoreFiles(
  sessionInput: unknown,
  rootDir: unknown = process.cwd(),
  filterInput: unknown = {},
): Promise<ApiResponse<RestoreResult>> {
  if (!sessionInput || typeof sessionInput !== 'object') {
    return createApiError('Restore session must be an object', 'VALIDATION_ERROR');
  }

  if (typeof rootDir !== 'string' || !rootDir.trim()) {
    return createApiError('Root directory must be a non-empty string', 'VALIDATION_ERROR');
  }

  const filterResult = validateRestoreFilter(filterInput);
  if (!apiUtils.isOk(filterResult)) {
    return filterResult as ApiResponse<RestoreResult>;
  }

  const envCheck = checkFileSystemEnvironment();
  if (!apiUtils.isOk(envCheck)) {
    return envCheck as ApiResponse<RestoreResult>;
  }

  const session = sessionInput as RestoreSession;
  const filter = filterResult.data;

  return safeUtils.executeAsync(
    async () => {
      const startTime = createTimestamp();
      const errors: RestoreError[] = [];
      const warnings: string[] = [];
      let filesRestored = 0;
      let filesSkipped = 0;
      let bytesProcessed = 0;

      // Filter files based on criteria
      const filesToRestore = filterFiles(session.files, filter);

      if (session.options.dryRun) {
        console.log(`DRY RUN: Would restore ${filesToRestore.length} files`);
        filesToRestore.forEach((file) => {
          console.log(`  - ${file.path} (${file.size} bytes)`);
        });

        return createRestoreResult(
          session.sessionId,
          true,
          0,
          filesToRestore.length,
          errors,
          warnings,
          startTime,
          0,
        );
      }

      // Process each file
      for (const file of filesToRestore) {
        try {
          const result = await restoreFile(file, rootDir, session.options);

          if (result.success) {
            filesRestored++;
            bytesProcessed += file.size;
          } else {
            filesSkipped++;
            if (result.error) {
              errors.push(result.error);
            }
          }

          if (result.warning) {
            warnings.push(result.warning);
          }
        } catch (error) {
          filesSkipped++;
          errors.push({
            file: file.path,
            code: 'RESTORE_FAILED',
            message: error instanceof Error ? error.message : String(error),
            recoverable: false,
          });
        }
      }

      const success = errors.filter((e) => !e.recoverable).length === 0;
      return createRestoreResult(
        session.sessionId,
        success,
        filesRestored,
        filesSkipped,
        errors,
        warnings,
        startTime,
        bytesProcessed,
      );
    },
    'RESTORE_FILES_ERROR',
    contextUtils.sessionContext('restoreFiles', session.sessionId),
  );
}

/**
 * Restore from backup by ID
 */
export async function restoreFromBackup(
  backupId: unknown,
  backupDir: unknown,
  rootDir: unknown = process.cwd(),
  optionsInput: unknown = {},
  filterInput: unknown = {},
): Promise<ApiResponse<RestoreResult>> {
  if (typeof backupId !== 'string' || !backupId.trim()) {
    return createApiError('Backup ID must be a non-empty string', 'VALIDATION_ERROR');
  }

  if (typeof backupDir !== 'string' || !backupDir.trim()) {
    return createApiError('Backup directory must be a non-empty string', 'VALIDATION_ERROR');
  }

  if (typeof rootDir !== 'string' || !rootDir.trim()) {
    return createApiError('Root directory must be a non-empty string', 'VALIDATION_ERROR');
  }

  const envCheck = checkFileSystemEnvironment();
  if (!apiUtils.isOk(envCheck)) {
    return envCheck as ApiResponse<RestoreResult>;
  }

  return safeUtils.executeAsync(
    async () => {
      // Load backup data
      const backupLoadResult = await loadBackupData(backupId, backupDir);
      if (!apiUtils.isOk(backupLoadResult)) {
        throw new Error(backupLoadResult.error.message);
      }

      const backupData = backupLoadResult.data;

      // Create restore session
      const sessionResult = createRestoreSession(backupId, backupData.files, optionsInput);
      if (!apiUtils.isOk(sessionResult)) {
        throw new Error(sessionResult.error.message);
      }

      const session = sessionResult.data;

      // Restore files
      const restoreResult = await restoreFiles(session, rootDir, filterInput);
      if (!apiUtils.isOk(restoreResult)) {
        throw new Error(restoreResult.error.message);
      }

      return restoreResult.data;
    },
    'RESTORE_FROM_BACKUP_ERROR',
    contextUtils.sessionContext('restoreFromBackup', backupId),
  );
}

/**
 * List available backups
 */
export async function listBackups(backupDir: unknown): Promise<ApiResponse<BackupMetadata[]>> {
  if (typeof backupDir !== 'string' || !backupDir.trim()) {
    return createApiError('Backup directory must be a non-empty string', 'VALIDATION_ERROR');
  }

  const envCheck = checkFileSystemEnvironment();
  if (!apiUtils.isOk(envCheck)) {
    return envCheck as ApiResponse<BackupMetadata[]>;
  }

  return safeUtils.executeAsync(
    async () => {
      const backups: BackupMetadata[] = [];

      try {
        const sessionDirs = await fs.readdir(backupDir);

        for (const sessionDir of sessionDirs) {
          const sessionPath = path.join(backupDir, sessionDir);
          const stat = await fs.stat(sessionPath);

          if (stat.isDirectory()) {
            const backupFiles = (await fs.readdir(sessionPath)).filter(
              (f) => f.startsWith('backup-') && f.endsWith('.json'),
            );

            for (const backupFile of backupFiles) {
              const backupPath = path.join(sessionPath, backupFile);
              try {
                const metadata = await loadBackupMetadata(backupPath);
                if (metadata) {
                  backups.push(metadata);
                }
              } catch (error) {
                console.warn(`Could not load backup metadata from ${backupPath}: ${error}`);
              }
            }
          }
        }

        return backups.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
      } catch (error) {
        console.error(`Error listing backups: ${error}`);
        return [];
      }
    },
    'LIST_BACKUPS_ERROR',
    contextUtils.sessionContext('listBackups', backupDir),
  );
}

/**
 * Validate restore operation
 */
export function validateRestore(
  sessionInput: unknown,
  rootDir: unknown,
): ApiResponse<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskLevel: RiskLevel;
}> {
  if (!sessionInput || typeof sessionInput !== 'object') {
    return createApiError('Restore session must be an object', 'VALIDATION_ERROR');
  }

  if (typeof rootDir !== 'string' || !rootDir.trim()) {
    return createApiError('Root directory must be a non-empty string', 'VALIDATION_ERROR');
  }

  return safeUtils.execute(
    () => {
      const session = sessionInput as RestoreSession;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate session structure
      if (!session.sessionId || !session.backupId || !Array.isArray(session.files)) {
        errors.push('Invalid restore session structure');
      }

      // Check for large files
      const largeFiles = session.files.filter((f) => f.size > session.options.maxFileSize);
      if (largeFiles.length > 0) {
        warnings.push(`${largeFiles.length} files exceed size limit and will be skipped`);
      }

      // Check for potential conflicts
      if (session.options.overwriteExisting) {
        warnings.push('Existing files will be overwritten');
      }

      // Check backup validation
      if (!session.options.createBackup) {
        warnings.push('No backup will be created before restore');
      }

      // Assess risk level
      let riskLevel: RiskLevel;
      if (errors.length > 0) riskLevel = 'critical';
      else if (session.files.length > 100 && session.options.overwriteExisting) riskLevel = 'high';
      else if (warnings.length > 2) riskLevel = 'medium';
      else riskLevel = 'low';

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel,
      };
    },
    'RESTORE_VALIDATION_ERROR',
    contextUtils.sessionContext('validateRestore', session.sessionId),
  );
}

// ============================================================================
// PRIVATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Filter files based on restore criteria
 */
function filterFiles(files: readonly RestoreFile[], filter: RestoreFilter): RestoreFile[] {
  return files.filter((file) => {
    // Include patterns
    if (filter.includePatterns && filter.includePatterns.length > 0) {
      const matchesInclude = filter.includePatterns.some((pattern) =>
        new RegExp(pattern).test(file.path),
      );
      if (!matchesInclude) return false;
    }

    // Exclude patterns
    if (filter.excludePatterns && filter.excludePatterns.length > 0) {
      const matchesExclude = filter.excludePatterns.some((pattern) =>
        new RegExp(pattern).test(file.path),
      );
      if (matchesExclude) return false;
    }

    // File size filter
    if (filter.maxFileSize && file.size > filter.maxFileSize) {
      return false;
    }

    // File type filter
    if (filter.fileTypes && filter.fileTypes.length > 0) {
      const extension = path.extname(file.path).slice(1);
      if (!filter.fileTypes.includes(extension)) {
        return false;
      }
    }

    // Date filters
    if (filter.modifiedAfter) {
      if (new Date(file.lastModified) < new Date(filter.modifiedAfter)) {
        return false;
      }
    }

    if (filter.modifiedBefore) {
      if (new Date(file.lastModified) > new Date(filter.modifiedBefore)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Restore single file
 */
async function restoreFile(
  file: RestoreFile,
  rootDir: string,
  options: RestoreOptions,
): Promise<{
  success: boolean;
  error?: RestoreError;
  warning?: string;
}> {
  try {
    const fullPath = path.resolve(rootDir, file.path);

    // Check if file exists and handle overwrite policy
    let fileExists = false;
    try {
      await fs.stat(fullPath);
      fileExists = true;
    } catch {
      // File doesn't exist
    }

    if (fileExists && !options.overwriteExisting) {
      return {
        success: false,
        warning: `File ${file.path} exists and overwrite is disabled`,
      };
    }

    // Create backup if requested and file exists
    if (fileExists && options.createBackup) {
      const backupPath = `${fullPath}.restore-backup-${Date.now()}`;
      try {
        const existingContent = await fs.readFile(fullPath, 'utf-8');
        await fs.writeFile(backupPath, existingContent, 'utf-8');
      } catch (error) {
        return {
          success: false,
          warning: `Failed to create backup for ${file.path}: ${error}`,
        };
      }
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Validate checksum if enabled
    if (options.validateChecksums && file.checksum) {
      const crypto = await import('crypto');
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(file.originalContent)
        .digest('hex');
      if (expectedChecksum !== file.checksum) {
        return {
          success: false,
          error: {
            file: file.path,
            code: 'CHECKSUM_MISMATCH',
            message: `Checksum validation failed for ${file.path}`,
            recoverable: false,
          },
        };
      }
    }

    // Write file content
    await fs.writeFile(fullPath, file.originalContent, 'utf-8');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        file: file.path,
        code: 'RESTORE_FAILED',
        message: error instanceof Error ? error.message : String(error),
        recoverable: true,
      },
    };
  }
}

/**
 * Load backup data from backup directory
 */
async function loadBackupData(
  backupId: string,
  backupDir: string,
): Promise<ApiResponse<{ files: RestoreFile[]; metadata: BackupMetadata }>> {
  return safeUtils.executeAsync(
    async () => {
      // Find backup file
      const sessionDirs = await fs.readdir(backupDir);
      let backupPath: string | null = null;

      for (const sessionDir of sessionDirs) {
        const sessionPath = path.join(backupDir, sessionDir);
        const stat = await fs.stat(sessionPath);

        if (stat.isDirectory()) {
          const backupFiles = await fs.readdir(sessionPath);
          const matchingBackup = backupFiles.find(
            (f) => f.includes(backupId) && f.endsWith('.json'),
          );

          if (matchingBackup) {
            backupPath = path.join(sessionPath, matchingBackup);
            break;
          }
        }
      }

      if (!backupPath) {
        throw new Error(`Backup with ID ${backupId} not found`);
      }

      // Load backup data
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData = JSON.parse(backupContent);

      if (!Array.isArray(backupData)) {
        throw new Error('Invalid backup data format');
      }

      const files: RestoreFile[] = backupData.map((entry: any) => ({
        path: createFilePath(entry.filePath),
        originalContent: entry.originalContent,
        size: Buffer.byteLength(entry.originalContent, 'utf-8'),
        checksum: entry.checksum || '',
        lastModified: (entry.timestamp as Timestamp) || createTimestamp(),
      }));

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: backupData[0]?.timestamp || createTimestamp(),
        gitSha: backupData[0]?.gitSha || 'unknown',
        totalFiles: files.length,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        tags: [],
      };

      return { files, metadata };
    },
    'LOAD_BACKUP_DATA_ERROR',
    contextUtils.sessionContext('loadBackupData', backupId),
  );
}

/**
 * Load backup metadata from backup file
 */
async function loadBackupMetadata(backupPath: string): Promise<BackupMetadata | null> {
  try {
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    const backupData = JSON.parse(backupContent);

    if (!Array.isArray(backupData) || backupData.length === 0) {
      return null;
    }

    const firstEntry = backupData[0];
    const totalSize = backupData.reduce(
      (sum: number, entry: any) => sum + Buffer.byteLength(entry.originalContent || '', 'utf-8'),
      0,
    );

    return {
      id: path.basename(backupPath, '.json'),
      timestamp: firstEntry.timestamp || createTimestamp(),
      gitSha: firstEntry.gitSha || 'unknown',
      totalFiles: backupData.length,
      totalSize,
      tags: firstEntry.tags || [],
    };
  } catch (error) {
    console.warn(`Failed to load backup metadata from ${backupPath}: ${error}`);
    return null;
  }
}

/**
 * Create restore result
 */
function createRestoreResult(
  sessionId: EntityId,
  success: boolean,
  filesRestored: number,
  filesSkipped: number,
  errors: readonly RestoreError[],
  warnings: readonly string[],
  startTime: Timestamp,
  bytesProcessed: number,
): RestoreResult {
  const endTime = createTimestamp();
  const totalDuration = new Date(endTime).getTime() - new Date(startTime).getTime();
  const filesPerSecond = totalDuration > 0 ? filesRestored / (totalDuration / 1000) : 0;

  return {
    sessionId,
    success,
    filesRestored,
    filesSkipped,
    errors,
    warnings,
    performance: {
      startTime,
      endTime,
      totalDuration,
      filesPerSecond,
      bytesProcessed,
    },
  };
}
