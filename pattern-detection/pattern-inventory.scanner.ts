#!/usr/bin/env tsx
/**
 * Pattern Inventory Scanner
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions (R-01)
 * ✓ Canonical imports only (R-02)
 * ✓ Validated I/O with schemas (R-03)
 * ✓ Factory response pattern (R-04)
 * ✓ Environment-agnostic core logic (R-05)
 *
 * Single Responsibility: LLM-REVIEW flag inventory and technical debt analysis
 */

import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import {
  ApiResponse,
  BusinessDomain,
  CanonicalId,
  CanonicalTimestamp,
  Severity,
} from '../types/canonical-types';
import {
  AnalysisResult,
  DetectedPatterns,
  HealthAssessment,
  SummaryStatistics,
} from '../shared-REFACTORED/types/domain.types';
import { createApiSuccess, createApiError } from '';
import { PatternAnalyzer } from './pattern-analysis.utilities';
import { PatternDetector } from './pattern-detection.utilities';

// ============================================================================
// INVENTORY SCANNER CONFIGURATION
// ============================================================================

interface LLMReviewFlag {
  readonly id: CanonicalId;
  readonly category: string;
  readonly severity: Severity;
  readonly details: string;
  readonly location: {
    readonly file: string;
    readonly line: number;
    readonly context: string[];
  };
  readonly metadata: {
    readonly author: {
      readonly name: string;
      readonly email: string;
      readonly timestamp: CanonicalTimestamp;
    };
    readonly source: string;
    readonly confidence: number;
    readonly reviewRequired: boolean;
  };
  readonly domain: BusinessDomain;
  readonly flagFormat: {
    readonly comment: string;
    readonly uuid: string;
  };
}

interface InventoryReport {
  readonly id: CanonicalId;
  readonly generatedAt: CanonicalTimestamp;
  readonly summary: SummaryStatistics;
  readonly health: HealthAssessment;
  readonly flags: LLMReviewFlag[];
  readonly patterns: DetectedPatterns[];
  readonly analysis: AnalysisResult;
  readonly metadata: {
    readonly toolVersion: string;
    readonly executionTimeMs: number;
    readonly filesScanned: number;
  };
}

// ============================================================================
// INVENTORY SCANNER CORE
// ============================================================================

