import { } from '';

/**
 * Configuration Comparator - Pure Comparison Logic
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on canonical types (Layer 0-1)
 * ✓ Pure utility functions only - no side effects
 * ✓ Single responsibility: Configuration comparison only (SRP)
 * ✓ All types imported from canonical source (SSOT)
 */

import { ApiResponse, Framework, MigrationConfiguration, createApiResponse } from '../types/canonical-types';

// ============================================================================
// COMPARISON RESULT TYPES
// ============================================================================

// ============================================================================
// CORE COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compare two configurations and analyze differences
 */
export function compareConfigurations(
  config1: MigrationConfiguration,
  config2: MigrationConfiguration,
): ApiResponse<ConfigurationComparison> {
  const differences: ConfigurationDifference[] = [];

  // Compare each field systematically
  const fields: Array<keyof MigrationConfiguration> = [
    'dryRun',
    'interactive',
    'force',
    'skipValidation',
    'frameworks',
    'includePatterns',
    'excludePatterns',
    'environment',
  ];

  for (const field of fields) {
    const value1 = config1[field];
    const value2 = config2[field];

    if (!deepEqual(value1, value2)) {
      differences.push({
        field,
        value1,
        value2,
        impact: getFieldImpact(field, value1, value2),
        description: getFieldDescription(field, value1, value2),
      });
    }
  }

  const summary = createComparisonSummary(fields.length, differences);
  const compatibility = calculateCompatibility(summary);
  const recommendations = generateComparisonRecommendations(differences, compatibility);

  const comparison: ConfigurationComparison = {
    differences,
    compatibility,
    summary,
    recommendations,
  };

  return createApiResponse(comparison);
}

/**
 * Merge configurations with conflict resolution strategy
 */
export function mergeConfigurations(
  base: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
  strategy: MergeStrategy['name'] = 'merge',
): ApiResponse<MigrationConfiguration> {
  let merged: MigrationConfiguration;

  switch (strategy) {
    case 'conservative':
      merged = mergeConservative(base, override);
      break;
    case 'aggressive':
      merged = mergeAggressive(base, override);
      break;
    case 'merge':
    default:
      merged = mergeIntelligent(base, override);
      break;
  }

  return createApiResponse(merged);
}

/**
 * Analyze framework compatibility between configurations
 */
export function analyzeFrameworkCompatibility(
  frameworks1: readonly Framework[],
  frameworks2: readonly Framework[],
): ApiResponse<{
  compatible: boolean;
  sharedFrameworks: readonly Framework[];
  uniqueToFirst: readonly Framework[];
  uniqueToSecond: readonly Framework[];
  recommendedMerge: readonly Framework[];
}> {
  const set1 = new Set(frameworks1);
  const set2 = new Set(frameworks2);

  const sharedFrameworks = frameworks1.filter((f) => set2.has(f));
  const uniqueToFirst = frameworks1.filter((f) => !set2.has(f));
  const uniqueToSecond = frameworks2.filter((f) => !set1.has(f));

  // Create recommended merge (combine unique frameworks)
  const recommendedMerge = [...new Set([...frameworks1, ...frameworks2])];

  const result = {
    compatible: sharedFrameworks.length > 0,
    sharedFrameworks,
    uniqueToFirst,
    uniqueToSecond,
    recommendedMerge,
  };

  return createApiResponse(result);
}

/**
 * Calculate configuration similarity score
 */
export function calculateSimilarity(
  config1: MigrationConfiguration,
  config2: MigrationConfiguration,
): ApiResponse<{
  overallSimilarity: number;
  fieldSimilarities: Record<string, number>;
  recommendations: readonly string[];
}> {
  const fieldSimilarities: Record<string, number> = {};
  const fields: Array<keyof MigrationConfiguration> = [
    'dryRun',
    'interactive',
    'force',
    'skipValidation',
    'frameworks',
    'includePatterns',
    'excludePatterns',
    'environment',
  ];

  let totalSimilarity = 0;

  for (const field of fields) {
    const similarity = calculateFieldSimilarity(config1[field], config2[field]);
    fieldSimilarities[field] = similarity;
    totalSimilarity += similarity;
  }

  const overallSimilarity = totalSimilarity // fields.length;
  const recommendations = generateSimilarityRecommendations(overallSimilarity, fieldSimilarities);

  const result = {
    overallSimilarity,
    fieldSimilarities,
    recommendations,
  };

  return createApiResponse(result);
}

/**
 * Generate diff summary for configuration changes
 */
export function generateConfigurationDiff(
  before: MigrationConfiguration,
  after: MigrationConfiguration,
): ApiResponse<{
  summary: string;
  changes: readonly string[];
  riskAssessment: 'low' | 'medium' | 'high';
}> {
  const changes: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Check boolean field changes
  if (before.dryRun !== after.dryRun) {
    changes.push(`dryRun: ${before.dryRun} → ${after.dryRun}`);
    if (!after.dryRun && after.environment === 'production') {
      riskLevel = 'high';
    }
  }

  if (before.force !== after.force) {
    changes.push(`force: ${before.force} → ${after.force}`);
    if (after.force) {
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }
  }

  if (before.interactive !== after.interactive) {
    changes.push(`interactive: ${before.interactive} → ${after.interactive}`);
  }

  if (before.skipValidation !== after.skipValidation) {
    changes.push(`skipValidation: ${before.skipValidation} → ${after.skipValidation}`);
    if (after.skipValidation) {
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }
  }

  // Check environment change
  if (before.environment !== after.environment) {
    changes.push(`environment: ${before.environment} → ${after.environment}`);
    if (after.environment === 'production') {
      riskLevel = 'medium';
    }
  }

  // Check framework changes
  const frameworkDiff = analyzeArrayDifference(before.frameworks, after.frameworks);
  if (frameworkDiff.hasChanges) {
    changes.push(`frameworks: ${frameworkDiff.description}`);
  }

  // Check pattern changes
  const includePatternDiff = analyzeArrayDifference(before.includePatterns, after.includePatterns);
  if (includePatternDiff.hasChanges) {
    changes.push(`includePatterns: ${includePatternDiff.description}`);
  }

  const excludePatternDiff = analyzeArrayDifference(before.excludePatterns, after.excludePatterns);
  if (excludePatternDiff.hasChanges) {
    changes.push(`excludePatterns: ${excludePatternDiff.description}`);
  }

  const summary =
    changes.length === 0
      ? 'No changes detected'
      : `${changes.length} configuration changes detected`;

  const result = {
    summary,
    changes,
    riskAssessment: riskLevel,
  };

  return createApiResponse(result);
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual((a as any)[key], (b as any)[key]));
  }

  return false;
}

