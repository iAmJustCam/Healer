#\!/bin/bash

# Script to fix missing type imports in TypeScript files
# Adds imports for canonical types that are used but not imported

# Find files with type errors
find_error_files() {
  npx tsc --noEmit --pretty false 2>&1 | grep "TS2304" | cut -d ":" -f 1 | sort | uniq
}

# Add imports for specific files
add_imports() {
  local file="$1"
  local imports_added=false
  
  # Check file content
  local content=$(cat "$file")
  
  # Check which types are missing and add appropriate imports
  if grep -q "Cannot find name 'RiskLevel'\|Cannot find name 'TransformationStrategy'\|Cannot find name 'FilePath'\|Cannot find name 'ApiResponse'\|Cannot find name 'createApiError'\|Cannot find name 'createApiSuccess'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
    
    # Check if the file already has imports from canonical-types
    if grep -q "from ['\"].*canonical-types['\"]" "$file"; then
      # If it has imports but is missing some, update the existing import
      local old_import=$(grep -E "import \{.*\} from ['\"].*canonical-types['\"]" "$file" | head -1)
      
      if [ -n "$old_import" ]; then
        # Extract the import path
        local import_path=$(echo "$old_import" | sed -E "s/.*from (['\"].*canonical-types['\"])/\1/")
        
        # Collect all needed types
        local needed_types=""
        if grep -q "Cannot find name 'RiskLevel'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
          needed_types="${needed_types} RiskLevel,"
        fi
        if grep -q "Cannot find name 'TransformationStrategy'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
          needed_types="${needed_types} TransformationStrategy,"
        fi
        if grep -q "Cannot find name 'FilePath'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
          needed_types="${needed_types} FilePath,"
        fi
        if grep -q "Cannot find name 'ApiResponse'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
          needed_types="${needed_types} ApiResponse,"
        fi
        if grep -q "Cannot find name 'createApiError'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
          needed_types="${needed_types} createApiError,"
        fi
        if grep -q "Cannot find name 'createApiSuccess'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
          needed_types="${needed_types} createApiSuccess,"
        fi
        
        # Remove trailing comma
        needed_types=$(echo "$needed_types" | sed 's/,$//')
        
        # Extract existing types
        local existing_types=$(echo "$old_import" | sed -E "s/import \{(.*)\} from.*/\1/")
        
        # Combine without duplicates
        local combined_types="$existing_types,$needed_types"
        combined_types=$(echo "$combined_types" | tr ',' '\n' | sort | uniq | tr '\n' ',' | sed 's/,$//' | sed 's/^,//')
        
        # Create new import
        local new_import="import { $combined_types } from $import_path"
        
        # Replace the old import with the new one
        sed -i.bak "s/$old_import/$new_import/" "$file"
        rm "${file}.bak"
        
        echo "Updated import in $file"
        imports_added=true
      fi
    else
      # File doesn't have canonical imports, add a new import line
      local import_line="import { "
      
      if grep -q "Cannot find name 'RiskLevel'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
        import_line="${import_line}RiskLevel, "
      fi
      if grep -q "Cannot find name 'TransformationStrategy'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
        import_line="${import_line}TransformationStrategy, "
      fi
      if grep -q "Cannot find name 'FilePath'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
        import_line="${import_line}FilePath, "
      fi
      if grep -q "Cannot find name 'ApiResponse'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
        import_line="${import_line}ApiResponse, "
      fi
      if grep -q "Cannot find name 'createApiError'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
        import_line="${import_line}createApiError, "
      fi
      if grep -q "Cannot find name 'createApiSuccess'" <(npx tsc --noEmit --pretty false 2>&1 | grep "$file"); then
        import_line="${import_line}createApiSuccess, "
      fi
      
      # Remove trailing comma and space
      import_line=$(echo "$import_line" | sed 's/, $//')
      
      # Complete the import line
      import_line="${import_line} } from '../types/canonical-types';"
      
      # Add the import after any existing imports or at the top of the file
      if grep -q "^import " "$file"; then
        # Find the last import line
        local last_import_line=$(grep -n "^import " "$file" | tail -1 | cut -d ":" -f 1)
        sed -i.bak "${last_import_line}a\\
${import_line}" "$file"
        rm "${file}.bak"
      else
        # Add at the top
        sed -i.bak "1i\\
${import_line}\\
" "$file"
        rm "${file}.bak"
      fi
      
      echo "Added new import to $file"
      imports_added=true
    fi
  fi
  
  # Return status
  $imports_added
}

# Main function to run the script
main() {
  echo "Finding files with type errors..."
  error_files=$(find_error_files)
  
  echo "Found $(echo "$error_files" | wc -l | xargs) files with type errors"
  
  local fixed_files=0
  local total_files=0
  
  # Process each file
  for file in $error_files; do
    if [ -f "$file" ]; then
      ((total_files++))
      echo "Processing $file..."
      if add_imports "$file"; then
        ((fixed_files++))
      fi
    fi
  done
  
  echo "Fixed imports in $fixed_files out of $total_files files"
  echo "Run TypeScript checker again to see remaining errors"
}

# Run the script
main
