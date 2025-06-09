#!/usr/bin/env node

/**
 * Fix Missing Imports Script
 * 
 * This script analyzes TypeScript files and adds missing imports from canonical-types.ts
 * for common types like RiskLevel, Severity, FilePath, etc.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Common types from canonical-types.ts that are often missing
const commonTypes = [
  'RiskLevel',
  'Severity',
  'FilePath',
  'DirectoryPath',
  'Result',
  'ApiResponse',
  'ApiError',
  'BusinessDomain',
  'ValidationError',
  'createApiError',
  'createApiSuccess',
  'createEntityId',
  'createFilePath',
  'createTimestamp',
  'TransformationStrategy',
  'TransformationStatus',
  'Framework',
  'ConfidenceScore',
  'ValidationLevel',
  'ComplexityLevel',
  'ErrorCategory',
  'EntityId',
  'OperationId',
  'Timestamp',
];

// Special types that might need special handling (type vs interface)
const specialTypes = {
  'ComplianceReport': { kind: 'interface' },
  'ConstitutionComplianceResult': { kind: 'interface' },
  'Violation': { kind: 'interface' },
  'AutoFixPlan': { kind: 'interface' },
};

// Main function to process a file
async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}`);
    
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Analyze the file for missing types
    const missingTypes = findMissingTypes(content, filePath);
    
    if (missingTypes.length === 0) {
      console.log(`  No missing types found in ${filePath}`);
      return;
    }
    
    console.log(`  Found missing types: ${missingTypes.join(', ')}`);
    
    // Add the imports
    const updatedContent = addImports(content, missingTypes);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent);
    console.log(`  Updated imports in ${filePath}`);
    
    return missingTypes;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return [];
  }
}

// Find missing types in a file
function findMissingTypes(content, filePath) {
  const missingTypes = [];
  
  // Check each common type
  for (const type of commonTypes) {
    // Skip if the type is already imported
    if (content.includes(`import { ${type}`) || content.includes(`import {${type}`) || 
        content.includes(`import type { ${type}`) || content.includes(`import type {${type}`)) {
      continue;
    }
    
    // Check if the type is used in the file
    const regex = new RegExp(`\\b${type}\\b`, 'g');
    if (regex.test(content)) {
      missingTypes.push(type);
    }
  }
  
  // Check for RiskLevel used as a namespace (RiskLevel.HIGH)
  if (content.includes('RiskLevel.') && !missingTypes.includes('RiskLevel')) {
    missingTypes.push('RiskLevel');
  }
  
  // Check special types
  for (const [type, info] of Object.entries(specialTypes)) {
    if (!content.includes(`import { ${type}`) && !content.includes(`import type { ${type}`) && 
        content.includes(type)) {
      missingTypes.push(type);
    }
  }
  
  return missingTypes;
}

// Add missing imports to the file
function addImports(content, missingTypes) {
  if (missingTypes.length === 0) return content;
  
  // Check if there's already an import from canonical-types
  const hasCanonicalImport = /import\s+[\{\s\w,]+\s+from\s+['"](\.\.\/)*types\/canonical-types['"];/.test(content);
  const hasTypeCanonicalImport = /import\s+type\s+[\{\s\w,]+\s+from\s+['"](\.\.\/)*types\/canonical-types['"];/.test(content);
  
  // If there's already an import, update it
  if (hasCanonicalImport) {
    return updateExistingImport(content, missingTypes);
  }
  
  // If there's a type-only import, convert it and add the missing types
  if (hasTypeCanonicalImport) {
    return updateTypeOnlyImport(content, missingTypes);
  }
  
  // Otherwise, add a new import statement
  return addNewImport(content, missingTypes);
}

// Update an existing import statement
function updateExistingImport(content, missingTypes) {
  const importRegex = /(import\s+[\{\s\w,]+)\s+from\s+(['"](\.\.\/)*types\/canonical-types['"];)/;
  
  return content.replace(importRegex, (match, importPart, fromPart) => {
    // Extract existing imports
    const importMatch = importPart.match(/import\s+\{([^}]*)\}/);
    let existingImports = importMatch ? importMatch[1].split(',').map(i => i.trim()).filter(i => i) : [];
    
    // Add missing types
    for (const type of missingTypes) {
      if (!existingImports.includes(type)) {
        existingImports.push(type);
      }
    }
    
    // Create updated import statement
    return `import { ${existingImports.join(', ')} } from ${fromPart}`;
  });
}

// Update a type-only import statement, converting it to a regular import
function updateTypeOnlyImport(content, missingTypes) {
  const importRegex = /(import\s+type\s+[\{\s\w,]+)\s+from\s+(['"](\.\.\/)*types\/canonical-types['"];)/;
  
  return content.replace(importRegex, (match, importPart, fromPart) => {
    // Extract existing imports
    const importMatch = importPart.match(/import\s+type\s+\{([^}]*)\}/);
    let existingImports = importMatch ? importMatch[1].split(',').map(i => i.trim()).filter(i => i) : [];
    
    // Add missing types
    for (const type of missingTypes) {
      if (!existingImports.includes(type)) {
        existingImports.push(type);
      }
    }
    
    // Create updated import statement, converting to regular import
    return `import { ${existingImports.join(', ')} } from ${fromPart}`;
  });
}

// Add a new import statement
function addNewImport(content, missingTypes) {
  // Calculate the relative path to canonical-types
  let relativePath = '../types/canonical-types';
  
  // Create the import statement
  const importStatement = `import { ${missingTypes.join(', ')} } from '${relativePath}';\n`;
  
  // Add after any existing imports, or at the top of the file
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import\s+/)) {
      insertIndex = i + 1;
    } else if (lines[i].match(/^\/\//)) {
      // Skip comment lines
      continue;
    } else if (lines[i].match(/^\/\*/)) {
      // Skip block comments
      while (i < lines.length && !lines[i].includes('*/')) {
        i++;
      }
    } else if (lines[i].trim() !== '') {
      // Stop at the first non-import, non-comment, non-empty line
      break;
    }
  }
  
  // Insert the import statement
  lines.splice(insertIndex, 0, importStatement);
  return lines.join('\n');
}

// Process a file identified with TypeScript errors
async function processFileWithErrors(filePath, errorType) {
  console.log(`Processing file with ${errorType} errors: ${filePath}`);
  return await processFile(filePath);
}

// Main function
async function main() {
  try {
    const args = process.argv.slice(2);
    
    // If specific files are provided
    if (args.length > 0) {
      for (const filePath of args) {
        await processFile(filePath);
      }
      return;
    }
    
    // Otherwise, find files with TypeScript errors
    console.log('Finding files with TypeScript errors...');
    
    // Run TypeScript to get error output
    const output = execSync('npx tsc --noEmit --pretty false 2>&1 | grep -E "TS2304|Cannot find name"', { encoding: 'utf8' });
    
    // Parse the output to get the files with errors
    const fileErrors = {};
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^(]+)\(\d+,\d+\): error (TS\d+): Cannot find name '([^']+)'/);
      if (match) {
        const [_, filePath, errorType, typeName] = match;
        if (!fileErrors[filePath]) {
          fileErrors[filePath] = { errorType, missingTypes: [] };
        }
        
        if (!fileErrors[filePath].missingTypes.includes(typeName)) {
          fileErrors[filePath].missingTypes.push(typeName);
        }
      }
    }
    
    // Process each file with errors
    for (const [filePath, { errorType }] of Object.entries(fileErrors)) {
      await processFileWithErrors(filePath, errorType);
    }
    
    console.log('Completed processing files with TypeScript errors.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();