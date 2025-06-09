/**
 * Backup Manager Utility - Pure Functions
 *
 * SRP: Backup operations only
 * - No local types (uses canonical types)
 * - Validates all inputs with schemas
 * - Returns via createApiSuccess/err pattern
 * - Environment detection for APIs
 */

import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// CANONICAL TYPE IMPORTS ONLY
import { ApiResponse, EntityId, FilePath, Timestamp } from '';

import { createEntityId, createTimestamp } from '';

// VALIDATION IMPORTS
import { apiUtils, contextUtils, safeUtils } from '@/utilities/result-utilities';
import { FilePath, createApiError, createApiSuccess, createTimestamp, EntityId, Timestamp } from '../types/canonical-types';


// Backup session interface (minimal, focused)
interface BackupSession {
  readonly id: EntityId;
  readonly timestamp: Timestamp;
  readonly gitSha: string;
  readonly files: readonly BackupFile[];
  readonly metadata: BackupMetadata;
}

interface BackupFile {
  readonly path: FilePath;
  readonly originalContent: string;
  readonly size: number;
  readonly checksum: string;
}

interface BackupMetadata {
  readonly totalFiles: number;
  readonly totalSize: number;
  readonly compressionRatio: number;
  readonly tags: readonly string[];
}

interface BackupManagerConfig {
  readonly backupDir: string;
  readonly rootDir: string;
  readonly maxRetentionDays: number;
}

/**
 * Validate backup manager configuration
 */
function validateConfig(config: unknown): ApiResponse<BackupManagerConfig> {
  if (!config || typeof config !== 'object') {
    return createApiError('Config must be an object', 'VALIDATION_ERROR');
  }

  const c = config as Record<string, unknown>;

  if (typeof c.backupDir !== 'string' || !c.backupDir.trim()) {
    return createApiError('backupDir must be a non-empty string', 'VALIDATION_ERROR');
  }

  if (typeof c.rootDir !== 'string' || !c.rootDir.trim()) {
    return createApiError('rootDir must be a non-empty string', 'VALIDATION_ERROR');
  }

  const maxRetentionDays = typeof c.maxRetentionDays === 'number' ? c.maxRetentionDays : 30;

  return createApiSuccess({
    backupDir: c.backupDir,
    rootDir: c.rootDir,
    maxRetentionDays,
  });
}

/**
 * Validate file list input
 */
function validateFileList(files: unknown): ApiResponse<string[]> {
  if (!Array.isArray(files)) {
    return createApiError('Files must be an array', 'VALIDATION_ERROR');
  }

  for (const file of files) {
    if (typeof file !== 'string' || !file.trim()) {
      return createApiError('All files must be non-empty strings', 'VALIDATION_ERROR');
    }
  }

  return createApiSuccess(files as string[]);
}

/**
 * Get Git SHA safely with environment detection
 */
function getGitSha(): string {
  // Environment detection
  if (typeof execSync !== 'function') {
    return crypto.createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 8);
  }

  return (
    safeUtils.execute(
      () => execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim(),
      'GIT_SHA_ERROR',
    ).data || crypto.createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 8)
  );
}

/**
 * Create backup session
 */
