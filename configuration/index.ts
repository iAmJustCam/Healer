// Constitutional imports
import { ApiResponse } from '';
import {
  ConfigurationOps,
  ConfigurationState
} from "../types/configuration.types";

import { } from '';

/**
 * Configuration Utilities - Centralized Export
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Pure re-exports only - no local definitions (SSOT)
 * ✓ Single responsibility: Module organization (SRP)
 * ✓ All types imported from canonical source (DRY)
 */

// Core validation functions
export {
  quickValidateConfiguration,
  validateConfiguration,
  validateConfigurationHealth,
  validateFrameworkConfiguration,
} from './configuration-validator';

// Health assessment functions
export {
  assessConfigurationHealth,
  assessConfigurationSafety,
  assessEnvironmentHealth,
  assessFrameworkRisk,
  calculateComplexityScore,
  type ConfigurationHealth,
  type SafetyAssessment,
} from './configuration-health-assessor';

// Auto-fixing functions
export {
  autoFixConfiguration,
  autoFixFrameworkConfiguration,
  mergeWithDefaults,
  optimizeForEnvironment,
  type AutoFixResult,
  type MergeOptions,
} from './configuration-auto-fixer';

// Comparison functions
export {
  analyzeFrameworkCompatibility,
  calculateSimilarity,
  compareConfigurations,
  generateConfigurationDiff,
  mergeConfigurations,
  type ComparisonSummary,
  type ConfigurationComparison,
  type ConfigurationDifference,
  type MergeStrategy,
} from './configuration-comparator';

// Re-export canonical types for convenience (SSOT compliance)
