// AI-specific enums
export enum AIRecoveryType {
  RETRY_WITH_BACKOFF = 'RETRY_WITH_BACKOFF',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  FALLBACK_TO_CACHE = 'FALLBACK_TO_CACHE',
  ALTERNATIVE_MODEL = 'ALTERNATIVE_MODEL',
  GRACEFUL_DEGRADATION = 'GRACEFUL_DEGRADATION'
}

export enum AIErrorCategory {
  API_TIMEOUT = 'API_TIMEOUT',
  AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  INPUT_VALIDATION_ERROR = 'INPUT_VALIDATION_ERROR',
  OUTPUT_PARSING_ERROR = 'OUTPUT_PARSING_ERROR'
}

export enum CascadeType {
  TYPE_INFERENCE_CASCADE = 'TYPE_INFERENCE_CASCADE',
  MODULE_BOUNDARY_CASCADE = 'MODULE_BOUNDARY_CASCADE',
  ASYNC_BOUNDARY_CASCADE = 'ASYNC_BOUNDARY_CASCADE',
  FRAMEWORK_CONTRACT_CASCADE = 'FRAMEWORK_CONTRACT_CASCADE'
}

export enum VerificationStepCategory {
  COMPILATION = 'COMPILATION',
  UNIT_TESTING = 'UNIT_TESTING',
  INTEGRATION_TESTING = 'INTEGRATION_TESTING',
  MANUAL_TESTING = 'MANUAL_TESTING',
  CODE_REVIEW = 'CODE_REVIEW'
}

export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum DeploymentEnvironment {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION'
}

export enum DeploymentStrategy {
  ROLLING = 'ROLLING',
  BLUE_GREEN = 'BLUE_GREEN',
  CANARY = 'CANARY'
}

export enum SeniorityLevel {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  STAFF = 'STAFF'
}

export enum ReviewerType {
  SENIOR_DEVELOPER = 'SENIOR_DEVELOPER',
  TECH_LEAD = 'TECH_LEAD',
  ARCHITECT = 'ARCHITECT'
}

export enum MitigationStrategyType {
  FEATURE_FLAGS = 'FEATURE_FLAGS',
  PHASED_ROLLOUT = 'PHASED_ROLLOUT',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER'
}

export enum RiskFactorType {
  ASYNC_COMPLEXITY = 'ASYNC_COMPLEXITY',
  TYPE_SAFETY = 'TYPE_SAFETY',
  COMPONENT_COMPLEXITY = 'COMPONENT_COMPLEXITY'
}

import type { EntityId, Timestamp } from './canonical-types.js';

export interface AICLIConfig {
  aiProvider: string;
  modelName: string;
  maxRetries: number;
  timeout: number;
}

export interface AICLIContext {
  config: AICLIConfig;
  sessionId: EntityId;
  correlationId: EntityId;
}

export interface TelemetryData {
  timestamp: Timestamp;
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface ScanCommandOptions {
  directory: string;
  recursive?: boolean;
  includePatterns?: string[];
}

export interface AnalyzeCommandOptions {
  files: string[];
  depth?: 'shallow' | 'deep';
  format?: 'json' | 'markdown';
}

export interface StatusCommandOptions {
  checkAi?: boolean;
  checkTools?: boolean;
  healthCheck?: boolean;
}
