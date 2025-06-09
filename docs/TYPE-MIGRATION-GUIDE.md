# 🗺️ Domain-to-Type System Mapping Guide

## Overview

This guide maps your existing domain structure to the new canonical type system, showing exactly which type files belong to which domains and how they work together.

## 🏗️ Your Domain Architecture

```
domains/
├── shared-foundation/           # Foundation for all domains
├── pattern-detection/           # Finds migration patterns
├── transformation/              # Executes code changes
├── migration-engine/            # Orchestrates the whole process
├── ai-verification/             # AI-powered validation
├── analysis-reporting/          # Generates reports and metrics
└── cli/                        # User interface commands
```

## 📁 New Type System Architecture

```
types/
├── canonical-types.ts           # SINGLE SOURCE OF TRUTH (All domains use this)
└── pipelines/                   # Domain-specific extensions
    ├── pattern-detection.pipeline.d.ts    # → domains/pattern-detection/
    ├── transformation.pipeline.d.ts       # → domains/transformation/
    ├── migration-engine.pipeline.d.ts     # → domains/migration-engine/
    ├── ai-verification.pipeline.d.ts      # → domains/ai-verification/
    ├── analysis.pipeline.d.ts             # → domains/analysis-reporting/
    ├── configuration.pipeline.d.ts        # → domains/shared-foundation/
    └── cli.pipeline.d.ts                  # → domains/cli/
```

## 🎯 Domain-Specific Mapping

### 1. 🏛️ Shared Foundation Domain
**Location**: `domains/shared-foundation/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (all core types)
- ✅ `configuration.pipeline.d.ts` (config-specific parameters)

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import {
  EntityId, FilePath, Result,
  MigrationConfiguration, ValidationLevel
} from '@types';

// From configuration.pipeline.d.ts
const configEngine: Engine<ConfigRequest, ConfigResult, 'configuration'> =
  async (request, context) => {
    const { environment, validationMode, hotReloadEnabled } = context.params;
    // Your configuration logic here
  };
```

**Your Scripts**:
```bash
npm run domain:foundation  # Uses configuration pipeline types
```

---

### 2. 🔍 Pattern Detection Domain
**Location**: `domains/pattern-detection/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (core types like `Framework`, `PatternMatch`)
- ✅ `pattern-detection.pipeline.d.ts` (detection-specific parameters)

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import { Framework, PatternMatch, ConfidenceScore } from '@types';

// From pattern-detection.pipeline.d.ts
const patternEngine: Engine<string[], DetectedPatterns, 'pattern-detection'> =
  async (files, context) => {
    const { frameworks, minConfidence, includeDebt, scanDepth } = context.params;
    // Your pattern detection logic here
  };
```

**Your Scripts**:
```bash
npm run domain:patterns    # Uses pattern-detection pipeline types
```

---

### 3. 🔄 Transformation Domain
**Location**: `domains/transformation/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (core types like `TransformationResult`, `TransformationStrategy`)
- ✅ `transformation.pipeline.d.ts` (transformation-specific parameters)

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import { TransformationStrategy, TransformationResult, ChangeRecord } from '@types';

// From transformation.pipeline.d.ts
const transformEngine: Engine<TransformationRequest, TransformationResult, 'transformation'> =
  async (request, context) => {
    const { strategy, dryRun, backupEnabled, parallelism } = context.params;
    // Your transformation logic here
  };
```

**Your Scripts**:
```bash
npm run domain:transform   # Uses transformation pipeline types
```

---

### 4. 🚀 Migration Engine Domain (Orchestrator)
**Location**: `domains/migration-engine/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (all core coordination types)
- ✅ `migration-engine.pipeline.d.ts` (orchestration-specific parameters)
- ⚡ Can also import from other pipeline files when coordinating

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import { MigrationSession, RiskAssessment, ExecutionContext } from '@types';

// From migration-engine.pipeline.d.ts
const migrationEngine: Engine<MigrationPlan, MigrationExecution, 'migration-engine'> =
  async (plan, context) => {
    const { strategySelector, riskTolerance, maxConcurrency } = context.params;
    // Your orchestration logic here
  };
```

