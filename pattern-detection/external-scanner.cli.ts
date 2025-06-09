#!/usr/bin/env tsx
/**
 * External Project Scanner CLI
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions (R-01)
 * ✓ Canonical imports only (R-02)
 * ✓ Validated I/O with schemas (R-03)
 * ✓ Factory response pattern (R-04)
 * ✓ Environment-agnostic core logic (R-05)
 *
 * Single Responsibility: CLI interface for scanning external projects
 */

import { DirectoryPath, createApiError, Framework } from '../types/canonical-types';
import { ScanOptions, ScanResult } from '';
import { PatternScanner } from './pattern-scanning.utilities';

// ============================================================================
// CLI IMPLEMENTATION
// ============================================================================

/**
 * Command-line tool for scanning external projects
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const targetDirectory = args[0];
    
    if (!targetDirectory) {
      console.error('Error: Target directory is required');
      printUsage();
      process.exit(1);
    }
    
    console.log(`Scanning external project at: ${targetDirectory}`);
    
    const options: ScanOptions = {
      includePatterns: ['**/*.{ts,tsx,js,jsx}'],
      excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      maxDepth: 5,
      includeDependencies: false,
      frameworks: [Framework.REACT19, Framework.NEXTJS15, Framework.TYPESCRIPT5],
    };
    
    // Override defaults with command line options
    parseCommandLineOptions(args.slice(1), options);
    
    // Run the scanner
    const scanner = new PatternScanner();
    const result = await scanner.scanExternalProject(targetDirectory, options);
    
    if (result.success) {
      printScanResults(result.data);
      process.exit(0);
    } else {
      console.error(`Error scanning project: ${result.error.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

/**
 * Print usage instructions
 */
function printUsage() {
  console.log(`
Usage: npx tsx external-scanner.cli.ts <directory> [options]

Options:
  --include=<pattern>     File pattern to include (can be used multiple times)
  --exclude=<pattern>     File pattern to exclude (can be used multiple times)
  --max-depth=<number>    Maximum directory depth to scan (default: 5)
  --include-deps          Include dependencies in scan (default: false)
  --framework=<name>      Framework to scan for (can be used multiple times)
                         Available: react, nextjs, typescript, tailwind

Example:
  npx tsx external-scanner.cli.ts /path/to/project --include="src/**/*.ts" --exclude="**/*.test.ts" --framework=typescript
`);
}

/**
 * Parse command line options
 */
function parseCommandLineOptions(args: string[], options: ScanOptions) {
  for (const arg of args) {
    if (arg.startsWith('--include=')) {
      const pattern = arg.substring('--include='.length);
      options.includePatterns.push(pattern);
    } else if (arg.startsWith('--exclude=')) {
      const pattern = arg.substring('--exclude='.length);
      options.excludePatterns.push(pattern);
    } else if (arg.startsWith('--max-depth=')) {
      const depth = parseInt(arg.substring('--max-depth='.length), 10);
      if (!isNaN(depth)) {
        options.maxDepth = depth;
      }
    } else if (arg === '--include-deps') {
      options.includeDependencies = true;
    } else if (arg.startsWith('--framework=')) {
      const framework = arg.substring('--framework='.length).toLowerCase();
      switch (framework) {
        case 'react':
          options.frameworks.push(Framework.REACT19);
          break;
        case 'nextjs':
          options.frameworks.push(Framework.NEXTJS15);
          break;
        case 'typescript':
          options.frameworks.push(Framework.TYPESCRIPT5);
          break;
        case 'tailwind':
          options.frameworks.push(Framework.TAILWIND4);
          break;
      }
    }
  }
}

/**
 * Print scan results
 */
function printScanResults(result: ScanResult) {
  console.log('\n=== Scan Results ===');
  console.log(`Total files scanned: ${result.totalFiles}`);
  console.log(`Patterns detected: ${result.totalPatterns}`);
  
  console.log('\nFramework Detection:');
  for (const [framework, confidence] of Object.entries(result.frameworkDetection)) {
    console.log(`  ${framework}: ${confidence}`);
  }
  
  console.log('\nPattern Categories:');
  for (const [category, count] of Object.entries(result.patternCategories)) {
    console.log(`  ${category}: ${count}`);
  }
  
  if (result.recommendations.length > 0) {
    console.log('\nRecommendations:');
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }
  
  console.log('\nScan completed successfully.');
}

// Run the CLI
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});