/**
 * AI Response Analyzer
 *
 * Analyzes AI verification reports and provides insights.
 * Uses canonical types only, validates all inputs, returns via factory patterns.
 */

import {
  ApiResponse,
  EntityId,
  FilePath,
  RiskLevel,
  Timestamp,
  CascadeType,
  AITrendAnalysis,
  AIReportFileInfo,
  AIVerificationInfo,
  AIAnnotationInfo,
  AIAnalysisSummary,
  SystemHealthStatus,
  TrendData,
  RiskLevelTrendPoint,
  PerformanceTrendPoint,
  VolumeTrendPoint,
  AIUsageTrendPoint,
  AIAnalysisResult,
  createApiSuccess,
  createApiError
} from '@/types/canonical-types';

import { EntityIdSchema, RiskLevelSchema, TimestampSchema } from '@/shared-foundation/validation-schemas';
import { validateWithSchema } from '@/shared-foundation/validation-schemas';

// Imports already defined above
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// RESPONSE ANALYSIS INTERFACES
// ============================================================================

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_REPORTS_DIR = './test-verification-reports';

// ============================================================================
// FILE INFO EXTRACTION
// ============================================================================

/**
 * Extract file info from AI report filename with validation
 */
export function extractAIFileInfo(
  filename: string,
): ApiResponse<Omit<AIReportFileInfo, 'filePath'>> {
  try {
    if (!filename || typeof filename !== 'string') {
      return createApiError('VALIDATION_ERROR', 'Invalid filename provided');
    }

    const parts = filename.split('-');
    const timestamp = parts.pop()?.replace('.json', '') || '';

    // Handle files with or without UUID pattern
    const hasUuid = parts.length > 1 && parts[parts.length - 1]?.length === 8;
    const uuid = hasUuid ? parts.pop() || null : null;

    // Reconstruct base filename
    const baseFilename = parts.join('-');

    // Validate timestamp format
    const timestampValidation = validateWithSchema(TimestampSchema, timestamp);
    if (!timestampValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid timestamp format');
    }

    // Validate UUID if present
    let validatedUuid: EntityId | null = null;
    if (uuid) {
      const uuidValidation = validateWithSchema(EntityIdSchema, uuid);
      if (!uuidValidation.success) {
        return createApiError('VALIDATION_ERROR', 'Invalid UUID format');
      }
      validatedUuid = uuidValidation.data;
    }

    const result = {
      baseFilename,
      uuid: validatedUuid,
      timestamp: timestampValidation.data,
    };

    return createApiSuccess(result);
  } catch (error) {
    return createApiError('EXTRACTION_ERROR', 'File info extraction failed', {
      error,
    });
  }
}

/**
 * Group AI reports by source file with validation
 */
export function groupAIReportsByFile(
  reports: readonly AIReportFileInfo[],
): ApiResponse<Record<string, AIReportFileInfo[]>> {
  try {
    const fileGroups: Record<string, AIReportFileInfo[]> = {};

    for (const report of reports) {
      if (!fileGroups[report.baseFilename]) {
        fileGroups[report.baseFilename] = [];
      }
      fileGroups[report.baseFilename].push(report);
    }

    // Sort each group by timestamp
    for (const file in fileGroups) {
      fileGroups[file].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }

    return createApiSuccess(fileGroups);
  } catch (error) {
    return createApiError('GROUPING_ERROR', 'Report grouping failed', { error });
  }
}

// ============================================================================
// VERIFICATION INFO EXTRACTION
// ============================================================================

/**
 * Extract key AI verification info from report with validation
 */
