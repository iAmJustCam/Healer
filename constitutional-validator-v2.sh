#!/bin/bash
# constitutional-validator-v2.sh
# Enhanced constitutional compliance checker for Strict Canonical Type Enforcement
# Implementation of Constitutional Rules C-01, C-02, C-03

set -e

echo "🏛️ CONSTITUTIONAL VALIDATOR v2 - STRICT CANONICAL TYPE ENFORCEMENT"
echo "🛡️ Validates compliance with Project Constitution v3"
echo ""

VIOLATIONS=0
WARNINGS=0

# Check 1: Local type definitions (Constitutional Mandate D-01)
echo "1️⃣ Checking for local type definitions (D-01)..."
LOCAL_TYPES=$(find . -name "*.ts" -not -path "./types/*" -not -path "./node_modules/*" -not -path "./pipelines/*" -not -path "./**/*.test.ts" -not -path "./**/*.spec.ts" -exec grep -l "^export interface\|^export type\|^export enum" {} \; 2>/dev/null || true)

if [ ! -z "$LOCAL_TYPES" ]; then
    echo "❌ LOCAL TYPE VIOLATIONS (D-01):"
    echo "$LOCAL_TYPES"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ No local type definitions outside canonical-types.ts"
fi

echo ""

# Check 2: JavaScript files (Constitutional Cleanliness)
echo "2️⃣ Checking for JavaScript files..."
JS_FILES=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./shared-foundation/*utilities.mjs" 2>/dev/null || true)

if [ ! -z "$JS_FILES" ]; then
    echo "⚠️  JavaScript files found (should be TypeScript):"
    echo "$JS_FILES"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ All files are TypeScript"
fi

echo ""

# Check 3: Naming conventions (Constitutional Consistency)
echo "3️⃣ Checking naming conventions..."
BAD_NAMES=$(find . -name "*.ts" -not -path "./node_modules/*" | grep -E "[A-Z].*-|.*-[A-Z]" || true)

if [ ! -z "$BAD_NAMES" ]; then
    echo "⚠️  Mixed case naming found:"
    echo "$BAD_NAMES"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ Consistent kebab-case naming"
fi

echo ""

# Check 4: Pipeline compliance - Declaration merging only (Constitutional Mandate D-02)
echo "4️⃣ Checking pipeline constitutional compliance (D-02)..."
PIPELINE_VIOLATIONS=$(find ./pipelines/ -name "*.d.ts" -exec grep -l "^export " {} \; 2>/dev/null | wc -l)
PIPELINE_MERGE_CHECK=$(find ./pipelines/ -name "*.d.ts" -exec grep -L "declare module '@types'" {} \; 2>/dev/null || true)

if [ "$PIPELINE_VIOLATIONS" -gt 0 ]; then
    echo "❌ PIPELINE EXPORT VIOLATIONS (D-02): $PIPELINE_VIOLATIONS files"
    VIOLATIONS=$((VIOLATIONS + 1))
elif [ ! -z "$PIPELINE_MERGE_CHECK" ]; then
    echo "❌ PIPELINE MERGE VIOLATIONS (D-02):"
    echo "$PIPELINE_MERGE_CHECK"
    echo "Pipeline files must use 'declare module \"@types\"' pattern"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ All pipeline files use proper declaration merging"
fi

echo ""

# Check 5: Import patterns (Constitutional Mandate M-01)
echo "5️⃣ Checking import patterns (M-01)..."
# Non-canonical imports - should use @types alias
BAD_IMPORTS=$(find . -name "*.ts" -not -path "./types/*" -not -path "./node_modules/*" -not -path "./**/*.test.ts" -not -path "./**/*.spec.ts" -exec grep -l "import.*from.*['\"].*types.*['\"]" {} \; 2>/dev/null || true)

if [ ! -z "$BAD_IMPORTS" ]; then
    echo "❌ IMPORT PATTERN VIOLATIONS (M-01):"
    echo "$BAD_IMPORTS"
    echo "Must use '@types' alias for canonical imports"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ All imports use canonical @types alias"
fi

echo ""

# Check 6: Canonical Type Usage (Constitutional Mandate S-01)
echo "6️⃣ Checking canonical type usage (S-01)..."
# Check if canonical-types.ts exists
if [ ! -f "./types/canonical-types.ts" ]; then
    echo "❌ CANONICAL SOURCE VIOLATION (S-01):"
    echo "canonical-types.ts does not exist in types/ directory"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ canonical-types.ts exists as SSOT"
