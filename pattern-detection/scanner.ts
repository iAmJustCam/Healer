
/**
 * LLM-REVIEW Flags Inventory Tool - CANONICALIZED VERSION
 *
 * Scans the codebase for LLM-REVIEW flags and generates a comprehensive inventory
 * using the canonical domain model for type safety and SOLID compliance.
 *
 * Key features:
 * - Uses canonical types for all domain objects (SSOT compliance)
 * - Maintains backward compatibility with existing tooling
 * - Enhanced complexity scoring with canonical metrics
 * - Type-safe report generation and export
 *
 * Usage: tsx scripts/migrate/inventory.ts [--json] [--html] [--output=path/to/file]
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { patterns, filePatterns, riskFactors } from '@patterns/patterns/patterns';
// Import canonical types from shared foundation
import {
  BusinessDomain,
  MigrationCategory,
  Severity,
  CanonicalId,
  FileReference,
  PositionReference,
  TemporalMetrics,
  Distribution,
  ComplexityFactors,
  DebtScore,
  ComponentContext,
  HealthAssessment,
  SummaryStatistics,
  CanonicalTimestamp,
  AuthorAttribution,
  ChangeMetadata
} from '../shared-REFACTORED/types/domain.types';

// Define interfaces that aren't directly importable
interface LLMReviewFlag {
  id: CanonicalId;
  category: MigrationCategory;
  severity: Severity;
  details: string;
  location: {
    file: FileReference;
    position: PositionReference;
  };
  metadata: ChangeMetadata;
  relationships: {
    blocks: CanonicalId[];
    blockedBy: CanonicalId[];
    related: CanonicalId[];
  };
  flagFormat: {
    comment: string;
    uuid: string;
  };
  domain: BusinessDomain;
}

interface CanonicalIssue {
  id: CanonicalId;
  category: MigrationCategory;
  severity: Severity;
  details: string;
  location: {
    file: FileReference;
    position: PositionReference;
  };
  relationships: {
    blocks: CanonicalId[];
    blockedBy: CanonicalId[];
    related: CanonicalId[];
  };
}

interface CanonicalReport {
  id: CanonicalId;
  generatedAt: CanonicalTimestamp;
  summary: SummaryStatistics;
  health: HealthAssessment;
  issues: CanonicalIssue[];
  verificationPlans: any[];
  metadata: {
    toolVersion: string;
    scanParameters: Record<string, any>;
    executionTimeMs: number;
  };
}

// Helper functions
function createCanonicalId(value: string, type: string): CanonicalId {
  return { value, type };
}

function createCanonicalTimestamp(date?: Date): CanonicalTimestamp {
  const now = date || new Date();
  return {
    iso: now.toISOString(),
    epoch: now.getTime()
  };
}

function createFileReference(filePath: string, rootDir: string): FileReference {
  return {
    absolutePath: filePath,
    relativePath: filePath.replace(rootDir, '').replace(/^\//, '')
  };
}

function isLLMReviewFlag(issue: CanonicalIssue): issue is LLMReviewFlag {
  return 'domain' in issue && 'flagFormat' in issue;
}

function isHighSeverity(issue: CanonicalIssue): boolean {
  return issue.severity === Severity.HIGH || issue.severity === Severity.CRITICAL;
}

// Legacy imports for debt scoring (to be canonicalized in future)
import {
  DebtIssue,
  DebtScoreContext,
  DebtScoreResult,
  findRelatedIssues,
  analyzeComponentCriticality,
  calculateComplexityDebtScore,
  generateComplexityDebtReport
} from '@analysis/utilities/business-context';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, 'telemetry');
const DEFAULT_OUTPUT = path.join(OUTPUT_DIR, 'llm-review-index.json');
const OUTPUT_ARG = process.argv.find(arg => arg.startsWith('--output='));
const OUTPUT_FILE = OUTPUT_ARG ? OUTPUT_ARG.replace('--output=', '') : DEFAULT_OUTPUT;
const JSON_OUTPUT = process.argv.includes('--json');
const HTML_OUTPUT = process.argv.includes('--html');
const VERBOSE = process.argv.includes('--verbose');

/**
 * Legacy category to canonical category mapping
 * Maintains backward compatibility while using canonical types
 */
