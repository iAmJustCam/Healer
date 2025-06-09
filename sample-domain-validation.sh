#!/bin/bash
# sample-domain-validation.sh
# Shows how to check a specific domain for compliance

set -e

DOMAIN="websocket"  # Change this to the domain you want to validate

echo "🏛️ CONSTITUTIONAL VALIDATION FOR $DOMAIN DOMAIN"
echo ""

# Find domain-specific files
FILES=$(find /Users/cameroncatri/Desktop/layers -path "*domains/$DOMAIN*" -name "*.ts")

# Check for local type definitions
echo "1️⃣ Checking for local type definitions in $DOMAIN domain..."
LOCAL_TYPES=$(grep -l "^export interface\|^export type\|^export enum" $FILES 2>/dev/null || true)

if [ ! -z "$LOCAL_TYPES" ]; then
    echo "❌ LOCAL TYPE VIOLATIONS:"
    echo "$LOCAL_TYPES"
    echo ""
    echo "These files contain local type definitions that need to be migrated to canonical-types.ts"
else
    echo "✅ No local type definitions in $DOMAIN domain"
fi

echo ""

# Check for non-canonical imports
echo "2️⃣ Checking for non-canonical imports in $DOMAIN domain..."
BAD_IMPORTS=$(grep -l "import.*from.*['\"].*types['\"]" $FILES 2>/dev/null || true)

if [ ! -z "$BAD_IMPORTS" ]; then
    echo "❌ IMPORT PATTERN VIOLATIONS:"
    echo "$BAD_IMPORTS"
    echo ""
    echo "These files contain imports from type files instead of @types alias"
else
    echo "✅ All imports use canonical @types alias"
fi

echo ""
echo "🔍 RECOMMENDED STEPS FOR $DOMAIN DOMAIN:"
echo "1. Move any local type definitions to canonical-types.ts"
echo "2. Replace imports to use @types alias"
echo "3. For domain-specific parameters, create a $DOMAIN.pipeline.d.ts file"
echo "4. Run the full constitutional validator when done"