export function extractAIVerificationInfo(reportPath: string): ApiResponse<AIVerificationInfo> {
  try {
    if (!reportPath || typeof reportPath !== 'string') {
      return createApiError('VALIDATION_ERROR', 'Invalid report path');
    }

    if (!fs.existsSync(reportPath)) {
      return createApiError('FILE_NOT_FOUND', 'Report file not found');
    }

    const content = fs.readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(content);

    // Handle both old and new report formats
    const riskAssessment = report.riskAssessment || report;
    const metadata = report.metadata || {};
    const metrics = report.metrics || {};

    // Extract and normalize risk score
    let riskScore: number;
    if (typeof riskAssessment.score === 'object') {
      riskScore =
        typeof riskAssessment.score.toNumber === 'function'
          ? riskAssessment.score.toNumber()
          : riskAssessment.score.value || 0;
    } else {
      riskScore = riskAssessment.riskScore || riskAssessment.score || 0;
    }

    // Validate and normalize risk score to 0-100 scale
    if (typeof riskScore !== 'number' || isNaN(riskScore)) {
      riskScore = 0;
    }
    const normalizedRiskScore = Math.max(0, Math.min(100, riskScore));

    // Extract and validate risk level
    const riskLevelValidation = validateWithSchema(
      RiskLevelSchema,
      riskAssessment.level || riskAssessment.riskLevel || RiskLevel.MEDIUM,
    );

    if (!riskLevelValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid risk level');
    }

    // Build verification info object
    const verificationInfo: AIVerificationInfo = {
      filePath: (report.filePath || reportPath) as FilePath,
      riskLevel: riskLevelValidation.data,
      riskScore: normalizedRiskScore,
      cascadeType: riskAssessment.cascadeType || 'TYPE_INFERENCE_CASCADE',
      timestamp: (report.timestamp || metadata.timestamp || new Date().toISOString()) as Timestamp,
      businessImpact: riskAssessment.businessImpact || metadata.businessImpact,
      transformations: metadata.transformations || [],
      verificationSteps: metrics.verificationSteps || metadata.verificationSteps?.length || 0,
      correlationId: report.correlationId || metadata.correlationId,
      aiEnhanced: metadata.aiEnhanced || report.aiEnhanced || false,
      cacheHit: metrics.cacheHit || report.cached || false,
      performanceScore: Math.min(Math.max(metrics.performanceScore || 0, 0), 100),
    };

    return createApiSuccess(verificationInfo);
  } catch (error) {
    return createApiError('EXTRACTION_ERROR', 'Verification info extraction failed', { error });
  }
}

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

/**
 * Generate comprehensive summary statistics with validation
 */
export function generateAIAnalysisSummary(
  reports: readonly AIReportFileInfo[],
  verifications: readonly (AIVerificationInfo | null)[],
): ApiResponse<AIAnalysisSummary> {
  try {
    const validVerifications = verifications.filter((v): v is AIVerificationInfo => v !== null);

    const uniqueFiles = new Set(validVerifications.map((v) => v.filePath));

    // Count risk levels
    const riskLevels: Record<string, number> = {};
    for (const v of validVerifications) {
      riskLevels[v.riskLevel] = (riskLevels[v.riskLevel] || 0) + 1;
    }

    // Count cascade types
    const cascadeTypes: Record<string, number> = {};
    for (const v of validVerifications) {
      cascadeTypes[v.cascadeType] = (cascadeTypes[v.cascadeType] || 0) + 1;
    }

    // Calculate averages
    const totalRiskScore = validVerifications.reduce((sum, v) => sum + v.riskScore, 0);
    const averageRiskScore =
      validVerifications.length > 0 ? totalRiskScore / validVerifications.length : 0;

    const totalPerformanceScore = validVerifications.reduce(
      (sum, v) => sum + v.performanceScore,
      0,
    );
    const averagePerformanceScore =
      validVerifications.length > 0 ? totalPerformanceScore / validVerifications.length : 0;

    // AI enhancement statistics
    const aiEnhancedCount = validVerifications.filter((v) => v.aiEnhanced).length;
    const aiEnhancedPercentage =
      validVerifications.length > 0 ? (aiEnhancedCount / validVerifications.length) * 100 : 0;

    // Cache hit rate
    const cacheHits = validVerifications.filter((v) => v.cacheHit).length;
    const cacheHitRate =
      validVerifications.length > 0 ? (cacheHits / validVerifications.length) * 100 : 0;

    // Get latest response timestamp
    const timestamps = reports.map((r) => r.timestamp).sort();
    const latestResponse = (
      timestamps.length > 0 ? timestamps[timestamps.length - 1] : new Date().toISOString()
    ) as Timestamp;

    // System health assessment
    const systemHealth = assessSystemHealth(validVerifications, riskLevels);

    const summary: AIAnalysisSummary = {
      totalReports: reports.length,
      uniqueFiles: uniqueFiles.size,
      riskLevels,
      cascadeTypes,
      averageRiskScore,
      averagePerformanceScore,
      latestResponse,
      aiEnhancedPercentage,
      cacheHitRate,
      systemHealth,
    };

    return createApiSuccess(summary);
  } catch (error) {
    return createApiError('SUMMARY_ERROR', 'Summary generation failed', { error });
  }
}

