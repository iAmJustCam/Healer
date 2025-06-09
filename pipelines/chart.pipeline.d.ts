/**
 * Chart Domain Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

import {
  ChartType,
  ChartOptions
} from '@types';

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'chart': {
      readonly renderEngine?: 'canvas' | 'svg' | 'webgl';
      readonly defaultType?: ChartType;
      readonly defaultOptions?: Partial<ChartOptions>;
      readonly animationEnabled?: boolean;
      readonly responsiveResize?: boolean;
      readonly theme?: 'light' | 'dark' | 'auto';
      readonly localization?: {
        readonly locale?: string;
        readonly dateFormat?: string;
        readonly numberFormat?: string;
      };
      readonly performance?: {
        readonly dataPointLimit?: number;
        readonly useWebWorker?: boolean;
        readonly optimizeRendering?: boolean;
      };
    };
  }
}