export async function createBackup(
  filesInput: unknown,
  configInput: unknown,
): Promise<ApiResponse<BackupSession>> {
  // Validate inputs
  const configResult = validateConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<BackupSession>;
  }

  const filesResult = validateFileList(filesInput);
  if (!apiUtils.isOk(filesResult)) {
    return filesResult as ApiResponse<BackupSession>;
  }

  const config = configResult.data;
  const files = filesResult.data;

  return safeUtils.executeAsync(
    async () => {
      const gitSha = getGitSha();
      const timestamp = createTimestamp();
      const sessionId = createEntityId(`${gitSha}-${Date.now()}`);

      const backupFiles: BackupFile[] = [];
      let totalSize = 0;

      // Environment detection for fs APIs
      if (typeof fs.readFile !== 'function') {
        throw new Error('File system APIs not available');
      }

      // Process each file
      for (const filePath of files) {
        try {
          const fullPath = path.resolve(config.rootDir, filePath);
          const content = await fs.readFile(fullPath, 'utf-8');
          const size = Buffer.byteLength(content, 'utf-8');
          const checksum = crypto.createHash('sha256').update(content).digest('hex');

          backupFiles.push({
            path: filePath as FilePath,
            originalContent: content,
            size,
            checksum,
          });

          totalSize += size;
        } catch (error) {
          console.warn(`Failed to backup file ${filePath}: ${error}`);
        }
      }

      // Create session directory
      const sessionDir = path.join(config.backupDir, gitSha);
      await fs.mkdir(sessionDir, { recursive: true });

      // Save backup data
      const backupFilePath = path.join(
        sessionDir,
        `backup-${timestamp.replace(/[:.]/g, '-')}.json`,
      );
      const backupData = backupFiles.map((file) => ({
        filePath: file.path,
        originalContent: file.originalContent,
        timestamp,
        gitSha,
      }));

      await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');

      // Calculate metadata
      const metadata: BackupMetadata = {
        totalFiles: backupFiles.length,
        totalSize,
        compressionRatio: 1.0,
        tags: generateTags(backupFiles),
      };

      return {
        id: sessionId,
        gitSha,
        timestamp,
        files: backupFiles,
        metadata,
      };
    },
    'BACKUP_CREATION_ERROR',
    contextUtils.sessionContext('createBackup', sessionId),
  );
}

/**
 * List backup sessions
 */
export async function listSessions(configInput: unknown): Promise<ApiResponse<BackupSession[]>> {
  const configResult = validateConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<BackupSession[]>;
  }

  const config = configResult.data;

  return safeUtils.executeAsync(
    async () => {
      // Environment detection
      if (typeof fs.readdir !== 'function') {
        throw new Error('File system APIs not available');
      }

      const sessions: BackupSession[] = [];
      const sessionDirs = await fs.readdir(config.backupDir);

      for (const sessionDir of sessionDirs) {
        const sessionPath = path.join(config.backupDir, sessionDir);
        const stat = await fs.stat(sessionPath);

        if (stat.isDirectory()) {
          const backupFiles = (await fs.readdir(sessionPath)).filter(
            (f) => f.startsWith('backup-') && f.endsWith('.json'),
          );

          if (backupFiles.length > 0) {
            const latestBackup = backupFiles.sort().reverse()[0];
            const backupPath = path.join(sessionPath, latestBackup);

            try {
              const session = await loadSession(backupPath);
              if (session) {
                sessions.push(session);
              }
            } catch (error) {
              console.warn(`Could not load backup session ${backupPath}: ${error}`);
            }
          }
        }
      }

      return sessions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    },
    'LIST_SESSIONS_ERROR',
    contextUtils.sessionContext('listSessions', 'system'),
  );
}

/**
 * Get specific backup session
 */
export async function getSession(
  gitSha: unknown,
  configInput: unknown,
): Promise<ApiResponse<BackupSession | null>> {
  if (typeof gitSha !== 'string' || !gitSha.trim()) {
    return createApiError('Git SHA must be a non-empty string', 'VALIDATION_ERROR');
  }

  const configResult = validateConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<BackupSession | null>;
  }

  const config = configResult.data;

  return safeUtils.executeAsync(
    async () => {
      const sessionPath = path.join(config.backupDir, gitSha);
      const files = await fs.readdir(sessionPath);
      const backupFiles = files
        .filter((f) => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (backupFiles.length === 0) return null;

      const latestBackup = backupFiles[0];
      const backupPath = path.join(sessionPath, latestBackup);

      return await loadSession(backupPath);
    },
    'GET_SESSION_ERROR',
    contextUtils.sessionContext('getSession', gitSha),
  );
}

/**
 * Restore files from backup
 */
