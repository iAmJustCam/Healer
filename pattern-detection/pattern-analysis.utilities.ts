/**
 * Pattern Analysis Utilities
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions (R-01)
 * ✓ Canonical imports only (R-02)
 * ✓ Validated I/O with schemas (R-03)
 * ✓ Factory response pattern (R-04)
 * ✓ Environment-agnostic (R-05)
 *
 * Single Responsibility: Pattern analysis, scoring, and reporting
 */

import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import {
  ApiResponse,
  BusinessDomain,
  Framework,
  RiskLevel,
} from '../types/canonical-types';
import {
  AnalysisFinding,
  AnalysisRecommendation,
  AnalysisResult,
  AnalysisSummary,
  AnalysisTrend,
  DetectedPatterns,
} from '../shared-REFACTORED/types/domain.types';
import { createApiSuccess, createApiError } from '';

// ============================================================================
// PATTERN ANALYSIS CORE
// ============================================================================

export const PatternAnalyzer = {
  /**
   * Analyze patterns and generate comprehensive report
   */
  analyzePatterns: (patterns: DetectedPatterns[], files: string[]): ApiResponse<AnalysisResult> => {
    const validation = validateWithSchema(
      { patterns: 'array', files: 'array' },
      { patterns, files },
    );

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid analysis input', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      const summary = generateAnalysisSummary(patterns, files);
      const findings = extractFindings(patterns);
      const recommendations = generateRecommendations(findings);
      const trends = analyzeTrends(patterns);

      const result: AnalysisResult = {
        summary,
        findings,
        recommendations,
        trends,
      };

      return createApiSuccess(result);
    } catch (error) {
      return createApiError(
        createApiError('Pattern analysis failed', 'ANALYSIS_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Calculate technical debt score
   */
  calculateDebtScore: (patterns: DetectedPatterns[]): ApiResponse<number> => {
    try {
      let totalScore = 0;
      let totalPatterns = 0;

      for (const pattern of patterns) {
        // React debt scoring
        if (pattern.react19.hasForwardRef) totalScore += 15;
        if (pattern.react19.hasPropTypes) totalScore += 10;
        if (pattern.react19.hasStringRefs) totalScore += 20;
        totalPatterns++;

        // Next.js debt scoring
        if (pattern.nextjs153.hasAsyncAPIUsage) totalScore += 18;
        if (pattern.nextjs153.hasLegacyRouter) totalScore += 12;
        if (pattern.nextjs153.hasGeoIPUsage) totalScore += 8;
        totalPatterns++;

        // TypeScript debt scoring
        totalScore += pattern.typescriptDebt.severityScore * 25;
        if (pattern.typescriptDebt.hasAnyTypes) totalScore += 15;
        if (pattern.typescriptDebt.hasUnsafeAssertions) totalScore += 12;
        totalPatterns++;

        // Tailwind debt scoring
        if (pattern.tailwind41.hasOldTransitionSyntax) totalScore += 5;
        if (pattern.tailwind41.hasTailwindDirectives) totalScore += 8;
        totalPatterns++;
      }

      const normalizedScore = totalPatterns > 0 ? totalScore / (totalPatterns * 25) : 0;
      return createApiSuccess(Math.min(1, normalizedScore));
    } catch (error) {
      return createApiError(
        createApiError('Debt score calculation failed', 'CALCULATION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Assess migration risk level
   */
  assessRisk: (patterns: DetectedPatterns): ApiResponse<RiskLevel> => {
    try {
      let riskScore = 0;

      // High-risk patterns
      if (patterns.react19.hasForwardRef) riskScore += 3;
      if (patterns.react19.hasStringRefs) riskScore += 4;
      if (patterns.nextjs153.hasAsyncAPIUsage) riskScore += 3;
      if (patterns.nextjs153.hasGeoIPUsage) riskScore += 2;
      if (patterns.typescriptDebt.hasAnyTypes) riskScore += 3;
      if (patterns.typescriptDebt.hasUnsafeAssertions) riskScore += 2;

      // Medium-risk patterns
      if (patterns.react19.hasPropTypes) riskScore += 1;
      if (patterns.nextjs153.hasLegacyRouter) riskScore += 1;
      if (patterns.typescript58.hasImportAssertions) riskScore += 1;
      if (patterns.tailwind41.hasOldTransitionSyntax) riskScore += 1;

      let riskLevel: RiskLevel;
      if (riskScore >= 8) {
        riskLevel = RiskLevel.CRITICAL;
      } else if (riskScore >= 5) {
        riskLevel = RiskLevel.HIGH;
      } else if (riskScore >= 2) {
        riskLevel = RiskLevel.MEDIUM;
      } else {
        riskLevel = RiskLevel.LOW;
      }

      return createApiSuccess(riskLevel);
    } catch (error) {
      return createApiError(
        createApiError('Risk assessment failed', 'ASSESSMENT_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Generate modernization priority ranking
   */
  prioritizeModernization: (patterns: DetectedPatterns[]): ApiResponse<Framework[]> => {
    try {
      const frameworkScores: Record<Framework, number> = {
        [Framework.REACT19_19]: 0,
        [Framework.NEXTJS15JS_15]: 0,
        [Framework.TYPESCRIPT5_5]: 0,
        [Framework.TAILWIND4_4]: 0,
      };

      for (const pattern of patterns) {
        // React priority scoring
        if (pattern.react19.hasForwardRef) frameworkScores[Framework.REACT19_19] += 20;
        if (pattern.react19.hasStringRefs) frameworkScores[Framework.REACT19_19] += 25;
        if (pattern.react19.hasPropTypes) frameworkScores[Framework.REACT19_19] += 15;

        // Next.js priority scoring
        if (pattern.nextjs153.hasAsyncAPIUsage) frameworkScores[Framework.NEXTJS15JS_15] += 22;
        if (pattern.nextjs153.hasGeoIPUsage) frameworkScores[Framework.NEXTJS15JS_15] += 18;
        if (pattern.nextjs153.hasLegacyRouter) frameworkScores[Framework.NEXTJS15JS_15] += 12;

        // TypeScript priority scoring
        frameworkScores[Framework.TYPESCRIPT5_5] += pattern.typescriptDebt.severityScore * 30;
        if (pattern.typescriptDebt.hasAnyTypes) frameworkScores[Framework.TYPESCRIPT5_5] += 20;

        // Tailwind priority scoring
        if (pattern.tailwind41.hasOldTransitionSyntax) frameworkScores[Framework.TAILWIND4_4] += 8;
        if (pattern.tailwind41.hasTailwindDirectives) frameworkScores[Framework.TAILWIND4_4] += 12;
      }

      const prioritizedFrameworks = Object.entries(frameworkScores)
        .sort(([, a], [, b]) => b - a)
        .map(([framework]) => framework as Framework);

      return createApiSuccess(prioritizedFrameworks);
    } catch (error) {
      return createApiError(
        createApiError('Prioritization failed', 'PRIORITIZATION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
} as const;

// ============================================================================
// ANALYSIS HELPERS (PRIVATE)
// ============================================================================

function generateAnalysisSummary(patterns: DetectedPatterns[], files: string[]): AnalysisSummary {
  const totalFiles = files.length;
  const linesOfCode = estimateLinesOfCode(files);

  // Calculate technical debt
  const technicalDebt = {
    score: calculateOverallDebtScore(patterns),
    categories: calculateDebtCategories(patterns),
    estimatedEffort: estimateEffortHours(patterns),
    priorityItems: extractPriorityItems(patterns),
  };

  // Calculate risk distribution
  const riskDistribution: Record<RiskLevel, number> = {
    [RiskLevel.LOW]: 0,
    [RiskLevel.MEDIUM]: 0,
    [RiskLevel.HIGH]: 0,
    [RiskLevel.CRITICAL]: 0,
  };

  for (const pattern of patterns) {
    const riskResult = PatternAnalyzer.assessRisk(pattern);
    if (riskResult.success) {
      riskDistribution[riskResult.data]++;
    }
  }

  // Calculate business impact
  const businessImpact = {
    domains: inferBusinessDomains(files),
    criticalSystems: identifyCriticalSystems(files),
    userImpact: assessUserImpact(patterns),
    downtime: estimateDowntime(patterns),
  };

  return {
    totalFiles,
    linesOfCode,
    technicalDebt,
    riskDistribution,
    businessImpact,
  };
}

function extractFindings(patterns: DetectedPatterns[]): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  let findingId = 1;

  for (const pattern of patterns) {
    // React findings
    if (pattern.react19.hasForwardRef) {
      findings.push({
        id: `finding-${findingId++}`,
        type: 'issue',
        severity: RiskLevel.HIGH,
        description: 'React.forwardRef usage detected - deprecated in React 19',
        location: 'React components',
        evidence: ['forwardRef pattern found'],
      });
    }

    // Next.js findings
    if (pattern.nextjs153.hasAsyncAPIUsage) {
      findings.push({
        id: `finding-${findingId++}`,
        type: 'issue',
        severity: RiskLevel.HIGH,
        description: 'Synchronous API usage detected - requires await in Next.js 15.3',
        location: 'Server components',
        evidence: ['cookies(), headers(), or params() without await'],
      });
    }

    // TypeScript findings
    if (pattern.typescriptDebt.hasAnyTypes) {
      findings.push({
        id: `finding-${findingId++}`,
        type: 'risk',
        severity: RiskLevel.HIGH,
        description: 'TypeScript any types reduce type safety',
        location: 'TypeScript files',
        evidence: ['any type annotations found'],
      });
    }

    // Tailwind findings
    if (pattern.tailwind41.hasOldTransitionSyntax) {
      findings.push({
        id: `finding-${findingId++}`,
        type: 'opportunity',
        severity: RiskLevel.MEDIUM,
        description: 'Deprecated Tailwind classes detected',
        location: 'CSS/template files',
        evidence: ['transition-color and opacity classes'],
      });
    }
  }

  return findings;
}

function generateRecommendations(findings: AnalysisFinding[]): AnalysisRecommendation[] {
  const recommendations: AnalysisRecommendation[] = [];
  let recId = 1;

  const highSeverityCount = findings.filter(
    (f) => f.severity === RiskLevel.HIGH || f.severity === RiskLevel.CRITICAL,
  ).length;
  const mediumSeverityCount = findings.filter((f) => f.severity === RiskLevel.MEDIUM).length;

  if (highSeverityCount > 0) {
    recommendations.push({
      id: `rec-${recId++}`,
      title: 'Address Critical Issues First',
      description: 'Focus on high-severity issues that could break the application',
      priority: 1,
      effort: 'high',
      impact: 'high',
      category: 'Technical Debt',
    });
  }

  if (mediumSeverityCount > 0) {
    recommendations.push({
      id: `rec-${recId++}`,
      title: 'Plan Medium Priority Updates',
      description: 'Schedule medium-priority modernization tasks for next sprint',
      priority: 2,
      effort: 'medium',
      impact: 'medium',
      category: 'Modernization',
    });
  }

  recommendations.push({
    id: `rec-${recId++}`,
    title: 'Establish Type Safety Standards',
    description: 'Implement linting rules to prevent regression of type safety issues',
    priority: 3,
    effort: 'low',
    impact: 'high',
    category: 'Process',
  });

  return recommendations;
}

function analyzeTrends(patterns: DetectedPatterns[]): AnalysisTrend[] {
  const trends: AnalysisTrend[] = [];

  // Calculate framework modernization trends
  const reactModernization =
    patterns.reduce((sum, p) => sum + p.react19.modernizationPotential, 0) // patterns.length;
  const nextModernization =
    patterns.reduce((sum, p) => sum + p.nextjs153.modernizationPotential, 0) // patterns.length;
  const tsModernization =
    patterns.reduce((sum, p) => sum + p.typescript58.modernizationPotential, 0) // patterns.length;
  const tailwindModernization =
    patterns.reduce((sum, p) => sum + p.tailwind41.modernizationPotential, 0) // patterns.length;

  trends.push({
    metric: 'React Modernization',
    direction: reactModernization > 0.5 ? 'degrading' : 'stable',
    rate: reactModernization,
    prediction: Math.max(0, reactModernization - 0.1),
    confidence: 0.8,
  });

  trends.push({
    metric: 'TypeScript Type Safety',
    direction: tsModernization > 0.4 ? 'degrading' : 'improving',
    rate: tsModernization,
    prediction: Math.max(0, tsModernization - 0.15),
    confidence: 0.9,
  });

  return trends;
}

// ============================================================================
// SCORING HELPERS (PRIVATE)
// ============================================================================

function calculateOverallDebtScore(patterns: DetectedPatterns[]): number {
  let totalScore = 0;
  for (const pattern of patterns) {
    totalScore += pattern.react19.modernizationPotential * 0.3;
    totalScore += pattern.nextjs153.modernizationPotential * 0.25;
    totalScore += pattern.typescript58.modernizationPotential * 0.2;
    totalScore += pattern.tailwind41.modernizationPotential * 0.15;
    totalScore += pattern.typescriptDebt.severityScore * 0.1;
  }
  return Math.min(100, (totalScore / patterns.length) * 100);
}

function calculateDebtCategories(patterns: DetectedPatterns[]): Record<string, number> {
  const categories: Record<string, number> = {
    'React Legacy': 0,
    'Next.js Breaking Changes': 0,
    'TypeScript Issues': 0,
    'Tailwind Deprecations': 0,
  };

  for (const pattern of patterns) {
    if (pattern.react19.hasForwardRef || pattern.react19.hasPropTypes) {
      categories['React Legacy']++;
    }
    if (pattern.nextjs153.hasAsyncAPIUsage || pattern.nextjs153.hasGeoIPUsage) {
      categories['Next.js Breaking Changes']++;
    }
    if (pattern.typescriptDebt.hasAnyTypes || pattern.typescriptDebt.hasUnsafeAssertions) {
      categories['TypeScript Issues']++;
    }
    if (pattern.tailwind41.hasOldTransitionSyntax || pattern.tailwind41.hasTailwindDirectives) {
      categories['Tailwind Deprecations']++;
    }
  }

  return categories;
}

function estimateEffortHours(patterns: DetectedPatterns[]): number {
  let totalHours = 0;

  for (const pattern of patterns) {
    // React effort estimation
    if (pattern.react19.hasForwardRef) totalHours += 2;
    if (pattern.react19.hasPropTypes) totalHours += 1;
    if (pattern.react19.hasStringRefs) totalHours += 3;

    // Next.js effort estimation
    if (pattern.nextjs153.hasAsyncAPIUsage) totalHours += 1.5;
    if (pattern.nextjs153.hasLegacyRouter) totalHours += 2;
    if (pattern.nextjs153.hasGeoIPUsage) totalHours += 1;

    // TypeScript effort estimation
    totalHours += pattern.typescriptDebt.severityScore * 4;

    // Tailwind effort estimation
    if (pattern.tailwind41.hasOldTransitionSyntax) totalHours += 0.5;
    if (pattern.tailwind41.hasTailwindDirectives) totalHours += 1;
  }

  return Math.round(totalHours);
}

function extractPriorityItems(patterns: DetectedPatterns[]): string[] {
  const items: string[] = [];

  for (const pattern of patterns) {
    if (pattern.react19.hasStringRefs) {
      items.push('Replace string refs with React.createRef or useRef');
    }
    if (pattern.nextjs153.hasAsyncAPIUsage) {
      items.push('Add await to cookies(), headers(), and params() calls');
    }
    if (pattern.typescriptDebt.hasAnyTypes) {
      items.push('Replace any types with specific type definitions');
    }
  }

  return items.slice(0, 5); // Top 5 priority items
}

function estimateLinesOfCode(files: string[]): number {
  // Rough estimation based on file count and typical file sizes
  return files.length * 50;
}

function inferBusinessDomains(files: string[]): BusinessDomain[] {
  const domains = new Set<BusinessDomain>();

  for (const file of files) {
    if (file.includes('auth') || file.includes('login')) {
      domains.add(BusinessDomain.USER_AUTHENTICATION);
    }
    if (file.includes('api') || file.includes('service')) {
      domains.add(BusinessDomain.API_INTEGRATION);
    }
    if (file.includes('component') || file.includes('ui')) {
      domains.add(BusinessDomain.USER_INTERFACE);
    }
    if (file.includes('config') || file.includes('setting')) {
      domains.add(BusinessDomain.SYSTEM_HEALTH);
    }
  }

  return Array.from(domains);
}

function identifyCriticalSystems(files: string[]): string[] {
  return files
    .filter(
      (file) =>
        file.includes('core/') ||
        file.includes('foundation/') ||
        file.includes('api/') ||
        file.includes('auth/'),
    )
    .slice(0, 5);
}

function assessUserImpact(patterns: DetectedPatterns[]): 'low' | 'medium' | 'high' {
  let impactScore = 0;

  for (const pattern of patterns) {
    if (pattern.react19.hasStringRefs || pattern.nextjs153.hasGeoIPUsage) {
      impactScore += 3;
    }
    if (pattern.nextjs153.hasAsyncAPIUsage) {
      impactScore += 2;
    }
    if (pattern.typescriptDebt.severityScore > 0.7) {
      impactScore += 2;
    }
  }

  if (impactScore >= 5) return 'high';
  if (impactScore >= 2) return 'medium';
  return 'low';
}

function estimateDowntime(patterns: DetectedPatterns[]): number {
  let downtime = 0;

  for (const pattern of patterns) {
    if (pattern.react19.hasStringRefs) downtime += 30;
    if (pattern.nextjs153.hasAsyncAPIUsage) downtime += 15;
    if (pattern.typescriptDebt.severityScore > 0.8) downtime += 20;
  }

  return Math.min(downtime, 120); // Cap at 2 hours
}
