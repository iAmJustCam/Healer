/**
 * Form Domain Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

import {
  ValidationLevel
} from '@types';

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'form': {
      readonly validationMode?: 'onBlur' | 'onChange' | 'onSubmit';
      readonly validationLevel?: ValidationLevel;
      readonly autoSave?: boolean;
      readonly persistFormState?: boolean;
      readonly submitMode?: 'ajax' | 'native';
      readonly fieldTransformers?: boolean;
      readonly enableAccessibility?: boolean;
      readonly useNativeValidation?: boolean;
      readonly errorRendering?: 'inline' | 'summary' | 'tooltip';
      readonly i18n?: {
        readonly locale?: string;
        readonly translations?: Record<string, Record<string, string>>;
      };
    };
  }
}