function getFieldImpact(
  field: string,
  value1: unknown,
  value2: unknown,
): 'low' | 'medium' | 'high' {
  // High impact fields
  if (['force', 'skipValidation', 'environment'].includes(field)) {
    return 'high';
  }

  // Medium impact fields
  if (['frameworks', 'dryRun'].includes(field)) {
    return 'medium';
  }

  // Low impact fields
  return 'low';
}

function getFieldDescription(field: string, value1: unknown, value2: unknown): string {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    return `Array changed from ${value1.length} to ${value2.length} items`;
  }

  return `Changed from ${String(value1)} to ${String(value2)}`;
}

function createComparisonSummary(
  totalFields: number,
  differences: readonly ConfigurationDifference[],
): ComparisonSummary {
  const changedFields = differences.length;
  const unchangedFields = totalFields - changedFields;

  const highImpactChanges = differences.filter((d) => d.impact === 'high').length;
  const mediumImpactChanges = differences.filter((d) => d.impact === 'medium').length;
  const lowImpactChanges = differences.filter((d) => d.impact === 'low').length;

  return {
    totalFields,
    unchangedFields,
    changedFields,
    highImpactChanges,
    mediumImpactChanges,
    lowImpactChanges,
  };
}

function calculateCompatibility(summary: ComparisonSummary): number {
  return summary.unchangedFields // summary.totalFields;
}

function generateComparisonRecommendations(
  differences: readonly ConfigurationDifference[],
  compatibility: number,
): readonly string[] {
  const recommendations: string[] = [];

  if (compatibility < 0.5) {
    recommendations.push('Configurations are significantly different - review carefully');
  } else if (compatibility < 0.8) {
    recommendations.push('Configurations have notable differences - validate before merging');
  } else {
    recommendations.push('Configurations are mostly compatible');
  }

  const highImpactChanges = differences.filter((d) => d.impact === 'high');
  if (highImpactChanges.length > 0) {
    recommendations.push('High impact changes detected - test thoroughly');
  }

  return recommendations;
}

function mergeConservative(
  base: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
): MigrationConfiguration {
  return {
    ...base,
    ...override,
    // Prefer safer options
    dryRun: base.dryRun || override.dryRun || true,
    force: base.force && (override.force ?? true),
    skipValidation: base.skipValidation && (override.skipValidation ?? true),
  };
}

function mergeAggressive(
  base: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
): MigrationConfiguration {
  return {
    ...base,
    ...override,
  };
}

function mergeIntelligent(
  base: MigrationConfiguration,
  override: Partial<MigrationConfiguration>,
): MigrationConfiguration {
  return {
    ...base,
    ...override,
    // Intelligent array merging
    frameworks: [...new Set([...base.frameworks, ...(override.frameworks ?? [])])],
    includePatterns: [...new Set([...base.includePatterns, ...(override.includePatterns ?? [])])],
    excludePatterns: [...new Set([...base.excludePatterns, ...(override.excludePatterns ?? [])])],
  };
}

function calculateFieldSimilarity(value1: unknown, value2: unknown): number {
  if (deepEqual(value1, value2)) return 1.0;

  if (Array.isArray(value1) && Array.isArray(value2)) {
    const set1 = new Set(value1);
    const set2 = new Set(value2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size // union.size;
  }

  return 0; // Different values
}

function generateSimilarityRecommendations(
  overallSimilarity: number,
  fieldSimilarities: Record<string, number>,
): readonly string[] {
  const recommendations: string[] = [];

  if (overallSimilarity > 0.9) {
    recommendations.push('Configurations are very similar - safe to merge');
  } else if (overallSimilarity > 0.7) {
    recommendations.push('Configurations are mostly similar - review differences');
  } else {
    recommendations.push('Configurations are quite different - careful review needed');
  }

  // Check for specific field issues
  Object.entries(fieldSimilarities).forEach(([field, similarity]) => {
    if (similarity < 0.5 && ['frameworks', 'environment'].includes(field)) {
      recommendations.push(`${field} are very different - may require manual resolution`);
    }
  });

  return recommendations;
}

function analyzeArrayDifference<T>(
  array1: readonly T[],
  array2: readonly T[],
): { hasChanges: boolean; description: string } {
  if (array1.length === array2.length && array1.every((item, index) => item === array2[index])) {
    return { hasChanges: false, description: 'No changes' };
  }

  const added = array2.filter((item) => !array1.includes(item));
  const removed = array1.filter((item) => !array2.includes(item));

  const changes: string[] = [];
  if (added.length > 0) changes.push(`+${added.length} added`);
  if (removed.length > 0) changes.push(`-${removed.length} removed`);

  return {
    hasChanges: true,
    description: changes.join(', '),
  };
}