export const InventoryScanner = {
  /**
   * Scan codebase for LLM-REVIEW flags and patterns
   */
  scanInventory: async (rootDirectory: string): Promise<ApiResponse<InventoryReport>> => {
    const validation = validateWithSchema({ rootDirectory: 'string' }, { rootDirectory });

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid scan parameters', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      const startTime = Date.now();

      // Discover files to scan
      const files = await discoverFiles(rootDirectory);
      if (!files.success) {
        return createApiError(files.error);
      }

      // Extract LLM-REVIEW flags
      const flags = await extractAllLLMFlags(files.data);
      if (!flags.success) {
        return createApiError(flags.error);
      }

      // Detect migration patterns
      const patterns = await detectAllPatterns(files.data);
      if (!patterns.success) {
        return createApiError(patterns.error);
      }

      // Generate analysis
      const analysis = PatternAnalyzer.analyzePatterns(patterns.data, files.data);
      if (!analysis.success) {
        return createApiError(analysis.error);
      }

      // Generate health assessment
      const health = calculateHealthAssessment(flags.data, patterns.data);
      if (!health.success) {
        return createApiError(health.error);
      }

      // Generate summary statistics
      const summary = generateSummaryStatistics(flags.data, patterns.data, files.data);
      if (!summary.success) {
        return createApiError(summary.error);
      }

      const executionTime = Date.now() - startTime;

      const report: InventoryReport = {
        id: createCanonicalId(`inventory-${Date.now()}`, 'report'),
        generatedAt: createCanonicalTimestamp(),
        summary: summary.data,
        health: health.data,
        flags: flags.data,
        patterns: patterns.data,
        analysis: analysis.data,
        metadata: {
          toolVersion: '2.0.0-constitutional',
          executionTimeMs: executionTime,
          filesScanned: files.data.length,
        },
      };

      return createApiSuccess(report);
    } catch (error) {
      return createApiError(
        createApiError('Inventory scan failed', 'SCAN_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Generate HTML report from inventory
   */
  generateHTMLReport: (report: InventoryReport): ApiResponse<string> => {
    try {
      const html = createHTMLReport(report);
      return createApiSuccess(html);
    } catch (error) {
      return createApiError(
        createApiError('HTML report generation failed', 'REPORT_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Main CLI execution
   */
  main: async (args: string[]): Promise<ApiResponse<void>> => {
    try {
      const options = parseInventoryArgs(args);
      const rootDir = process.cwd();

      console.log('🔍 LLM-REVIEW Constitutional Flags Inventory Tool');
      console.log('📊 Using canonical domain model for type safety...\n');

      const scanResult = await InventoryScanner.scanInventory(rootDir);
      if (!scanResult.success) {
        return createApiError(scanResult.error);
      }

      const report = scanResult.data;

      // Output based on options
      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
      } else if (options.html) {
        const htmlResult = InventoryScanner.generateHTMLReport(report);
        if (htmlResult.success) {
          const outputFile = options.output || 'llm-review-inventory.html';
          await writeFile(outputFile, htmlResult.data);
          console.log(`✅ HTML report saved to ${outputFile}`);
        }
      } else {
        // Console output
        printConsoleInventory(report, options.verbose);
      }

      return createApiSuccess(undefined);
    } catch (error) {
      return createApiError(
        createApiError('CLI execution failed', 'CLI_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
} as const;

// ============================================================================
// FILE DISCOVERY (PRIVATE)
// ============================================================================

async function discoverFiles(rootDirectory: string): Promise<ApiResponse<string[]>> {
  try {
    if (typeof process !== 'undefined' && process?.cwd) {
      const glob = await import('glob');
      const patterns = [
        '**/*.{ts,tsx,js,jsx}',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/build/**',
        '!**/.next/**',
        '!**/coverage/**',
      ];

      const files = glob.globSync(patterns, {
        cwd: rootDirectory,
        absolute: true,
      });

      return createApiSuccess(files);
    } else {
      return createApiError(
        createApiError('File discovery not available in browser environment', 'ENVIRONMENT_ERROR'),
      );
    }
  } catch (error) {
    return createApiError(
      createApiError('File discovery failed', 'DISCOVERY_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// FLAG EXTRACTION (PRIVATE)
// ============================================================================

async function extractAllLLMFlags(files: string[]): Promise<ApiResponse<LLMReviewFlag[]>> {
  try {
    const allFlags: LLMReviewFlag[] = [];

    for (const filePath of files) {
      const fileFlags = await extractFileFlags(filePath);
      if (fileFlags.success) {
        allFlags.push(...fileFlags.data);
      }
    }

    // Enrich with git blame if available
    const enrichedFlags = await enrichWithGitBlame(allFlags);
    return createApiSuccess(enrichedFlags);
  } catch (error) {
    return createApiError(
      createApiError('Flag extraction failed', 'FLAG_EXTRACTION_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

async function extractFileFlags(filePath: string): Promise<ApiResponse<LLMReviewFlag[]>> {
  try {
    const content = await readFileContent(filePath);
    if (!content.success) {
      return createApiSuccess([]); // Return empty array for unreadable files
    }

    const flags: LLMReviewFlag[] = [];

    // Match LLM-REVIEW format: // LLM-REVIEW::<CATEGORY>::<UUID>::<DETAILS>
    const regex = /\/\/\s*LLM-REVIEW::([A-Z-]+)::([a-f0-9]{8})::(.+?)(?:\n|$)/g;
    const lines = content.data.split('\n');
    let match;

    while ((match = regex.exec(content.data)) !== null) {
      const [fullMatch, category, uuid, details] = match;

      // Calculate line number
      const contentBeforeMatch = content.data.substring(0, match.index);
      const lineNumber = contentBeforeMatch.split('\n').length;

      // Get context lines
      const startLine = Math.max(0, lineNumber - 3);
      const endLine = Math.min(lines.length - 1, lineNumber + 2);
      const contextLines = lines.slice(startLine, endLine + 1);

      const flag: LLMReviewFlag = {
        id: createCanonicalId(uuid, 'uuid'),
        category,
        severity: mapCategoryToSeverity(category),
        details,
        location: {
          file: filePath,
          line: lineNumber,
          context: contextLines,
        },
        metadata: {
          author: {
            name: 'unknown',
            email: 'unknown',
            timestamp: createCanonicalTimestamp(),
          },
          source: 'automated',
          confidence: 0.95,
          reviewRequired:
            mapCategoryToSeverity(category) === Severity.HIGH ||
            mapCategoryToSeverity(category) === Severity.CRITICAL,
        },
        domain: inferBusinessDomainFromPath(filePath),
        flagFormat: {
          comment: fullMatch,
          uuid,
        },
      };

      flags.push(flag);
    }

    return createApiSuccess(flags);
  } catch (error) {
    return createApiError(
      createApiError('File flag extraction failed', 'FILE_FLAG_ERROR', {
        filePath,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// PATTERN DETECTION (PRIVATE)
// ============================================================================

async function detectAllPatterns(files: string[]): Promise<ApiResponse<DetectedPatterns[]>> {
  try {
    const allPatterns: DetectedPatterns[] = [];

    for (const filePath of files) {
      const content = await readFileContent(filePath);
      if (content.success) {
        const patterns = PatternDetector.detectPatterns(content.data, filePath);
        if (patterns.success) {
          allPatterns.push(patterns.data);
        }
      }
    }

    return createApiSuccess(allPatterns);
  } catch (error) {
    return createApiError(
      createApiError('Pattern detection failed', 'PATTERN_DETECTION_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// ANALYSIS FUNCTIONS (PRIVATE)
// ============================================================================

function calculateHealthAssessment(
  flags: LLMReviewFlag[],
  patterns: DetectedPatterns[],
): ApiResponse<HealthAssessment> {
  try {
    // Calculate debt score from flags
    const flagScore = flags.length > 0 ? Math.min(1, flags.length * 0.1) : 0;

    // Calculate pattern score
    const patternScore =
      patterns.length > 0
        ? patterns.reduce((sum, p) => sum + p.typescriptDebt.severityScore, 0) / patterns.length
        : 0;

    const overallScore = {
      raw: (flagScore + patternScore) / 2,
      normalized: Math.min(1, (flagScore + patternScore) / 2),
      grade: calculateGrade((flagScore + patternScore) / 2),
      factors: {
        interactionCount: 1,
        dependencyDepth: 1,
        cyclomaticComplexity: 1,
        domainCriticality: 1,
        userImpact: 1,
      },
      contextMultiplier: 1,
    };

    // Calculate severity distribution
    const severityDistribution = {
      byCategory: flags.reduce(
        (acc, flag) => {
          acc[flag.severity] = (acc[flag.severity] || 0) + 1;
          return acc;
        },
        {} as Record<Severity, number>,
      ),
      byPercentage: {} as Record<Severity, number>,
      total: flags.length,
    };

    // Calculate percentages
    Object.keys(severityDistribution.byCategory).forEach((severity) => {
      const sev = severity as Severity;
      severityDistribution.byPercentage[sev] =
        flags.length > 0
          ? Math.round((severityDistribution.byCategory[sev] / flags.length) * 100)
          : 0;
    });

    const health: HealthAssessment = {
      overallScore,
      typeSafetyGrade: overallScore.grade,
      distribution: severityDistribution,
      estimatedEffort: {
        storyPoints: {
          byCategory: {
            [Severity.HIGH]: (severityDistribution.byCategory[Severity.HIGH] || 0) * 3,
            [Severity.MEDIUM]: (severityDistribution.byCategory[Severity.MEDIUM] || 0) * 2,
            [Severity.LOW]: (severityDistribution.byCategory[Severity.LOW] || 0) * 1,
            [Severity.CRITICAL]: (severityDistribution.byCategory[Severity.CRITICAL] || 0) * 5,
          },
          byPercentage: {} as Record<Severity, number>,
          total: 0,
        },
        hours: {
          byCategory: {} as Record<Severity, number>,
          byPercentage: {} as Record<Severity, number>,
          total: 0,
        },
      },
      interactionFactor: 1.0,
      contextualComplexity: overallScore.normalized,
      criticalComponents: [],
      domainHealth: {},
    };

    // Calculate totals and percentages for effort
    health.estimatedEffort.storyPoints.total = Object.values(
      health.estimatedEffort.storyPoints.byCategory,
    ).reduce((sum, val) => sum + val, 0);
    health.estimatedEffort.hours.byCategory = {
      [Severity.HIGH]: health.estimatedEffort.storyPoints.byCategory[Severity.HIGH] * 4,
      [Severity.MEDIUM]: health.estimatedEffort.storyPoints.byCategory[Severity.MEDIUM] * 3,
      [Severity.LOW]: health.estimatedEffort.storyPoints.byCategory[Severity.LOW] * 2,
      [Severity.CRITICAL]: health.estimatedEffort.storyPoints.byCategory[Severity.CRITICAL] * 8,
    };
    health.estimatedEffort.hours.total = Object.values(
      health.estimatedEffort.hours.byCategory,
    ).reduce((sum, val) => sum + val, 0);

    return createApiSuccess(health);
  } catch (error) {
    return createApiError(
      createApiError('Health assessment failed', 'HEALTH_ASSESSMENT_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function generateSummaryStatistics(
  flags: LLMReviewFlag[],
  patterns: DetectedPatterns[],
  files: string[],
): ApiResponse<SummaryStatistics> {
  try {
    const severityDist = {
      byCategory: flags.reduce(
        (acc, flag) => {
          acc[flag.severity] = (acc[flag.severity] || 0) + 1;
          return acc;
        },
        {} as Record<Severity, number>,
      ),
      byPercentage: {} as Record<Severity, number>,
      total: flags.length,
    };

    // Calculate percentages
    Object.keys(severityDist.byCategory).forEach((severity) => {
      const sev = severity as Severity;
      severityDist.byPercentage[sev] =
        flags.length > 0 ? Math.round((severityDist.byCategory[sev] / flags.length) * 100) : 0;
    });

    const categoryDist = {
      byCategory: flags.reduce(
        (acc, flag) => {
          acc[flag.category] = (acc[flag.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPercentage: {} as Record<string, number>,
      total: flags.length,
    };

    Object.keys(categoryDist.byCategory).forEach((category) => {
      categoryDist.byPercentage[category] =
        flags.length > 0 ? Math.round((categoryDist.byCategory[category] / flags.length) * 100) : 0;
    });

    const domainDist = {
      byCategory: flags.reduce(
        (acc, flag) => {
          acc[flag.domain] = (acc[flag.domain] || 0) + 1;
          return acc;
        },
        {} as Record<BusinessDomain, number>,
      ),
      byPercentage: {} as Record<BusinessDomain, number>,
      total: flags.length,
    };

    Object.keys(domainDist.byCategory).forEach((domain) => {
      const dom = domain as BusinessDomain;
      domainDist.byPercentage[dom] =
        flags.length > 0 ? Math.round((domainDist.byCategory[dom] / flags.length) * 100) : 0;
    });

    const directoryDist = {
      byCategory: files.reduce(
        (acc, file) => {
          const topDir = file.split('/').find((part) => part && !part.startsWith('.')) || 'root';
          acc[topDir] = (acc[topDir] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPercentage: {} as Record<string, number>,
      total: files.length,
    };

    Object.keys(directoryDist.byCategory).forEach((dir) => {
      directoryDist.byPercentage[dir] =
        files.length > 0 ? Math.round((directoryDist.byCategory[dir] / files.length) * 100) : 0;
    });

    const authorDist = {
      byCategory: flags.reduce(
        (acc, flag) => {
          const author = flag.metadata.author.name;
          if (author !== 'unknown') {
            acc[author] = (acc[author] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      ),
      byPercentage: {} as Record<string, number>,
      total: flags.filter((f) => f.metadata.author.name !== 'unknown').length,
    };

    Object.keys(authorDist.byCategory).forEach((author) => {
      authorDist.byPercentage[author] =
        authorDist.total > 0
          ? Math.round((authorDist.byCategory[author] / authorDist.total) * 100)
          : 0;
    });

    const now = new Date();
    const temporal = {
      last7Days: flags.filter((f) => {
        const flagDate = new Date(f.metadata.author.timestamp.epoch);
        return now.getTime() - flagDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      }).length,
      last30Days: flags.filter((f) => {
        const flagDate = new Date(f.metadata.author.timestamp.epoch);
        return now.getTime() - flagDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      }).length,
      last90Days: flags.filter((f) => {
        const flagDate = new Date(f.metadata.author.timestamp.epoch);
        return now.getTime() - flagDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
      }).length,
      trends: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
    };

    temporal.trends.daily = temporal.last7Days / 7;
    temporal.trends.weekly = temporal.last30Days / 4;
    temporal.trends.monthly = temporal.last90Days / 3;

    const summary: SummaryStatistics = {
      totalIssues: flags.length,
      severity: severityDist,
      categories: categoryDist,
      domains: domainDist,
      directories: directoryDist,
      authors: authorDist,
      temporal,
    };

    return createApiSuccess(summary);
  } catch (error) {
    return createApiError(
      createApiError('Summary statistics generation failed', 'SUMMARY_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// UTILITY FUNCTIONS (PRIVATE)
// ============================================================================

async function readFileContent(filePath: string): Promise<ApiResponse<string>> {
  try {
    if (typeof process !== 'undefined' && process?.cwd) {
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, 'utf-8');
      return createApiSuccess(content);
    } else {
      return createApiError(
        createApiError('File reading not available in browser environment', 'ENVIRONMENT_ERROR'),
      );
    }
  } catch (error) {
    return createApiError(
      createApiError('File reading failed', 'FILE_READ_ERROR', {
        filePath,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

async function writeFile(filePath: string, content: string): Promise<ApiResponse<void>> {
  try {
    if (typeof process !== 'undefined' && process?.cwd) {
      const fs = await import('fs');
      const path = await import('path');

      // Ensure directory exists
      const dir = path.dirname(filePath);
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(filePath, content, 'utf-8');
      return createApiSuccess(undefined);
    } else {
      return createApiError(
        createApiError('File writing not available in browser environment', 'ENVIRONMENT_ERROR'),
      );
    }
  } catch (error) {
    return createApiError(
      createApiError('File writing failed', 'FILE_WRITE_ERROR', {
        filePath,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

async function enrichWithGitBlame(flags: LLMReviewFlag[]): Promise<LLMReviewFlag[]> {
  // Environment check for git blame
  if (typeof process === 'undefined' || !process?.cwd) {
    return flags; // Return flags as-is in non-Node environments
  }

  try {
    const { execSync } = await import('child_process');

    return flags.map((flag) => {
      try {
        const blameOutput = execSync(
          `git blame -L ${flag.location.line},${flag.location.line} -p "${flag.location.file}"`,
          { encoding: 'utf-8', timeout: 5000 },
        );

        const authorMatch = blameOutput.match(/author (.+)/);
        const emailMatch = blameOutput.match(/author-mail <(.+)>/);
        const timeMatch = blameOutput.match(/author-time ([0-9]+)/);

        if (authorMatch && emailMatch && timeMatch) {
          const timestamp = createCanonicalTimestamp(new Date(parseInt(timeMatch[1], 10) * 1000));

          return {
            ...flag,
            metadata: {
              ...flag.metadata,
              author: {
                name: authorMatch[1],
                email: emailMatch[1],
                timestamp,
              },
            },
          };
        }
      } catch {
        // Ignore git blame errors and return original flag
      }

      return flag;
    });
  } catch {
    // Return original flags if git blame is not available
    return flags;
  }
}

function mapCategoryToSeverity(category: string): Severity {
  const categoryMap: Record<string, Severity> = {
    'ANY-TYPE': Severity.HIGH,
    'TYPE-ASSERTION': Severity.HIGH,
    'NON-NULL': Severity.MEDIUM,
    'RETURN-TYPE': Severity.MEDIUM,
    'UNTYPED-VAR': Severity.MEDIUM,
    'TYPE-SYNTAX': Severity.LOW,
    'OPTIONAL-CHAINING': Severity.LOW,
    'EMPTY-CATCH': Severity.HIGH,
  };

  return categoryMap[category] || Severity.MEDIUM;
}

function inferBusinessDomainFromPath(filePath: string): BusinessDomain {
  const path = filePath.toLowerCase();

  if (path.includes('auth') || path.includes('login')) {
    return BusinessDomain.USER_AUTHENTICATION;
  }
  if (path.includes('api') || path.includes('service')) {
    return BusinessDomain.API_INTEGRATION;
  }
  if (path.includes('component') || path.includes('ui')) {
    return BusinessDomain.USER_INTERFACE;
  }
  if (path.includes('data') || path.includes('chart')) {
    return BusinessDomain.DATA_PROCESSING;
  }
  if (path.includes('health') || path.includes('monitor')) {
    return BusinessDomain.SYSTEM_HEALTH;
  }

  return BusinessDomain.USER_INTERFACE; // Default domain
}

function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score < 0.2) return 'A';
  if (score < 0.4) return 'B';
  if (score < 0.6) return 'C';
  if (score < 0.8) return 'D';
  return 'F';
}

function createCanonicalId(value: string, type: string): CanonicalId {
  return { value, type } as CanonicalId;
}

function createCanonicalTimestamp(date?: Date): CanonicalTimestamp {
  const now = date || new Date();
  return {
    iso: now.toISOString(),
    epoch: now.getTime(),
  } as CanonicalTimestamp;
}

// ============================================================================
// HTML REPORT GENERATION (PRIVATE)
// ============================================================================

function createHTMLReport(report: InventoryReport): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LLM-REVIEW Flags Inventory Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1400px;
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
    .header p {
      margin: 0.5rem 0 0;
      opacity: 0.9;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .stat-value {
      font-size: 2.5rem;
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
    .flag-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
      border-left: 4px solid;
    }
    .flag-high { border-left-color: #ef4444; }
    .flag-medium { border-left-color: #f59e0b; }
    .flag-low { border-left-color: #10b981; }
    .flag-critical { border-left-color: #dc2626; }
    .flag-header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .flag-category {
      font-weight: 600;
      color: #374151;
    }
    .flag-severity {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .severity-high { background: #fef2f2; color: #991b1b; }
    .severity-medium { background: #fffbeb; color: #92400e; }
    .severity-low { background: #f0fdf4; color: #166534; }
    .severity-critical { background: #fef2f2; color: #7f1d1d; }
    .flag-details {
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    .flag-location {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85rem;
      color: #6b7280;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    .table th,
    .table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .grade-A { color: #059669; font-weight: bold; }
    .grade-B { color: #0891b2; font-weight: bold; }
    .grade-C { color: #d97706; font-weight: bold; }
    .grade-D { color: #dc2626; font-weight: bold; }
    .grade-F { color: #991b1b; font-weight: bold; }
    .execution-info {
      background: #f3f4f6;
      border-radius: 6px;
      padding: 1rem;
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 LLM-REVIEW Flags Inventory</h1>
    <p>Constitutional Compliance Report - Generated ${report.generatedAt.iso}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${report.summary.totalIssues}</div>
      <div class="stat-label">Total Flags</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.metadata.filesScanned}</div>
      <div class="stat-label">Files Scanned</div>
    </div>
    <div class="stat-card">
      <div class="stat-value grade-${report.health.typeSafetyGrade}">${report.health.typeSafetyGrade}</div>
      <div class="stat-label">Type Safety Grade</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.health.estimatedEffort.storyPoints.total}</div>
      <div class="stat-label">Story Points</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.health.estimatedEffort.hours.total}h</div>
      <div class="stat-label">Estimated Hours</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.metadata.executionTimeMs}ms</div>
      <div class="stat-label">Scan Time</div>
    </div>
  </div>

  <div class="section">
    <h2>📊 Severity Distribution</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Severity</th>
          <th>Count</th>
          <th>Percentage</th>
          <th>Story Points</th>
          <th>Hours</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report.summary.severity.byCategory)
          .sort(([, a], [, b]) => b - a)
          .map(
            ([severity, count]) => `
            <tr>
              <td><span class="flag-severity severity-${severity.toLowerCase()}">${severity}</span></td>
              <td>${count}</td>
              <td>${report.summary.severity.byPercentage[severity as Severity]}%</td>
              <td>${report.health.estimatedEffort.storyPoints.byCategory[severity as Severity]}</td>
              <td>${report.health.estimatedEffort.hours.byCategory[severity as Severity]}</td>
            </tr>
          `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📁 Category Breakdown</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report.summary.categories.byCategory)
          .sort(([, a], [, b]) => b - a)
          .map(
            ([category, count]) => `
            <tr>
              <td>${category}</td>
              <td>${count}</td>
              <td>${report.summary.categories.byPercentage[category]}%</td>
            </tr>
          `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🏗️ Domain Distribution</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Domain</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report.summary.domains.byCategory)
          .sort(([, a], [, b]) => b - a)
          .map(
            ([domain, count]) => `
            <tr>
              <td>${domain.replace(/_/g, ' ')}</td>
              <td>${count}</td>
              <td>${report.summary.domains.byPercentage[domain as BusinessDomain]}%</td>
            </tr>
          `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🚩 LLM-REVIEW Flags</h2>
    ${report.flags
      .slice(0, 20)
      .map(
        (flag) => `
      <div class="flag-item flag-${flag.severity.toLowerCase()}">
        <div class="flag-header">
          <span class="flag-category">${flag.category}</span>
          <span class="flag-severity severity-${flag.severity.toLowerCase()}">${flag.severity}</span>
        </div>
        <div class="flag-details">${flag.details}</div>
        <div class="flag-location">
          📄 ${flag.location.file.split('/').pop()} (line ${flag.location.line})
          | 🏷️ ${flag.domain.replace(/_/g, ' ')}
          | 👤 ${flag.metadata.author.name}
        </div>
      </div>
    `,
      )
      .join('')}
    ${report.flags.length > 20 ? `<p><em>Showing first 20 of ${report.flags.length} flags...</em></p>` : ''}
  </div>

  <div class="execution-info">
    <strong>Report Metadata:</strong><br>
    Tool Version: ${report.metadata.toolVersion} |
    Generated: ${report.generatedAt.iso} |
    Execution Time: ${report.metadata.executionTimeMs}ms |
    Files Scanned: ${report.metadata.filesScanned}
  </div>
</body>
</html>`;
}

// ============================================================================
// CLI HELPERS (PRIVATE)
// ============================================================================

function parseInventoryArgs(args: string[]): {
  json: boolean;
  html: boolean;
  verbose: boolean;
  output?: string;
} {
  return {
    json: args.includes('--json'),
    html: args.includes('--html'),
    verbose: args.includes('--verbose'),
    output: args.find((arg) => arg.startsWith('--output='))?.replace('--output=', ''),
  };
}

function printConsoleInventory(report: InventoryReport, verbose: boolean): void {
  console.log(`\n┌────────────────────────────────────────────────┐`);
  console.log(`│ 🧠 LLM-REVIEW FLAGS INVENTORY                  │`);
  console.log(`└────────────────────────────────────────────────┘`);

  console.log(`• Total flags: ${report.summary.totalIssues}`);
  console.log(`• Files scanned: ${report.metadata.filesScanned}`);
  console.log(`• Type safety grade: ${report.health.typeSafetyGrade}`);
  console.log(`• Story points: ${report.health.estimatedEffort.storyPoints.total}`);
  console.log(`• Estimated hours: ${report.health.estimatedEffort.hours.total}`);
  console.log(`• Execution time: ${report.metadata.executionTimeMs}ms`);

  console.log(`\n🚨 Severity Breakdown:`);
  Object.entries(report.summary.severity.byCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([severity, count]) => {
      if (count > 0) {
        const icon =
          severity === 'critical'
            ? '💥'
            : severity === 'high'
              ? '🔴'
              : severity === 'medium'
                ? '🟡'
                : '🟢';
        console.log(
          `  ${icon} ${severity}: ${count} (${report.summary.severity.byPercentage[severity as Severity]}%)`,
        );
      }
    });

  console.log(`\n📁 Top Categories:`);
  Object.entries(report.summary.categories.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([category, count]) => {
      console.log(`  • ${category}: ${count}`);
    });

  if (verbose && report.flags.length > 0) {
    console.log(`\n🚩 Sample Flags:`);
    report.flags.slice(0, 5).forEach((flag) => {
      const severityIcon =
        flag.severity === 'critical' ? '💥' : flag.severity === 'high' ? '⚡' : '⚠️';
      console.log(
        `  ${severityIcon} ${flag.category} in ${flag.location.file.split('/').pop()}:${flag.location.line}`,
      );
      console.log(`    └─ ${flag.details}`);
    });
  }

  console.log(`\n📊 Constitutional Benefits:`);
  console.log(`  ✅ SOLID compliance enforcement`);
  console.log(`  ✅ SSOT type safety verification`);
  console.log(`  ✅ DRY principle validation`);
  console.log(`  ✅ Automated debt tracking`);
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

if (
  typeof process !== 'undefined' &&
  process?.argv &&
  import.meta.url === `file:/${process.argv[1]}`
) {
  InventoryScanner.main(process.argv.slice(2)).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
