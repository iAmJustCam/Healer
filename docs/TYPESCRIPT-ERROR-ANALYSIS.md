# TypeScript Errors Analysis & Fix Plan

## Root Cause Analysis

The compilation errors stem from several interconnected issues:

### 1. Broken Import Paths
- Many files are importing from `@shared/types/domain.types` but this path doesn't exist
- Mixed usage of relative vs absolute imports
- Inconsistent module resolution

### 2. Missing Type Definitions
From the error analysis, these key types are missing or incorrectly imported:

#### Core Domain Types (should be in `domain.types.ts`):
- `EntityId`, `CanonicalId`, `Timestamp`, `FilePath`
- `ConfidenceScore`, `ComplexityScore`, `Severity`
- `Framework`, `RiskLevel`, `ValidationLevel`
- `ApiResponse`, `Result`, `MigrationConfiguration`
- `PatternMatch`, `CodeLocation`, `ExecutionContext`

#### Business Context Types:
- `BusinessDomain`, `CascadeType`, `RiskFactorType`
- `TransformationStatus`, `OutputFormat`

#### AI-Related Types:
- `ErrorCategory`, `ErrorSeverity`, `RecoveryType`
- `LogLevel`

### 3. Type Guard vs Value Usage
Many enums are imported as types but used as values, causing compilation errors.

### 4. Duplicate Exports
Multiple files export the same types, causing conflicts.

## Fix Strategy

### Phase 1: Consolidate Core Types
1. Create a single source of truth for domain types
2. Fix import/export declarations
3. Ensure enums can be used as both types and values

### Phase 2: Update Import Paths
1. Standardize on relative imports within domains
2. Use absolute imports only for cross-domain references
3. Update all import statements to use correct paths

### Phase 3: Resolve Conflicts
1. Remove duplicate type definitions
2. Create proper type re-exports
3. Fix namespace conflicts

## Implementation Plan

### Step 1: Create Consolidated Domain Types
Update `domains/shared-foundation/types/domain.types.ts` with all missing types.

### Step 2: Fix Import Paths
Create a script to systematically update all import paths.

### Step 3: Update Index Files
Ensure proper re-exports from index files.

### Step 4: Validate Compilation
Run incremental TypeScript compilation to verify fixes.

## Key Files to Update

1. `domains/shared-foundation/types/domain.types.ts` - Add missing types
2. `domains/shared-foundation/types/index.ts` - Fix exports
3. All files with `@shared/types/*` imports - Update paths
4. Files using enums as values - Fix import declarations

## Missing Type Mappings

Based on the errors, here are the types that need to be added or moved:

### From `migration.types.ts` to `domain.types.ts`:
- `EntityId`, `Timestamp`, `FilePath`, `GitSha`
- `Framework`, `RiskLevel`, `TransformStrategy`
- `FlagCategory`, `OutputFormat`
- `ApiResponse`, `SystemError`, `MigrationConfiguration`

### New types needed:
- `CanonicalId`, `ConfidenceScore`, `ComplexityScore`
- `BusinessDomain`, `CascadeType`, `RiskFactorType`
- `TransformationStatus`, `PatternId`, `TransformationId`
- `ErrorCategory`, `ErrorSeverity`, `RecoveryType`, `LogLevel`

### TypeShape related:
- `TypeCategory`, `PrimitiveKind`, `TypeModifier`
- All TypeShape interfaces and utilities

This analysis shows we need to create a comprehensive type consolidation that resolves the import issues while maintaining the existing functionality.
