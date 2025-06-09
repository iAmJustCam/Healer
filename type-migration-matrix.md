# Canonical Types Migration Matrix

**From:** Fragmented 2100-line type definitions
**To:** Clean 700-line canonical SSOT
**Reduction:** 67% smaller, zero duplication

## 🎯 Enum Value Migrations

### RiskLevel Enum
| **Old Format** | **New Format** | **Usage Pattern** |
|----------------|----------------|-------------------|
| `'CRITICAL'` | `RiskLevel.CRITICAL` | `{ level: RiskLevel.CRITICAL }` |
| `'HIGH'` | `RiskLevel.HIGH` | `risk.level === RiskLevel.HIGH` |
| `'MEDIUM'` | `RiskLevel.MEDIUM` | `[RiskLevel.MEDIUM, RiskLevel.LOW]` |
| `'LOW'` | `RiskLevel.LOW` | `switch(level) { case RiskLevel.LOW: }` |
| `'NONE'` | `RiskLevel.NONE` | `riskLevel: RiskLevel.NONE` |

### Framework Enum (Versioned)
| **Old Format** | **New Format** | **Usage Pattern** |
|----------------|----------------|-------------------|
| `Framework.REACT` | `Framework.REACT19` | `{ framework: Framework.REACT19 }` |
| `Framework.NEXT` | `Framework.NEXTJS15` | `frameworks.includes(Framework.NEXTJS15)` |
| `Framework.TYPESCRIPT` | `Framework.TYPESCRIPT5` | `case Framework.TYPESCRIPT5:` |
| `Framework.TAILWIND` | `Framework.TAILWIND4` | `supportedFrameworks: [Framework.TAILWIND4]` |

### TransformationStrategy Enum
| **Old Format** | **New Format** | **Usage Pattern** |
|----------------|----------------|-------------------|
| `'IN_PLACE'` | `TransformationStrategy.IN_PLACE` | `strategy: TransformationStrategy.IN_PLACE` |
| `'COPY_MODIFY'` | `TransformationStrategy.COPY_MODIFY` | `if (strategy === TransformationStrategy.COPY_MODIFY)` |
| `'CREATE_NEW'` | `TransformationStrategy.CREATE_NEW` | `defaultStrategy: TransformationStrategy.CREATE_NEW` |
| `'HYBRID'` | `TransformationStrategy.HYBRID` | `[TransformationStrategy.HYBRID]` |
| `'INCREMENTAL'` | `TransformationStrategy.INCREMENTAL` | `switch(strategy) { case TransformationStrategy.INCREMENTAL: }` |

### TransformationStatus Enum
| **Old Format** | **New Format** | **Usage Pattern** |
|----------------|----------------|-------------------|
| `'PENDING'` | `TransformationStatus.PENDING` | `status: TransformationStatus.PENDING` |
| `'IN_PROGRESS'` | `TransformationStatus.RUNNING` | `status === TransformationStatus.RUNNING` |
| `'COMPLETED'` | `TransformationStatus.COMPLETED` | `finalStatus: TransformationStatus.COMPLETED` |
| `'FAILED'` | `TransformationStatus.FAILED` | `if (status === TransformationStatus.FAILED)` |
| `'SKIPPED'` | `TransformationStatus.SKIPPED` | `result.status = TransformationStatus.SKIPPED` |
| `'CANCELLED'` | `TransformationStatus.CANCELLED` | `TransformationStatus.CANCELLED` |

### Severity Enum (Consistent)
| **Old Format** | **New Format** | **Notes** |
|----------------|----------------|-----------|
| `Severity.CRITICAL` | `Severity.CRITICAL` | ✅ Already correct |
| `Severity.ERROR` | `Severity.ERROR` | ✅ Already correct |
| `Severity.WARNING` | `Severity.WARNING` | ✅ Already correct |
| `Severity.INFO` | `Severity.INFO` | ✅ Already correct |