/**
 * Assess system health based on verification data
 */
function assessSystemHealth(
  verifications: readonly AIVerificationInfo[],
  riskLevels: Record<string, number>,
): SystemHealthStatus {
  const issues: string[] = [];
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check for high risk concentration
  const criticalCount = riskLevels[RiskLevel.CRITICAL] || 0;
  const highCount = riskLevels[RiskLevel.HIGH] || 0;
  const totalCount = verifications.length;

  if (totalCount > 0) {
    const highRiskPercentage = ((criticalCount + highCount) / totalCount) * 100;

    if (highRiskPercentage > 50) {
      status = 'unhealthy';
      issues.push(
        `High risk concentration: ${highRiskPercentage.toFixed(1)}% of verifications are high/critical risk`,
      );
    } else if (highRiskPercentage > 25) {
      status = 'degraded';
      issues.push(
        `Elevated risk levels: ${highRiskPercentage.toFixed(1)}% of verifications are high/critical risk`,
      );
    }
  }

  // Check performance scores
  if (verifications.length > 0) {
    const avgPerformance =
      verifications.reduce((sum, v) => sum + v.performanceScore, 0) / verifications.length;
    if (avgPerformance < 50) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy';
      issues.push(`Low average performance score: ${avgPerformance.toFixed(1)}/100`);
    }
  }

  // Check AI enhancement usage
  if (verifications.length > 0) {
    const aiUsage = (verifications.filter((v) => v.aiEnhanced).length / verifications.length) * 100;
    if (aiUsage < 50) {
      issues.push(`Low AI enhancement usage: ${aiUsage.toFixed(1)}%`);
    }
  }

  return { status, issues };
}

// ============================================================================
// ANNOTATION CHECKING
// ============================================================================

/**
 * Check for AI annotations in source files with validation
 */