const CATEGORY_MAPPING: Record<string, MigrationCategory> = {
  'ANY-TYPE': MigrationCategory.ANY_TYPE_ELIMINATION,
  'TYPE-ASSERTION': MigrationCategory.TYPE_ASSERTION_REPLACEMENT,
  'NON-NULL': MigrationCategory.NON_NULL_ASSERTION,
  'RETURN-TYPE': MigrationCategory.TYPE_INFERENCE_IMPROVEMENT,
  'UNTYPED-VAR': MigrationCategory.TYPE_INFERENCE_IMPROVEMENT,
  'TYPE-SYNTAX': MigrationCategory.TYPE_INFERENCE_IMPROVEMENT,
  'OPTIONAL-CHAINING': MigrationCategory.TYPE_INFERENCE_IMPROVEMENT,
  'EMPTY-CATCH': MigrationCategory.EMPTY_CATCH_ELIMINATION,
};

/**
 * Legacy priority to canonical severity mapping
 */
const PRIORITY_TO_SEVERITY: Record<string, Severity> = {
  'high': Severity.HIGH,
  'medium': Severity.MEDIUM,
  'low': Severity.LOW
};

/**
 * Extract LLM-REVIEW flags using canonical types
 * Format: // LLM-REVIEW::<CATEGORY>::<UUID>::<DETAILS>
 */
function extractLLMReviewFlags(content: string, filePath: string): LLMReviewFlag[] {
  const flags: LLMReviewFlag[] = [];
  const fileRef = createFileReference(filePath, ROOT_DIR);

  // Match standardized LLM-REVIEW format
  const regex = /\/\s+LLM-REVIEW::([A-Z-]+)::([a-f0-9]{8})::(.+?)($|\n)/g;
  let match;

  // Split content into lines for line numbers
  const lines = content.split('\n');

  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, legacyCategory, uuid, details] = match;

    // Calculate line number from match position
    const contentBeforeMatch = content.substring(0, match.index);
    const lineNumber = contentBeforeMatch.split('\n').length;

    // Get context lines (3 before, 3 after)
    const startLine = Math.max(0, lineNumber - 4);
    const endLine = Math.min(lines.length - 1, lineNumber + 2);
    const contextLines = lines.slice(startLine, endLine + 1);

    // Map legacy category to canonical
    const category = CATEGORY_MAPPING[legacyCategory] || MigrationCategory.TYPE_INFERENCE_IMPROVEMENT;

    // Determine severity based on category (canonical approach)
    let severity: Severity = Severity.MEDIUM;
    if (category === MigrationCategory.ANY_TYPE_ELIMINATION ||
        category === MigrationCategory.TYPE_ASSERTION_REPLACEMENT ||
        category === MigrationCategory.EMPTY_CATCH_ELIMINATION) {
      severity = Severity.HIGH;
    } else if (category === MigrationCategory.NON_NULL_ASSERTION) {
      severity = Severity.MEDIUM;
    } else {
      severity = Severity.LOW;
    }

    // Infer business domain from file path
    const domain = inferBusinessDomainFromPath(fileRef.relativePath);

    // Create canonical timestamp
    const timestamp = createCanonicalTimestamp();

    flags.push({
      id: createCanonicalId(uuid, 'uuid'),
      category,
      severity,
      details,
      location: {
        file: fileRef,
        position: {
          line: lineNumber,
          contextLines
        }
      },
      metadata: {
        author: {
          name: 'unknown',
          email: 'unknown',
          timestamp
        },
        source: 'automated',
        confidence: 0.95,
        reviewRequired: severity === Severity.HIGH || severity === Severity.CRITICAL
      },
      relationships: {
        blocks: [],
        blockedBy: [],
        related: []
      },
      flagFormat: {
        comment: fullMatch,
        uuid
      },
      domain
    });
  }

  return flags;
}

/**
 * Infer business domain from file path using canonical domains
 */