export async function restoreFiles(
  filesInput: unknown,
  configInput: unknown,
  filterFn?: (file: BackupFile) => boolean,
): Promise<ApiResponse<{ restored: number; errors: string[] }>> {
  if (!Array.isArray(filesInput)) {
    return createApiError('Files must be an array', 'VALIDATION_ERROR');
  }

  const configResult = validateConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<{ restored: number; errors: string[] }>;
  }

  const config = configResult.data;
  const files = filesInput as BackupFile[];

  return safeUtils.executeAsync(
    async () => {
      const result = { restored: 0, errors: [] as string[] };
      const filesToRestore = filterFn ? files.filter(filterFn) : files;

      for (const file of filesToRestore) {
        try {
          const fullPath = path.resolve(config.rootDir, file.path);

          // Ensure directory exists
          await fs.mkdir(path.dirname(fullPath), { recursive: true });

          // Verify checksum if available
          if (file.checksum) {
            const expectedChecksum = crypto
              .createHash('sha256')
              .update(file.originalContent)
              .digest('hex');
            if (expectedChecksum !== file.checksum) {
              result.errors.push(`Checksum mismatch for ${file.path}`);
              continue;
            }
          }

          // Restore file content
          await fs.writeFile(fullPath, file.originalContent, 'utf-8');
          result.restored++;
        } catch (error) {
          result.errors.push(`Failed to restore ${file.path}: ${error}`);
        }
      }

      return result;
    },
    'RESTORE_FILES_ERROR',
    contextUtils.sessionContext('restoreFiles', 'batch'),
  );
}

/**
 * Delete backup session
 */
export async function deleteSession(
  gitSha: unknown,
  configInput: unknown,
): Promise<ApiResponse<boolean>> {
  if (typeof gitSha !== 'string' || !gitSha.trim()) {
    return createApiError('Git SHA must be a non-empty string', 'VALIDATION_ERROR');
  }

  const configResult = validateConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<boolean>;
  }

  const config = configResult.data;

  return safeUtils.executeAsync(
    async () => {
      const sessionPath = path.join(config.backupDir, gitSha);
      await fs.rm(sessionPath, { recursive: true, force: true });
      return true;
    },
    'DELETE_SESSION_ERROR',
    contextUtils.sessionContext('deleteSession', gitSha),
  );
}

/**
 * Cleanup old backups
 */
export async function cleanup(
  configInput: unknown,
  maxAge: number = 30 * 24 * 60 * 60 * 1000,
): Promise<ApiResponse<number>> {
  const configResult = validateConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<number>;
  }

  const config = configResult.data;

  return safeUtils.executeAsync(
    async () => {
      const sessionsResult = await listSessions(config);
      if (!apiUtils.isOk(sessionsResult)) {
        throw new Error(sessionsResult.error.message);
      }

      const sessions = sessionsResult.data;
      const cutoffDate = new Date(Date.now() - maxAge);
      let deletedCount = 0;

      for (const session of sessions) {
        if (new Date(session.timestamp) < cutoffDate) {
          const deleteResult = await deleteSession(session.gitSha, config);
          if (apiUtils.isOk(deleteResult) && deleteResult.data) {
            deletedCount++;
          }
        }
      }

      return deletedCount;
    },
    'CLEANUP_ERROR',
    contextUtils.sessionContext('cleanup', 'system'),
  );
}

// ============================================================================
// PRIVATE UTILITIES
// ============================================================================

/**
 * Load session from backup file
 */
async function loadSession(backupPath: string): Promise<BackupSession | null> {
  try {
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf-8'));

    if (!Array.isArray(backupData) || backupData.length === 0) {
      return null;
    }

    const firstEntry = backupData[0];
    const files: BackupFile[] = backupData.map((entry: any) => ({
      path: entry.filePath as FilePath,
      originalContent: entry.originalContent,
      size: Buffer.byteLength(entry.originalContent, 'utf-8'),
      checksum: crypto.createHash('sha256').update(entry.originalContent).digest('hex'),
    }));

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const metadata: BackupMetadata = {
      totalFiles: files.length,
      totalSize,
      compressionRatio: 1.0,
      tags: generateTags(files),
    };

    return {
      id: createEntityId(`${firstEntry.gitSha}-${new Date(firstEntry.timestamp).getTime()}`),
      gitSha: firstEntry.gitSha,
      timestamp: firstEntry.timestamp as Timestamp,
      files,
      metadata,
    };
  } catch (error) {
    console.error(`Failed to load backup session from ${backupPath}: ${error}`);
    return null;
  }
}

/**
 * Generate tags for backup files
 */
function generateTags(files: readonly BackupFile[]): readonly string[] {
  const tags: string[] = [];

  // File type tags
  const extensions = new Set(files.map((f) => path.extname(f.path)));
  extensions.forEach((ext) => {
    if (ext) tags.push(`files:${ext.slice(1)}`);
  });

  // Size tags
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 1024 * 1024) tags.push('size:large');
  else if (totalSize > 1024 * 100) tags.push('size:medium');
  else tags.push('size:small');

  return tags;
}
