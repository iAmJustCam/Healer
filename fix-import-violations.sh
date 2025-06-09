#!/bin/bash

# Fix import pattern violations in the remaining files
# This script replaces imports that contain 'types' in the path 
# with the canonical @types alias

# Get all files with import pattern violations
VIOLATION_FILES=$(find . -name "*.ts" \
  -not -path "./types/canonical-types.ts" \
  -not -path "./node_modules/*" \
  -not -path "./transformation-engine-REFACTORED/*" \
  -not -path "./convert-migration-engine/*" \
  -not -path "./.constitutional/*" \
  -exec grep -l "import.*from.*['\"].*types['\"]" {} \; 2>/dev/null || true)

echo "Files with import pattern violations:"
echo "$VIOLATION_FILES"
echo ""

# Process each file
for file in $VIOLATION_FILES; do
  echo "Processing $file..."
  
  # Create a backup
  cp "$file" "${file}.bak"
  
  # Fix imports containing "types" but not using @types alias
  # Pattern: import ... from '...types...'
  # Replace with: import ... from '@types'
  perl -i -pe 's/import\s+\{([^}]+)\}\s+from\s+['"'"'"]([^@][^'"'"'"]*types[^'"'"'"]*)['"'"'"]/import { $1 } from '\''@types'\''/g' "$file"
  
  echo "Fixed $file"
done

echo ""
echo "All import violations fixed!"