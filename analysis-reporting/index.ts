/**
 * Analysis Reporting Domain - Flat Export Index
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ No local type definitions
 * ✓ Pure re-exports only
 * ✓ Single source of truth for domain exports (SSOT)
 * ✓ Follows flat domain structure
 */

// Analysis Utilities
export { analyzeFiles, analyzeSingleFile, generateAnalysisReport } from './analyzer.utilities';

// Business Context Utilities
export {
  analyzeBusinessContext,
  calculateBusinessCriticality,
  detectBusinessDomain,
  generateBusinessImpact,
} from './business-context.utilities';

// Report Generation Utilities
export {
  formatAnalysisReport,
  generateBackupReport,
  generateProjectReport,
  generateTrendAnalysis,
} from './report-generator.utilities';

// Risk Assessment Utilities
export {
  assessMigrationRisk,
  calculateConfidence,
  calculateEffortLevel,
  calculateFrameworkRisks,
  generateRecommendations,
  scoreToRiskLevel,
} from './risk-assessment.utilities';

// Risk Calculation Utilities
export {
  analyzeRiskFactors,
  assessComprehensiveRisk,
  calculateBusinessImpact,
  calculateFrameworkRisks as calculateFrameworkRiskScores,
  calculateOverallRiskScore,
  calculateRiskConfidence,
  calculateWeightedRisk,
  findDominantRiskFactor,
} from './risk-calculation.utilities';

// Domain re-export (no local types defined)
export default {};