function inferBusinessDomainFromPath(relativePath: string): BusinessDomain {
  if (relativePath.includes('auth') || relativePath.includes('login')) {
    return BusinessDomain.USER_AUTHENTICATION;
  }
  if (relativePath.includes('chart') || relativePath.includes('viz') || relativePath.includes('dashboard')) {
    return BusinessDomain.DATA_VISUALIZATION;
  }
  if (relativePath.includes('health') || relativePath.includes('monitor')) {
    return BusinessDomain.SYSTEM_HEALTH;
  }
  if (relativePath.includes('config') || relativePath.includes('setting')) {
    return BusinessDomain.CONFIGURATION;
  }
  if (relativePath.includes('api') || relativePath.includes('service')) {
    return BusinessDomain.API_INTEGRATION;
  }
  if (relativePath.includes('component') || relativePath.includes('ui')) {
    return BusinessDomain.USER_INTERFACE;
  }
  if (relativePath.includes('shared') || relativePath.includes('util')) {
    return BusinessDomain.SHARED_UTILITIES;
  }
  return BusinessDomain.FOUNDATION;
}

/**
 * Add git blame info to flags using canonical attribution
 */
function enrichWithGitBlame(flags: LLMReviewFlag[]): LLMReviewFlag[] {
  return flags.map(flag => {
    try {
      // Get git blame info for the specific line
      const blameOutput = execSync(
        `git blame -L ${flag.location.position.line},${flag.location.position.line} -p ${flag.location.file.absolutePath}`,
        { encoding: 'utf-8' }
      );

      // Parse author info
      const authorMatch = blameOutput.match(/author (.+)/);
      const authorEmailMatch = blameOutput.match(/author-mail <(.+)>/);
      const authorDateMatch = blameOutput.match(/author-time ([0-9]+)/);

      if (authorMatch && authorEmailMatch && authorDateMatch) {
        const timestamp = parseInt(authorDateMatch[1], 10) * 1000;
        const authorTimestamp = createCanonicalTimestamp(new Date(timestamp));

        const enrichedAuthor: AuthorAttribution = {
          name: authorMatch[1],
          email: authorEmailMatch[1],
          timestamp: authorTimestamp
        };

        return {
          ...flag,
          metadata: {
            ...flag.metadata,
            author: enrichedAuthor
          }
        };
      }
    } catch (error) {
      if (VERBOSE) {
        console.warn(`Could not get git blame info for ${flag.location.file.relativePath}:${flag.location.position.line}`);
      }
    }

    return flag;
  });
}

/**
 * Convert canonical issues to legacy DebtIssue format for scoring
 * TODO: Canonicalize debt scoring system in future iteration
 */
function toLegacyDebtIssues(issues: CanonicalIssue[]): DebtIssue[] {
  return issues.map(issue => ({
    id: issue.id.value,
    category: issue.category,
    severity: issue.severity.toLowerCase() as 'high' | 'medium' | 'low',
    details: issue.details,
    filePath: issue.location.file.absolutePath,
    lineNumber: issue.location.position.line,
    interaction: issue.relationships.related.map(id => id.value)
  }));
}

/**
 * Convert legacy DebtScoreResult to canonical DebtScore
 */
function toCanonicalDebtScore(legacy: DebtScoreResult): DebtScore {
  return {
    raw: legacy.rawScore,
    normalized: legacy.normalizedScore,
    grade: legacy.grade,
    factors: {
      interactionCount: legacy.interactionFactor,
      dependencyDepth: 1, // Default - to be enhanced
      cyclomaticComplexity: 1, // Default - to be enhanced
      domainCriticality: legacy.contextualMultiplier,
      userImpact: legacy.contextualMultiplier
    },
    contextMultiplier: legacy.contextualMultiplier
  };
}

/**
 * Calculate TypeScript health metrics using canonical types
 */
