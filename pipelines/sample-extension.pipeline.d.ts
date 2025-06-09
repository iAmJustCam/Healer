/**
 * Sample Pipeline Extension
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - NO export statements
 * - Uses declaration merging pattern ONLY
 */

import {
  ValidationLevel,
  RiskLevel
} from '@types';

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'sample-domain': {
      readonly enableFeature: boolean;
      readonly validationMode: ValidationLevel;
      readonly riskTolerance: RiskLevel;
      readonly customOption: string;
    };
  }
}