### ErrorCategory Enum (Consolidated)
| **Old Format** | **New Format** | **Rationale** |
|----------------|----------------|---------------|
| `ErrorCategory.VALIDATION` | `ErrorCategory.TYPE_DEFINITION` | Consolidate related categories |
| `ErrorCategory.TRANSFORMATION` | `ErrorCategory.TYPE_DEFINITION` | Most transformation errors are type-related |
| `ErrorCategory.COMPILATION` | `ErrorCategory.SYNTAX_ERROR` | More specific categorization |
| `ErrorCategory.RUNTIME` | `ErrorCategory.TYPE_ASSERTION` | Runtime errors often type assertions |
| `ErrorCategory.CONFIGURATION` | `ErrorCategory.TYPE_DEFINITION` | Config errors usually type mismatches |

### BusinessDomain Enum (Standardized)
| **Old Format** | **New Format** | **Rationale** |
|----------------|----------------|---------------|
| `BusinessDomain.AUTHENTICATION` | `BusinessDomain.USER_AUTHENTICATION` | More specific naming |
| `BusinessDomain.AUTHORIZATION` | `BusinessDomain.USER_AUTHENTICATION` | Combine auth concepts |
| `BusinessDomain.USER_MANAGEMENT` | `BusinessDomain.USER_AUTHENTICATION` | Related to auth domain |
| `BusinessDomain.REPORTING` | `BusinessDomain.DATA_PROCESSING` | Reporting is data processing |
| `BusinessDomain.INTEGRATION` | `BusinessDomain.API_INTEGRATION` | More specific |
| `BusinessDomain.CORE_BUSINESS` | `BusinessDomain.DATA_PROCESSING` | Business logic processes data |
| `BusinessDomain.INFRASTRUCTURE` | `BusinessDomain.SYSTEM_HEALTH` | Infrastructure monitoring |

## 📁 Import Path Migrations

### Fragmented → Canonical Imports
| **Old Import Path** | **New Import Path** | **Files Affected** |
|---------------------|---------------------|-------------------|
| `from '../types/foundation.types'` | `from '../types/canonical-types'` | ~150 files |
| `from '../types/domain.types'` | `from '../types/canonical-types'` | ~89 files |
| `from '../types/result.types'` | `from '../types/canonical-types'` | ~45 files |
| `from '../types/utilities.types'` | `from '../types/canonical-types'` | ~32 files |
| `from '@shared/types/*'` | `from '@types/canonical-types'` | ~67 files |
| `from '@/types/*'` | `from '@types/canonical-types'` | ~23 files |

### Result Utilities Path Fix
| **Old Import Path** | **New Import Path** | **Reason** |
|---------------------|---------------------|------------|
| `from '../shared-foundation/result-utilities'` | `from '../../domains/shared-foundation/result-utilities'` | Correct relative path |
| `from '../utilities/result-utilities'` | `from '../../domains/shared-foundation/result-utilities'` | Standardize location |

## 🔧 Type vs Value Import Fixes

### Enum Usage Detection
```typescript
// ❌ OLD: Type-only import for enum values
import type { RiskLevel, Framework } from '../types/canonical-types';

// Usage as values (creates runtime error)
const risk = RiskLevel.HIGH; // ❌ RiskLevel is not defined
if (framework === Framework.REACT19) { } // ❌ Framework is not defined

// ✅ NEW: Value import for enum usage
import { RiskLevel, Framework } from '../types/canonical-types';

// Usage as values (works correctly)
const risk = RiskLevel.HIGH; // ✅ Correct
if (framework === Framework.REACT19) { } // ✅ Correct
```

### Import Rule Matrix
| **Usage Type** | **Import Style** | **Example** |
|----------------|------------------|-------------|
| Enum values (switch/comparison) | `import { EnumName }` | `case RiskLevel.HIGH:` |
| Interface types only | `import type { InterfaceName }` | `const data: ApiResponse<T>` |
| Mixed enum + types | `import { EnumName, type InterfaceName }` | `{ level: RiskLevel.HIGH }: RiskAssessment` |
| Factory functions | `import { createEntityId }` | `const id = createEntityId('test')` |