function calculateCanonicalHealth(flags: LLMReviewFlag[]): HealthAssessment {
  // Convert to legacy format for existing scoring logic
  const legacyIssues = toLegacyDebtIssues(flags);
  const issuesWithInteractions = findRelatedIssues(legacyIssues);

  // Count by severity (canonical)
  const severityCounts = flags.reduce((acc, flag) => {
    acc[flag.severity] = (acc[flag.severity] || 0) + 1;
    return acc;
  }, {} as Record<Severity, number>);

  const totalFlags = flags.length;

  // Calculate severity distribution
  const severityDistribution: Distribution<Severity> = {
    byCategory: severityCounts,
    byPercentage: Object.entries(severityCounts).reduce((acc, [severity, count]) => {
      acc[severity as Severity] = totalFlags > 0 ? Math.round((count / totalFlags) * 100) : 0;
      return acc;
    }, {} as Record<Severity, number>),
    total: totalFlags
  };

  // Group files for component-level scoring
  const fileMap = new Map<string, DebtIssue[]>();
  for (const issue of issuesWithInteractions) {
    if (!fileMap.has(issue.filePath)) {
      fileMap.set(issue.filePath, []);
    }
    fileMap.get(issue.filePath)!.push(issue);
  }

  // Calculate file scores using existing complexity scoring
  const fileScores = new Map<string, DebtScoreResult>();
  for (const [filePath, fileIssues] of fileMap.entries()) {
    const context = analyzeComponentCriticality(filePath);
    const score = calculateComplexityDebtScore(fileIssues, context);
    fileScores.set(filePath, score);
  }

  // Calculate interaction factor
  let totalInteractionFactor = 0;
  for (const score of fileScores.values()) {
    totalInteractionFactor += score.interactionFactor;
  }
  const avgInteractionFactor = fileScores.size > 0
    ? totalInteractionFactor / fileScores.size
    : 1.0;

  // Get worst components by score
  const criticalComponents = Array.from(fileScores.entries())
    .sort((a, b) => b[1].normalizedScore - a[1].normalizedScore)
    .slice(0, 5)
    .map(([filePath, score]) => ({
      file: createFileReference(filePath, ROOT_DIR),
      score: toCanonicalDebtScore(score),
      issueCount: fileMap.get(filePath)?.length || 0
    }));

  // Calculate domain health map
  const domainHealth: Record<BusinessDomain, { score: DebtScore; issueCount: number }> = {};
  const domainIssues = new Map<BusinessDomain, DebtIssue[]>();

  // Group issues by domain
  for (const flag of flags) {
    const domain = flag.domain;
    const legacyIssue = toLegacyDebtIssues([flag])[0];

    if (!domainIssues.has(domain)) {
      domainIssues.set(domain, []);
    }
    domainIssues.get(domain)!.push(legacyIssue);
  }

  // Calculate domain scores
  for (const [domain, issues] of domainIssues.entries()) {
    const domainContext: DebtScoreContext = {
      componentType: 'domain',
      domainId: domain,
      isSharedComponent: false,
      dependencyCount: 0,
      userFacing: false,
      apiSurface: 'internal',
      inCriticalPath: domain === BusinessDomain.FOUNDATION ||
                     domain === BusinessDomain.SYSTEM_HEALTH
    };

    const score = calculateComplexityDebtScore(issues, domainContext);
    domainHealth[domain] = {
      score: toCanonicalDebtScore(score),
      issueCount: issues.length
    };
  }

  // Calculate complexity-weighted overall score
  let complexityWeightedTotal = 0;
  let complexityDivisor = 0;

  for (const score of fileScores.values()) {
    complexityWeightedTotal += score.normalizedScore * score.contextualMultiplier;
    complexityDivisor += score.contextualMultiplier;
  }

  const contextualComplexity = complexityDivisor > 0
    ? complexityWeightedTotal / complexityDivisor
    : 0;

  // Calculate overall debt score
  const overallScore: DebtScore = {
    raw: contextualComplexity,
    normalized: contextualComplexity,
    grade: contextualComplexity < 0.2 ? 'A' :
           contextualComplexity < 0.4 ? 'B' :
           contextualComplexity < 0.6 ? 'C' :
           contextualComplexity < 0.8 ? 'D' : 'F',
    factors: {
      interactionCount: avgInteractionFactor,
      dependencyDepth: 1,
      cyclomaticComplexity: 1,
      domainCriticality: contextualComplexity,
      userImpact: contextualComplexity
    },
    contextMultiplier: avgInteractionFactor
  };

  // Calculate effort estimates with complexity adjustment
  const complexityFactor = Math.max(1, Math.min(3, avgInteractionFactor));
  const storyPointsDistribution: Distribution<Severity> & { total: number } = {
    byCategory: {
      [Severity.HIGH]: Math.round((severityCounts[Severity.HIGH] || 0) * 3 * complexityFactor),
      [Severity.MEDIUM]: Math.round((severityCounts[Severity.MEDIUM] || 0) * 2 * complexityFactor),
      [Severity.LOW]: Math.round((severityCounts[Severity.LOW] || 0) * 1 * complexityFactor),
      [Severity.CRITICAL]: Math.round((severityCounts[Severity.CRITICAL] || 0) * 5 * complexityFactor)
    },
    byPercentage: {
      [Severity.HIGH]: 0, // Calculated below
      [Severity.MEDIUM]: 0,
      [Severity.LOW]: 0,
      [Severity.CRITICAL]: 0
    },
    total: 0
  };

  storyPointsDistribution.total = Object.values(storyPointsDistribution.byCategory).reduce((sum, val) => sum + val, 0);

  // Calculate percentages for story points
  Object.keys(storyPointsDistribution.byCategory).forEach(severity => {
    const sev = severity as Severity;
    storyPointsDistribution.byPercentage[sev] = storyPointsDistribution.total > 0
      ? Math.round((storyPointsDistribution.byCategory[sev] / storyPointsDistribution.total) * 100)
      : 0;
  });

  const hoursDistribution: Distribution<Severity> & { total: number } = {
    byCategory: {
      [Severity.HIGH]: storyPointsDistribution.byCategory[Severity.HIGH] * 4,
      [Severity.MEDIUM]: storyPointsDistribution.byCategory[Severity.MEDIUM] * 3,
      [Severity.LOW]: storyPointsDistribution.byCategory[Severity.LOW] * 2,
      [Severity.CRITICAL]: storyPointsDistribution.byCategory[Severity.CRITICAL] * 8
    },
    byPercentage: {
      [Severity.HIGH]: 0,
      [Severity.MEDIUM]: 0,
      [Severity.LOW]: 0,
      [Severity.CRITICAL]: 0
    },
    total: 0
  };

  hoursDistribution.total = Object.values(hoursDistribution.byCategory).reduce((sum, val) => sum + val, 0);

  Object.keys(hoursDistribution.byCategory).forEach(severity => {
    const sev = severity as Severity;
    hoursDistribution.byPercentage[sev] = hoursDistribution.total > 0
      ? Math.round((hoursDistribution.byCategory[sev] / hoursDistribution.total) * 100)
      : 0;
  });

  return {
    overallScore,
    typeSafetyGrade: overallScore.grade,
    distribution: severityDistribution,
    estimatedEffort: {
      storyPoints: storyPointsDistribution,
      hours: hoursDistribution
    },
    interactionFactor: avgInteractionFactor,
    contextualComplexity,
    criticalComponents,
    domainHealth
  };
}