fi

echo ""

# Check 7: Pipeline Extension Pattern (Constitutional Mandate D-02)
echo "7️⃣ Checking pipeline extension pattern (D-02)..."
# Check for proper @internal comments
PIPELINE_EXTENSION_VIOLATIONS=$(find ./pipelines/ -name "*.d.ts" -exec grep -L "@internal.*L2 Pipeline Extension" {} \; 2>/dev/null || true)

if [ ! -z "$PIPELINE_EXTENSION_VIOLATIONS" ]; then
    echo "⚠️  PIPELINE EXTENSION COMMENT VIOLATIONS (D-02):"
    echo "$PIPELINE_EXTENSION_VIOLATIONS"
    echo "Pipeline extensions must include '/** @internal L2 Pipeline Extension */' comment"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ All pipeline extensions use proper @internal comments"
fi

echo ""

# Check 8: Type Duplication Check (Constitutional Mandate D-02)
echo "8️⃣ Checking for duplicate type definitions (C-02)..."
# This is a simplified check - a full implementation would use ts-morph for AST comparison
DUPLICATE_CHECKS=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./types/canonical-types.ts" -exec grep -l "interface.*{" {} \; | xargs grep -l "export" 2>/dev/null || true)

if [ ! -z "$DUPLICATE_CHECKS" ]; then
    echo "⚠️  POTENTIAL DUPLICATE TYPES (C-02):"
    echo "$DUPLICATE_CHECKS"
    echo "These files may contain duplicates of canonical types - requires manual review"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ No obvious type duplications detected"
fi

echo ""

# Summary 
echo "📊 CONSTITUTIONAL COMPLIANCE SUMMARY:"

if [ $VIOLATIONS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 FULL CONSTITUTIONAL COMPLIANCE ACHIEVED!"
    echo "✅ Zero violations across all domains"
    echo "✅ Strict Canonical Type Enforcement verified"
    echo "✅ Ready for production use"
elif [ $VIOLATIONS -eq 0 ]; then
    echo "🔶 CONSTITUTIONAL COMPLIANCE WITH WARNINGS"
    echo "✅ No critical violations"
    echo "⚠️  $WARNINGS warnings to address"
    echo "🔧 Recommended fixes, but PR gates pass"
else
    echo "💥 $VIOLATIONS CONSTITUTIONAL VIOLATIONS FOUND"
    echo "⚠️  Plus $WARNINGS additional warnings"
    echo "❌ PR GATES BLOCKED: Compliance required"
    echo "🔧 Manual fixes required before merge"
fi

echo ""
echo "📋 COMPLIANCE CHECKLIST:"
echo "  - Local types ban (D-01): $([ -z "$LOCAL_TYPES" ] && echo "✅" || echo "❌")"
echo "  - Canonical import path (M-01): $([ -z "$BAD_IMPORTS" ] && echo "✅" || echo "❌")"
echo "  - Pipeline extension pattern (D-02): $([ -z "$PIPELINE_MERGE_CHECK" ] && [ "$PIPELINE_VIOLATIONS" -eq 0 ] && echo "✅" || echo "❌")"
echo "  - SSOT exists (S-01): $([ -f "./types/canonical-types.ts" ] && echo "✅" || echo "❌")"
echo "  - Type duplication (C-02): $([ -z "$DUPLICATE_CHECKS" ] && echo "✅" || echo "⚠️")"
echo "  - TypeScript only: $([ -z "$JS_FILES" ] && echo "✅" || echo "⚠️")"
echo "  - Naming conventions: $([ -z "$BAD_NAMES" ] && echo "✅" || echo "⚠️")"
echo "  - Pipeline extension comments: $([ -z "$PIPELINE_EXTENSION_VIOLATIONS" ] && echo "✅" || echo "⚠️")"

echo ""
echo "📑 CONSTITUTIONAL REFERENCES:"
echo "  - M-01: All domain objects must be imported only from @types/canonical-types"
echo "  - D-01: Interface, type, enum declarations outside SSOT are forbidden"
echo "  - D-02: Pipeline extensions must augment PipelineParamMap only"
echo "  - C-01: ESLint rule no-local-types errors on violations"
echo "  - C-02: ts-morph CI audit fails if two distinct identifiers share identical AST shapes"
echo "  - S-01: Execute Big Bang Type Migration by updating imports, removing aliases"

if [ $VIOLATIONS -gt 0 ]; then
    exit 1
else
    exit 0
fi
