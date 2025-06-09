/**
 * Pipeline Validation Schemas
 * 
 * Zod schemas for validating pipeline inputs and outputs.
 * These schemas enforce type safety and data integrity throughout the pipeline chain.
 */

import { z } from 'zod';

// Common schemas
export const filePathSchema = z.object({
  path: z.string(),
  relativePath: z.string().optional(),
  hash: z.string().optional(),
});

export const timestampSchema = z.string().datetime();

export const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const confidenceScoreSchema = z.enum(['low', 'medium', 'high', 'certain']);

export const transformationStrategySchema = z.enum([
  'in-place', 
  'copy-modify', 
  'create-new', 
  'hybrid', 
  'incremental'
]);

// Input Pipeline Schemas
export const inputSourceSchema = z.object({
  type: z.enum(['filesystem', 'git', 'archive', 'remote']),
  location: z.string(),
  credentials: z.object({
    type: z.enum(['token', 'ssh', 'basic', 'oauth']),
    value: z.string(),
    expiration: z.string().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const scanFilterSchema = z.object({
  type: z.enum(['include', 'exclude']),
  pattern: z.string(),
  applyTo: z.enum(['files', 'directories', 'both']).optional(),
});

export const scanOptionsSchema = z.object({
  recursive: z.boolean(),
  followSymlinks: z.boolean(),
  maxDepth: z.number().positive().optional(),
  includeDotFiles: z.boolean(),
  resolveRealPaths: z.boolean(),
  timeout: z.number().positive().optional(),
});

export const scanRequestSchema = z.object({
  sources: z.array(inputSourceSchema),
  filters: z.array(scanFilterSchema),
  options: scanOptionsSchema,
});

// Validation Pipeline Schemas
export const validationSchemaSchema = z.object({
  version: z.string(),
  properties: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    required: z.boolean(),
    default: z.unknown().optional(),
    description: z.string(),
    examples: z.array(z.unknown()).optional(),
    validation: z.object({
      pattern: z.string().optional(),
      minimum: z.number().optional(),
      maximum: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      enum: z.array(z.string()).optional(),
      custom: z.string().optional(),
    }).optional(),
  })),
  constraints: z.array(z.object({
    type: z.enum(['required_if', 'mutually_exclusive', 'dependency', 'range']),
    properties: z.array(z.string()),
    condition: z.string().optional(),
    message: z.string(),
  })),
  dependencies: z.array(z.object({
    property: z.string(),
    dependsOn: z.array(z.string()),
    type: z.enum(['value', 'presence', 'format']),
    condition: z.string(),
  })),
});

export const validationOptionsSchema = z.object({
  mode: z.enum(['strict', 'permissive', 'custom']),
  customRules: z.array(z.object({
    name: z.string(),
    description: z.string(),
    test: z.string(),
    message: z.string(),
    severity: z.enum(['error', 'warning', 'info']),
  })).optional(),
  ignoreExtraProperties: z.boolean().optional(),
  requiredByDefault: z.boolean().optional(),
  coerceTypes: z.boolean().optional(),
  errorLimit: z.number().optional(),
});

export const validationRequestSchema = z.object({
  target: z.unknown(),
  schema: z.union([z.string(), validationSchemaSchema]),
  options: validationOptionsSchema,
});

// Detection Pipeline Schemas
export const detectionOptionsSchema = z.object({
  includeTests: z.boolean(),
  followImports: z.boolean(),
  timeout: z.number(),
  includeSourceContext: z.boolean(),
  parallelExecution: z.boolean(),
  maxMemoryUsage: z.number().optional(),
});

export const customPatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  detector: z.string(),
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: confidenceScoreSchema,
});

export const detectionRequestSchema = z.object({
  targets: z.array(z.string()),
  options: detectionOptionsSchema,
  patterns: z.array(customPatternSchema).optional(),
});

// Assessment Pipeline Schemas
export const assessmentOptionsSchema = z.object({
  includeFixSuggestions: z.boolean(),
  calculateTrends: z.boolean(),
  requirementsAlignment: z.boolean(),
  performanceImpact: z.boolean(),
  securityAnalysis: z.boolean(),
});

export const patternResultReferenceSchema = z.object({
  id: z.string(),
  source: z.string(),
  timestamp: timestampSchema,
});

export const businessDomainSchema = z.object({
  name: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  stakeholders: z.array(z.string()),
  slas: z.record(z.number()),
});

export const assessmentRequestSchema = z.object({
  targetFiles: z.array(filePathSchema),
  patternResults: patternResultReferenceSchema.optional(),
  analysisDepth: z.enum(['surface', 'deep', 'comprehensive']),
  businessContext: businessDomainSchema.optional(),
  options: assessmentOptionsSchema,
});

// Add more schema definitions for other pipeline types as needed...

/**
 * Schema Registry
 * 
 * A centralized registry of all validation schemas for pipeline operations.
 * This allows for consistent validation across different parts of the system.
 */
export const PipelineSchemas = {
  input: {
    scanRequest: scanRequestSchema,
    inputSource: inputSourceSchema,
  },
  validation: {
    validationRequest: validationRequestSchema,
    validationOptions: validationOptionsSchema,
  },
  detection: {
    detectionRequest: detectionRequestSchema,
    customPattern: customPatternSchema,
  },
  assessment: {
    assessmentRequest: assessmentRequestSchema,
  },
  // Add more pipeline schemas as they are defined
};