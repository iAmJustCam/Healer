#!/bin/bash
# fix-enum-imports.sh

echo "🔧 Fixing enum imports..."

# Convert all imports of enum types to value imports
find . -name "*.ts" -exec sed -i '' 's/import type {[^}]*\(Framework\|RiskLevel\|Severity\|TransformationStatus\|BusinessDomain\|ValidationLevel\|OutputFormat\|ConfidenceScore\|ComplexityLevel\)[^}]*}/import { \1 }/g' {} \;

# Update any imports that import both type and value
find . -name "*.ts" -exec sed -i '' 's/import type \([^{]*\){/import \1{/g' {} \;

# Update all factory function imports to be value imports
find . -name "*.ts" -exec sed -i '' 's/import type {[^}]*\(createApiResponse\|createSystemError\|createEntityId\|createOperationId\|createTimestamp\|createFilePath\|createApiSuccess\|createApiError\)[^}]*}/import { \1 }/g' {} \;

echo "✅ Enum imports fixed!"