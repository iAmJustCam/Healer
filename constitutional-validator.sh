#!/bin/bash
# constitutional-validator.sh

echo "🛡️ COMPREHENSIVE CONSTITUTIONAL VALIDATION"

VIOLATIONS=0

# Check for local types outside /types directory
echo "Checking for local type definitions..."
LOCAL_TYPES=$(find . -name "*.ts" -not -path "./types/*" -not -path "./pipelines/*" -exec grep -l "export interface\|export type" {} \;)

if [ ! -z "$LOCAL_TYPES" ]; then
  echo "❌ Local type violations found:"
  echo "$LOCAL_TYPES"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for mixed file extensions
echo "Checking for mixed file extensions..."
JS_FILES=$(find . -name "*.js" | grep -v node_modules | grep -v "script-runner\|direct-run")
if [ ! -z "$JS_FILES" ]; then
  echo "❌ JavaScript files in TypeScript project:"
  echo "$JS_FILES"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for naming inconsistencies
echo "Checking for naming inconsistencies..."
MIXED_CASE=$(find . -name "*-*" -name "*.ts" | grep -E "[A-Z].*-")
if [ ! -z "$MIXED_CASE" ]; then
  echo "❌ Mixed case naming violations:"
  echo "$MIXED_CASE"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Summary
if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ CONSTITUTIONAL COMPLIANCE ACHIEVED!"
  exit 0
else
  echo "💥 $VIOLATIONS constitutional violations found"
  exit 1
fi
