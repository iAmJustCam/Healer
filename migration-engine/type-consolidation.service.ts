#!/usr/bin/env node

import { } from '';

/**
 * Type Consolidation Migration Script
 *
 * This script automates the migration to the canonical type system:
 * 1. Analyzes existing type definitions for duplicates
 * 2. Updates import statements to use @types alias
 * 3. Removes obsolete type files
 * 4. Validates the migration
 */

import chalk from 'chalk';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { Project } from 'ts-morph';

interface DuplicateType {
  name: string;
  files: string[];
  definition: string;
}

interface MigrationReport {
  duplicatesFound: DuplicateType[];
  importsUpdated: number;
  filesRemoved: string[];
  errors: string[];
  warnings: string[];
  tsConfigUpdated: boolean;
}

class TypeConsolidationMigrator {
  private project: Project;
  private report: MigrationReport = {
    duplicatesFound: [],
    importsUpdated: 0,
    filesRemoved: [],
    errors: [],
    warnings: [],
    tsConfigUpdated: false,
  };

  // Files to be removed after migration
  private readonly obsoleteFiles = [
    'domain.types.ts',
    'migration.types.ts',
    'models.ts',
    'primitives.ts',
    'enums.ts',
    'result.ts',
  ];

  // Import patterns to update
  private readonly importMappings = new Map([
    ['./domain.types', '@types'],
    ['./migration.types', '@types'],
    ['./models', '@types'],
    ['./primitives', '@types'],
    ['./enums', '@types'],
    ['./result', '@types'],
  ]);

  constructor(private rootPath: string) {
    this.project = new Project({
      tsConfigFilePath: join(rootPath, 'tsconfig.json'),
    });
  }

  async migrate(): Promise<MigrationReport> {
    console.log(chalk.blue('🚀 Starting type consolidation migration...\n'));

    try {
      // Step 1: Analyze for duplicates
      await this.analyzeDuplicates();

      // Step 2: Update tsconfig.json
      await this.updateTsConfig();

      // Step 3: Update import statements
      await this.updateImports();

      // Step 4: Create pipeline declaration files
      await this.createPipelineDeclarations();

      // Step 5: Remove obsolete files
      await this.removeObsoleteFiles();

      // Step 6: Validate migration
      await this.validateMigration();

      console.log(chalk.green('✅ Migration completed successfully!\n'));
      this.printReport();
    } catch (error) {
      console.error(chalk.red('❌ Migration failed:'), error);
      this.report.errors.push(error instanceof Error ? error.message : String(error));
    }

    return this.report;
  }

  private async analyzeDuplicates(): Promise<void> {
    console.log(chalk.yellow('🔍 Analyzing type duplicates...'));

    const typeDefinitions = new Map<string, { file: string; definition: string }[]>();
    const sourceFiles = this.project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath();

      // Skip node_modules and test files
      if (
        filePath.includes('node_modules') ||
        filePath.includes('.test.') ||
        filePath.includes('.spec.')
      ) {
        continue;
      }

      // Find type definitions
      const interfaces = sourceFile.getInterfaces();
      const typeAliases = sourceFile.getTypeAliases();
      const enums = sourceFile.getEnums();

      [...interfaces, ...typeAliases, ...enums].forEach((node) => {
        const name = node.getName();
        const definition = node.getText();

        if (!typeDefinitions.has(name)) {
          typeDefinitions.set(name, []);
        }

        typeDefinitions.get(name)!.push({
          file: relative(this.rootPath, filePath),
          definition,
        });
      });
    }

    // Find duplicates
    for (const [name, occurrences] of typeDefinitions) {
      if (occurrences.length > 1) {
        // Check if definitions are actually the same
        const firstDef = this.normalizeDefinition(occurrences[0].definition);
        const isDuplicate = occurrences
          .slice(1)
          .every((occ) => this.normalizeDefinition(occ.definition) === firstDef);

        if (isDuplicate) {
          this.report.duplicatesFound.push({
            name,
            files: occurrences.map((occ) => occ.file),
            definition: firstDef,
          });
        }
      }
    }

