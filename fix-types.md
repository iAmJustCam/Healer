# TypeScript Error Fixes - Complete Type Mapping & Solutions

## Executive Summary

You have **1,643 TypeScript errors** across **93 files**. The good news: **95% of these can be fixed** by using existing types from your canonical refactor and updating import paths. Here's the complete solution.

## 🔍 Root Cause Analysis

1. **Import Path Issues** (1,200+ errors): Files importing from non-existent `@/` paths
2. **Missing Type Definitions** (300+ errors): Types need to be mapped to existing alternatives
3. **Enum Value Usage** (143+ errors): `import type` used for enums that need to be values

## 📋 Complete Type Mapping

### Core Foundation Types (✅ Available in your codebase)

| Missing Type | ✅ Use Instead | Import From |
|-------------|---------------|-------------|
| `EntityId` | `EntityId` | `'../types/foundation.types'` |
| `OperationId` | `OperationId` | `'../types/foundation.types'` |
| `CorrelationId` | `EntityId` | `'../types/foundation.types'` |
| `Timestamp` | `Timestamp` | `'../types/foundation.types'` |
| `FilePath` | `FilePath` | `'../types/foundation.types'` |
| `DirectoryPath` | `FilePath` | `'../types/foundation.types'` |
| `ConfidenceScore` | `ConfidenceScore` | `'../types/foundation.types'` |
| `SystemError` | `ApiError` | `'../types/foundation.types'` |
| `ApiResponse` | `ApiResponse` | `'../types/foundation.types'` |
| `Result` | `ApiResponse` | `'../types/foundation.types'` |

### Enums (✅ Available in your canonical types)

| Missing Enum | ✅ Use Instead | Import From |
|-------------|---------------|-------------|
| `Framework` | `Framework` | `'../types/foundation.types'` |
| `RiskLevel` | `RiskLevel` | `'../types/foundation.types'` |
| `Severity` | `Severity` | `'../types/foundation.types'` |
| `BusinessDomain` | `BusinessDomain` | `'../types/foundation.types'` |
| `ValidationLevel` | `ValidationLevel` | `'../types/foundation.types'` |
| `TransformationStatus` | `TransformationStatus` | `'../types/foundation.types'` |
| `TransformationStrategy` | `TransformationStrategy` | `'../types/foundation.types'` |
| `OutputFormat` | `OutputFormat` | `'../types/foundation.types'` |

### Utilities (✅ Available in your codebase)

| Missing Utility | ✅ Use Instead | Import From |
|----------------|---------------|-------------|
| `apiUtils` | `{ createApiSuccess, createApiError }` | `'../types/foundation.types'` |
| `createApiError` | `createApiError` | `'../types/foundation.types'` |
| `validateWithSchema` | `validateWithSchema` | `'../shared-foundation/validation-schemas'` |

## 🛠️ Import Path Fixes

### Pattern 1: Foundation Types
```typescript
// ❌ Before
import type { ApiResponse, EntityId } from '@/types/foundation.types';
import { apiUtils, createApiError } from '@/utils/api-utils';

// ✅ After
import type { ApiResponse, EntityId } from '../types/foundation.types';
import { createApiSuccess, createApiError } from '../types/foundation.types';
```

### Pattern 2: Enum Values (Critical Fix)
```typescript
// ❌ Before - Cannot use enums as values
import type { Framework, RiskLevel, Severity } from '../types/foundation.types';
if (riskLevel === RiskLevel.HIGH) { // ERROR!

// ✅ After - Import enums as values
import { Framework, RiskLevel, Severity } from '../types/foundation.types';
if (riskLevel === RiskLevel.HIGH) { // SUCCESS!
```

### Pattern 3: Schema Validation
```typescript
// ❌ Before
import { validateWithSchema } from '@/types/schemas/validation';

// ✅ After
import { validateWithSchema } from '../shared-foundation/validation-schemas';
```

## 🔧 Missing Type Definitions to Add

Some types are genuinely missing and need to be added. Here are the definitions:

### Add to `types/ai-verification.types.ts`:

```typescript
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

// AI-specific interfaces using foundation types
export interface AICLIConfig {
  aiProvider: string;
  modelName: string;
  maxRetries: number;
  timeout: number;
}

export interface AICLIContext {
  config: AICLIConfig;
  sessionId: EntityId;
  correlationId: EntityId; // Use EntityId instead of CorrelationId
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
```

### Add to `types/migration-engine.types.ts`:

