// All types are directly defined in this file instead of importing from aliases
/**
 * Import Rewriter Service - Production Implementation
 *
 * Advanced import path rewriting with AST-based analysis and canonical type compliance.
 * Converted from ES module to full TypeScript service with SOLID principles.
 *
 * @module transformation-engine/import-rewriting
 */

import * as fs from 'fs';
import * as path from 'path';
import { SourceFile } from 'ts-morph';
import { Project } from 'ts-morph';

// STRICT CANONICAL TYPE IMPORTS - NO MOCKS
import {
  ApiResponse,
  EntityId,
  FilePath,
  OperationId,
  Result,
  Timestamp,
  TransformationStatus,
  ValidationLevel,
  createApiResponse,
  createEntityId,
  createOperationId,
  createApiError,
  createTimestamp,
} from '../types/canonical-types';

import { 
  PipelineParams,
  ImportRewritingContext,
  TypeAnalysisData,
  TypeGroup,
  ImportMapping,
  TransformationResult, // Using canonical type instead of TransformationResult
  ImportValidationError
} from '../types/canonical-types';

import { fromTryCatch, resultUtils } from '../shared-foundation/result-utilities';

/// ============================================================================
// STRICT INTERFACE DEFINITIONS
/// ============================================================================

/**
 * Import rewriting configuration
 */
export interface ImportRewritingOptions {
  readonly canonicalPathsOnly: boolean;
  readonly validateImports: boolean;
  readonly generateReport: boolean;
  readonly validationLevel: ValidationLevel;
  readonly operationId: OperationId;
  readonly sessionId: EntityId;
  readonly dryRun: boolean;
}

// Using types defined in canonical-types.ts via declaration merging in ../pipelines/transformation.pipeline.d.ts

/// ============================================================================
// STRICT INTERFACES FOR SOLID COMPLIANCE
/// ============================================================================

/**
 * Type analysis loader (Single Responsibility)
 */
interface ITypeAnalysisLoader {
  loadAnalysis(projectRoot: FilePath): Promise<Result<TypeAnalysisData>>;
  validateAnalysis(analysis: TypeAnalysisData): Result<boolean>;
}

/**
 * Import mapping generator (Single Responsibility)
 */
interface IImportMappingGenerator {
  generateMappings(analysis: TypeAnalysisData): Promise<Result<readonly ImportMapping[]>>;
  validateMapping(mapping: ImportMapping): boolean;
}

/**
 * AST-based import rewriter (Single Responsibility)
 */
interface IASTImportRewriter {
  rewriteImports(
    sourceFile: SourceFile,
    mappings: readonly ImportMapping[],
  ): Promise<Result<number>>;
  validateImportPaths(
    sourceFile: SourceFile,
  ): Promise<Result<readonly ImportValidationError[]>>;
}

/**
 * Import validation service (Single Responsibility)
 */
interface IImportValidationService {
  validateImportResolution(file: FilePath, importPath: string): Promise<Result<boolean>>;
  validateCanonicalCompliance(mappings: readonly ImportMapping[]): Promise<Result<boolean>>;
}

/**
 * Report generation service (Single Responsibility)
 */
interface IReportGenerator {
  generateImportReport(result: TransformationResult): Promise<Result<FilePath>>;
}

/// ============================================================================
// CONCRETE IMPLEMENTATIONS
/// ============================================================================

/**
 * Production type analysis loader
 */
class ProductionTypeAnalysisLoader implements ITypeAnalysisLoader {
  async loadAnalysis(projectRoot: FilePath): Promise<Result<TypeAnalysisData>> {
    return fromTryCatch(
      () => {
        const analysisPath = path.join(projectRoot, 'tools/type-consolidation/type-analysis.json');

        if (!fs.existsSync(analysisPath)) {
          throw new Error(`Type analysis file not found: ${analysisPath}`);
        }

        const content = fs.readFileSync(analysisPath, 'utf8');
        const analysis = JSON.parse(content) as TypeAnalysisData;

        // Validate structure
        const validation = this.validateAnalysis(analysis);
        if (!resultUtils.isSuccess(validation)) {
          throw new Error('Invalid type analysis structure');
        }

        return analysis;
      },
      'TYPE_ANALYSIS_LOAD_FAILED',
      'loadAnalysis',
    );
  }

