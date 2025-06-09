/**
 * Foundation Domain Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

import {
  LogLevel,
  Environment
} from '@types';

// Add missing enums to canonical types first
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  enum LogLevel {
    TRACE = 'TRACE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL'
  }

  /** @internal L2 Pipeline Extension */
  enum Environment {
    DEVELOPMENT = 'DEVELOPMENT',
    TESTING = 'TESTING',
    STAGING = 'STAGING',
    PRODUCTION = 'PRODUCTION'
  }
}

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'foundation': {
      readonly environment: Environment;
      readonly logLevel: LogLevel;
      readonly featureFlags?: Record<string, boolean>;
      readonly configOverrides?: Record<string, unknown>;
      readonly telemetryEnabled?: boolean;
      readonly securityMode?: 'standard' | 'strict' | 'enhanced';
      readonly enableDebugTools?: boolean;
      readonly errorReporting?: {
        readonly enabled: boolean;
        readonly sampleRate?: number;
        readonly includeStackTrace?: boolean;
      };
      readonly performance?: {
        readonly monitoringEnabled?: boolean;
        readonly tracingEnabled?: boolean;
        readonly slowThresholdMs?: number;
      };
    };
  }
}