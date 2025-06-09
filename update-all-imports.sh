#!/bin/bash
# update-all-imports.sh
# Updates all imports to use @types alias

# Find all TypeScript files
FILES=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./.git/*")

# Loop through files and fix import patterns
for FILE in $FILES; do
  # Skip files in types/ directory
  if [[ $FILE == "./types/"* ]]; then
    continue
  fi
  
  # Fix import patterns - replace type imports with @types
  perl -i -pe 's/import\s+(\{[^}]+\})\s+from\s+['"'"'"](.*?)\.types?['"'"'"]/import $1 from '"'"'@types'"'"'/g' "$FILE" || true
  perl -i -pe 's/import\s+type\s+(\{[^}]+\})\s+from\s+['"'"'"](.*?)\.types?['"'"'"]/import type $1 from '"'"'@types'"'"'/g' "$FILE" || true
  perl -i -pe 's/import\s+(\{[^}]+\})\s+from\s+['"'"'"]@\/types\/[^'"'"'"]+['"'"'"]/import $1 from '"'"'@types'"'"'/g' "$FILE" || true
  perl -i -pe 's/import\s+type\s+(\{[^}]+\})\s+from\s+['"'"'"]@\/types\/[^'"'"'"]+['"'"'"]/import type $1 from '"'"'@types'"'"'/g' "$FILE" || true
done

echo "✅ All imports updated to use @types alias"
