#!/bin/bash

# Script to fix missing imports for canonical types
# Uses the Node.js script to find and fix missing imports in TypeScript files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make a backup of files that will be modified
echo "Creating backup of files..."
BACKUP_DIR="$SCRIPT_DIR/type-import-fix-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Find files with TypeScript errors
echo "Finding files with TypeScript errors..."
FILES_WITH_ERRORS=$(npx tsc --noEmit --pretty false 2>&1 | grep -E "TS2304|Cannot find name" | awk -F'(' '{print $1}' | sort | uniq)

# Backup files with errors
for FILE in $FILES_WITH_ERRORS; do
  if [ -f "$FILE" ]; then
    DIR_PATH=$(dirname "$FILE")
    BACKUP_SUBDIR="$BACKUP_DIR/$DIR_PATH"
    mkdir -p "$BACKUP_SUBDIR"
    cp "$FILE" "$BACKUP_SUBDIR/"
    echo "Backed up $FILE"
  fi
done

# Run the Node.js script to fix imports
echo "Running fix-missing-imports.js..."
node "$SCRIPT_DIR/fix-missing-imports.js"

# Check if there are still TypeScript errors
echo "Checking for remaining TypeScript errors..."
REMAINING_ERRORS=$(npx tsc --noEmit --pretty false 2>&1 | grep -E "TS2304|Cannot find name" | wc -l | xargs)

if [ "$REMAINING_ERRORS" -gt 0 ]; then
  echo "There are still $REMAINING_ERRORS TypeScript errors. Some imports might not have been fixed."
else
  echo "Success! All missing type imports have been fixed."
fi

echo "Done. Backup created at $BACKUP_DIR"