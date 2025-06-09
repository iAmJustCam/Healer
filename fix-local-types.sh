#!/bin/bash
# fix-local-types.sh
# Removes local type declarations in violation of D-01

set -e

echo "🛡️ FIXING LOCAL TYPE DECLARATIONS (D-01)"
echo ""

# Create backup directory
BACKUP_DIR="./local-types-fix-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"
echo ""

# Extract local type declarations
echo "1️⃣ Finding local type declarations..."
LOCAL_TYPES_FILES=$(find . -name "*.ts" -not -path "./types/*" -not -path "./node_modules/*" -not -path "./**/*.test.ts" -not -path "./**/*.spec.ts" -not -path "./pipelines/*" -exec grep -l "^export interface\|^export type\|^export enum" {} \;)

# Process each file with local type declarations
for FILE in $LOCAL_TYPES_FILES; do
  echo "Processing $FILE..."
  
  # Backup file
  cp "$FILE" "$BACKUP_DIR/$(basename "$FILE")"
  
  # Create a temporary file to extract type declarations
  TEMP_TYPES_FILE=$(mktemp)
  
  # Extract type declarations to a temporary file
  grep -n "^export \(interface\|type\|enum\)" "$FILE" | while read -r LINE; do
    LINE_NUM=$(echo "$LINE" | cut -d: -f1)
    TYPE_DECL=$(echo "$LINE" | cut -d: -f2-)
    
    # Extract the type name
    TYPE_NAME=$(echo "$TYPE_DECL" | sed -E 's/export (interface|type|enum) ([a-zA-Z0-9_]+).*/\2/')
    
    echo "  - Found local type: $TYPE_NAME"
    
    # Determine the end of the type declaration
    END_LINE=$(tail -n +$LINE_NUM "$FILE" | grep -n "^}" | head -1 | cut -d: -f1)
    if [ -z "$END_LINE" ]; then
      # For single-line type declarations
      END_LINE=1
    fi
    END_LINE=$((LINE_NUM + END_LINE))
    
    # Extract the type declaration
    sed -n "${LINE_NUM},${END_LINE}p" "$FILE" >> "$TEMP_TYPES_FILE"
    echo "" >> "$TEMP_TYPES_FILE"
    
    # Remove the type declaration from the file and replace with an import
    sed -i '' "${LINE_NUM},${END_LINE}d" "$FILE"
    
    # Add an import for the type from @types
    if ! grep -q "import.*${TYPE_NAME}.*from '@types'" "$FILE"; then
      if grep -q "import.*from '@types'" "$FILE"; then
        # Add to existing import
        sed -i '' "s/import { \(.*\) } from '@types';/import { \1, ${TYPE_NAME} } from '@types';/" "$FILE"
      else
        # Add new import at the top of the file
        sed -i '' "1s/^/import { ${TYPE_NAME} } from '@types';\n/" "$FILE"
      fi
    fi
  done
  
  echo "✓ Processed $FILE"
  echo "  - Local types extracted to $TEMP_TYPES_FILE"
  echo "  - Consider manually adding these types to canonical-types.ts"
  echo ""
done

echo "2️⃣ Fixing remaining import patterns..."
# Fix any remaining import patterns
PROBLEMATIC_IMPORTS=$(find . -name "*.ts" -not -path "./types/*" -not -path "./node_modules/*" -exec grep -l "import.*from.*['\"].*types['\"]" {} \;)

for FILE in $PROBLEMATIC_IMPORTS; do
  echo "Fixing imports in $FILE..."
  
  # Backup file
  cp "$FILE" "$BACKUP_DIR/$(basename "$FILE")"
  
  # Replace imports
  sed -i '' -E "s/import ([^;]+) from ['\"]([^'\"]+)\.types['\"];/import \1 from '@types';/g" "$FILE"
  sed -i '' -E "s/import ([^;]+) from ['\"]([^'\"]+)\/types[^\/'\"]+['\"];/import \1 from '@types';/g" "$FILE"
  
  echo "✓ Fixed imports in $FILE"
done

echo "✅ LOCAL TYPE FIXES COMPLETE"
echo ""
echo "Next steps:"
echo "1. Review the extracted type declarations in $BACKUP_DIR"
echo "2. Add missing types to canonical-types.ts if needed"
echo "3. Run the constitutional validator again"