#!/bin/bash

# A simple script to fix missing imports in a specific file

file="migration-engine/migration-domain.ts"

# Check if the file exists
if [ ! -f "$file" ]; then
    echo "File not found: $file"
    exit 1
fi

# Create a backup
cp "$file" "${file}.bak"
echo "Created backup at ${file}.bak"

# Add the missing imports if not already present
if ! grep -q "createApiError" "$file"; then
    # Create a temp file
    temp_file="${file}.temp"
    
    # Find if there are any imports from canonical-types
    if grep -q "from '../types/canonical-types'" "$file"; then
        # Update existing import
        import_line=$(grep -E "import \{.*\} from '../types/canonical-types'" "$file" | head -1)
        
        # Ensure import_line doesn't already have createApiError
        if ! echo "$import_line" | grep -q "createApiError"; then
            # Create new import line with createApiError added
            new_import_line=$(echo "$import_line" | sed 's/import {/import { createApiError,/g')
            
            # Replace the line in the file
            cat "$file" | sed "s|$import_line|$new_import_line|" > "$temp_file"
            mv "$temp_file" "$file"
            echo "Updated import with createApiError"
        else
            echo "createApiError already in imports"
        fi
    else
        # Add a new import at the top
        echo "import { createApiError } from '../types/canonical-types';" > "$temp_file"
        cat "$file" >> "$temp_file"
        mv "$temp_file" "$file"
        echo "Added new import for createApiError"
    fi
else
    echo "createApiError already imported"
fi

echo "Fix completed"