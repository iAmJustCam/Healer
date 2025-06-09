import { } from '';

/**
 * Configuration Health Assessor - Pure Health Assessment Logic
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on canonical types (Layer 0-1)
 * ✓ Pure utility functions only - no side effects
 * ✓ Single responsibility: Health assessment only (SRP)
 * ✓ All types imported from canonical source (SSOT)
 */

import { RiskLevel, ApiResponse, Framework, MigrationConfiguration, createApiResponse } from '../types/canonical-types';

// ============================================================================
// HEALTH ASSESSMENT TYPES
// ============================================================================

// ============================================================================
// CORE HEALTH ASSESSMENT FUNCTIONS
// ============================================================================

/**
 * Assess overall configuration health
 */
export function assessConfigurationHealth(
  config: MigrationConfiguration,
  errorCount: number = 0,
  warningCount: number = 0,
): ApiResponse<ConfigurationHealth> {
  const healthScore = calculateHealthScore(config, errorCount, warningCount);
  const riskLevel = determineRiskLevel(errorCount, warningCount, config);
  const complexityScore = calculateComplexityScore(config);
  const recommendations = generateHealthRecommendations(config, errorCount, warningCount);
  const safetyAssessment = assessConfigurationSafety(config);

  const health: ConfigurationHealth = {
    isValid: errorCount === 0,
    healthScore,
    riskLevel,
    errorCount,
    warningCount,
    missingProperties: 0, // Calculated elsewhere
    recommendations,
    safetyIssues: safetyAssessment.safetyIssues,
    complexityScore,
    lastAssessed: new Date().toISOString(),
  };

  return createApiResponse(health);
}

/**
 * Calculate configuration complexity score (0-100)
 */
export function calculateComplexityScore(config: MigrationConfiguration): number {
  let complexity = 0;

  // Framework complexity (more frameworks = higher complexity)
  complexity += config.frameworks.length * 15;

  // Pattern complexity
  complexity += config.includePatterns.length * 8;
  complexity += config.excludePatterns.length * 3;

  // Setting complexity modifiers
  if (config.interactive) complexity += 10;
  if (config.force) complexity += 20;
  if (config.skipValidation) complexity += 25;
  if (!config.dryRun && config.environment === 'production') complexity += 30;

  // Environment complexity
  const envComplexity = {
    development: 0,
    testing: 5,
    staging: 10,
    production: 20,
  };
  complexity += envComplexity[config.environment as keyof typeof envComplexity] || 0;

  return Math.min(100, complexity);
}

/**
 * Assess configuration safety
 */
export function assessConfigurationSafety(config: MigrationConfiguration): SafetyAssessment {
  const safetyIssues: string[] = [];
  const recommendations: string[] = [];

  // Force mode safety checks
  if (config.force) {
    safetyIssues.push('Force mode bypasses safety checks');
    recommendations.push('Use force mode only when necessary');
  }

  // Validation skipping safety checks
  if (config.skipValidation) {
    safetyIssues.push('Validation is disabled');
    recommendations.push('Enable validation for safer operation');
  }

  // Production environment safety checks
  if (config.environment === 'production' && !config.dryRun) {
    safetyIssues.push('Direct production changes without dry run');
    recommendations.push('Always use dry run in production');
  }

  // Complex migration safety checks
  if (config.environment === 'production' && config.frameworks.length > 2) {
    safetyIssues.push('Complex migration directly in production');
    recommendations.push('Test in staging environment first');
  }

  // Missing safety nets
  if (config.excludePatterns.length === 0) {
    safetyIssues.push('No file exclusion patterns defined');
    recommendations.push('Add exclude patterns to prevent unintended file processing');
  }

  // Conflicting settings
  if (config.force && config.interactive) {
    safetyIssues.push('Force mode conflicts with interactive mode');
    recommendations.push('Choose either force or interactive mode, not both');
  }

  return {
    isSafe: safetyIssues.length === 0,
    safetyIssues,
    recommendations,
  };
}

/**
 * Determine configuration risk level based on framework combinations
 */
