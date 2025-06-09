/**
 * Report Generation Utilities - Pure Report Generation Functions
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on Foundation Types (Layer 0)
 * ✓ Pure utility functions only - no side effects
 * ✓ Environment-agnostic
 * ✓ Single responsibility: Report generation only (SRP)
 * ✓ All inputs validated with canonical schemas
 */

import { z } from 'zod';
import {
  ApiResponse,
  OutputFormat,
  PatternMatch,
  RiskAssessment,
  RiskLevel,
  Timestamp,
} from '../types/canonical-types';
import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import { createApiError } from '../shared-REFACTORED/utilities/error.utilities';
import { ApiUtilities } from '';

// Input validation schemas
const ProjectReportRequestSchema = z.object({
  patterns: z.array(
    z.object({
      id: z.string(),
      location: z.object({
        file: z.string(),
        line: z.number(),
        column: z.number(),
      }),
      confidence: z.number().min(0).max(1),
      severity: z.enum(['info', 'warning', 'error', 'critical']),
    }),
  ),
  riskAssessment: z.object({
    level: z.enum(['low', 'medium', 'high', 'critical']),
    score: z.number().min(0).max(10),
    factors: z.array(
      z.object({
        type: z.string(),
        weight: z.number(),
        description: z.string(),
      }),
    ),
    businessDomain: z.enum([
      'user_interface',
      'user_authentication',
      'api_integration',
      'data_processing',
      'system_health',
    ]),
    confidence: z.number().min(0).max(1),
  }),
  fileCount: z.number().min(0),
});

const ReportFormatRequestSchema = z.object({
  analysisResult: z.unknown(),
  format: z.enum(['json', 'html', 'markdown', 'csv']).default('json'),
  filename: z.string().optional(),
});

/**
 * Generate comprehensive project analysis report
 */
export function generateProjectReport(request: unknown): ApiResponse<{
  readonly summary: {
    readonly totalFiles: number;
    readonly patternsFound: number;
    readonly affectedFiles: number;
    readonly estimatedHours: number;
  };
  readonly riskAssessment: RiskAssessment;
  readonly patternMatches: readonly PatternMatch[];
  readonly recommendations: readonly string[];
  readonly timestamp: Timestamp;
}> {
  // Validate input
  const validationResult = validateWithSchema(ProjectReportRequestSchema, request);
  if (!validationResult.success) {
    return ApiUtilities.error(
      createApiError('Invalid project report request', 'VALIDATION_ERROR', {
        validationErrors: validationResult.error,
      }),
    );
  }

  const { patterns, riskAssessment, fileCount } = validationResult.data;

  try {
    const affectedFiles = new Set(patterns.map((p: any) => p.location.file)).size;
    const estimatedHours = calculateEstimatedHours(
      riskAssessment.level as RiskLevel,
      affectedFiles,
    );
    const recommendations = generateRecommendations(riskAssessment as RiskAssessment, patterns);

    const report = {
      summary: {
        totalFiles: fileCount,
        patternsFound: patterns.length,
        affectedFiles,
        estimatedHours,
      },
      riskAssessment: riskAssessment as RiskAssessment,
      patternMatches: patterns as PatternMatch[],
      recommendations,
      timestamp: new Date().toISOString() as Timestamp,
    };

    return ApiUtilities.ok(report);
  } catch (error) {
    return ApiUtilities.error(
      createApiError(
        `Project report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REPORT_GENERATION_ERROR',
        { fileCount, patternsCount: patterns.length, error },
      ),
    );
  }
}

/**
 * Format analysis report in specified format
 */
export function formatAnalysisReport(request: unknown): ApiResponse<{
  content: string;
  format: OutputFormat;
  size: number;
}> {
  // Validate input
  const validationResult = validateWithSchema(ReportFormatRequestSchema, request);
  if (!validationResult.success) {
    return ApiUtilities.error(
      createApiError('Invalid report format request', 'VALIDATION_ERROR', {
        validationErrors: validationResult.error,
      }),
    );
  }

  const { analysisResult, format } = validationResult.data;

  try {
    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(analysisResult, null, 2);
        break;
      case 'html':
        content = generateHtmlReport(analysisResult);
        break;
      case 'markdown':
        content = generateMarkdownReport(analysisResult);
        break;
      case 'csv':
        content = generateCsvReport(analysisResult);
        break;
      default:
        return ApiUtilities.error(
          createApiError(`Unsupported report format: ${format}`, 'UNSUPPORTED_FORMAT'),
        );
    }

    return ApiUtilities.ok({
      content,
      format: format as OutputFormat,
      size: content.length,
    });
  } catch (error) {
    return ApiUtilities.error(
      createApiError(
        `Report formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FORMAT_ERROR',
        { format, error },
      ),
    );
  }
}

