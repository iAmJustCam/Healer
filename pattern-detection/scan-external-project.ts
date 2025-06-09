#!/usr/bin/env tsx
// ====================================================================
// EXTERNAL PROJECT SCANNER CLI - Replaces scan-external-project.ts
// File: scripts/migrate/scan-external-project.ts
// ====================================================================

import { CLIOrchestrator } from '@cli/orchestrators/cli-orchestrator';

/**
 * SOLID-compliant external project scanner
 * SRP: CLI entry point only - delegates to orchestrator
 *
 * Usage:
 * tsx scripts/migrate/scan-external-project.ts --project=/path/to/project [options]
 */

async function main(): Promise<void> {
  const orchestrator = new CLIOrchestrator();
  const options = orchestrator.parseArguments(process.argv.slice(2));

  // Validate required project argument
  if (!options.projectPath) {
    console.error('❌ Missing required argument: --project=<path>');
    console.error(
      'Usage: tsx scripts/migrate/scan-external-project.ts --project=/path/to/project [options]',
    );
    process.exit(1);
  }

  // Set defaults for external project scanning
  const scanOptions = {
    ...options,
    includePatterns: options.includePatterns?.length
      ? options.includePatterns
      : [
          'src/**/*.{ts,tsx}',
          'app/**/*.{ts,tsx}',
          'components/**/*.{ts,tsx}',
          'pages/**/*.{ts,tsx}',
          'lib/**/*.{ts,tsx}',
        ],
    excludePatterns: options.excludePatterns?.length
      ? options.excludePatterns
      : ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**'],
    format: options.format || 'html',
    backup: true, // Always create backup for external projects
  };

  await orchestrator.execute(scanOptions);
}

// Error handling
main().catch((error) => {
  console.error(`❌ Scanner failed: ${error}`);
  process.exit(1);
});