/**
 * Generate canonical summary statistics
 */
function generateCanonicalSummary(flags: LLMReviewFlag[]): SummaryStatistics {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Initialize distributions
  const severityDist: Distribution<Severity> = {
    byCategory: { [Severity.LOW]: 0, [Severity.MEDIUM]: 0, [Severity.HIGH]: 0, [Severity.CRITICAL]: 0 },
    byPercentage: { [Severity.LOW]: 0, [Severity.MEDIUM]: 0, [Severity.HIGH]: 0, [Severity.CRITICAL]: 0 },
    total: flags.length
  };

  const categoryDist: Distribution<MigrationCategory> = {
    byCategory: {},
    byPercentage: {},
    total: flags.length
  };

  const domainDist: Distribution<BusinessDomain> = {
    byCategory: {},
    byPercentage: {},
    total: flags.length
  };

  const directoryDist: Distribution<string> = {
    byCategory: {},
    byPercentage: {},
    total: flags.length
  };

  const authorDist: Distribution<string> = {
    byCategory: {},
    byPercentage: {},
    total: flags.length
  };

  let last7Count = 0, last30Count = 0, last90Count = 0;

  // Process each flag
  for (const flag of flags) {
    // Count by severity
    severityDist.byCategory[flag.severity]++;

    // Count by category
    categoryDist.byCategory[flag.category] = (categoryDist.byCategory[flag.category] || 0) + 1;

    // Count by domain
    domainDist.byCategory[flag.domain] = (domainDist.byCategory[flag.domain] || 0) + 1;

    // Count by directory
    const topDir = flag.location.file.relativePath.split('/')[0];
    directoryDist.byCategory[topDir] = (directoryDist.byCategory[topDir] || 0) + 1;

    // Count by author
    const authorName = flag.metadata.author.name;
    if (authorName !== 'unknown') {
      authorDist.byCategory[authorName] = (authorDist.byCategory[authorName] || 0) + 1;
    }

    // Count by timeframe
    const flagTime = new Date(flag.metadata.author.timestamp.epoch);
    if (flagTime >= last7Days) last7Count++;
    if (flagTime >= last30Days) last30Count++;
    if (flagTime >= last90Days) last90Count++;
  }

  // Calculate percentages for all distributions
  const calculatePercentages = <T extends string>(dist: Distribution<T>) => {
    Object.keys(dist.byCategory).forEach(key => {
      const k = key as T;
      dist.byPercentage[k] = dist.total > 0
        ? Math.round(((dist.byCategory[k] || 0) / dist.total) * 100)
        : 0;
    });
  };

  calculatePercentages(severityDist);
  calculatePercentages(categoryDist);
  calculatePercentages(domainDist);
  calculatePercentages(directoryDist);
  calculatePercentages(authorDist);

  const temporal: TemporalMetrics = {
    last7Days: last7Count,
    last30Days: last30Count,
    last90Days: last90Count,
    trends: {
      daily: last7Count / 7,
      weekly: last30Count / 4,
      monthly: last90Count / 3
    }
  };

  return {
    totalIssues: flags.length,
    severity: severityDist,
    categories: categoryDist,
    domains: domainDist,
    directories: directoryDist,
    authors: authorDist,
    temporal
  };
}