**Your Scripts**:
```bash
npm run domain:migrate     # Uses migration-engine pipeline types
```

---

### 5. 🤖 AI Verification Domain
**Location**: `domains/ai-verification/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (core types like `ConfidenceScore`, `RiskLevel`)
- ✅ `ai-verification.pipeline.d.ts` (AI-specific parameters)

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import { ConfidenceScore, RiskLevel, Severity } from '@types';

// From ai-verification.pipeline.d.ts
const aiEngine: Engine<AIVerificationRequest, AIVerificationResult, 'ai-verification'> =
  async (request, context) => {
    const { model, confidence, maxTokens, enableEnhancement } = context.params;
    // Your AI verification logic here
  };
```

**Your Scripts**:
```bash
npm run domain:ai          # Uses ai-verification pipeline types
```

---

### 6. 📊 Analysis & Reporting Domain
**Location**: `domains/analysis-reporting/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (core types like `BusinessDomain`, `RiskAssessment`)
- ✅ `analysis.pipeline.d.ts` (analysis-specific parameters)

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import { BusinessDomain, RiskAssessment, TelemetryData } from '@types';

// From analysis.pipeline.d.ts
const analysisEngine: Engine<AnalysisRequest, AnalysisResult, 'analysis'> =
  async (request, context) => {
    const { depth, audience, generateReport, metrics } = context.params;
    // Your analysis logic here
  };
```

**Your Scripts**:
```bash
npm run domain:analysis    # Uses analysis pipeline types
```

---

### 7. 💻 CLI Domain
**Location**: `domains/cli/`

**Uses These Type Files**:
- ✅ `canonical-types.ts` (core types like `OutputFormat`, `Result`)
- ✅ `cli.pipeline.d.ts` (CLI-specific parameters)
- ⚡ Can import from other pipeline files to coordinate commands

**What This Domain Gets**:
```typescript
// From canonical-types.ts
import { OutputFormat, Result, ApiResponse } from '@types';

// From cli.pipeline.d.ts
const cliEngine: Engine<CLICommand, CLIResult, 'cli'> =
  async (command, context) => {
    const { interactive, verbose, outputFormat, colorEnabled } = context.params;
    // Your CLI logic here
  };
```

**Your Scripts**:
```bash
npm run domain:cli         # Uses cli pipeline types
npm run migrate           # Main CLI entry point
```

## 🔄 How Domains Work Together

### Cross-Domain Communication Pattern

```typescript
// Example: CLI domain coordinating with other domains

// 1. CLI receives user command
const cliResult = await cliEngine(userCommand, cliContext);

// 2. CLI calls pattern detection
const patternResult = await patternDetectionEngine(files, patternContext);

// 3. CLI calls migration engine (which coordinates others)
const migrationResult = await migrationEngine(migrationPlan, migrationContext);

// 4. CLI calls analysis for reporting
const reportResult = await analysisEngine(analysisRequest, analysisContext);
```

### Type Safety Across Domains

✅ **Before**: Each domain had its own types, causing mismatches
```typescript
// Different domains used different "User" types - ERROR PRONE!
// domain1: interface User { name: string }
// domain2: interface User { id: number, name: string }
```

✅ **After**: All domains use the same canonical types
```typescript
// All domains import from same place - TYPE SAFE!
import { EntityId, UserInfo, Result } from '@types';
```

## 🚀 Migration Steps by Domain

### Step 1: Update All Domain Imports
```bash
# This command updates ALL domains at once
npm run migrate:types
```

### Step 2: Verify Each Domain Works
```bash
# Test each domain individually
npm run domain:foundation
npm run domain:patterns
npm run domain:transform
npm run domain:migrate
npm run domain:ai
npm run domain:analysis
npm run domain:cli
```

### Step 3: Test Cross-Domain Integration
```bash
# Test the main CLI which coordinates everything
npm run migrate --help
npm run types:health
```

## 🎁 What Each Domain Gets

### 🏛️ Foundation Domain Benefits
- **Centralized configuration types** - no more config mismatches
- **Shared validation patterns** - consistent error handling
- **Common utilities** - factory functions and type guards

