#!/bin/bash
# cleanup-type-files.sh
# Remove duplicate type files now that we have the canonical types

set -e

echo "🧹 CLEANING UP DUPLICATE TYPE FILES"
echo ""

# Create backup directory
BACKUP_DIR="./type-files-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"
echo ""

# List type files to be archived
echo "Archiving type files (will be backed up first):"
find ./types -name "*.types.ts" -not -name "canonical-types.ts" | sort

# Back up all type files except canonical-types.ts
echo ""
echo "1️⃣ Backing up type files..."
find ./types -name "*.types.ts" -not -name "canonical-types.ts" -exec cp {} "$BACKUP_DIR/" \;
echo "✅ Type files backed up to $BACKUP_DIR"
echo ""

# Create git tag if in a git repository
echo "2️⃣ Creating git tag..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git tag -a pre-ssot-$(date +%Y%m%d) -m "Backup before removing type files for SSOT migration"
  echo "✅ Git tag 'pre-ssot-$(date +%Y%m%d)' created"
else
  echo "⚠️ Not in a git repository, skipping tag creation"
fi
echo ""

# Remove type files
echo "3️⃣ Removing duplicate type files..."
find ./types -name "*.types.ts" -not -name "canonical-types.ts" -exec rm {} \;
echo "✅ Duplicate type files removed"
echo ""

echo "🎉 TYPE FILE CLEANUP COMPLETE"
echo ""
echo "Next steps:"
echo "1. Run the constitutional validator again"
echo "2. Fix any remaining issues manually"
echo "3. Compile the project to verify type safety"
echo ""
echo "To restore the type files if needed:"
echo "1. Files are backed up in $BACKUP_DIR"
echo "2. Git tag 'pre-ssot-$(date +%Y%m%d)' can be used to restore files from git"