  validateAnalysis(analysis: TypeAnalysisData): Result<boolean> {
    return fromTryCatch(
      () => {
        if (!analysis.identical || !Array.isArray(analysis.identical.groups)) {
          throw new Error('Missing or invalid identical groups');
        }

        for (const group of analysis.identical.groups) {
          if (!group.canonicalFile || !Array.isArray(group.duplicates)) {
            throw new Error('Invalid group structure');
          }
        }

        return true;
      },
      'TYPE_ANALYSIS_VALIDATION_FAILED',
      'validateAnalysis',
    );
  }
}

/**
 * Production import mapping generator
 */
class ProductionImportMappingGenerator implements IImportMappingGenerator {
  async generateMappings(analysis: TypeAnalysisData): Promise<Result<readonly ImportMapping[]>> {
    return fromTryCatch(
      () => {
        const mappings: ImportMapping[] = [];

        for (const group of analysis.identical.groups) {
          const canonicalPath = group.canonicalFile;

          // Only process files in the canonical types structure
          if (
            !canonicalPath.includes('types/canonical') &&
            !canonicalPath.includes('shared-foundation')
          ) {
            continue;
          }

          for (const duplicatePath of group.duplicates) {
            // Skip the canonical file itself
            if (duplicatePath === canonicalPath) {
              continue;
            }

            // Determine type name from file path
            const fileName = path.basename(duplicatePath);
            const typeName = fileName.replace(/\.ts$/, '');

            // Generate mapping
            const mapping: ImportMapping = {
              typeName,
              oldPath: duplicatePath.replace(/\.ts$/, ''),
              newPath: this.generateCanonicalPath(canonicalPath),
              confidence: this.calculateConfidence(duplicatePath, canonicalPath),
            };

            if (this.validateMapping(mapping)) {
              mappings.push(mapping);
            }
          }
        }

        return mappings;
      },
      'MAPPING_GENERATION_FAILED',
      'generateMappings',
    );
  }

  validateMapping(mapping: ImportMapping): boolean {
    // Validate mapping structure and paths
    return (
      (mapping.typeName.length > 0 &&
        mapping.oldPath.length > 0 &&
        mapping.newPath.length > 0 &&
        mapping.confidence > 0.5 &&
        mapping.newPath.includes('canonical')) ||
      mapping.newPath.includes('shared-foundation')
    );
  }

  private generateCanonicalPath(canonicalFile: string): string {
    // Convert absolute path to canonical import path
    if (canonicalFile.includes('shared-foundation')) {
      return '../types/foundation.types';
    }

    // Default canonical path
    return '../types/foundation.types';
  }

  private calculateConfidence(duplicatePath: string, canonicalPath: string): number {
    // Calculate confidence based on path similarity and structure
    let confidence = 0.7; // Base confidence

    // Higher confidence for well-structured paths
    if (canonicalPath.includes('canonical') || canonicalPath.includes('shared-foundation')) {
      confidence += 0.2;
    }

    // Lower confidence for complex nested paths
    const duplicateDepth = duplicatePath.split('/').length;
    if (duplicateDepth > 4) {
      confidence -= 0.1;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }
}

/**
 * Production AST-based import rewriter using ts-morph
 */
class ProductionASTImportRewriter implements IASTImportRewriter {
  async rewriteImports(
    sourceFile: SourceFile,
    mappings: readonly ImportMapping[],
  ): Promise<Result<number>> {
    return fromTryCatch(
      () => {
        let rewriteCount = 0;
        const importDeclarations = sourceFile.getImportDeclarations();

        for (const importDecl of importDeclarations) {
          const moduleSpecifier = importDecl.getModuleSpecifierValue();

          // Find applicable mapping
          const mapping = mappings.find(
            (m) =>
              moduleSpecifier === m.oldPath ||
              moduleSpecifier.endsWith(`/${m.typeName}`) ||
              this.isPathMatch(moduleSpecifier, m.oldPath),
          );

          if (mapping) {
            // Get imported elements for validation
            const namedImports = importDecl.getNamedImports();

            if (namedImports.length > 0) {
              // Rewrite the module specifier
              importDecl.setModuleSpecifier(mapping.newPath);
              rewriteCount++;

              console.log(
                `Rewrote import in ${sourceFile.getFilePath()}: ${moduleSpecifier} → ${mapping.newPath}`,
              );
            }
          }
        }

        return rewriteCount;
      },
      'IMPORT_REWRITING_FAILED',
      'rewriteImports',
    );
  }

