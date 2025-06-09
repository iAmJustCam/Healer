# 🏛️ Contributing to the Domain Monorepo

Welcome to the Domain Monorepo! This document outlines key contribution guidelines, with a special focus on the **Project Constitution for Strict Canonical Type Enforcement**.

## Table of Contents

- [Project Constitution](#project-constitution)
- [Type System Architecture](#type-system-architecture)
- [Declaration Merging Pattern](#declaration-merging-pattern)
- [Development Workflow](#development-workflow)
- [Validation and Compliance](#validation-and-compliance)

## Project Constitution

This repository follows a strict **Constitutional Model** for ensuring consistent, maintainable code. The current constitution (V3) implements **Strict Canonical Type Enforcement** which requires:

1. **Single Source of Truth (SSOT)** - All types come from one canonical source
2. **Strict DRY Implementation** - One identifier per concept, no synonyms
3. **Hard Dependency Inversion** - All modules depend on SSOT abstractions
4. **Zero-Tolerance Type Deduplication** - No type aliases allowed
5. **Type System Hardening** - Compilation breaks on any deviation

See `CONSTITUTION.md` in the root directory for the complete constitutional text.

## Type System Architecture

Our type system is organized around these key principles:

```
types/
├── canonical-types.ts           # SINGLE SOURCE OF TRUTH (All domains)
└── pipelines/                   # Domain-specific extensions
    ├── pattern-detection.pipeline.d.ts
    ├── transformation.pipeline.d.ts
    ├── migration-engine.pipeline.d.ts
    └── ...
```

### Importing Types

**ALWAYS** import types using the canonical `@types` alias:

```typescript
// ✅ CORRECT: Use the canonical @types alias
import { EntityId, PatternMatch, RiskLevel } from '@types';

// ❌ WRONG: Never import directly from file paths
import { EntityId } from '../types/canonical-types';
import { PatternMatch } from './types/foundation.types';
```

## Declaration Merging Pattern

The **ONLY** way to define domain-specific types is through TypeScript's declaration merging pattern in pipeline declaration files.

### How Declaration Merging Works

Declaration merging allows you to extend existing interfaces in a type-safe way without modifying the original source file.

For our project, we use declaration merging to extend the `PipelineParamMap` interface from canonical-types.ts:

```typescript
// In canonical-types.ts
export interface PipelineParamMap {
  [key: string]: Record<string, unknown>;
}

// In your-domain.pipeline.d.ts
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'your-domain': {
      readonly specificOption: boolean;
      readonly customConfig: string;
      // ... other domain-specific parameters
    };
  }
}
```

### Rules for Declaration Merging

1. **Location**: ONLY in `*.pipeline.d.ts` files
2. **Target**: ONLY extend the `PipelineParamMap` interface
3. **Format**: Use `declare module '@types'` pattern
4. **Comment**: Include the `/** @internal L2 Pipeline Extension */` comment
5. **Domain Key**: Use a domain-specific string key (e.g., 'pattern-detection')
6. **Properties**: Use readonly properties to ensure immutability

### Declaration Merging Example

Here's a complete example for a domain's pipeline parameters:

```typescript
// In pipelines/my-feature.pipeline.d.ts

/**
 * My Feature Pipeline Parameters
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Pipeline extension via declaration merging only
 */

// Import any needed canonical types
import { ValidationLevel, RiskLevel } from '@types';

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'my-feature': {
      readonly enableFeatureX: boolean;
      readonly validationLevel: ValidationLevel;
      readonly customThreshold: number;
      readonly riskTolerance: RiskLevel;
    };
  }
}
```

### Using Pipeline Parameters

After defining your pipeline parameters through declaration merging, you can use them type-safely in your domain code:

```typescript
import { Engine, ApiResponse, OperationId } from '@types';

// Your domain-specific types
type MyInput = string[];
type MyOutput = { results: string[] };

// Create a typed engine function
const myFeatureEngine: Engine<MyInput, MyOutput, 'my-feature'> = 
  async (input, context) => {
    // Access your typed parameters
    const { enableFeatureX, validationLevel, customThreshold, riskTolerance } = context.params;
    
    // Type-safe parameter usage
    if (enableFeatureX && validationLevel === 'STRICT') {
      // ...implementation
    }
    
    // ...rest of implementation
    
    // Return typed response
    return {
      success: true,
      data: { results: ['result1', 'result2'] }
    };
  };
```

## Development Workflow

1. **NEVER** create types in your domain code files
2. **ALWAYS** import from `@types` alias
3. For domain-specific parameters, use the declaration merging pattern
4. Run `npm run validate:constitution` before committing
5. Fix any constitutional violations before pushing

## Validation and Compliance

We enforce constitutional compliance through multiple mechanisms:

1. **ESLint Rule**: The `no-local-types` rule prevents type declarations outside canonical files
2. **Constitutional Validator**: The `npm run validate:constitution` script checks for violations
3. **CI Checks**: PR gates include constitutional validation
4. **TypeScript Path Aliases**: The tsconfig.json enforces canonical imports

### Validation Scripts

```bash
# Check for constitutional violations
npm run validate:constitution

# Lint code with constitutional rules
npm run lint

# Fix common issues automatically
npm run lint:fix
```

### Common Violations and Fixes

| Violation | Fix |
|-----------|-----|
| Local type definition | Move to canonical-types.ts or use declaration merging |
| Direct import from types file | Change to import from '@types' |
| Missing @internal comment | Add the required comment to pipeline extensions |
| Duplicate type definition | Use the canonical type instead |

## Need Help?

If you're unsure about how to follow the constitutional principles, please reach out to:

- Type Stewards: [list of domain type stewards]
- Architecture Council: [council members]

Remember, the constitution exists to make our codebase more maintainable and robust, not to make development harder. Once you get used to the patterns, you'll find they lead to more consistent, reliable code.