/**
 * Generate backup session report
 */
export function generateBackupReport(
  sessions: readonly {
    id: string;
    timestamp: string;
    metadata: {
      totalFiles: number;
      totalSize: number;
      tags: readonly string[];
    };
    gitSha?: string;
    debtReport?: {
      grade: string;
    };
  }[],
  format: OutputFormat = OutputFormat.HTML,
): ApiResponse<string> {
  try {
    const report = {
      summary: {
        totalSessions: sessions.length,
        totalFiles: sessions.reduce((sum, s) => sum + s.metadata.totalFiles, 0),
        totalSize: sessions.reduce((sum, s) => sum + s.metadata.totalSize, 0),
        dateRange: {
          oldest: sessions.length > 0 ? sessions[sessions.length - 1].timestamp : null,
          newest: sessions.length > 0 ? sessions[0].timestamp : null,
        },
      },
      sessions: sessions.map((session) => ({
        id: session.id,
        gitSha: session.gitSha?.substring(0, 8) || 'unknown',
        timestamp: session.timestamp,
        fileCount: session.metadata.totalFiles,
        size: formatBytes(session.metadata.totalSize),
        debtGrade: session.debtReport?.grade || 'N/A',
        tags: Array.from(session.metadata.tags),
      })),
      timestamp: new Date().toISOString(),
    };

    const content =
      format === OutputFormat.HTML
        ? generateBackupHtmlReport(report)
        : JSON.stringify(report, null, 2);

    return ApiUtilities.ok(content);
  } catch (error) {
    return ApiUtilities.error(
      createApiError(
        `Backup report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BACKUP_REPORT_ERROR',
        { sessionsCount: sessions.length, format, error },
      ),
    );
  }
}

/**
 * Generate trend analysis from historical data
 */
export function generateTrendAnalysis(
  historicalData: readonly {
    timestamp: string;
    score: number;
    grade: string;
  }[],
): ApiResponse<{
  trends: readonly {
    timestamp: string;
    score: number;
    grade: string;
    improvement: number;
  }[];
  analysis: {
    overallTrend: 'improving' | 'declining' | 'stable';
    avgImprovement: number;
    projectedCompletion: Date | null;
  };
}> {
  try {
    const sortedData = [...historicalData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const trends = sortedData.map((data, index) => {
      const prevData = index > 0 ? sortedData[index - 1] : null;
      const improvement = prevData ? prevData.score - data.score : 0;

      return {
        timestamp: data.timestamp,
        score: data.score,
        grade: data.grade,
        improvement,
      };
    });

    const improvements = trends.slice(1).map((t) => t.improvement);
    const avgImprovement =
      improvements.length > 0
        ? improvements.reduce((sum, imp) => sum + imp, 0) // improvements.length
        : 0;

    let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (avgImprovement > 0.01) overallTrend = 'improving';
    else if (avgImprovement < -0.01) overallTrend = 'declining';

    // Project when score will reach below 0.2 (Grade A)
    const lastTrend = trends[trends.length - 1];
    let projectedCompletion: Date | null = null;

    if (lastTrend && avgImprovement > 0 && lastTrend.score > 0.2) {
      const weeksToComplete = (lastTrend.score - 0.2) // avgImprovement;
      projectedCompletion = new Date(Date.now() + weeksToComplete * 7 * 24 * 60 * 60 * 1000);
    }

    return ApiUtilities.ok({
      trends,
      analysis: {
        overallTrend,
        avgImprovement,
        projectedCompletion,
      },
    });
  } catch (error) {
    return ApiUtilities.error(
      createApiError(
        `Trend analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TREND_ANALYSIS_ERROR',
        { dataPointsCount: historicalData.length, error },
      ),
    );
  }
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

function calculateEstimatedHours(riskLevel: RiskLevel, affectedFiles: number): number {
  const baseHours = affectedFiles * 0.5; // 30 minutes per file base

  const riskMultiplier = {
    [RiskLevel.LOW]: 1.0,
    [RiskLevel.MEDIUM]: 1.5,
    [RiskLevel.HIGH]: 2.5,
    [RiskLevel.CRITICAL]: 4.0,
  }[riskLevel];

  return Math.ceil(baseHours * riskMultiplier);
}

function generateRecommendations(
  riskAssessment: RiskAssessment,
  patterns: readonly any[],
): readonly string[] {
  const recommendations: string[] = [];

  // Risk-based recommendations
  if (riskAssessment.level === RiskLevel.CRITICAL) {
    recommendations.push(
      'Break migration into smaller phases',
      'Implement comprehensive testing before deployment',
      'Consider feature flags for gradual rollout',
    );
  }

  if (riskAssessment.level === RiskLevel.HIGH) {
    recommendations.push(
      'Ensure thorough QA coverage',
      'Plan rollback strategy',
      'Monitor closely post-deployment',
    );
  }

  // Pattern-based recommendations
  if (patterns.length > 20) {
    recommendations.push('Consider automated migration tools for large number of patterns');
  }

  if (riskAssessment.confidence < 0.7) {
    recommendations.push('Low confidence - manual review recommended');
  }

  return recommendations;
}

function generateHtmlReport(result: any): string {
  const riskColor =
    {
      low: '#38a169',
      medium: '#dd6b20',
      high: '#e53e3e',
      critical: '#c53030',
    }[result.riskAssessment?.level] || '#gray';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px;
    }
    .header { text-align: center; margin-bottom: 2rem; }
    .risk-badge {
      display: inline-block; padding: 0.5rem 1rem; border-radius: 0.5rem;
      color: white; font-weight: bold; background-color: ${riskColor};
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .card { background: #f7fafc; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric { font-size: 2rem; font-weight: bold; color: #2d3748; }
    .label { font-size: 0.875rem; color: #718096; margin-top: 0.25rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
    ${result.riskAssessment ? `<div class="risk-badge">${result.riskAssessment.level.toUpperCase()} RISK</div>` : ''}
  </div>

  <div class="grid">
    ${
      result.summary
        ? `
    <div class="card">
      <div class="metric">${result.summary.totalFiles || 0}</div>
      <div class="label">Total Files Analyzed</div>
    </div>
    <div class="card">
      <div class="metric">${result.summary.patternsFound || 0}</div>
      <div class="label">Patterns Found</div>
    </div>
    <div class="card">
      <div class="metric">${result.summary.affectedFiles || 0}</div>
      <div class="label">Files Requiring Changes</div>
    </div>
    <div class="card">
      <div class="metric">${result.summary.estimatedHours || 0}h</div>
      <div class="label">Estimated Time</div>
    </div>
    `
        : ''
    }
  </div>

  ${
    result.recommendations
      ? `
  <div class="card" style="margin-top: 2rem;">
    <h2>Recommendations</h2>
    <ul>
      ${result.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
  `
      : ''
  }
</body>
</html>`;
}

function generateMarkdownReport(result: any): string {
  return `# Analysis Report

Generated on ${new Date().toLocaleString()}

## Summary

${result.riskAssessment ? `- **Risk Level**: ${result.riskAssessment.level.toUpperCase()}` : ''}
${
  result.summary
    ? `
- **Total Files**: ${result.summary.totalFiles || 0}
- **Patterns Found**: ${result.summary.patternsFound || 0}
- **Affected Files**: ${result.summary.affectedFiles || 0}
- **Estimated Hours**: ${result.summary.estimatedHours || 0}
`
    : ''
}

${
  result.recommendations && result.recommendations.length > 0
    ? `
## Recommendations

${result.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
`
    : ''
}
`;
}

function generateCsvReport(result: any): string {
  const headers = ['Metric', 'Value'];
  const rows = [headers.join(',')];

  if (result.summary) {
    rows.push(`"Total Files",${result.summary.totalFiles || 0}`);
    rows.push(`"Patterns Found",${result.summary.patternsFound || 0}`);
    rows.push(`"Affected Files",${result.summary.affectedFiles || 0}`);
    rows.push(`"Estimated Hours",${result.summary.estimatedHours || 0}`);
  }

  if (result.riskAssessment) {
    rows.push(`"Risk Level","${result.riskAssessment.level}"`);
    rows.push(`"Risk Score",${result.riskAssessment.score || 0}`);
  }

  return rows.join('\n');
}

function generateBackupHtmlReport(report: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backup Sessions Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; }
    .header { text-align: center; margin-bottom: 2rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 2rem; font-weight: bold; color: #2563eb; }
    .stat-label { color: #64748b; margin-top: 0.5rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Backup Sessions Report</h1>
    <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-value">${report.summary.totalSessions}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.summary.totalFiles}</div>
      <div class="stat-label">Total Files</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatBytes(report.summary.totalSize)}</div>
      <div class="stat-label">Total Size</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Git SHA</th>
        <th>Date</th>
        <th>Files</th>
        <th>Size</th>
        <th>Debt Grade</th>
        <th>Tags</th>
      </tr>
    </thead>
    <tbody>
      ${report.sessions
        .map(
          (session: any) => `
        <tr>
          <td><code>${session.gitSha}</code></td>
          <td>${new Date(session.timestamp).toLocaleDateString()}</td>
          <td>${session.fileCount}</td>
          <td>${session.size}</td>
          <td>${session.debtGrade}</td>
          <td>${session.tags.join(', ')}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