  async validateImportPaths(
    sourceFile: SourceFile,
  ): Promise<Result<readonly ImportValidationError[]>> {
    return fromTryCatch(
      () => {
        const errors: ImportValidationError[] = [];
        const importDeclarations = sourceFile.getImportDeclarations();

        for (const importDecl of importDeclarations) {
          const moduleSpecifier = importDecl.getModuleSpecifierValue();
          const line = importDecl.getStartLineNumber();

          // Check for common import issues
          if (moduleSpecifier.includes('//')) {
            errors.push({
              file: sourceFile.getFilePath() as FilePath,
              line,
              oldImport: moduleSpecifier,
              newImport: moduleSpecifier.replace(/\/\/+/g, '/'),
              error: 'Double slash in import path',
              severity: 'warning',
            });
          }

          if (moduleSpecifier.includes('@shared/types') && !moduleSpecifier.includes('canonical')) {
            errors.push({
              file: sourceFile.getFilePath() as FilePath,
              line,
              oldImport: moduleSpecifier,
              newImport: '../types/foundation.types',
              error: 'Non-canonical type import',
              severity: 'error',
            });
          }
        }

        return errors;
      },
      'IMPORT_VALIDATION_FAILED',
      'validateImportPaths',
    );
  }

  private isPathMatch(moduleSpecifier: string, oldPath: string): boolean {
    // Flexible path matching logic
    const normalizedSpecifier = moduleSpecifier.replace(/\\/g, '/');
    const normalizedOldPath = oldPath.replace(/\\/g, '/');

    return (
      normalizedSpecifier === normalizedOldPath ||
      normalizedSpecifier.endsWith(normalizedOldPath) ||
      normalizedOldPath.endsWith(normalizedSpecifier)
    );
  }
}

/**
 * Production import validation service
 */
class ProductionImportValidationService implements IImportValidationService {
  async validateImportResolution(file: FilePath, importPath: string): Promise<Result<boolean>> {
    return fromTryCatch(
      () => {
        // Resolve import path relative to file
        const fileDir = path.dirname(file);
        let resolvedPath: string;

        if (importPath.startsWith('@/')) {
          // Handle alias imports
          resolvedPath = importPath.replace('@/', './');
        } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
          // Handle relative imports
          resolvedPath = path.resolve(fileDir, importPath);
        } else {
          // Handle node_modules imports
          return true; // Assume valid for now
        }

        // Check if file exists (with common extensions)
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];
        for (const ext of extensions) {
          if (fs.existsSync(resolvedPath + ext)) {
            return true;
          }
        }

        return false;
      },
      'IMPORT_RESOLUTION_VALIDATION_FAILED',
      'validateImportResolution',
    );
  }

  async validateCanonicalCompliance(mappings: readonly ImportMapping[]): Promise<Result<boolean>> {
    return fromTryCatch(
      () => {
        for (const mapping of mappings) {
          // Ensure new path points to canonical types
          if (
            !mapping.newPath.includes('canonical') &&
            !mapping.newPath.includes('shared-foundation')
          ) {
            throw new Error(`Non-canonical mapping detected: ${mapping.newPath}`);
          }
        }

        return true;
      },
      'CANONICAL_COMPLIANCE_VALIDATION_FAILED',
      'validateCanonicalCompliance',
    );
  }
}

/**
 * Production report generator
 */
class ProductionReportGenerator implements IReportGenerator {
  async generateImportReport(result: TransformationResult): Promise<Result<FilePath>> {
    return fromTryCatch(
      () => {
        const reportDir = path.join(process.cwd(), 'reports');

        // Ensure reports directory exists
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(
          reportDir,
          `import-rewriting-report-${Date.now()}.md`,
        ) as FilePath;

        const reportContent = this.generateReportContent(result);
        fs.writeFileSync(reportPath, reportContent, 'utf8');

        return reportPath;
      },
      'REPORT_GENERATION_FAILED',
      'generateImportReport',
    );
  }