## 🗂️ Interface Consolidations

### Eliminated Duplicate Interfaces
| **Old Interfaces (Removed)** | **New Single Interface** | **Consolidation Benefit** |
|------------------------------|---------------------------|----------------------------|
| `WebSocketOpenEvent`, `WebSocketCloseEvent`, etc. | Removed entirely | Not part of core SSOT |
| `ChartClickEvent`, `ChartHoverEvent`, etc. | Removed entirely | Domain-specific, not canonical |
| `AITrendAnalysis`, `AIReportFileInfo` | Removed entirely | AI-specific, belongs in AI domain |
| `TelemetryData`, `AICLIConfig` | Removed entirely | CLI-specific configuration |
| `NetworkNode`, `NetworkEdge` | Removed entirely | Chart-specific, not core types |

### Consolidated Core Interfaces
| **Multiple Old Versions** | **Single New Version** | **Change Required** |
|---------------------------|------------------------|---------------------|
| `MigrationError` (3 versions) | `MigrationError` (canonical) | Use unified interface |
| `ErrorFix` (2 versions) | `ErrorFix` (canonical) | Standardize on single definition |
| `ErrorPattern` (2 versions) | `ErrorPattern` (canonical) | Remove duplicate properties |
| `TransformationResult` (3 versions) | `TransformationResult` (canonical) | Consolidate to essential properties |
| `ValidationError` (4 versions) | `ValidationError` (canonical) | Single validation error format |

## 🏗️ Factory Function Migrations

### Standardized Creation Functions
| **Old Patterns** | **New Canonical Pattern** | **Migration Required** |
|-------------------|----------------------------|------------------------|
| Multiple `createApiError` signatures | `createApiError(code, message, path?, options?)` | Standardize parameters |
| Various timestamp formats | `createTimestamp()` → ISO string | Use single timestamp format |
| Inconsistent ID generation | `createEntityId(value)`, `createOperationId()` | Use typed ID creators |
| Mixed file path handling | `createFilePath(path)`, `createDirectoryPath(path)` | Use branded path types |

### Removed Factory Functions
| **Removed Function** | **Replacement** | **Reason** |
|---------------------|-----------------|------------|
| `createWebSocketConnectionId()` | Removed | Not core domain |
| `createChartId()` | Removed | Chart-specific |
| `parseArguments()` | Removed | CLI-specific utility |
| `generateSuggestion()` | Internal helper | Not public API |

## 🧪 Type Guard Migrations

### New Type Guards Available
| **Type Guard** | **Usage** | **Benefit** |
|----------------|-----------|-------------|
| `isRiskLevel(value)` | Runtime validation | Type-safe enum checking |
| `isFramework(value)` | Input validation | Prevent invalid framework values |
| `isSeverity(value)` | Error handling | Type-safe severity levels |
| `isTransformationStrategy(value)` | Strategy validation | Ensure valid strategies |

### Usage Pattern
```typescript
// ✅ NEW: Type-safe validation
function processRisk(level: unknown) {
  if (isRiskLevel(level)) {
    // level is now typed as RiskLevel
    switch (level) {
      case RiskLevel.CRITICAL:
        // Handle critical risk
        break;
    }
  }
}
```

## 📋 Migration Checklist

### Phase 1: Update Imports (Estimated: 2-3 hours)
- [ ] Replace all fragmented type imports with canonical imports
- [ ] Fix `type` vs value imports for enums
- [ ] Update result-utilities import paths
- [ ] Verify no compilation errors

### Phase 2: Update Enum Usage (Estimated: 1-2 hours)
- [ ] Replace string literals with enum values
- [ ] Update switch statements to use enum values
- [ ] Fix comparisons to use enum values
- [ ] Standardize framework names to versioned format

### Phase 3: Interface Cleanup (Estimated: 30 minutes)
- [ ] Remove duplicate interface definitions
- [ ] Update to use consolidated interfaces
- [ ] Remove domain-specific interfaces from core types

