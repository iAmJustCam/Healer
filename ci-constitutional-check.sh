#!/bin/bash
# ci-constitutional-check.sh
# CI integration for constitutional validation

set -e

# Run validation on files excluding certain directories
echo "🏛️ CONSTITUTIONAL VALIDATION FOR CI"
echo ""

# Check for local type definitions (D-01)
echo "1️⃣ Checking for local type definitions (D-01)..."
LOCAL_TYPES=$(find . -name "*.ts" \
  -not -path "./types/*" \
  -not -path "./node_modules/*" \
  -not -path "./**/*.test.ts" \
  -not -path "./**/*.spec.ts" \
  -not -path "./pipelines/*" \
  -not -path "./transformation-engine-REFACTORED/*" \
  -not -path "./convert-migration-engine/*" \
  -not -path "./.constitutional/*" \
  -exec grep -l "^export interface\|^export type\|^export enum" {} \; 2>/dev/null || true)

if [ ! -z "$LOCAL_TYPES" ]; then
    echo "❌ LOCAL TYPE VIOLATIONS (D-01):"
    echo "$LOCAL_TYPES"
    exit 1
else
    echo "✅ No local type definitions outside canonical-types.ts"
fi

echo ""

# Check for import pattern violations (M-01)
echo "2️⃣ Checking import patterns (M-01)..."
BAD_IMPORTS=$(find . -name "*.ts" \
  -not -path "./types/canonical-types.ts" \
  -not -path "./node_modules/*" \
  -not -path "./transformation-engine-REFACTORED/*" \
  -not -path "./convert-migration-engine/*" \
  -not -path "./.constitutional/*" \
  -exec grep -l "import.*from.*['\"].*types['\"]" {} \; 2>/dev/null || true)

if [ ! -z "$BAD_IMPORTS" ]; then
    echo "❌ IMPORT PATTERN VIOLATIONS (M-01):"
    echo "$BAD_IMPORTS"
    exit 1
else
    echo "✅ All imports use canonical @types alias"
fi

echo ""

# Check for pipeline declaration compliance (D-02)
echo "3️⃣ Checking pipeline declarations (D-02)..."
PIPELINE_VIOLATIONS=$(find ./pipelines/ -name "*.d.ts" -exec grep -L "declare module '@types'" {} \; 2>/dev/null || true)

if [ ! -z "$PIPELINE_VIOLATIONS" ]; then
    echo "❌ PIPELINE DECLARATION VIOLATIONS (D-02):"
    echo "$PIPELINE_VIOLATIONS"
    exit 1
else
    echo "✅ All pipeline files use proper declaration merging"
fi

echo ""
echo "🎉 CONSTITUTIONAL COMPLIANCE ACHIEVED FOR CI"
exit 0