  private generateReportContent(result: TransformationResult): string {
    const successRate =
      result.totalFiles > 0 ? ((result.modifiedFiles / result.totalFiles) * 100).toFixed(1) : '0';

    return `# Import Rewriting Report

**Generated:** ${new Date(result.timestamp).toISOString()}
**Operation ID:** ${result.operationId}
**Status:** ${result.status}

## Summary

- **Total Files Processed:** ${result.totalFiles}
- **Files Modified:** ${result.modifiedFiles}
- **Success Rate:** ${successRate}%
- **Total Imports Rewritten:** ${result.totalImportsRewritten}
- **Execution Time:** ${result.executionTimeMs}ms

## Mappings Applied

${result.mappingsApplied
  .map(
    (mapping) =>
      `- \`${mapping.oldPath}\` → \`${mapping.newPath}\` (confidence: ${(mapping.confidence * 100).toFixed(1)}%)`,
  )
  .join('\n')}

## Validation Errors

${
  result.validationErrors.length === 0
    ? 'No validation errors found.'
    : result.validationErrors
        .map(
          (error) =>
            `- **${error.file}:${error.line}** [${error.severity.toUpperCase()}] ${error.error}`,
        )
        .join('\n')
}

## Recommendations

1. Review all import changes for correctness
2. Run TypeScript compilation to verify imports resolve correctly
3. Update any remaining manual import references
4. Consider updating IDE/editor configuration for new import paths

