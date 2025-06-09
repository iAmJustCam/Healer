#!/bin/bash
# fix-typescript-errors.sh

echo "🔧 Fixing TypeScript import errors..."

# Fix foundation types path
find . -name "*.ts" -exec sed -i '' 's|@/types/foundation\.types|../types/foundation.types|g' {} \;

# Fix api utils path
find . -name "*.ts" -exec sed -i '' 's|@/utils/api-utils|../types/foundation.types|g' {} \;

# Fix schema paths
find . -name "*.ts" -exec sed -i '' 's|@/types//schemas/core\.schemas|../shared-foundation/validation-schemas|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|@/types//schemas/validation|../shared-foundation/validation-schemas|g' {} \;

# Fix canonical types path
find . -name "*.ts" -exec sed -i '' 's|@/types/canonical-types|../types/foundation.types|g' {} \;

# Fix refactored paths
find . -name "*.ts" -exec sed -i '' 's|../shared-REFACTORED/types/canonical-types|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|../shared-REFACTORED/utilities/result\.utilities|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|../canonical-types|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|./canonical-types|../types/foundation.types|g' {} \;

# Fix utility imports to use specific functions
find . -name "*.ts" -exec sed -i '' 's|import { apiUtils, createApiError }|import { createApiSuccess, createApiError }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|apiUtils\.ok|createApiSuccess|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|apiUtils\.err|createApiError|g' {} \;

# Fix enum imports (remove 'type' keyword for enums used as values)
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*Framework[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*RiskLevel[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*Severity[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*BusinessDomain[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*ValidationLevel[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*TransformationStatus[^}]*\) }|import { \1 }|g' {} \;

echo "✅ Import path fixes complete!"
echo "📝 Next steps:"
echo "1. Add missing type definitions to ai-verification.types.ts and migration-engine.types.ts"
echo "2. Run: tsc --noEmit to check remaining errors"
echo "3. Fix any remaining path-specific issues manually"