#!/usr/bin/env node

/**
 * Fix Import Syntax Manually Script
 * 
 * This script completely rewrites the import sections of problematic files
 * to fix syntax issues.
 */

import fs from 'fs';

const filesToFix = [
  '/Users/cameroncatri/Desktop/layers/scripts/domains/configuration/configuration-auto-fixer.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/configuration/configuration-comparator.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/configuration/configuration-health-assessor.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/migration-engine/migration-domain.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/migration-engine/migration-orchestrator.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/migration-engine/migration-utilities.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/migration-engine/project-reorganizer.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/pattern-detection/external-scanner.cli.ts',
  '/Users/cameroncatri/Desktop/layers/scripts/domains/pattern-detection/patterns3.ts'
];

async function main() {
  try {
    console.log('Fixing import syntax in problematic files...');
    
    for (const file of filesToFix) {
      fixFileSyntax(file);
    }
    
    console.log('Finished fixing import syntax issues.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function fixFileSyntax(filePath) {
  console.log(`Fixing import syntax in ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Handle each file specifically based on the known issues
    if (filePath.includes('configuration-auto-fixer.ts')) {
      const fixedContent = fixConfigAutoFixer(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('configuration-comparator.ts')) {
      const fixedContent = fixConfigComparator(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('configuration-health-assessor.ts')) {
      const fixedContent = fixConfigHealthAssessor(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('migration-domain.ts')) {
      const fixedContent = fixMigrationDomain(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('migration-orchestrator.ts')) {
      const fixedContent = fixMigrationOrchestrator(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('migration-utilities.ts')) {
      const fixedContent = fixMigrationUtilities(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('project-reorganizer.ts')) {
      const fixedContent = fixProjectReorganizer(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('external-scanner.cli.ts')) {
      const fixedContent = fixExternalScannerCli(content);
      fs.writeFileSync(filePath, fixedContent);
    } else if (filePath.includes('patterns3.ts')) {
      const fixedContent = fixPatterns3(content);
      fs.writeFileSync(filePath, fixedContent);
    }
    
    console.log(`  Fixed import syntax in ${filePath}`);
  } catch (error) {
    console.error(`  Error fixing file ${filePath}: ${error.message}`);
  }
}

function fixConfigAutoFixer(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'ApiResponse',
    'Framework',
    'MigrationConfiguration',
    'createApiResponse',
    'createApiError'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixConfigComparator(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'ApiResponse',
    'Framework',
    'MigrationConfiguration',
    'createApiResponse'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixConfigHealthAssessor(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'RiskLevel',
    'ApiResponse',
    'Framework',
    'MigrationConfiguration',
    'createApiResponse'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixMigrationDomain(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'RiskLevel',
    'FilePath',
    'ApiResponse',
    'createApiError',
    'createApiSuccess',
    'createEntityId',
    'createFilePath',
    'createTimestamp',
    'Framework',
    'ValidationLevel',
    'EntityId',
    'Timestamp'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixMigrationOrchestrator(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'RiskLevel',
    'FilePath',
    'Result',
    'ApiResponse',
    'ApiError',
    'createApiError',
    'createEntityId',
    'createTimestamp',
    'TransformationStatus',
    'ValidationLevel',
    'EntityId',
    'OperationId',
    'Timestamp'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixMigrationUtilities(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'RiskLevel',
    'FilePath',
    'ApiResponse',
    'createApiError',
    'createApiSuccess',
    'createEntityId',
    'createFilePath',
    'createTimestamp',
    'TransformationStrategy',
    'Framework',
    'ConfidenceScore',
    'EntityId',
    'Timestamp'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixProjectReorganizer(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'RiskLevel',
    'FilePath',
    'DirectoryPath',
    'Result',
    'ApiResponse',
    'ApiError',
    'BusinessDomain',
    'createApiError',
    'createEntityId',
    'createTimestamp',
    'TransformationStatus',
    'ValidationLevel',
    'EntityId',
    'OperationId',
    'Timestamp'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

function fixExternalScannerCli(content) {
  // This file might have a shebang at the top
  const lines = content.split('\n');
  const newLines = [];
  let skipNext = false;
  
  // Keep the shebang if it exists, then add our imports
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 && lines[i].startsWith('#!')) {
      newLines.push(lines[i]);
      continue;
    }
    
    if (lines[i].includes('import {') && lines[i].includes('canonical-types')) {
      // Skip all import lines
      skipNext = true;
      continue;
    }
    
    if (skipNext) {
      if (lines[i].includes('}') && lines[i].includes('from') && lines[i].includes('canonical-types')) {
        skipNext = false;
        continue;
      }
      continue;
    }
    
    newLines.push(lines[i]);
  }
  
  // Find the types needed
  const types = [
    'DirectoryPath',
    'createApiError',
    'Framework'
  ];
  
  // Add our import after any shebang
  if (newLines[0].startsWith('#!')) {
    newLines.splice(1, 0, '', `import { ${types.join(', ')} } from '../types/canonical-types';`);
  } else {
    newLines.unshift(`import { ${types.join(', ')} } from '../types/canonical-types';`);
  }
  
  return newLines.join('\n');
}

function fixPatterns3(content) {
  // Find the comment block at the beginning of the file
  const commentEndIndex = content.indexOf('*/') + 2;
  const fileStart = content.substring(0, commentEndIndex);
  
  // Find where to insert the new import
  const importIndex = content.indexOf('// ============================================================================', commentEndIndex);
  
  // Find the types needed
  const types = [
    'ConfidenceScore',
    'Violation'
  ];
  
  // Create the new content
  return fileStart + '\n\n' +
    `import { ${types.join(', ')} } from '../types/canonical-types';\n\n` +
    content.substring(importIndex);
}

main();