export function checkForAIAnnotations(
  sourcePaths: readonly string[],
): ApiResponse<readonly AIAnnotationInfo[]> {
  try {
    const annotations: AIAnnotationInfo[] = [];

    for (const sourcePath of sourcePaths) {
      if (!sourcePath || typeof sourcePath !== 'string') {
        continue;
      }

      if (fs.existsSync(sourcePath)) {
        const content = fs.readFileSync(sourcePath, 'utf-8');

        // Check for both AI-REVIEW and legacy LLM-REVIEW formats
        const aiReviewMatch = content.match(/AI-REVIEW::([A-Z]+)::([A-Z_]+)::([a-f0-9]+)/);
        const legacyMatch = content.match(/LLM-REVIEW::([A-Z]+)::([A-Z_]+)::([a-f0-9]+)/);

        const match = aiReviewMatch || legacyMatch;

        if (match) {
          const riskLevelValidation = validateWithSchema(RiskLevelSchema, match[1]);
          const entityIdValidation = validateWithSchema(EntityIdSchema, match[3]);

          if (riskLevelValidation.success && entityIdValidation.success) {
            const annotation: AIAnnotationInfo = {
              file: path.basename(sourcePath),
              riskLevel: riskLevelValidation.data,
              cascadeType: match[2],
              id: entityIdValidation.data,
              format: aiReviewMatch ? 'AI-REVIEW' : 'LLM-REVIEW',
            };

            annotations.push(annotation);
          }
        }
      }
    }

    return createApiSuccess(annotations);
  } catch (error) {
    return createApiError('ANNOTATION_ERROR', 'Annotation checking failed', {
      error,
    });
  }
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Analyze AI response trends over time with validation
 */
export function analyzeAITrends(
  fileGroups: Record<string, AIReportFileInfo[]>,
  verificationMap: Record<string, AIVerificationInfo | null>,
): ApiResponse<AITrendAnalysis> {
  try {
    const allReports = Object.values(fileGroups).flat();
    const validVerifications = allReports
      .map((r) => verificationMap[r.filePath])
      .filter((v): v is AIVerificationInfo => v !== null);

    if (validVerifications.length === 0) {
      return createApiError('INSUFFICIENT_DATA', 'No valid verification data for trend analysis');
    }

    // Sort by timestamp
    validVerifications.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const timeRange = {
      start: validVerifications[0].timestamp,
      end: validVerifications[validVerifications.length - 1].timestamp,
    };

    // Generate trend data
    const trendsResult = generateTrendData(validVerifications);
    if (!trendsResult.success || !trendsResult.data) {
      return trendsResult.error ? trendsResult : createApiError('TREND_ERROR', 'Trend data generation failed');
    }

    // Generate insights
    const insights = generateTrendInsights(validVerifications, trendsResult.data);

    // Generate predictions
    const predictions = generateTrendPredictions(trendsResult.data);

    const trendAnalysis: AITrendAnalysis = {
      timeRange,
      trends: trendsResult.data,
      insights,
      predictions,
    };

    return createApiSuccess(trendAnalysis);
  } catch (error) {
    return createApiError('TREND_ERROR', 'Trend analysis failed', { error });
  }
}

/**
 * Generate trend data from verifications
 */
function generateTrendData(verifications: readonly AIVerificationInfo[]): ApiResponse<TrendData> {
  try {
    // Group by time buckets (daily)
    const buckets = new Map<string, AIVerificationInfo[]>();

    for (const verification of verifications) {
      const date = verification.timestamp.split('T')[0]; // Extract date part
      if (!buckets.has(date)) {
        buckets.set(date, []);
      }
      const bucketArr = buckets.get(date);
      if (bucketArr) {
        bucketArr.push(verification);
      }
    }

    const riskLevelTrend: RiskLevelTrendPoint[] = [];
    const performanceTrend: PerformanceTrendPoint[] = [];
    const volumeTrend: VolumeTrendPoint[] = [];
    const aiUsageTrend: AIUsageTrendPoint[] = [];

    // Convert the Map to an array of entries
    Array.from(buckets.entries()).forEach(([date, dayVerifications]) => {
      // Risk level distribution for the day
      const riskCounts = dayVerifications.reduce<Record<string, number>>((acc, v) => {
        const level = v.riskLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      for (const [level, count] of Object.entries(riskCounts)) {
        // Validate level is a valid RiskLevel
        const riskLevelValidation = validateWithSchema(RiskLevelSchema, level);
        if (riskLevelValidation.success) {
          riskLevelTrend.push({
            timestamp: date,
            level: riskLevelValidation.data,
            count: count,
          });
        }
      }

      // Average performance score for the day
      const avgPerformance =
        dayVerifications.reduce((sum, v) => sum + v.performanceScore, 0) / dayVerifications.length;
      performanceTrend.push({
        timestamp: date,
        score: avgPerformance,
      });

      // Volume for the day
      volumeTrend.push({
        timestamp: date,
        reportCount: dayVerifications.length,
      });

      // AI usage percentage for the day
      const aiEnhancedCount = dayVerifications.filter((v) => v.aiEnhanced).length;
      const aiEnhancedPercentage = (aiEnhancedCount / dayVerifications.length) * 100;
      aiUsageTrend.push({
        timestamp: date,
        aiEnhancedPercentage,
      });
    });

    const trendData: TrendData = {
      riskLevelTrend,
      performanceTrend,
      volumeTrend,
      aiUsageTrend,
    };

    return createApiSuccess(trendData);
  } catch (error) {
    return createApiError('TREND_DATA_ERROR', 'Trend data generation failed', {
      error,
    });
  }
}

/**
 * Generate insights from trend data
 */
function generateTrendInsights(
  verifications: readonly AIVerificationInfo[],
  trends: TrendData,
): readonly string[] {
  const insights: string[] = [];

  // Performance trend
  const performanceScores = trends.performanceTrend.map((t) => t.score);
  if (performanceScores.length > 1) {
    const firstHalf = performanceScores.slice(0, Math.floor(performanceScores.length / 2));
    const secondHalf = performanceScores.slice(Math.floor(performanceScores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg && firstAvg > 0) {
      insights.push(
        `Performance improving: ${(((secondAvg - firstAvg) / firstAvg) * 100).toFixed(1)}% increase in recent period`,
      );
    } else if (firstAvg > 0) {
      insights.push(
        `Performance declining: ${(((firstAvg - secondAvg) / firstAvg) * 100).toFixed(1)}% decrease in recent period`,
      );
    }
  }

  // AI usage trend
  const aiUsageData = trends.aiUsageTrend;
  if (aiUsageData.length > 0) {
    const latestUsage = aiUsageData[aiUsageData.length - 1].aiEnhancedPercentage;
    insights.push(`Current AI enhancement usage: ${latestUsage.toFixed(1)}%`);
  }

  // Volume analysis
  const volumeData = trends.volumeTrend;
  if (volumeData.length > 0) {
    const totalVolume = volumeData.reduce((sum, t) => sum + t.reportCount, 0);
    const avgDaily = totalVolume / volumeData.length;
    insights.push(`Average daily verification volume: ${avgDaily.toFixed(1)} reports`);
  }

  return insights;
}

/**
 * Generate predictions based on trends
 */
function generateTrendPredictions(trends: TrendData): readonly string[] {
  const predictions: string[] = [];

  // Simple prediction based on recent performance trend
  const performanceData = trends.performanceTrend;
  if (performanceData.length >= 3) {
    const recent = performanceData.slice(-3).map((t) => t.score);
    const isImproving = recent[2] > recent[0];

    if (isImproving) {
      predictions.push('Performance trend suggests continued improvement in coming period');
    } else {
      predictions.push('Performance trend suggests need for optimization measures');
    }
  }

  // AI usage prediction
  const aiUsageData = trends.aiUsageTrend;
  if (aiUsageData.length >= 2) {
    const recent = aiUsageData.slice(-2);
    const isIncreasing = recent[1].aiEnhancedPercentage > recent[0].aiEnhancedPercentage;

    if (isIncreasing) {
      predictions.push('AI enhancement adoption is increasing');
    } else {
      predictions.push('AI enhancement usage may need promotion or optimization');
    }
  }

  return predictions;
}

// ============================================================================
// CONSOLE VISUALIZATION
// ============================================================================

/**
 * Generate enhanced console visualization of AI reports
 */
export function generateAIConsoleVisualization(
  fileGroups: Record<string, AIReportFileInfo[]>,
  reportInfoMap: Record<string, AIVerificationInfo | null>,
): ApiResponse<string> {
  try {
    let output = '\n=== AI Verification Report Analysis ===\n\n';

    // Calculate summary statistics
    const allReports = Object.values(fileGroups).flat();
    const allVerifications = allReports.map((r) => reportInfoMap[r.filePath]);
    const summaryResult = generateAIAnalysisSummary(allReports, allVerifications);

    if (!summaryResult.success || !summaryResult.data) {
      return summaryResult.error ? summaryResult : createApiError('SUMMARY_ERROR', 'Summary generation failed');
    }

    const summary = summaryResult.data;

    // Add summary statistics with enhanced metrics
    output += `Total Reports: ${summary.totalReports}\n`;
    output += `Unique Files Analyzed: ${summary.uniqueFiles}\n`;
    output += `Average Risk Score: ${summary.averageRiskScore.toFixed(2)}/100\n`;
    output += `Average Performance Score: ${summary.averagePerformanceScore.toFixed(2)}/100\n`;
    output += `AI Enhanced: ${summary.aiEnhancedPercentage.toFixed(1)}%\n`;
    output += `Cache Hit Rate: ${summary.cacheHitRate.toFixed(1)}%\n`;
    output += `Latest Response: ${summary.latestResponse}\n`;
    output += `System Health: ${getHealthEmoji(summary.systemHealth.status)} ${summary.systemHealth.status.toUpperCase()}\n\n`;

    // Health issues
    if (summary.systemHealth.issues.length > 0) {
      output += 'Health Issues:\n';
      for (const issue of summary.systemHealth.issues) {
        output += `  ⚠️  ${issue}\n`;
      }
      output += '\n';
    }

    // Risk level distribution with visual indicators
    output += 'Risk Level Distribution:\n';
    for (const [level, count] of Object.entries(summary.riskLevels)) {
      const countNum = Number(count);
      const totalNum = Number(summary.totalReports);
      const percent = totalNum > 0 ? ((countNum / totalNum) * 100).toFixed(1) : '0.0';
      const emoji = getRiskEmoji(level as RiskLevel);
      output += `  ${emoji} ${level}: ${count} (${percent}%)\n`;
    }
    output += '\n';

    // Cascade type distribution
    output += 'Cascade Type Distribution:\n';
    for (const [type, count] of Object.entries(summary.cascadeTypes)) {
      const countNum = Number(count);
      const totalNum = Number(summary.totalReports);
      const percent = totalNum > 0 ? ((countNum / totalNum) * 100).toFixed(1) : '0.0';
      output += `  🔗 ${type}: ${count} (${percent}%)\n`;
    }
    output += '\n';

    // File response summary with enhanced metrics
    output += 'AI Response Summary:\n';
    output += '=================================================================================\n';
    output += 'File                     | Responses | Latest Response | Avg Risk | AI Enhanced\n';
    output += '---------------------------------------------------------------------------------\n';

    for (const file in fileGroups) {
      const responses = fileGroups[file].length;
      const latestTimestamp = fileGroups[file][responses - 1].timestamp;

      // Calculate average risk for this file
      const fileVerifications = fileGroups[file]
        .map((r) => reportInfoMap[r.filePath])
        .filter((v): v is AIVerificationInfo => v !== null);

      const avgRisk =
        fileVerifications.length > 0
          ? fileVerifications.reduce((sum, v) => sum + v.riskScore, 0) / fileVerifications.length
          : 0;

      const aiEnhancedCount = fileVerifications.filter((v) => v.aiEnhanced).length;
      const aiEnhancedPercent =
        fileVerifications.length > 0 ? (aiEnhancedCount / fileVerifications.length) * 100 : 0;

      output += `${file.padEnd(24)} | ${String(responses).padEnd(9)} | ${latestTimestamp.padEnd(15)} | ${avgRisk.toFixed(1).padEnd(8)} | ${aiEnhancedPercent.toFixed(0)}%\n`;
    }

    output +=
      '=================================================================================\n\n';

    return createApiSuccess(output);
  } catch (error) {
    return createApiError('VISUALIZATION_ERROR', 'Console visualization generation failed', { error });
  }
}

/**
 * Get emoji for risk level
 */
function getRiskEmoji(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case RiskLevel.CRITICAL:
      return '🚨';
    case RiskLevel.HIGH:
      return '⚠️';
    case RiskLevel.MEDIUM:
      return '🟡';
    case RiskLevel.LOW:
      return '✅';
    default:
      return '❓';
  }
}

/**
 * Get emoji for health status
 */
function getHealthEmoji(status: string): string {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'degraded':
      return '⚠️';
    case 'unhealthy':
      return '🚨';
    default:
      return '❓';
  }
}

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Export analysis results to various formats
 */
export function exportAIAnalysis(
  analysis: AIAnalysisResult,
  outputPath: string,
  format: 'json' | 'csv' | 'markdown' = 'json',
): ApiResponse<void> {
  try {
    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(analysis, null, 2);
        break;
      case 'csv':
        content = generateCSVExport(analysis);
        break;
      case 'markdown':
        content = generateMarkdownReport(analysis);
        break;
      default:
        return createApiError('UNSUPPORTED_FORMAT', `Unsupported export format: ${format}`);
    }

    fs.writeFileSync(outputPath, content, 'utf-8');
    return createApiSuccess(undefined);
  } catch (error) {
    return createApiError('EXPORT_ERROR', 'Export failed', { error });
  }
}

/**
 * Generate CSV export
 */
function generateCSVExport(analysis: AIAnalysisResult): string {
  const headers = [
    'File',
    'Risk Level',
    'Risk Score',
    'Cascade Type',
    'AI Enhanced',
    'Cache Hit',
    'Performance Score',
    'Verification Steps',
    'Timestamp',
  ];

  const rows = Object.values(analysis.verificationMap)
    .filter((v): v is AIVerificationInfo => v !== null)
    .map((v) => [
      v.filePath,
      v.riskLevel,
      v.riskScore.toFixed(2),
      v.cascadeType,
      v.aiEnhanced ? 'Yes' : 'No',
      v.cacheHit ? 'Yes' : 'No',
      v.performanceScore.toFixed(2),
      v.verificationSteps,
      v.timestamp,
    ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(analysis: AIAnalysisResult): string {
  const summary = analysis.summary;

  return `# AI Verification Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Reports**: ${summary.totalReports}
- **Unique Files**: ${summary.uniqueFiles}
- **Average Risk Score**: ${summary.averageRiskScore.toFixed(2)}/100
- **Average Performance Score**: ${summary.averagePerformanceScore.toFixed(2)}/100
- **AI Enhanced**: ${summary.aiEnhancedPercentage.toFixed(1)}%
- **Cache Hit Rate**: ${summary.cacheHitRate.toFixed(1)}%
- **System Health**: ${summary.systemHealth.status}

## Risk Level Distribution

${Object.entries(summary.riskLevels)
  .map(([level, count]) => {
    const countNum = Number(count);
    const totalNum = Number(summary.totalReports);
    return `- **${level}**: ${count} (${((countNum / totalNum) * 100).toFixed(1)}%)`;
  })
  .join('\n')}

## Cascade Type Distribution

${Object.entries(summary.cascadeTypes)
  .map(([type, count]) => {
    const countNum = Number(count);
    const totalNum = Number(summary.totalReports);
    return `- **${type}**: ${count} (${((countNum / totalNum) * 100).toFixed(1)}%)`;
  })
  .join('\n')}

${
  summary.systemHealth.issues.length > 0
    ? `
## Health Issues

${summary.systemHealth.issues.map((issue) => `- ⚠️ ${issue}`).join('\n')}
`
    : ''
}

${
  analysis.trends
    ? `
## Trends Analysis

**Time Range**: ${analysis.trends.timeRange.start} to ${analysis.trends.timeRange.end}

### Insights
${analysis.trends.insights.map((insight) => `- ${insight}`).join('\n')}

### Predictions
${analysis.trends.predictions.map((prediction) => `- ${prediction}`).join('\n')}
`
    : ''
}

## Annotations Found

${
  analysis.annotations.length > 0
    ? analysis.annotations
        .map((ann) => `- **${ann.file}**: ${ann.format} (${ann.riskLevel}, ${ann.cascadeType})`)
        .join('\n')
    : 'No AI annotations found in source files.'
}
`;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Main analysis function with enhanced AI capabilities and validation
 */
export function analyzeAIResponses(
  reportsDir = DEFAULT_REPORTS_DIR,
): ApiResponse<AIAnalysisResult> {
  try {
    // Environment detection
    if (!fs.existsSync(reportsDir)) {
      return createApiError(
        createApiError(`Reports directory not found: ${reportsDir}`, 'DIRECTORY_NOT_FOUND'),
      );
    }

    // Get all JSON files in the reports directory
    const files = fs
      .readdirSync(reportsDir)
      .filter((file) => file.endsWith('.json') && file !== 'transformations.json');

    // Extract file info from filenames
    const reportInfo: AIReportFileInfo[] = [];
    for (const file of files) {
      const filePath = path.join(reportsDir, file) as FilePath;
      const infoResult = extractAIFileInfo(file);

      if (infoResult.success && infoResult.data) {
        const completeInfo: AIReportFileInfo = {
          filePath,
          ...infoResult.data,
        };
        reportInfo.push(completeInfo);
      }
    }

    // Group reports by file
    const fileGroupsResult = groupAIReportsByFile(reportInfo);
    if (!fileGroupsResult.success || !fileGroupsResult.data) {
      return createApiError(
        fileGroupsResult.error || createApiError('File grouping failed', 'GROUPING_ERROR'),
      );
    }

    // Extract verification info from reports
    const verificationMap: Record<string, AIVerificationInfo | null> = {};
    for (const report of reportInfo) {
      const result = extractAIVerificationInfo(report.filePath);
      verificationMap[report.filePath] = result.success && result.data ? result.data : null;
    }

    // Check for files with AI annotations
    const pathSet = new Set<string>();
    Object.keys(fileGroupsResult.data).forEach((file) => {
      pathSet.add(path.join(path.dirname(reportsDir), file));
    });
    const sourcePaths = Array.from(pathSet);
    const annotationsResult = checkForAIAnnotations(sourcePaths);
    const annotations =
      annotationsResult.success && annotationsResult.data ? annotationsResult.data : [];

    // Generate summary
    const allVerifications = Object.values(verificationMap);
    const summaryResult = generateAIAnalysisSummary(reportInfo, allVerifications);
    if (!summaryResult.success || !summaryResult.data) {
      return summaryResult.error ? summaryResult : createApiError('SUMMARY_ERROR', 'Summary generation failed');
    }

    // Generate trends if enough data
    let trends: AITrendAnalysis | undefined;
    if (reportInfo.length >= 5) {
      const trendsResult = analyzeAITrends(fileGroupsResult.data, verificationMap);
      trends = trendsResult.success && trendsResult.data ? trendsResult.data : undefined;
    }

    const result: AIAnalysisResult = {
      summary: summaryResult.data,
      fileGroups: fileGroupsResult.data,
      verificationMap,
      annotations,
      trends,
    };

    return createApiSuccess(result);
  } catch (error) {
    return createApiError(createApiError('AI response analysis failed', 'ANALYSIS_ERROR', { error }));
  }
}