---
*Generated by Import Rewriter Service*
`;
  }
}

/// ============================================================================
// MAIN SERVICE CLASS (SINGLE RESPONSIBILITY)
/// ============================================================================

/**
 * Import rewriter service with strict SOLID compliance
 */
export class ImportRewriterService {
  private readonly options: ImportRewritingOptions;
  private readonly projectRoot: FilePath;

  private readonly typeAnalysisLoader: ITypeAnalysisLoader;
  private readonly mappingGenerator: IImportMappingGenerator;
  private readonly astRewriter: IASTImportRewriter;
  private readonly validator: IImportValidationService;
  private readonly reportGenerator: IReportGenerator;

  constructor(
    options: ImportRewritingOptions,
    projectRoot: FilePath,
    // Dependency injection for SOLID compliance
    typeAnalysisLoader?: ITypeAnalysisLoader,
    mappingGenerator?: IImportMappingGenerator,
    astRewriter?: IASTImportRewriter,
    validator?: IImportValidationService,
    reportGenerator?: IReportGenerator,
  ) {
    this.options = options;
    this.projectRoot = projectRoot;

    // Use provided dependencies or create defaults
    this.typeAnalysisLoader = typeAnalysisLoader ?? new ProductionTypeAnalysisLoader();
    this.mappingGenerator = mappingGenerator ?? new ProductionImportMappingGenerator();
    this.astRewriter = astRewriter ?? new ProductionASTImportRewriter();
    this.validator = validator ?? new ProductionImportValidationService();
    this.reportGenerator = reportGenerator ?? new ProductionReportGenerator();
  }

  /**
   * Execute the complete import rewriting workflow
   */
  async execute(): Promise<ApiResponse<TransformationResult>> {
    const startTime = Date.now();

    try {
      // Step 1: Load type analysis
      const analysisResult = await this.typeAnalysisLoader.loadAnalysis(this.projectRoot);
      if (!resultUtils.isSuccess(analysisResult)) {
        return createApiResponse(undefined, analysisResult.error);
      }

      // Step 2: Generate import mappings
      const mappingsResult = await this.mappingGenerator.generateMappings(analysisResult.data);
      if (!resultUtils.isSuccess(mappingsResult)) {
        return createApiResponse(undefined, mappingsResult.error);
      }

      const mappings = mappingsResult.data;

      // Step 3: Validate canonical compliance
      if (this.options.validateImports) {
        const complianceResult = await this.validator.validateCanonicalCompliance(mappings);
        if (!resultUtils.isSuccess(complianceResult)) {
          return createApiResponse(undefined, complianceResult.error);
        }
      }

      // Step 4: Initialize ts-morph project and process files
      const project = new Project({
        tsConfigFilePath: path.join(this.projectRoot, 'tsconfig.json'),
        skipAddingFilesFromTsConfig: true,
      });

      // Add source files
      const sourceFiles = project.addSourceFilesAtPaths([
        path.join(this.projectRoot, '**/*.ts'),
        path.join(this.projectRoot, '**/*.tsx'),
        `!${path.join(this.projectRoot, 'node_modules/**')}`,
        `!${path.join(this.projectRoot, 'dist/**')}`,
        `!${path.join(this.projectRoot, 'build/**')}`,
      ]);

      // Step 5: Process each file
      let totalImportsRewritten = 0;
      let modifiedFiles = 0;
      const validationErrors: ImportValidationError[] = [];

      for (const sourceFile of sourceFiles) {
        // Skip files in the canonical types directory to avoid circular rewrites
        if (sourceFile.getFilePath().includes('types/canonical')) {
          continue;
        }

        // Rewrite imports
        const rewriteResult = await this.astRewriter.rewriteImports(sourceFile, mappings);
        if (resultUtils.isSuccess(rewriteResult)) {
          const rewriteCount = rewriteResult.data;
          if (rewriteCount > 0) {
            totalImportsRewritten += rewriteCount;
            modifiedFiles++;
          }
        }

        // Validate imports if requested
        if (this.options.validateImports) {
          const validationResult = await this.astRewriter.validateImportPaths(sourceFile);
          if (resultUtils.isSuccess(validationResult)) {
            validationErrors.push(...validationResult.data);
          }
        }
      }

      // Step 6: Save changes
      if (!this.options.dryRun && totalImportsRewritten > 0) {
        await project.save();
      }

      // Step 7: Generate report
      let reportPath: FilePath | undefined;
      if (this.options.generateReport) {
        // Return TransformationResult instead of TransformationResult
        const result: TransformationResult = {
          id: this.options.operationId,
          status: TransformationStatus.COMPLETED,
          changedFiles: modifiedFiles.map(file => ({ 
            path: file as FilePath, 
            // Other required fields for the FileInfo interface
          })),
          errors: validationErrors.map(err => ({
            code: 'IMPORT_VALIDATION',
            message: err.error,
            path: err.file,
            timestamp: createTimestamp(),
            recoverable: true
          })),
          startTime: createTimestamp(),
          endTime: createTimestamp(),
          strategy: 'in_place',
        };

        const reportResult = await this.reportGenerator.generateImportReport(result);
        if (resultUtils.isSuccess(reportResult)) {
          reportPath = reportResult.data;
        }
      }

      // Build final result
      // Final return value: TransformationResult instead of TransformationResult
      const result: TransformationResult = {
        id: this.options.operationId,
        status:
          totalImportsRewritten > 0 ? TransformationStatus.COMPLETED : TransformationStatus.SKIPPED,
        changedFiles: modifiedFiles.map(file => ({ 
          path: file as FilePath, 
          // Other required fields for the FileInfo interface
        })),
        errors: validationErrors.map(err => ({
          code: 'IMPORT_VALIDATION',
          message: err.error,
          path: err.file,
          timestamp: createTimestamp(),
          recoverable: true
        })),
        startTime: createTimestamp(),
        endTime: createTimestamp(),
        strategy: 'in_place',
      };

      return createApiResponse(result);
    } catch (error) {
      const systemError = createApiError(
        'IMPORT_REWRITING_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        'ImportRewriterService.execute',
      );

      return createApiResponse(undefined, systemError);
    }
  }
}

/// ============================================================================
// FACTORY FUNCTION WITH PIPELINE INTEGRATION
/// ============================================================================

/**
 * Create import rewriter service with pipeline integration
 */
export function createImportRewriterService(
  pipelineParams: PipelineParams<'transformation'>,
  projectRoot: FilePath = process.cwd() as FilePath,
): ImportRewriterService {
  const options: ImportRewritingOptions = {
    canonicalPathsOnly: pipelineParams.importRewriting?.canonicalPathsOnly ?? true,
    validateImports: pipelineParams.importRewriting?.validateImports ?? true,
    generateReport: pipelineParams.importRewriting?.generateReport ?? true,
    validationLevel: 'strict' as ValidationLevel,
    operationId: createOperationId(),
    sessionId: createEntityId(`import-rewriting-${Date.now()}`),
    dryRun: pipelineParams.dryRun ?? false,
  };

  return new ImportRewriterService(options, projectRoot);
}