### Phase 4: Factory Function Updates (Estimated: 30 minutes)
- [ ] Update factory function calls to new signatures
- [ ] Remove calls to deleted factory functions
- [ ] Use new type guards for validation

### Phase 5: Validation (Estimated: 30 minutes)
- [ ] Run TypeScript compilation (`tsc --noEmit`)
- [ ] Run tests to ensure no runtime errors
- [ ] Verify enum values work in switch statements
- [ ] Confirm no import errors

## 🛠️ Automated Migration Scripts

### Search & Replace Commands
```bash
# Update enum values
find . -name "*.ts" -exec sed -i 's/"CRITICAL"/RiskLevel.CRITICAL/g' {} \;
find . -name "*.ts" -exec sed -i 's/"HIGH"/RiskLevel.HIGH/g' {} \;
find . -name "*.ts" -exec sed -i 's/"MEDIUM"/RiskLevel.MEDIUM/g' {} \;
find . -name "*.ts" -exec sed -i 's/"LOW"/RiskLevel.LOW/g' {} \;

# Update import paths
find . -name "*.ts" -exec sed -i "s|from '../types/foundation.types'|from '../types/canonical-types'|g" {} \;
find . -name "*.ts" -exec sed -i "s|from '../types/domain.types'|from '../types/canonical-types'|g" {} \;
find . -name "*.ts" -exec sed -i "s|from '../shared-foundation/result-utilities'|from '../../domains/shared-foundation/result-utilities'|g" {} \;

# Fix enum imports
find . -name "*.ts" -exec sed -i 's/import type { \([^}]*RiskLevel[^}]*\) }/import { \1 }/g' {} \;
find . -name "*.ts" -exec sed -i 's/import type { \([^}]*Framework[^}]*\) }/import { \1 }/g' {} \;
```

### TypeScript AST Migration (Advanced)
```typescript
// migration-script.ts
import { Project } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('**/*.ts');

// Update string literals to enum values
project.getSourceFiles().forEach(file => {
  file.forEachDescendantOfKind(SyntaxKind.StringLiteral, node => {
    const value = node.getLiteralValue();
    switch (value) {
      case 'CRITICAL':
        node.replaceWithText('RiskLevel.CRITICAL');
        break;
      case 'HIGH':
        node.replaceWithText('RiskLevel.HIGH');
        break;
      // ... more replacements
    }
  });
});

project.save();
```

## ⚠️ Breaking Changes & Risks

### High-Risk Changes
| **Change** | **Risk Level** | **Mitigation** |
|------------|----------------|----------------|
| Framework enum rename | 🔴 High | Update all switch statements first |
| ErrorCategory consolidation | 🟡 Medium | Review error handling logic |
| Import path changes | 🟢 Low | Automated find/replace |

### Manual Review Required
- [ ] Switch statements using old `Framework.REACT` → `Framework.REACT19`
- [ ] Error handling using `ErrorCategory.VALIDATION` → `ErrorCategory.TYPE_DEFINITION`
- [ ] Any hardcoded string comparisons with old enum values
- [ ] Files importing from removed type modules

## 🎉 Post-Migration Benefits

### Code Quality Improvements
- **67% reduction** in type definition size
- **Zero duplication** of type definitions
- **100% constitutional compliance** with SSOT principles
- **Type safety** through branded types and type guards
- **Consistent naming** across all domains

### Developer Experience
- **Single import source** for all core types
- **IntelliSense accuracy** with consolidated definitions
- **Faster builds** with reduced type complexity
- **Clear error messages** with type guards
- **Future-proof** with versioned framework enums

### Maintenance Benefits
- **Single point of truth** for type changes
- **Easier refactoring** with centralized definitions
- **Reduced merge conflicts** from duplicate types
- **Simplified testing** with consistent interfaces
- **Clear ownership** of type definitions

---

*Migration completed successfully means your codebase is now 100% constitutional compliant and ready for the Big Bang Type Migration phase! 🚀*