/**
 * Generate HTML report content using canonical types
 */
function createCanonicalHTMLReport(report: CanonicalReport): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeScript Technical Debt Report - Canonical Model</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px;
    }
    h1, h2, h3 { color: #0066cc; }
    .card {
      background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .stat-card {
      background: white; padding: 15px; border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value { font-size: 32px; font-weight: bold; color: #0066cc; }
    .stat-label { font-size: 14px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .severity-high { color: #e53e3e; }
    .severity-medium { color: #dd6b20; }
    .severity-low { color: #38a169; }
    .severity-critical { color: #c53030; font-weight: bold; }
    .grade-A { color: #38a169; }
    .grade-B { color: #68d391; }
    .grade-C { color: #f6e05e; }
    .grade-D { color: #ed8936; }
    .grade-F { color: #e53e3e; }
  </style>
</head>
<body>
  <h1>📊 TypeScript Technical Debt Report</h1>
  <p><strong>Generated:</strong> ${report.generatedAt.iso}</p>
  <p><strong>Canonical Model Version:</strong> ${report.metadata.toolVersion}</p>

  <div class="card">
    <h2>🎯 Canonical Health Assessment</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value grade-${report.health.typeSafetyGrade}">${report.health.typeSafetyGrade}</div>
        <div class="stat-label">Type Safety Grade</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.summary.totalIssues}</div>
        <div class="stat-label">Total Issues</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(report.health.overallScore.normalized * 100)}%</div>
        <div class="stat-label">Debt Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.health.estimatedEffort.storyPoints.total}</div>
        <div class="stat-label">Story Points</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.health.interactionFactor.toFixed(2)}×</div>
        <div class="stat-label">Interaction Factor</div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>📈 Severity Distribution (Canonical)</h2>
    <table>
      <tr>
        <th>Severity</th>
        <th>Count</th>
        <th>Percentage</th>
        <th>Story Points</th>
      </tr>
      ${Object.entries(report.health.distribution.byCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([severity, count]) => `
          <tr>
            <td class="severity-${severity.toLowerCase()}">${severity}</td>
            <td>${count}</td>
            <td>${report.health.distribution.byPercentage[severity as Severity]}%</td>
            <td>${report.health.estimatedEffort.storyPoints.byCategory[severity as Severity]}</td>
          </tr>
        `).join('')}
    </table>
  </div>

  <div class="card">
    <h2>🏗️ Domain Health Map</h2>
    <table>
      <tr>
        <th>Domain</th>
        <th>Issues</th>
        <th>Grade</th>
        <th>Score</th>
      </tr>
      ${Object.entries(report.health.domainHealth)
        .sort(([, a], [, b]) => b.score.normalized - a.score.normalized)
        .map(([domain, health]) => `
          <tr>
            <td>${domain.replace(/_/g, ' ')}</td>
            <td>${health.issueCount}</td>
            <td class="grade-${health.score.grade}">${health.score.grade}</td>
            <td>${Math.round(health.score.normalized * 100)}%</td>
          </tr>
        `).join('')}
    </table>
  </div>

  <div class="card">
    <h2>🚨 Critical Components</h2>
    <table>
      <tr>
        <th>File</th>
        <th>Issues</th>
        <th>Grade</th>
        <th>Score</th>
      </tr>
      ${report.health.criticalComponents
        .map(component => `
          <tr>
            <td>${component.file.relativePath}</td>
            <td>${component.issueCount}</td>
            <td class="grade-${component.score.grade}">${component.score.grade}</td>
            <td>${Math.round(component.score.normalized * 100)}%</td>
          </tr>
        `).join('')}
    </table>
  </div>

  <div class="card">
    <h2>🔍 High Priority Issues</h2>
    <table>
      <tr>
        <th>File</th>
        <th>Line</th>
        <th>Category</th>
        <th>Domain</th>
        <th>Details</th>
      </tr>
      ${report.issues
        .filter(issue => isHighSeverity(issue))
        .map(issue => `
          <tr>
            <td>${issue.location.file.relativePath}</td>
            <td>${issue.location.position.line}</td>
            <td>${issue.category}</td>
            <td>${isLLMReviewFlag(issue) ? issue.domain : 'N/A'}</td>
            <td>${issue.details}</td>
          </tr>
        `).join('')}
    </table>
  </div>

  <div class="card">
    <h2>📊 Execution Metadata</h2>
    <ul>
      <li><strong>Execution Time:</strong> ${report.metadata.executionTimeMs}ms</li>
      <li><strong>Tool Version:</strong> ${report.metadata.toolVersion}</li>
      <li><strong>Total Files Scanned:</strong> ${Object.keys(report.metadata.scanParameters).length}</li>
    </ul>
  </div>
</body>
</html>`;
}

/**
 * Main function using canonical types
 */
function main(): void {
  const startTime = Date.now();

  if (VERBOSE) {
    console.log('🔍 LLM-REVIEW Canonical Flags Inventory Tool');
    console.log('📊 Using canonical domain model for type safety...\n');
  }

  // Find all TypeScript/JavaScript files
  const files = glob.sync([
    '**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.next/**'
  ]);

  if (VERBOSE) {
    console.log(`📁 Found ${files.length} files to scan`);
  }

  let allFlags: LLMReviewFlag[] = [];

  // Process each file
  for (const file of files) {
    const filePath = path.resolve(ROOT_DIR, file);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileFlags = extractLLMReviewFlags(content, filePath);

      if (fileFlags.length > 0 && VERBOSE) {
        console.log(`🚩 ${file}: ${fileFlags.length} LLM-REVIEW flags`);
      }

      allFlags = [...allFlags, ...fileFlags];
    } catch (error) {
      if (VERBOSE) {
        console.warn(`⚠️ Error processing ${file}: ${error}`);
      }
    }
  }

  // Enrich with git blame info
  allFlags = enrichWithGitBlame(allFlags);

  const executionTimeMs = Date.now() - startTime;

  // Generate canonical report
  const report: CanonicalReport = {
    id: createCanonicalId(`inventory-${Date.now()}`, 'composite'),
    generatedAt: createCanonicalTimestamp(),
    summary: generateCanonicalSummary(allFlags),
    health: calculateCanonicalHealth(allFlags),
    issues: allFlags,
    verificationPlans: [], // TODO: Generate verification plans
    metadata: {
      toolVersion: '2.0.0-canonical',
      scanParameters: { fileCount: files.length, rootDir: ROOT_DIR },
      executionTimeMs
    }
  };

  // Create output directory
  execSync(`mkdir -p ${path.dirname(OUTPUT_FILE)}`, { encoding: 'utf-8' });

  // Save canonical JSON report
  writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf-8');

  if (VERBOSE) {
    console.log(`✅ Saved canonical inventory to ${OUTPUT_FILE} (${allFlags.length} flags)`);
  }

  // Generate HTML report if requested
  if (HTML_OUTPUT) {
    const htmlOutputFile = OUTPUT_FILE.replace('.json', '.html');
    const htmlReport = createCanonicalHTMLReport(report);
    writeFileSync(htmlOutputFile, htmlReport, 'utf-8');

    if (VERBOSE) {
      console.log(`✅ Saved canonical HTML report to ${htmlOutputFile}`);
    }
  }

  // Output JSON to stdout if requested
  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    // Print canonical summary
    console.log(`\n┌────────────────────────────────────────────────┐`);
    console.log(`│ 🧠 CANONICAL TECHNICAL DEBT INVENTORY          │`);
    console.log(`└────────────────────────────────────────────────┘`);
    console.log(`• Total issues: ${report.summary.totalIssues}`);
    console.log(`• 🔴 High priority: ${report.summary.severity.byCategory[Severity.HIGH] || 0}`);
    console.log(`• 🟠 Medium priority: ${report.summary.severity.byCategory[Severity.MEDIUM] || 0}`);
    console.log(`• 🟢 Low priority: ${report.summary.severity.byCategory[Severity.LOW] || 0}`);
    console.log(`• ⚡ Critical priority: ${report.summary.severity.byCategory[Severity.CRITICAL] || 0}`);
    console.log(`• Type safety grade: ${report.health.typeSafetyGrade}`);
    console.log(`• Canonical debt score: ${(report.health.overallScore.normalized * 100).toFixed(1)}%`);
    console.log(`• Interaction factor: ${report.health.interactionFactor.toFixed(2)}×`);
    console.log(`• Total story points: ${report.health.estimatedEffort.storyPoints.total}`);
    console.log(`• Execution time: ${report.metadata.executionTimeMs}ms`);

    if (report.health.criticalComponents.length > 0) {
      console.log(`\n🔍 Most Critical Components:`);
      report.health.criticalComponents.slice(0, 3).forEach(component => {
        console.log(`• ${component.file.relativePath} (Grade ${component.score.grade}, ${component.issueCount} issues)`);
      });
    }

    console.log(`\n📋 Canonical Model Benefits:`);
    console.log(`1. ✅ SOLID compliance with single responsibility types`);
    console.log(`2. ✅ SSOT enforcement across all modules`);
    console.log(`3. ✅ DRY elimination of duplicate type definitions`);
    console.log(`4. ✅ Type-safe inter-module communication`);

    console.log(`\n📊 Full canonical report: ${OUTPUT_FILE}`);
  }
}

// Export canonical functions for direct imports
export {
  extractLLMReviewFlags,
  enrichWithGitBlame,
  generateCanonicalSummary,
  calculateCanonicalHealth,
  createCanonicalHTMLReport,
  toLegacyDebtIssues,
  toCanonicalDebtScore
};

// Execute if run directly
if (import.meta.url === `file:/${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}