### 🔍 Pattern Detection Benefits
- **Framework-specific types** - type-safe pattern matching
- **Confidence scoring** - standardized confidence metrics
- **Risk assessment** - consistent risk evaluation

### 🔄 Transformation Benefits
- **Strategy types** - type-safe transformation strategies
- **Result patterns** - standardized transformation results
- **Change tracking** - consistent change record format

### 🚀 Migration Engine Benefits
- **Orchestration types** - type-safe domain coordination
- **Execution tracking** - standardized progress monitoring
- **Resource management** - consistent resource usage patterns

### 🤖 AI Verification Benefits
- **AI service types** - type-safe AI integration
- **Verification patterns** - standardized verification results
- **Enhancement tracking** - consistent enhancement metrics

### 📊 Analysis Benefits
- **Reporting types** - type-safe report generation
- **Metrics patterns** - standardized metric collection
- **Business context** - consistent business impact modeling

### 💻 CLI Benefits
- **Command types** - type-safe command processing
- **Output formatting** - consistent output patterns
- **User interaction** - standardized user experience

## 🛠️ Daily Workflow

### When Working on a Specific Domain

1. **Import what you need from canonical types**:
   ```typescript
   import { Framework, Result, ConfidenceScore } from '@types';
   ```

2. **Use your domain's pipeline parameters**:
   ```typescript
   const myEngine: Engine<Input, Output, 'my-domain'> = async (input, context) => {
     const { myParam1, myParam2 } = context.params; // Type-safe!
   };
   ```

3. **Test your domain**:
   ```bash
   npm run domain:my-domain
   npm run types:validate
   ```

### When Adding New Domain Features

1. **Add to your pipeline declaration file**:
   ```typescript
   // types/pipelines/my-domain.pipeline.d.ts
   declare module '@types' {
     interface PipelineParamMap {
       'my-domain': {
         readonly newFeature: boolean; // Add your new parameter
       };
     }
   }
   ```

2. **Use it in your domain code**:
   ```typescript
   const { newFeature } = context.params; // Automatically type-safe!
   ```

## 🎯 Key Benefits

### For Individual Domains
- **Type Safety**: Your domain code is protected from type errors
- **IntelliSense**: Your editor knows exactly what types are available
- **Refactoring**: Safe to rename and restructure with confidence

### For Cross-Domain Integration
- **Consistent APIs**: All domains speak the same type language
- **Safe Communication**: No more type mismatches between domains
- **Clear Contracts**: Pipeline interfaces document expectations

### For the Whole System
- **Single Source of Truth**: One place to find and update types
- **Automated Quality**: ESLint prevents type sprawl
- **Fast Compilation**: Fewer files mean faster builds

## 🆘 Domain-Specific Troubleshooting

### If Your Domain Can't Find Types
```bash
# 1. Check if canonical types are in the right place
ls -la canonical-types.ts

# 2. Verify tsconfig.json has the path alias
grep "@types" tsconfig.json

# 3. Restart your TypeScript server
# In VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### If Pipeline Parameters Aren't Working
```bash
# 1. Check if your pipeline declaration file exists
ls -la types/pipelines/your-domain.pipeline.d.ts

# 2. Verify the module declaration syntax
# Should be: declare module '@types' { ... }

# 3. Make sure you're importing from '@types'
grep "from '@types'" your-domain-files.ts
```

### If Cross-Domain Types Don't Match
```bash
# 1. Run the type health check
npm run types:health

# 2. Check for duplicates
npm run types:audit

# 3. Validate all domains
npm run types:validate
```

## 🎉 Success Metrics by Domain

After migration, each domain should achieve:

- ✅ **0 TypeScript errors** in domain code
- ✅ **100% type coverage** for domain interfaces
- ✅ **Fast IntelliSense** in your editor
- ✅ **Safe refactoring** across domain boundaries
- ✅ **Clear documentation** through self-documenting types

---

**Remember**: This system is designed to make your life easier, not harder. Each domain gets exactly what it needs while ensuring everything works together perfectly!
