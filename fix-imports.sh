#\!/bin/bash

# Find TypeScript files that need canonical import fixes
FILES=$(find . -name "*.ts" | xargs grep -l "from '../types/")
COUNT=$(echo "$FILES" | wc -l)

echo "Found $COUNT files with imports to fix"

# Show the first few files
echo "First 5 files to update:"
echo "$FILES" | head -5

# Ask for confirmation
read -p "Update all $COUNT files? (y/n) " answer
if [[ $answer != "y" && $answer != "Y" ]]; then
    echo "Operation cancelled"
    exit 0
fi

# Process files
for file in $FILES; do
    echo "Processing $file..."
    sed -i "" "s|from '../types/[^'\"]*'|from '../types/canonical-types'|g" "$file"
done

echo "All files updated successfully"
