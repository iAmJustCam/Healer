/**
 * Pattern Scanning Utilities
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions (R-01)
 * ✓ Canonical imports only (R-02)
 * ✓ Validated I/O with schemas (R-03)
 * ✓ Factory response pattern (R-04)
 * ✓ Environment-agnostic (R-05)
 *
 * Single Responsibility: File system scanning and pattern discovery
 */

import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import { ApiResponse, DirectoryPath } from '';
import {
  DetectedPatterns,
  ScanOptions,
  ScanResult,
} from '../shared-REFACTORED/types/domain.types';
import { createApiSuccess, createApiError } from '';
import { PatternAnalyzer } from './pattern-analysis.utilities';
import { PatternDetector } from './pattern-detection.utilities';

// ============================================================================
// SCANNING CONFIGURATION
// ============================================================================

const DEFAULT_INCLUDE_PATTERNS = [
  '**/*.{ts,tsx,js,jsx}',
  '**/*.css',
  '**/*.scss',
  '**/tailwind.config.{js,ts}',
  '**/next.config.{js,ts,mjs}',
  '**/tsconfig.json',
];

const DEFAULT_EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/.git/**',
  '**/out/**',
  '**/.turbo/**',
];

// ============================================================================
// PATTERN SCANNER CORE
// ============================================================================

export const PatternScanner = {
  /**
   * Scan directory for migration patterns
   */
  scanDirectory: async (
    directoryPath: string,
    options: Partial<ScanOptions> = {},
  ): Promise<ApiResponse<ScanResult>> => {
    const validation = validateWithSchema(
      { directoryPath: 'string', options: 'object' },
      { directoryPath, options },
    );

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid scan parameters', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      // Validate directory exists (environment check)
      if (typeof process !== 'undefined' && process?.cwd) {
        const fs = await importNodeFS();
        if (!fs || !fs.existsSync(directoryPath)) {
          return createApiError(
            createApiError(`Directory not found: ${directoryPath}`, 'DIRECTORY_NOT_FOUND'),
          );
        }
      }

      const scanOptions: ScanOptions = {
        includePatterns: options.includePatterns || DEFAULT_INCLUDE_PATTERNS,
        excludePatterns: options.excludePatterns || DEFAULT_EXCLUDE_PATTERNS,
        maxDepth: options.maxDepth || 10,
        followSymlinks: options.followSymlinks || false,
        includeTests: options.includeTests || false,
      };

      const files = await discoverFiles(directoryPath, scanOptions);
      const patterns = await scanFiles(files);
      const analysis = PatternAnalyzer.analyzePatterns(patterns, files);

      if (!analysis.success) {
        return createApiError(analysis.error);
      }

      const result: ScanResult = {
        directoryPath: directoryPath as DirectoryPath,
        filesScanned: files.length,
        patternsFound: patterns,
        analysis: analysis.data,
        executionTime: Date.now(), // Simplified timing
      };

      return createApiSuccess(result);
    } catch (error) {
      return createApiError(
        createApiError('Directory scan failed', 'SCAN_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Scan individual file for patterns
   */
  scanFile: async (filePath: string): Promise<ApiResponse<DetectedPatterns>> => {
    const validation = validateWithSchema({ filePath: 'string' }, { filePath });

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid file path', 'VALIDATION_ERROR', { validation: validation.error }),
      );
    }

    try {
      const content = await readFileContent(filePath);
      if (!content.success) {
        return createApiError(content.error);
      }

      const patterns = PatternDetector.detectPatterns(content.data, filePath);
      return patterns;
    } catch (error) {
      return createApiError(
        createApiError('File scan failed', 'FILE_SCAN_ERROR', {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Scan multiple files in batch
   */
  scanFiles: async (filePaths: string[]): Promise<ApiResponse<DetectedPatterns[]>> => {
    const validation = validateWithSchema({ filePaths: 'array' }, { filePaths });

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid file paths array', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      const results: DetectedPatterns[] = [];
      const errors: string[] = [];

      for (const filePath of filePaths) {
        const scanResult = await PatternScanner.scanFile(filePath);
        if (scanResult.success) {
          results.push(scanResult.data);
        } else {
          errors.push(`${filePath}: ${scanResult.error.message}`);
        }
      }

      if (errors.length > 0 && results.length === 0) {
        return createApiError(
          createApiError('All file scans failed', 'BATCH_SCAN_ERROR', { errors }),
        );
      }

      return createApiSuccess(results);
    } catch (error) {
      return createApiError(
        createApiError('Batch scan failed', 'BATCH_SCAN_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Generate scan report
   */
  generateReport: async (
    scanResult: ScanResult,
    format: 'json' | 'html' = 'json',
  ): Promise<ApiResponse<string>> => {
    try {
      let report: string;

      if (format === 'html') {
        report = generateHTMLReport(scanResult);
      } else {
        report = JSON.stringify(scanResult, null, 2);
      }

      return createApiSuccess(report);
    } catch (error) {
      return createApiError(
        createApiError('Report generation failed', 'REPORT_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
} as const;

// ============================================================================
// FILE DISCOVERY (PRIVATE)
// ============================================================================

async function discoverFiles(directoryPath: string, options: ScanOptions): Promise<string[]> {
  // Environment-specific file discovery
  if (typeof process !== 'undefined' && process?.cwd) {
    return discoverFilesNode(directoryPath, options);
  } else {
    // Browser environment - would need different implementation
    throw new Error('File discovery not available in browser environment');
  }
}

async function discoverFilesNode(directoryPath: string, options: ScanOptions): Promise<string[]> {
  try {
    // Dynamic import for Node.js environment
    const glob = await import('glob');
    const path = await import('path');

    const files: string[] = [];

    for (const pattern of options.includePatterns) {
      const matches = glob.globSync(pattern, {
        cwd: directoryPath,
        ignore: options.excludePatterns,
        maxDepth: options.maxDepth,
        follow: options.followSymlinks,
        absolute: true,
      });
      files.push(...matches);
    }

    // Remove duplicates and filter
    const uniqueFiles = [...new Set(files)];

    if (!options.includeTests) {
      return uniqueFiles.filter(
        (file) =>
          !file.includes('.test.') && !file.includes('.spec.') && !file.includes('__tests__'),
      );
    }

    return uniqueFiles;
  } catch (error) {
    throw new Error(
      `File discovery failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function scanFiles(files: string[]): Promise<DetectedPatterns[]> {
  const patterns: DetectedPatterns[] = [];

  for (const file of files) {
    try {
      const content = await readFileContent(file);
      if (content.success) {
        const filePatterns = PatternDetector.detectPatterns(content.data, file);
        if (filePatterns.success) {
          patterns.push(filePatterns.data);
        }
      }
    } catch (error) {
      // Continue with other files if one fails
      console.warn(`Failed to scan ${file}: ${error}`);
    }
  }

  return patterns;
}

// ============================================================================
// FILE I/O HELPERS (PRIVATE)
// ============================================================================

async function readFileContent(filePath: string): Promise<ApiResponse<string>> {
  try {
    // Environment detection for file reading
    if (typeof process !== 'undefined' && process?.cwd) {
      const fs = await importNodeFS();
      if (!fs) {
        return createApiError(createApiError('File system not available', 'FS_NOT_AVAILABLE'));
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return createApiSuccess(content);
    } else if (typeof window !== 'undefined' && window?.fs?.readFile) {
      // Browser environment with file system API
      const content = await window.fs.readFile(filePath, { encoding: 'utf8' });
      return createApiSuccess(content);
    } else {
      return createApiError(
        createApiError(
          'File reading not supported in this environment',
          'ENVIRONMENT_NOT_SUPPORTED',
        ),
      );
    }
  } catch (error) {
    return createApiError(
      createApiError('Failed to read file', 'FILE_READ_ERROR', {
        filePath,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

async function importNodeFS(): Promise<any> {
  try {
    if (typeof process !== 'undefined' && process?.cwd) {
      return await import('fs');
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// REPORT GENERATION (PRIVATE)
// ============================================================================

function generateHTMLReport(scanResult: ScanResult): string {
  const { analysis, filesScanned, patternsFound } = scanResult;

  const severityCounts = analysis.findings.reduce(
    (acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalPatterns = patternsFound.reduce((total, pattern) => {
    return (
      total +
      (pattern.react19.modernizationPotential > 0 ? 1 : 0) +
      (pattern.nextjs153.modernizationPotential > 0 ? 1 : 0) +
      (pattern.typescript58.modernizationPotential > 0 ? 1 : 0) +
      (pattern.tailwind41.modernizationPotential > 0 ? 1 : 0) +
      (pattern.typescriptDebt.modernizationPotential > 0 ? 1 : 0)
    );
  }, 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Migration Pattern Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f8fafc;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #667eea;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .section h2 {
      color: #374151;
      margin-top: 0;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    .findings-list {
      list-style: none;
      padding: 0;
    }
    .finding-item {
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 6px;
      border-left: 4px solid;
    }
    .finding-high {
      background: #fef2f2;
      border-color: #ef4444;
    }
    .finding-medium {
      background: #fffbeb;
      border-color: #f59e0b;
    }
    .finding-low {
      background: #f0fdf4;
      border-color: #10b981;
    }
    .finding-critical {
      background: #fdf2f8;
      border-color: #ec4899;
    }
    .recommendation {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .recommendation-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .priority-high { border-left: 4px solid #ef4444; }
    .priority-medium { border-left: 4px solid #f59e0b; }
    .priority-low { border-left: 4px solid #10b981; }
    .execution-time {
      color: #6b7280;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Migration Pattern Analysis</h1>
    <p>Comprehensive analysis of framework migration patterns</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${filesScanned}</div>
      <div class="stat-label">Files Scanned</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${totalPatterns}</div>
      <div class="stat-label">Patterns Found</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analysis.findings.length}</div>
      <div class="stat-label">Issues Identified</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${analysis.summary.technicalDebt.estimatedEffort}h</div>
      <div class="stat-label">Estimated Effort</div>
    </div>
  </div>

  <div class="section">
    <h2>📊 Analysis Summary</h2>
    <p><strong>Total Files:</strong> ${analysis.summary.totalFiles}</p>
    <p><strong>Lines of Code:</strong> ${analysis.summary.linesOfCode.toLocaleString()}</p>
    <p><strong>Technical Debt Score:</strong> ${analysis.summary.technicalDebt.score}/100</p>
    <p><strong>Business Impact:</strong> ${analysis.summary.businessImpact.userImpact}</p>
    <p><strong>Estimated Downtime:</strong> ${analysis.summary.businessImpact.downtime} minutes</p>
  </div>

  <div class="section">
    <h2>🚨 Critical Findings</h2>
    <ul class="findings-list">
      ${analysis.findings
        .map(
          (finding) => `
        <li class="finding-item finding-${finding.severity.toLowerCase()}">
          <strong>${finding.description}</strong><br>
          <small>Location: ${finding.location} | Type: ${finding.type}</small>
          ${finding.evidence.length > 0 ? `<br><small>Evidence: ${finding.evidence.join(', ')}</small>` : ''}
        </li>
      `,
        )
        .join('')}
    </ul>
  </div>

  <div class="section">
    <h2>💡 Recommendations</h2>
    ${analysis.recommendations
      .map(
        (rec) => `
      <div class="recommendation priority-${rec.priority <= 1 ? 'high' : rec.priority <= 2 ? 'medium' : 'low'}">
        <div class="recommendation-title">${rec.title}</div>
        <p>${rec.description}</p>
        <small>Priority: ${rec.priority} | Effort: ${rec.effort} | Impact: ${rec.impact} | Category: ${rec.category}</small>
      </div>
    `,
      )
      .join('')}
  </div>

  <div class="section">
    <h2>📈 Trends Analysis</h2>
    ${analysis.trends
      .map(
        (trend) => `
      <div style="margin-bottom: 1rem;">
        <strong>${trend.metric}:</strong>
        <span style="color: ${trend.direction === 'improving' ? '#10b981' : trend.direction === 'degrading' ? '#ef4444' : '#6b7280'}">
          ${trend.direction}
        </span>
        (Rate: ${(trend.rate * 100).toFixed(1)}%, Confidence: ${(trend.confidence * 100).toFixed(0)}%)
      </div>
    `,
      )
      .join('')}
  </div>

  <div class="section">
    <h2>🎯 Risk Distribution</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
      ${Object.entries(analysis.summary.riskDistribution)
        .map(
          ([risk, count]) => `
        <div class="stat-card" style="text-align: center;">
          <div class="stat-value" style="color: ${getRiskColor(risk)}">${count}</div>
          <div class="stat-label">${risk} Risk</div>
        </div>
      `,
        )
        .join('')}
    </div>
  </div>

  <div class="section">
    <h2>🏗️ Affected Domains</h2>
    <ul>
      ${analysis.summary.businessImpact.domains
        .map(
          (domain) => `
        <li>${domain.replace(/_/g, ' ')}</li>
      `,
        )
        .join('')}
    </ul>
  </div>

  <div class="section">
    <h2>⚙️ Critical Systems</h2>
    <ul>
      ${analysis.summary.businessImpact.criticalSystems
        .map(
          (system) => `
        <li><code>${system}</code></li>
      `,
        )
        .join('')}
    </ul>
  </div>

  <div class="execution-time">
    Report generated in ${scanResult.executionTime}ms
  </div>
</body>
</html>`;
}

function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case 'critical':
      return '#ec4899';
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#6b7280';
  }
}

// ============================================================================
// VALIDATION HELPERS (PRIVATE)
// ============================================================================

function validateScanOptions(options: Partial<ScanOptions>): ApiResponse<ScanOptions> {
  try {
    const validated: ScanOptions = {
      includePatterns: Array.isArray(options.includePatterns)
        ? options.includePatterns
        : DEFAULT_INCLUDE_PATTERNS,
      excludePatterns: Array.isArray(options.excludePatterns)
        ? options.excludePatterns
        : DEFAULT_EXCLUDE_PATTERNS,
      maxDepth:
        typeof options.maxDepth === 'number' && options.maxDepth > 0 ? options.maxDepth : 10,
      followSymlinks: typeof options.followSymlinks === 'boolean' ? options.followSymlinks : false,
      includeTests: typeof options.includeTests === 'boolean' ? options.includeTests : false,
    };

    return createApiSuccess(validated);
  } catch (error) {
    return createApiError(
      createApiError('Invalid scan options', 'VALIDATION_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const ScanUtils = {
  /**
   * Get default include patterns
   */
  getDefaultIncludePatterns: (): string[] => [...DEFAULT_INCLUDE_PATTERNS],

  /**
   * Get default exclude patterns
   */
  getDefaultExcludePatterns: (): string[] => [...DEFAULT_EXCLUDE_PATTERNS],

  /**
   * Check if file should be scanned based on patterns
   */
  shouldScanFile: (filePath: string, options: ScanOptions): boolean => {
    // Check if file matches include patterns
    const includeMatch = options.includePatterns.some((pattern) =>
      matchesPattern(filePath, pattern),
    );

    if (!includeMatch) return false;

    // Check if file matches exclude patterns
    const excludeMatch = options.excludePatterns.some((pattern) =>
      matchesPattern(filePath, pattern),
    );

    if (excludeMatch) return false;

    // Check test file exclusion
    if (!options.includeTests && isTestFile(filePath)) {
      return false;
    }

    return true;
  },

  /**
   * Estimate scan complexity
   */
  estimateScanComplexity: (fileCount: number, options: ScanOptions): 'low' | 'medium' | 'high' => {
    let complexity = fileCount * 0.1;

    if (options.maxDepth > 5) complexity *= 1.2;
    if (options.followSymlinks) complexity *= 1.3;
    if (options.includeTests) complexity *= 1.1;

    if (complexity < 10) return 'low';
    if (complexity < 50) return 'medium';
    return 'high';
  },
} as const;

// ============================================================================
// PATTERN MATCHING HELPERS (PRIVATE)
// ============================================================================

function matchesPattern(filePath: string, pattern: string): boolean {
  // Simple pattern matching - could be enhanced with glob library
  if (pattern.includes('**')) {
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\{([^}]+)\}/g, '($1)')
      .replace(/,/g, '|');
    return new RegExp(regex).test(filePath);
  }

  return filePath.includes(pattern.replace(/\*/g, ''));
}

function isTestFile(filePath: string): boolean {
  return (
    /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath) ||
    filePath.includes('__tests__') ||
    filePath.includes('/tests/') ||
    filePath.includes('/test/')
  );
}