export function assessFrameworkRisk(frameworks: readonly Framework[]): RiskLevel {
  const frameworkCount = frameworks.length;

  // No frameworks = critical risk
  if (frameworkCount === 0) return RiskLevel.CRITICAL;

  // Single framework = low to medium risk
  if (frameworkCount === 1) return RiskLevel.LOW;

  // Multiple frameworks increase risk
  if (frameworkCount === 2) return RiskLevel.MEDIUM;
  if (frameworkCount === 3) return RiskLevel.HIGH;

  // Too many frameworks = critical risk
  return RiskLevel.CRITICAL;
}

/**
 * Generate environment-specific health warnings
 */
export function assessEnvironmentHealth(
  environment: string,
  config: MigrationConfiguration,
): readonly string[] {
  const warnings: string[] = [];

  switch (environment) {
    case 'production':
      if (!config.dryRun) {
        warnings.push('Production environment should use dry run first');
      }
      if (config.force) {
        warnings.push('Force mode is risky in production');
      }
      if (config.skipValidation) {
        warnings.push('Skipping validation in production is dangerous');
      }
      break;

    case 'staging':
      if (config.skipValidation) {
        warnings.push('Staging should validate before production');
      }
      break;

    case 'development':
      // Development is generally safer, fewer warnings
      if (config.frameworks.length > 3) {
        warnings.push('Many frameworks may slow development builds');
      }
      break;

    case 'testing':
      // Testing environment specific checks
      if (!config.dryRun && config.frameworks.length > 2) {
        warnings.push('Complex migrations should be tested with dry run first');
      }
      break;
  }

  return warnings;
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

function calculateHealthScore(
  config: MigrationConfiguration,
  errorCount: number,
  warningCount: number,
): number {
  let score = 1.0;

  // Deduct for errors (major impact)
  score -= errorCount * 0.2;

  // Deduct for warnings (minor impact)
  score -= warningCount * 0.05;

  // Deduct for risky configurations
  if (config.force && config.environment === 'production') score -= 0.3;
  if (config.skipValidation && !config.dryRun) score -= 0.25;
  if (config.frameworks.length === 0) score -= 0.4;
  if (config.excludePatterns.length === 0) score -= 0.1;

  // Bonus for safe configurations
  if (config.dryRun && config.environment === 'production') score += 0.1;
  if (!config.force && config.interactive) score += 0.05;

  return Math.max(0, Math.min(1, score));
}

function determineRiskLevel(
  errorCount: number,
  warningCount: number,
  config: MigrationConfiguration,
): RiskLevel {
  // Critical errors always result in critical risk
  if (errorCount > 0) return RiskLevel.CRITICAL;

  // High warning count increases risk
  if (warningCount > 10) return RiskLevel.HIGH;
  if (warningCount > 5) return RiskLevel.MEDIUM;

  // Configuration-specific risk factors
  if (config.force && config.environment === 'production') return RiskLevel.HIGH;
  if (config.skipValidation && !config.dryRun) return RiskLevel.HIGH;
  if (config.frameworks.length > 3) return RiskLevel.MEDIUM;

  return RiskLevel.LOW;
}

function generateHealthRecommendations(
  config: MigrationConfiguration,
  errorCount: number,
  warningCount: number,
): readonly string[] {
  const recommendations: string[] = [];

  if (errorCount > 0) {
    recommendations.push('Fix critical configuration errors before proceeding');
  }

  if (warningCount > 5) {
    recommendations.push('Address configuration warnings to improve reliability');
  }

  if (config.frameworks.length > 3) {
    recommendations.push('Consider breaking migration into smaller phases by framework');
  }

  if (!config.dryRun && config.environment === 'production') {
    recommendations.push('Enable dry run for production environment safety');
  }

  if (config.force) {
    recommendations.push('Review necessity of force mode - consider interactive approach');
  }

  if (config.excludePatterns.length === 0) {
    recommendations.push('Add exclude patterns to prevent processing unwanted files');
  }

  if (config.frameworks.length === 0) {
    recommendations.push('Specify at least one framework for migration');
  }

  if (errorCount === 0 && warningCount === 0) {
    recommendations.push('Configuration appears healthy - proceed with confidence');
  }

  return recommendations;
}
