#!/bin/bash

# Final comprehensive script to fix all comment formatting issues

SCRIPT_DIR="/Users/cameroncatri/Desktop/layers/scripts/domains"
echo "Starting final comment format cleanup..."

# 1. Fix section headers with single slashes
echo "1. Fixing section headers with single slashes..."
find "$SCRIPT_DIR" -type f -name "*.ts" -exec sed -i '' -E 's/^\/(\s*=+)/\/\/\1/g' {} \;

# 2. Fix section titles with single slashes
echo "2. Fixing section titles with single slashes..."
find "$SCRIPT_DIR" -type f -name "*.ts" -exec sed -i '' -E 's/^\/(\s+[A-Z][A-Z0-9 _-]+)/\/\/\1/g' {} \;

# 3. Fix section headers missing slashes on title line
echo "3. Fixing section headers missing slashes on title line..."
find "$SCRIPT_DIR" -type f -name "*.ts" -exec sed -i '' -E 's/(\/\/\s*=+)\s*\n([A-Z][A-Z0-9 _-]+)\s*\n(\/\/\s*=+)/\1\n\/\/ \2\n\3/g' {} \;

# 4. Fix single-slash comments in objects
echo "4. Fixing single-slash comments in objects..."
find "$SCRIPT_DIR" -type f -name "*.ts" -exec sed -i '' -E 's/(\s+)\/(\s+[A-Za-z])/\1\/\/\2/g' {} \;

# 5. Fix section dividers with equals but no slashes
echo "5. Fixing section dividers with equals but no slashes..."
find "$SCRIPT_DIR" -type f -name "*.ts" -exec sed -i '' -E 's/^(=+)$/\/\/ \1/g' {} \;

# 6. Fix uppercase section headers without slashes
echo "6. Fixing uppercase section headers without slashes..."
find "$SCRIPT_DIR" -type f -name "*.ts" -exec sed -i '' -E 's/^([A-Z][A-Z0-9 _-]{5,})$/\/\/ \1/g' {} \;

echo "All comment format issues fixed! Running TypeScript compiler to verify..."

# Run TypeScript compiler to verify
cd "$SCRIPT_DIR"
tsc -p tsconfig.json --noEmit

if [ $? -eq 0 ]; then
  echo "✅ Success! All TypeScript files compile without errors."
else
  echo "⚠️ Some TypeScript errors remain. Please check the output above."
fi