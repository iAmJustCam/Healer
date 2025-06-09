/**
 * Health Domain Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

import {
  Severity
} from '@types';

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'health': {
      readonly checkInterval?: number;
      readonly timeoutThreshold?: number;
      readonly minSeverityLevel?: Severity;
      readonly enableNotifications?: boolean;
      readonly logHealthEvents?: boolean;
      readonly retryStrategy?: 'exponential' | 'linear' | 'fixed';
      readonly maxRetries?: number;
      readonly metrics?: {
        readonly collectPerformance?: boolean;
        readonly collectMemory?: boolean;
        readonly collectErrors?: boolean;
      };
      readonly checks?: {
        readonly api?: boolean;
        readonly database?: boolean;
        readonly services?: boolean;
        readonly storage?: boolean;
      };
    };
  }
}