#!/usr/bin/env node

/**
 * Fix Duplicate Imports Script
 * 
 * This script fixes duplicate imports from canonical-types.ts that
 * might have been introduced by the fix-missing-imports.js script.
 */

import fs from 'fs';
import { execSync } from 'child_process';

async function main() {
  try {
    const files = findFilesWithDuplicateImports();
    
    if (files.length === 0) {
      console.log('No files with duplicate imports found.');
      return;
    }
    
    console.log(`Found ${files.length} files with duplicate imports. Fixing...`);
    
    for (const file of files) {
      fixDuplicateImports(file);
    }
    
    console.log('Finished fixing duplicate imports.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function findFilesWithDuplicateImports() {
  const output = execSync('find /Users/cameroncatri/Desktop/layers/scripts/domains -name "*.ts" -exec grep -l "import {.*} from \'\\.\\.\/types\/canonical-types\'" {} \\;', { encoding: 'utf8' });
  
  const files = output.split('\n').filter(f => f.trim());
  
  // Filter files that have duplicate imports
  const filesWithDuplicates = files.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const importMatches = content.match(/import\s+\{[^}]*\}\s+from\s+['"]\.\.\/types\/canonical-types['"]/g);
      return importMatches && importMatches.length > 1;
    } catch (error) {
      console.error(`Error checking file ${file}: ${error.message}`);
      return false;
    }
  });
  
  return filesWithDuplicates;
}

function fixDuplicateImports(filePath) {
  console.log(`Fixing duplicate imports in ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all import statements from canonical-types
    const importMatches = content.match(/import\s+\{[^}]*\}\s+from\s+['"]\.\.\/types\/canonical-types['"]/g) || [];
    
    if (importMatches.length <= 1) {
      console.log(`  No duplicate imports found in ${filePath}`);
      return;
    }
    
    // Extract all imported types
    const importedTypes = new Set();
    
    for (const importStatement of importMatches) {
      const typesMatch = importStatement.match(/import\s+\{([^}]*)\}\s+from/);
      if (typesMatch && typesMatch[1]) {
        const types = typesMatch[1].split(',').map(t => t.trim()).filter(t => t);
        types.forEach(type => importedTypes.add(type));
      }
    }
    
    // Create a new import statement with all unique types
    const newImportStatement = `import { ${Array.from(importedTypes).join(', ')} } from '../types/canonical-types';`;
    
    // Replace the first import statement with our new one and remove the others
    let replaced = false;
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/import\s+\{[^}]*\}\s+from\s+['"]\.\.\/types\/canonical-types['"]/)) {
        if (!replaced) {
          newLines.push(newImportStatement);
          replaced = true;
        }
        // Skip this line (don't add it to newLines) to remove the duplicate import
      } else {
        newLines.push(lines[i]);
      }
    }
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`  Fixed ${importMatches.length} duplicate imports in ${filePath}`);
  } catch (error) {
    console.error(`  Error fixing file ${filePath}: ${error.message}`);
  }
}

main();