#!/bin/bash
# fix-canonical-imports.sh
# Fixes violations of canonical import patterns

set -e

echo "🛡️ FIXING CANONICAL IMPORT VIOLATIONS"
echo ""

# Process a specific domain
process_domain() {
  local DOMAIN=$1
  echo "🔍 Processing $DOMAIN domain..."
  
  # Find domain-specific files
  FILES=$(find /Users/cameroncatri/Desktop/layers -path "*domains/$DOMAIN*" -name "*.ts")
  
  # Create backup directory
  BACKUP_DIR="./canonical-import-fix-backup-$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  
  # Loop through files and fix import patterns
  for FILE in $FILES; do
    # Backup file
    cp "$FILE" "$BACKUP_DIR/$(basename "$FILE")"
    
    # Fix import patterns - replace type imports with @types
    perl -i -pe 's/import\s+(\{[^}]+\})\s+from\s+['"'"'"](.*?)\.types?['"'"'"]/import $1 from '"'"'@types'"'"'/g' "$FILE"
    perl -i -pe 's/import\s+type\s+(\{[^}]+\})\s+from\s+['"'"'"](.*?)\.types?['"'"'"]/import type $1 from '"'"'@types'"'"'/g' "$FILE"
    
    echo "✓ Updated $FILE"
  done
  
  echo "✅ Processed $DOMAIN domain"
  echo ""
}

# Ask which domain to process
if [ -z "$1" ]; then
  echo "Available domains:"
  echo "1. websocket"
  echo "2. chart"
  echo "3. form"
  echo "4. health"
  echo "5. foundation"
  echo "6. all"
  
  read -p "Enter domain number or name to process: " DOMAIN_INPUT
  
  case $DOMAIN_INPUT in
    1|websocket) DOMAIN="websocket" ;;
    2|chart) DOMAIN="chart" ;;
    3|form) DOMAIN="form" ;;
    4|health) DOMAIN="health" ;;
    5|foundation) DOMAIN="foundation" ;;
    6|all) DOMAIN="all" ;;
    *) echo "Invalid domain selection"; exit 1 ;;
  esac
else
  DOMAIN=$1
fi

# Process selected domain(s)
if [ "$DOMAIN" = "all" ]; then
  process_domain "websocket"
  process_domain "chart"
  process_domain "form"
  process_domain "health"
  process_domain "foundation"
else
  process_domain "$DOMAIN"
fi

echo "🎉 IMPORT PATTERN FIXES COMPLETE"
echo ""
echo "Next steps:"
echo "1. Run validation on the fixed domains"
echo "2. Run the full constitutional validator"
echo "3. Fix any remaining issues manually"