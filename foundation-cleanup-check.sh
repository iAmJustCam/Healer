#!/bin/bash
# foundation-cleanup-check.sh
# Check shared-foundation for constitutional violations

echo "🔍 CHECKING SHARED-FOUNDATION FOR CONSTITUTIONAL VIOLATIONS"
echo ""

# Check for local type definitions
echo "Checking for local type definitions..."
FOUNDATION_VIOLATIONS=$(find shared-foundation/ -name "*.ts" -exec grep -l "export interface\|export type" {} \; 2>/dev/null)

if [ ! -z "$FOUNDATION_VIOLATIONS" ]; then
    echo "❌ Foundation files with local type definitions:"
    echo "$FOUNDATION_VIOLATIONS"
    echo ""
    echo "These should be moved to canonical /types files:"
    for file in $FOUNDATION_VIOLATIONS; do
        echo "  Processing: $file"
        grep -n "export interface\|export type" "$file" | head -3
        echo ""
    done
else
    echo "✅ No local type definitions found in shared-foundation"
fi

# Check for duplicate utilities across domains
echo "🔍 Checking for potential duplicate utilities..."
echo ""
echo "Array utilities:"
find . -name "*array*" -type f | grep -v node_modules | grep -v .git
echo ""
echo "String utilities:"
find . -name "*string*" -type f | grep -v node_modules | grep -v .git
echo ""
echo "Validation utilities:"
find . -name "*validation*" -type f | grep -v node_modules | grep -v .git

# Check for mixed file extensions
echo ""
echo "🔍 Checking for mixed file extensions..."
echo "JavaScript files in TypeScript project:"
find . -name "*.js" -o -name "*.mjs" | grep -v node_modules | grep -v .git

echo ""
echo "📋 CLEANUP RECOMMENDATIONS:"
echo "1. Move any shared-foundation types to /types"
echo "2. Consolidate duplicate utilities"
echo "3. Convert .js/.mjs files to .ts (or justify their existence)"
echo "4. Remove temporary files"
echo "5. Ensure consistent naming patterns"
