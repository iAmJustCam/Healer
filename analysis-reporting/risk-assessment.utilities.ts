/**
 * Risk Assessment Utilities - Pure Risk Calculation Functions
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on Foundation Types (Layer 0)
 * ✓ Pure utility functions only - no side effects
 * ✓ Environment-agnostic
 * ✓ Single responsibility: Risk assessment only (SRP)
 * ✓ All inputs validated with canonical schemas
 */

import { z } from 'zod';
import { ApiResponse, Framework, RiskLevel, Severity } from '';
import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import { createApiError } from '../shared-REFACTORED/utilities/error.utilities';
import { ApiUtilities } from '';

// Input validation schemas
const MigrationRiskRequestSchema = z.object({
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
      framework: z.enum(['react19', 'nextjs15', 'typescript5', 'tailwind4']).optional(),
    }),
  ),
  fileCount: z.number().min(0),
  hasTests: z.boolean().default(true),
});

const FrameworkRiskRequestSchema = z.object({
  patterns: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(['info', 'warning', 'error', 'critical']),
      framework: z.enum(['react19', 'nextjs15', 'typescript5', 'tailwind4']),
    }),
  ),
});

/**
 * Assess overall migration risk from patterns and context
 */
export function assessMigrationRisk(request: unknown): ApiResponse<{
  overallRisk: RiskLevel;
  riskScore: number;
  frameworkRisks: readonly {
    framework: string;
    risk: RiskLevel;
    score: number;
    issues: readonly string[];
    confidence: number;
  }[];
  recommendations: readonly string[];
  estimatedEffort: 'low' | 'medium' | 'high' | 'very-high';
  confidence: number;
}> {
  // Validate input
  const validationResult = validateWithSchema(MigrationRiskRequestSchema, request);
  if (!validationResult.success) {
    return ApiUtilities.error(
      createApiError('Invalid migration risk assessment request', 'VALIDATION_ERROR', {
        validationErrors: validationResult.error,
      }),
    );
  }

  const { patterns, fileCount, hasTests } = validationResult.data;

  try {
    const frameworkRisks = calculateFrameworkRisks(patterns);
    const overallScore = calculateOverallScore(frameworkRisks, fileCount, hasTests);
    const overallRisk = scoreToRiskLevel(overallScore);
    const estimatedEffort = calculateEffortLevel(overallScore, fileCount);
    const recommendations = generateRecommendations(frameworkRisks, overallRisk, hasTests);
    const confidence = calculateConfidence(patterns, fileCount);

    return ApiUtilities.ok({
      overallRisk,
      riskScore: overallScore,
      frameworkRisks,
      recommendations,
      estimatedEffort,
      confidence,
    });
  } catch (error) {
    return ApiUtilities.error(
      createApiError(
        `Risk assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RISK_ASSESSMENT_ERROR',
        { fileCount, patternsCount: patterns.length, error },
      ),
    );
  }
}

/**
 * Calculate framework-specific risk scores
 */
export function calculateFrameworkRisks(
  patterns: readonly {
    severity: Severity;
    framework?: Framework;
    id: string;
  }[],
): readonly {
  framework: string;
  risk: RiskLevel;
  score: number;
  issues: readonly string[];
  confidence: number;
}[] {
  const frameworkGroups = groupPatternsByFramework(patterns);

  return Array.from(frameworkGroups.entries()).map(([framework, frameworkPatterns]) => {
    const score = calculateFrameworkScore(frameworkPatterns);
    const risk = scoreToRiskLevel(score);
    const issues = extractIssues(frameworkPatterns);
    const confidence = calculateFrameworkConfidence(frameworkPatterns);

    return {
      framework,
      risk,
      score,
      issues,
      confidence,
    };
  });
}

/**
 * Calculate confidence in risk assessment
 */
export function calculateConfidence(patterns: readonly unknown[], fileCount: number): number {
  const patternCoverage = Math.min(1, patterns.length / 10); // Assume 10 patterns needed for full coverage
  const fileSampleSize = Math.min(1, fileCount / 100); // Assume 100 files needed for full confidence
  const patternQuality = calculatePatternQuality(patterns);

  return (patternCoverage * 0.4 + fileSampleSize * 0.3 + patternQuality * 0.3) * 100;
}

/**
 * Convert risk score to risk level
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 75) return RiskLevel.CRITICAL;
  if (score >= 50) return RiskLevel.HIGH;
  if (score >= 25) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

/**
 * Calculate estimated effort level based on risk and complexity
 */
export function calculateEffortLevel(
  score: number,
  fileCount: number,
): 'low' | 'medium' | 'high' | 'very-high' {
  const baseEffort = score / 25; // 0-4 scale
  const fileEffort = Math.log10(fileCount + 1); // Logarithmic scale for file count
  const totalEffort = baseEffort + fileEffort;

  if (totalEffort >= 6) return 'very-high';
  if (totalEffort >= 4) return 'high';
  if (totalEffort >= 2) return 'medium';
  return 'low';
}

/**
 * Generate risk mitigation recommendations
 */
export function generateRecommendations(
  frameworkRisks: readonly {
    framework: string;
    risk: RiskLevel;
    confidence: number;
  }[],
  overallRisk: RiskLevel,
  hasTests: boolean,
): readonly string[] {
  const recommendations: string[] = [];

  switch (overallRisk) {
    case RiskLevel.CRITICAL:
      recommendations.push('Consider breaking migration into smaller phases');
      recommendations.push('Perform extensive testing before production deployment');
      recommendations.push('Create rollback plan for each migration step');
      break;
    case RiskLevel.HIGH:
      recommendations.push('Plan for thorough QA testing');
      recommendations.push('Consider feature flagging for gradual rollout');
      recommendations.push('Allocate extra time for debugging');
      break;
    case RiskLevel.MEDIUM:
      recommendations.push('Test components thoroughly after migration');
      recommendations.push('Monitor for performance regressions');
      break;
    case RiskLevel.LOW:
      recommendations.push('Safe to proceed with automated migration');
      recommendations.push('Basic testing should be sufficient');
      break;
  }

  if (!hasTests) {
    recommendations.push('Add comprehensive test coverage before migration');
  }

  const highRiskFrameworks = frameworkRisks.filter(
    (f) => f.risk === RiskLevel.HIGH || f.risk === RiskLevel.CRITICAL,
  );
  if (highRiskFrameworks.length > 0) {
    recommendations.push(
      `Focus extra attention on: ${highRiskFrameworks.map((f) => f.framework).join(', ')}`,
    );
  }

  const lowConfidenceFrameworks = frameworkRisks.filter((f) => f.confidence < 60);
  if (lowConfidenceFrameworks.length > 0) {
    recommendations.push(
      `Gather more pattern data for: ${lowConfidenceFrameworks.map((f) => f.framework).join(', ')}`,
    );
  }

  return recommendations;
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

function groupPatternsByFramework(
  patterns: readonly {
    framework?: Framework;
    severity: Severity;
    id: string;
  }[],
): Map<string, Array<{ severity: Severity; id: string }>> {
  const groups = new Map<string, Array<{ severity: Severity; id: string }>>();

  for (const pattern of patterns) {
    const framework = pattern.framework || 'unknown';
    if (!groups.has(framework)) {
      groups.set(framework, []);
    }
    groups.get(framework)!.push({ severity: pattern.severity, id: pattern.id });
  }

  return groups;
}

function calculateFrameworkScore(patterns: readonly { severity: Severity }[]): number {
  const severityWeights = {
    [Severity.INFO]: 1,
    [Severity.WARNING]: 4,
    [Severity.ERROR]: 10,
    [Severity.CRITICAL]: 25,
  };

  const frameworkMultipliers = {
    [Framework.REACT1919_19]: 1.2, // React changes tend to be more complex
    [Framework.NEXTJS15JS15JS_15]: 1.0, // Standard complexity
    [Framework.TYPESCRIPT55_5]: 0.8, // Usually straightforward
    [Framework.TAILWIND44_4]: 0.6, // Often just class name changes
  };

  let score = 0;
  for (const pattern of patterns) {
    const severityWeight = severityWeights[pattern.severity] || 1;
    const frameworkMultiplier = 1.0; // Default multiplier
    score += severityWeight * frameworkMultiplier;
  }

  return Math.min(100, score);
}

function calculateOverallScore(
  frameworkRisks: readonly { score: number }[],
  fileCount: number,
  hasTests: boolean,
): number {
  if (frameworkRisks.length === 0) return 0;

  const avgFrameworkScore =
    frameworkRisks.reduce((sum, risk) => sum + risk.score, 0) // frameworkRisks.length;

  // File count multiplier (more files = higher risk)
  const fileMultiplier = Math.min(2, 1 + (fileCount - 10) / 100);

  // Test coverage modifier
  const testModifier = hasTests ? 0.8 : 1.3;

  return Math.min(100, avgFrameworkScore * fileMultiplier * testModifier);
}

function extractIssues(patterns: readonly { id: string }[]): readonly string[] {
  return patterns.map((pattern) => `Issue detected in pattern: ${pattern.id}`);
}

function calculateFrameworkConfidence(patterns: readonly unknown[]): number {
  if (patterns.length === 0) return 0;

  // Base confidence increases with more patterns
  let confidence = Math.min(0.8, 0.4 + patterns.length * 0.05);

  return confidence * 100;
}

function calculatePatternQuality(patterns: readonly unknown[]): number {
  if (patterns.length === 0) return 0;

  // Simplified quality calculation based on pattern count and diversity
  const baseQuality = 0.5;
  const countBonus = Math.min(0.3, patterns.length * 0.02);
  const diversityBonus = 0.2; // Assume good diversity

  return Math.min(1, baseQuality + countBonus + diversityBonus);
}
