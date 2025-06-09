/**
 * DETECTION Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'detection': {
      readonly enableFeature?: boolean;
      // Add additional domain-specific parameters here
    };
  }
}
