#!/usr/bin/env node

/**
 * Fix Syntax Issues Script
 * 
 * This script fixes syntax issues in specific files that have
 * broken import statements.
 */

import fs from 'fs';

const filesToFix = [
  '/Users/cameroncatri/Desktop/layers/scripts/domains/configuration/configuration-auto-fixer.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/configuration/configuration-comparator.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/configuration/configuration-health-assessor.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/migration-engine/migration-domain.ts'
];

async function main() {
  try {
    console.log('Fixing syntax issues in specific files...');
    
    for (const file of filesToFix) {
      fixSyntaxIssues(file);
    }
    
    console.log('Finished fixing syntax issues.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function fixSyntaxIssues(filePath) {
  console.log(`Fixing syntax issues in ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find problematic import sections
    let startLine = -1;
    let endLine = -1;
    
    // Find the start and end of the broken import section
    for (let i = 0; i < lines.length; i++) {
      // Look for import statements at the beginning of the file
      if (lines[i].includes('import {') && lines[i].includes('from') && 
          lines[i].includes('canonical-types')) {
        startLine = i;
      }
      
      // Look for the closing } if we've found a start
      if (startLine >= 0 && i > startLine && lines[i].includes('}') && 
          lines[i].includes('from') && lines[i].includes('canonical-types')) {
        endLine = i;
        break;
      }
    }
    
    if (startLine >= 0 && endLine >= 0) {
      // Extract all imported types
      const importedTypes = new Set();
      
      // Process the entire section to extract type names
      for (let i = startLine; i <= endLine; i++) {
        const line = lines[i];
        
        if (line.includes('import {')) {
          // Extract types from the import line
          const matches = line.match(/import\s+\{([^}]*)/);
          if (matches && matches[1]) {
            const types = matches[1].split(',').map(t => t.trim()).filter(t => t);
            types.forEach(type => importedTypes.add(type));
          }
        } else if (!line.includes('}') && !line.includes('from')) {
          // Extract types from the middle lines
          const types = line.split(',').map(t => t.trim()).filter(t => t);
          types.forEach(type => importedTypes.add(type));
        } else if (line.includes('}')) {
          // Extract types from the closing line
          const matches = line.match(/([^{]*)}\s+from/);
          if (matches && matches[1]) {
            const types = matches[1].split(',').map(t => t.trim()).filter(t => t);
            types.forEach(type => importedTypes.add(type));
          }
        }
      }
      
      // Create a new import statement with all unique types
      const newImportStatement = `import { ${Array.from(importedTypes).join(', ')} } from '../types/canonical-types';`;
      
      // Replace the problematic section with the new import
      const newLines = [
        ...lines.slice(0, startLine),
        newImportStatement,
        ...lines.slice(endLine + 1)
      ];
      
      // Write the fixed content back to the file
      fs.writeFileSync(filePath, newLines.join('\n'));
      console.log(`  Fixed import syntax in ${filePath}`);
    } else {
      console.log(`  No problematic import section found in ${filePath}`);
    }
  } catch (error) {
    console.error(`  Error fixing file ${filePath}: ${error.message}`);
  }
}

main();