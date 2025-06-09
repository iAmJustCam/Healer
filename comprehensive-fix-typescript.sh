#!/bin/bash
# comprehensive-fix-typescript.sh

echo "🔧 Applying comprehensive TypeScript fixes..."

# Step 1: Fix foundation types path
echo "📦 Fixing foundation types imports..."
find . -name "*.ts" -exec sed -i '' 's|@/types/foundation\.types|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|"@/types/foundation\.types"|"../types/foundation.types"|g' {} \;
find . -name "*.ts" -exec sed -i '' "s|'@/types/foundation\.types'|'../types/foundation.types'|g" {} \;

# Step 2: Fix api utils path
echo "🔧 Fixing API utils imports..."
find . -name "*.ts" -exec sed -i '' 's|@/utils/api-utils|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|"@/utils/api-utils"|"../types/foundation.types"|g' {} \;
find . -name "*.ts" -exec sed -i '' "s|'@/utils/api-utils'|'../types/foundation.types'|g" {} \;

# Step 3: Fix schema paths
echo "📝 Fixing schema imports..."
find . -name "*.ts" -exec sed -i '' 's|@/types//schemas/core\.schemas|../shared-foundation/validation-schemas|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|@/types//schemas/validation|../shared-foundation/validation-schemas|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|@/types/schemas/core\.schemas|../shared-foundation/validation-schemas|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|@/types/schemas/validation|../shared-foundation/validation-schemas|g' {} \;

# Step 4: Fix canonical types path
echo "🔄 Fixing canonical types imports..."
find . -name "*.ts" -exec sed -i '' 's|@/types/canonical-types|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|../shared-REFACTORED/types/canonical-types|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|../shared-REFACTORED/utilities/result\.utilities|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|../canonical-types|../types/foundation.types|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|./canonical-types|../types/foundation.types|g' {} \;

# Step 5: Fix utility imports to use specific functions
echo "🛠️ Fixing utility function imports..."
find . -name "*.ts" -exec sed -i '' 's|import { apiUtils, createApiError }|import { createApiSuccess, createApiError }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { apiUtils, createApiError }|import type { createApiSuccess, createApiError }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|apiUtils\.ok|createApiSuccess|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|apiUtils\.err|createApiError|g' {} \;

# Step 6: Fix enum imports (remove 'type' keyword for enums used as values)
echo "🔢 Fixing enum imports..."
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*Framework[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*RiskLevel[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*Severity[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*BusinessDomain[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*ValidationLevel[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*TransformationStatus[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*OutputFormat[^}]*\) }|import { \1 }|g' {} \;

# Step 7: Fix type imports that should be value imports
echo "🔄 Fixing value imports..."
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*createApiResponse[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*createSystemError[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*createEntityId[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*createOperationId[^}]*\) }|import { \1 }|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|import type { \([^}]*createTimestamp[^}]*\) }|import { \1 }|g' {} \;

# Step 8: Fix missing SystemError imports
echo "🐛 Fixing SystemError/ApiError mappings..."
find . -name "*.ts" -exec sed -i '' 's|SystemError|ApiError|g' {} \;
find . -name "*.ts" -exec sed -i '' 's|CorrelationId|EntityId|g' {} \;

echo "✅ Import path fixes complete!"
echo "📝 Next steps:"
echo "1. Run: tsc --noEmit to check remaining errors"
echo "2. Fix any remaining path-specific issues manually"