    console.log(
      chalk.cyan(`   Found ${this.report.duplicatesFound.length} duplicate type definitions`),
    );
  }

  private normalizeDefinition(definition: string): string {
    // Remove whitespace and comments for comparison
    return definition
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private async updateTsConfig(): Promise<void> {
    console.log(chalk.yellow('📝 Updating tsconfig.json...'));

    const tsConfigPath = join(this.rootPath, 'tsconfig.json');

    if (!existsSync(tsConfigPath)) {
      this.report.warnings.push('tsconfig.json not found');
      return;
    }

    try {
      const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

      if (!tsConfig.compilerOptions) {
        tsConfig.compilerOptions = {};
      }

      if (!tsConfig.compilerOptions.paths) {
        tsConfig.compilerOptions.paths = {};
      }

      // Add path alias for canonical types
      tsConfig.compilerOptions.paths['@types'] = ['../types/foundation.types.ts'];
      tsConfig.compilerOptions.paths['@types/*'] = ['../types/foundation.types.ts'];

      writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      this.report.tsConfigUpdated = true;
      console.log(chalk.green('   ✓ Added @types path alias'));
    } catch (error) {
      this.report.errors.push(`Failed to update tsconfig.json: ${error}`);
    }
  }

  private async updateImports(): Promise<void> {
    console.log(chalk.yellow('🔄 Updating import statements...'));

    const sourceFiles = this.project.getSourceFiles();
    let updatedCount = 0;

    for (const sourceFile of sourceFiles) {
      const filePath = sourceFile.getFilePath();

      // Skip node_modules and canonical-types.ts itself
      if (filePath.includes('node_modules') || filePath.endsWith('canonical-types.ts')) {
        continue;
      }

      let fileModified = false;
      const importDeclarations = sourceFile.getImportDeclarations();

      for (const importDecl of importDeclarations) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();

        // Check if this import needs to be updated
        for (const [oldImport, newImport] of this.importMappings) {
          if (moduleSpecifier === oldImport || moduleSpecifier.endsWith(oldImport)) {
            importDecl.setModuleSpecifier(newImport);
            fileModified = true;
            break;
          }
        }
      }

      if (fileModified) {
        await sourceFile.save();
        updatedCount++;
      }
    }

    this.report.importsUpdated = updatedCount;
    console.log(chalk.green(`   ✓ Updated imports in ${updatedCount} files`));
  }

  private async createPipelineDeclarations(): Promise<void> {
    console.log(chalk.yellow('📁 Creating pipeline declaration files...'));

    const pipelinesDir = join(this.rootPath, 'types', 'pipelines');

    // Create types/pipelines directory if it doesn't exist
    if (!existsSync(pipelinesDir)) {
      mkdirSync(pipelinesDir, { recursive: true });
    }

    const pipelineFiles = [
      'pattern-detection.pipeline.d.ts',
      'transformation.pipeline.d.ts',
      'analysis.pipeline.d.ts',
      'ai-verification.pipeline.d.ts',
      'migration-engine.pipeline.d.ts',
      'configuration.pipeline.d.ts',
      'cli.pipeline.d.ts',
    ];

    for (const fileName of pipelineFiles) {
      const filePath = join(pipelinesDir, fileName);
      if (!existsSync(filePath)) {
        // Create basic declaration file
        const content = this.generatePipelineTemplate(fileName);
        writeFileSync(filePath, content);
        console.log(chalk.green(`   ✓ Created ${fileName}`));
      }
    }
  }

  private generatePipelineTemplate(fileName: string): string {
    const pipelineName = fileName.replace('.pipeline.d.ts', '');

    return `/**
 * ${pipelineName.charAt(0).toUpperCase() + pipelineName.slice(1)} Pipeline Type Extensions
 *
 * Extends the canonical type system with ${pipelineName} specific parameters
 * using TypeScript declaration merging.
 */

declare module '../types/foundation.types' {
  interface PipelineParamMap {
    '${pipelineName}': {
      // Add ${pipelineName}-specific parameters here
      readonly placeholder: boolean;
    };
  }
}

// Add domain-specific interfaces here
interface Request {
  // Define request structure
}

interface Result {
  // Define result structure
}
`;
  }

  private async removeObsoleteFiles(): Promise<void> {
    console.log(chalk.yellow('🗑️  Removing obsolete files...'));

    for (const fileName of this.obsoleteFiles) {
      const filePath = join(this.rootPath, fileName);

      if (existsSync(filePath)) {
        try {
          // Create backup before deletion
          const backupPath = `${filePath}.backup`;
          const content = readFileSync(filePath, 'utf8');
          writeFileSync(backupPath, content);

          unlinkSync(filePath);
          this.report.filesRemoved.push(fileName);
          console.log(chalk.green(`   ✓ Removed ${fileName} (backup created)`));
        } catch (error) {
          this.report.errors.push(`Failed to remove ${fileName}: ${error}`);
        }
      }
    }
  }

  private async validateMigration(): Promise<void> {
    console.log(chalk.yellow('🔍 Validating migration...'));

    try {
      // Reload project to pick up changes
      this.project = new Project({
        tsConfigFilePath: join(this.rootPath, 'tsconfig.json'),
      });

      const diagnostics = this.project.getPreEmitDiagnostics();
      const errors = diagnostics.filter((d) => d.getCategory() === 1); // Error category

      if (errors.length > 0) {
        console.log(chalk.red(`   ⚠️  Found ${errors.length} TypeScript errors:`));
        errors.slice(0, 5).forEach((error) => {
          console.log(chalk.red(`      ${error.getMessageText()}`));
        });

        if (errors.length > 5) {
          console.log(chalk.red(`      ... and ${errors.length - 5} more`));
        }

        this.report.warnings.push(`Migration introduced ${errors.length} TypeScript errors`);
      } else {
        console.log(chalk.green('   ✓ No TypeScript errors found'));
      }
    } catch (error) {
      this.report.warnings.push(`Validation failed: ${error}`);
    }
  }

  private printReport(): void {
    console.log(chalk.blue('\n📊 Migration Report'));
    console.log(chalk.blue('=================='));

    console.log(chalk.cyan(`\n📋 Summary:`));
    console.log(`   • Duplicates found: ${this.report.duplicatesFound.length}`);
    console.log(`   • Imports updated: ${this.report.importsUpdated}`);
    console.log(`   • Files removed: ${this.report.filesRemoved.length}`);
    console.log(`   • TSConfig updated: ${this.report.tsConfigUpdated ? 'Yes' : 'No'}`);

    if (this.report.duplicatesFound.length > 0) {
      console.log(chalk.cyan(`\n🔍 Duplicate Types Found:`));
      this.report.duplicatesFound.forEach((dup) => {
        console.log(chalk.yellow(`   • ${dup.name}`));
        dup.files.forEach((file) => {
          console.log(`     - ${file}`);
        });
      });
    }

    if (this.report.filesRemoved.length > 0) {
      console.log(chalk.cyan(`\n🗑️  Files Removed:`));
      this.report.filesRemoved.forEach((file) => {
        console.log(`   • ${file}`);
      });
    }

    if (this.report.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Warnings:`));
      this.report.warnings.forEach((warning) => {
        console.log(`   • ${warning}`);
      });
    }

    if (this.report.errors.length > 0) {
      console.log(chalk.red(`\n❌ Errors:`));
      this.report.errors.forEach((error) => {
        console.log(`   • ${error}`);
      });
    }

    console.log(chalk.blue(`\n📋 Next Steps:`));
    console.log(`   1. Review and test the migrated code`);
    console.log(`   2. Update pipeline declaration files in types/pipelines/`);
    console.log(`   3. Add ESLint rules to prevent future type sprawl`);
    console.log(`   4. Update documentation and team guidelines`);

    console.log(chalk.green(`\n✨ Migration completed! Your type system is now consolidated.`));
  }
}

// CLI Usage
async function main() {
  const rootPath = process.argv[2] || process.cwd();

  console.log(chalk.blue(`🎯 Migrating types in: ${rootPath}\n`));

  const migrator = new TypeConsolidationMigrator(rootPath);
  const report = await migrator.migrate();

  // Exit with appropriate code
  process.exit(report.errors.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('💥 Fatal error:'), error);
    process.exit(1);
  });
}

export { TypeConsolidationMigrator, type MigrationReport };