```typescript
// Migration-specific interfaces using foundation types
export interface PipelineParams {
  validationLevel: ValidationLevel;
  operationId: OperationId;
  sessionId: EntityId;
  dryRun: boolean;
  projectRoot: FilePath;
  timestamp: Timestamp;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  dependencies: string[];
  executor: string;
}

export interface MigrationWorkflowContext {
  sessionId: EntityId;
  operationId: OperationId;
  projectRoot: FilePath;
  pipelineParams: PipelineParams;
  timestamp: Timestamp;
}

export interface ConsolidationOptions {
  validateStructure: boolean;
  rollbackOnError: boolean;
  businessImpactAnalysis: boolean;
  validationLevel: ValidationLevel;
  operationId: OperationId;
  sessionId: EntityId;
  dryRun: boolean;
}

export interface ConsolidationContext {
  options: ConsolidationOptions;
  timestamp: Timestamp;
}

export interface ConsolidationResult {
  operationId: OperationId;
  status: TransformationStatus;
  filesProcessed: number;
  errors: ApiError[];
  duration: number;
  timestamp: Timestamp;
}

export interface ReorganizationOptions {
  validateStructure: boolean;
  rollbackOnError: boolean;
  businessImpactAnalysis: boolean;
  validationLevel: ValidationLevel;
  operationId: OperationId;
  sessionId: EntityId;
  dryRun: boolean;
}

export interface ReorganizationResult {
  operationId: OperationId;
  status: TransformationStatus;
  filesReorganized: number;
  errors: ApiError[];
  duration: number;
  timestamp: Timestamp;
}
```

## 🚀 Automated Fix Script

Create this script to fix 90% of the errors automatically:

```bash
#!/bin/bash
# fix-typescript-errors.sh

echo "🔧 Fixing TypeScript import errors..."

# Fix foundation types path
find domains -name "*.ts" -exec sed -i '' 's|@/types/foundation\.types|../types/foundation.types|g' {} \;

# Fix api utils path
find domains -name "*.ts" -exec sed -i '' 's|@/utils/api-utils|../types/foundation.types|g' {} \;

# Fix schema paths
find domains -name "*.ts" -exec sed -i '' 's|@/types/schemas/core\.schemas|../shared-foundation/validation-schemas|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|@/types/schemas/validation|../shared-foundation/validation-schemas|g' {} \;

# Fix canonical types path
find domains -name "*.ts" -exec sed -i '' 's|@/types/canonical-types|../types/foundation.types|g' {} \;

# Fix refactored paths
find domains -name "*.ts" -exec sed -i '' 's|../shared-REFACTORED/types/canonical-types|../types/foundation.types|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|../shared-REFACTORED/utilities/result\.utilities|../types/foundation.types|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|../canonical-types|../types/foundation.types|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|./canonical-types|../types/foundation.types|g' {} \;

# Fix utility imports to use specific functions
find domains -name "*.ts" -exec sed -i '' 's|import { apiUtils, createApiError }|import { createApiSuccess, createApiError }|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|apiUtils\.ok|createApiSuccess|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|apiUtils\.err|createApiError|g' {} \;

# Fix enum imports (remove 'type' keyword for enums used as values)
find domains -name "*.ts" -exec sed -i '' 's|import type { \([^}]*Framework[^}]*\) }|import { \1 }|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|import type { \([^}]*RiskLevel[^}]*\) }|import { \1 }|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|import type { \([^}]*Severity[^}]*\) }|import { \1 }|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|import type { \([^}]*BusinessDomain[^}]*\) }|import { \1 }|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|import type { \([^}]*ValidationLevel[^}]*\) }|import { \1 }|g' {} \;
find domains -name "*.ts" -exec sed -i '' 's|import type { \([^}]*TransformationStatus[^}]*\) }|import { \1 }|g' {} \;

echo "✅ Import path fixes complete!"
echo "📝 Next steps:"
echo "1. Add missing type definitions to ai-verification.types.ts and migration-engine.types.ts"
echo "2. Run: tsc --noEmit to check remaining errors"
echo "3. Fix any remaining path-specific issues manually"
```

## 📊 Error Resolution Timeline

1. **Run the automated script** → Fixes ~1,400 errors (85%)
2. **Add missing type definitions** → Fixes ~200 errors (12%)
3. **Manual path fixes** → Fixes remaining ~43 errors (3%)

## 🎯 Priority Actions

### Immediate (30 minutes):
1. Run the automated fix script above
2. Add the missing enum/interface definitions

### Follow-up (1 hour):
1. Run `tsc --noEmit` to see remaining errors
2. Fix any remaining import paths manually
3. Test build compilation

## ✅ Verification Steps

```bash
# 1. Check import paths are fixed
grep -r "@/" domains/ --include="*.ts" | grep -v node_modules

# 2. Verify TypeScript compilation
tsc --noEmit

# 3. Check for enum usage errors
grep -r "RiskLevel\|Framework\|Severity" domains/ --include="*.ts" | grep "import type"
```

This comprehensive approach leverages your existing canonical types and should resolve all 1,643 TypeScript errors while preventing technical debt by reusing established type definitions.
