/**
 * AI CLI Interface
 *
 * Command line interface for AI migration system following constitutional requirements.
 * Uses canonical types only, validates all inputs, returns via factory patterns.
 */

import {
  ApiResponse,
  FilePath,
  OutputFormat,
  Result,
  RiskLevel,
  ApiError,
  MigrationConfiguration,
  PipelineContext,
  ResponseMetadata,
  ScanCommandOptions,
  AnalyzeCommandOptions,
  StatusCommandOptions,
  createApiSuccess,
  createApiError,
  PipelineParams,
  ValidationLevel,
  Framework
} from '@/types/canonical-types';
import { Command } from 'commander';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { createInterface, Interface as ReadlineInterface } from 'readline';

import { createProductionAIOrchestrator } from './ai-orchestrator';

// ============================================================================
// CLI INTERFACES
// ============================================================================

// ============================================================================
// CLI RENDERER
// ============================================================================

class SimpleCLIRenderer {
  private activeProgress = new Map<string, boolean>();

  async render(
    level: 'info' | 'warning' | 'error' | 'success' | 'debug',
    message: string,
  ): Promise<void> {
    const prefix = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      debug: '🔍',
    }[level];

    console.log(`${prefix} ${message}`);
  }

  async renderSection(title: string): Promise<void> {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋 ${title}`);
    console.log(`${'='.repeat(50)}`);
  }

  async renderList(items: readonly string[], numbered = false): Promise<void> {
    items.forEach((item, index) => {
      const prefix = numbered ? `${index + 1}.` : '•';
      console.log(`  ${prefix} ${item}`);
    });
  }

  async renderProgress<T>(operation: string, task: () => Promise<T>): Promise<Result<T>> {
    console.log(`🔄 ${operation}...`);
    try {
      const result = await task();
      console.log(`✅ ${operation} completed`);
      return { success: true, data: result };
    } catch (error) {
      console.log(`❌ ${operation} failed`);
      return {
        success: false,
        error: createApiError('OPERATION_ERROR', `${operation} failed`, {
          originalError: error,
        }),
      };
    }
  }

  dispose(): void {
    this.activeProgress.clear();
  }
}

// ============================================================================
// TELEMETRY SERVICE
// ============================================================================

class TelemetryService {
  private telemetryData: ResponseMetadata[] = [];

  constructor(
    private readonly enabled: boolean,
    private readonly outputDir: string,
  ) {}

  collect(data: ResponseMetadata): void {
    if (this.enabled) {
      this.telemetryData.push(data);
    }
  }

  async flush(startTime: number): Promise<ApiResponse<void>> {
    if (this.telemetryData.length === 0) {
      return createApiSuccess(undefined);
    }

    try {
      const telemetryFile = join(this.outputDir, 'telemetry.json');
      const data = {
        session: {
          startTime,
          endTime: Date.now(),
          duration: Date.now() - startTime,
        },
        events: this.telemetryData,
      };

      await this.saveResults(telemetryFile, data);
      return createApiSuccess(undefined);
    } catch (error) {
      return createApiError('TELEMETRY_ERROR', 'Telemetry flush failed', {
        originalError: error,
      });
    }
  }

  private async saveResults(outputPath: string, data: unknown): Promise<void> {
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// ============================================================================
// COMMAND EXECUTORS
// ============================================================================

abstract class BaseCommandExecutor<TOptions> {
  constructor(
    protected readonly renderer: SimpleCLIRenderer,
    protected readonly telemetryService: TelemetryService,
  ) {}

  async execute(options: TOptions): Promise<ApiResponse<unknown>> {
    try {
      const result = await this.executeInternal(options);
      return createApiSuccess(result);
    } catch (error) {
      return createApiError('EXECUTION_ERROR', 'Command execution failed', {
        originalError: error,
      });
    }
  }

  protected abstract executeInternal(options: TOptions): Promise<unknown>;

  protected async renderProgress<T>(operation: string, task: () => Promise<T>): Promise<Result<T>> {
    return this.renderer.renderProgress(operation, task);
  }

  protected generateProgressId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class ScanCommandExecutor extends BaseCommandExecutor<ScanCommandOptions> {
  constructor(renderer: SimpleCLIRenderer, telemetryService: TelemetryService) {
    super(renderer, telemetryService);
  }

  protected async executeInternal(options: ScanCommandOptions): Promise<any> {
    const progressResult = await this.renderProgress('Scanning for AI annotations', async () => {
      // Mock scan implementation
      const result = {
        flags: [],
        metadata: {
          filesProcessed: 0,
          annotationsFound: 0,
          scanTime: 100,
        },
        errors: [],
      };

      if (options.output) {
        await this.saveResults(options.output, result);
        await this.renderer.render('info', `Results saved to ${options.output}`);
      }

      await this.displayScanResults(result);
      return result;
    });

    if (!progressResult.success) {
      throw progressResult.error;
    }

    return progressResult.data;
  }

  private async displayScanResults(result: any): Promise<void> {
    await this.renderer.renderSection('Scan Results Summary');
    await this.renderer.render('info', `Files processed: ${result.metadata.filesProcessed}`);
    await this.renderer.render('info', `Annotations found: ${result.metadata.annotationsFound}`);
    await this.renderer.render('info', `Processing time: ${result.metadata.scanTime}ms`);

    if (result.errors.length > 0) {
      await this.renderer.render('warning', `Errors encountered: ${result.errors.length}`);
    }
  }

  private async saveResults(outputPath: string, data: unknown): Promise<void> {
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

class AnalyzeCommandExecutor extends BaseCommandExecutor<AnalyzeCommandOptions> {
  constructor(renderer: SimpleCLIRenderer, telemetryService: TelemetryService) {
    super(renderer, telemetryService);
  }

  protected async executeInternal(options: AnalyzeCommandOptions): Promise<any> {
    const progressResult = await this.renderProgress('Analyzing AI flags', async () => {
      const flags = await this.loadFlagsFromInput(options.input);

      // Mock analysis implementation
      const result = {
        flags,
        metadata: {
          flagCount: flags.length,
          uniqueFlagsCount: flags.length,
          filesScanned: 0,
          processingTime: 100,
        },
      };

      if (options.export) {
        await this.saveResults(options.export, result);
        await this.renderer.render('info', `Analysis exported to ${options.export}`);
      }

      await this.displayAnalysisResults(result);
      return result;
    });

    if (!progressResult.success) {
      throw progressResult.error;
    }

    return progressResult.data;
  }

  private async loadFlagsFromInput(input?: string): Promise<any[]> {
    if (!input) {
      throw createApiError('VALIDATION_ERROR', 'No input file specified');
    }

    const content = await fs.readFile(input, 'utf-8');
    const data = JSON.parse(content);

    if (data.flags) return data.flags;
    if (Array.isArray(data)) return data;
    if (data.annotations) return data.annotations;

    throw createApiError('VALIDATION_ERROR', 'Unrecognized input file format');
  }

  private async displayAnalysisResults(result: any): Promise<void> {
    await this.renderer.renderSection('Analysis Results Summary');
    await this.renderer.render('info', `Total flags: ${result.metadata.flagCount}`);
    await this.renderer.render('info', `Unique flags: ${result.metadata.uniqueFlagsCount}`);
    await this.renderer.render('info', `Files scanned: ${result.metadata.filesScanned}`);
    await this.renderer.render('info', `Processing time: ${result.metadata.processingTime}ms`);
  }

  private async saveResults(outputPath: string, data: unknown): Promise<void> {
    await fs.mkdir(dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// ============================================================================
// ENVIRONMENT VALIDATOR
// ============================================================================

class EnvironmentValidator {
  static async validate(): Promise<ApiResponse<void>> {
    // R-05: Environment detection before API use
    if (typeof process === 'undefined') {
      return createApiError('ENVIRONMENT_ERROR', 'Node.js environment required');
    }

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 16) {
      return createApiError('ENVIRONMENT_ERROR', `Node.js 16+ required, but found ${nodeVersion}`);
    }

    return createApiSuccess(undefined);
  }
}

// ============================================================================
// COMMAND REGISTRY
// ============================================================================

class CLICommandRegistry {
  constructor(
    private readonly renderer: SimpleCLIRenderer,
    private readonly telemetryService: TelemetryService,
    private readonly config: MigrationConfiguration,
  ) {}

  register(program: Command): void {
    this.setupBaseOptions(program);
    this.setupScanCommand(program);
    this.setupAnalyzeCommand(program);
    this.setupVerifyCommand(program);
    this.setupStatusCommand(program);
    this.setupInteractiveCommand(program);
  }

  private setupBaseOptions(program: Command): void {
    program
      .name('ai-migrate')
      .description('AI-powered code migration and technical debt analysis system')
      .version('2.0.0')
      .option('-v, --verbose', 'Enable verbose output')
      .option('-d, --dry-run', 'Perform dry run without making changes')
      .option('--output-dir <dir>', 'Output directory for results', './ai-migration-output')
      .option('--ai-model <model>', 'AI model to use', 'gpt-4')
      .option('--no-telemetry', 'Disable telemetry collection')
      .option('--disable-verification', 'Disable AI verification capabilities');
  }

  private setupScanCommand(program: Command): void {
    program
      .command('scan')
      .description('Scan for AI annotations in codebase')
      .option('--directories <dirs...>', 'Directories to scan')
      .option('--extensions <exts...>', 'File extensions to include')
      .option('--exclude <patterns...>', 'Patterns to exclude')
      .option('--output <file>', 'Output file for results')
      .option('--use-ripgrep', 'Force use of ripgrep for scanning')
      .action(async (options) => {
        const executor = new ScanCommandExecutor(this.renderer, this.telemetryService);
        const result = await executor.execute(options);
        if (!result.success) {
          await this.renderer.render('error', result.error?.message || 'Unknown error');
          process.exit(1);
        }
      });
  }

  private setupAnalyzeCommand(program: Command): void {
    program
      .command('analyze')
      .description('Analyze AI flags and generate comprehensive reports')
      .option('--input <file>', 'Input file with scan results')
      .option('--sha <sha>', 'Filter by specific Git SHA')
      .option('--category <categories...>', 'Filter by flag categories')
      .option('--min-risk <level>', 'Minimum risk level to include')
      .option('--export <file>', 'Export analysis results')
      .option('--format <format>', 'Export format (json|csv|yaml)', 'json')
      .option('--enable-ai', 'Enable AI-enhanced analysis')
      .option('--include-patterns', 'Include pattern analysis')
      .action(async (options) => {
        const executor = new AnalyzeCommandExecutor(this.renderer, this.telemetryService);
        const result = await executor.execute(options);
        if (!result.success) {
          await this.renderer.render('error', result.error?.message || 'Unknown error');
          process.exit(1);
        }
      });
  }

  private setupVerifyCommand(program: Command): void {
    program
      .command('verify')
      .description('Perform AI verification of code changes')
      .option('--file <file>', 'File to verify')
      .option('--batch <dir>', 'Directory for batch verification')
      .option('--output <file>', 'Output file for verification results')
      .option('--risk-threshold <level>', 'Risk threshold for verification')
      .action(async (options) => {
        await this.verifyCommand(options);
      });
  }

  private setupStatusCommand(program: Command): void {
    program
      .command('status')
      .description('Check system status and configuration')
      .option('--check-ai', 'Test AI service connectivity')
      .option('--check-tools', 'Verify required tools are available')
      .option('--health-check', 'Run comprehensive health check')
      .action(async (options) => {
        await this.statusCommand(options);
      });
  }

  private setupInteractiveCommand(program: Command): void {
    program
      .command('interactive')
      .alias('menu')
      .description('Launch interactive menu system')
      .action(async () => {
        await this.renderer.render('info', 'Interactive mode not implemented in this example');
      });
  }

  private async verifyCommand(options: any): Promise<void> {
    await this.renderer.renderSection('AI Verification');

    try {
      const orchestrator = createProductionAIOrchestrator();

      if (options.file) {
        // Single file verification
        const content = await fs.readFile(options.file, 'utf-8');
        const request = {
          filePath: options.file as FilePath,
          content,
          transformations: [],
        };

        const result = await orchestrator.executeAIVerification(request);
        if (result.success && result.data) {
          await this.displayVerificationResult(result.data);
        } else {
          await this.renderer.render('error', result.error?.message || 'Verification failed');
        }
      } else if (options.batch) {
        // Batch verification
        await this.renderer.render('info', 'Batch verification not fully implemented');
      }

      await orchestrator.shutdown();
    } catch (error) {
      await this.renderer.render('error', `Verification failed: ${error}`);
    }
  }

  private async displayVerificationResult(result: any): Promise<void> {
    await this.renderer.render('success', 'Verification completed');
    await this.renderer.render('info', `Risk Level: ${result.riskAssessment.level}`);
    await this.renderer.render('info', `Risk Score: ${result.riskAssessment.score.toFixed(1)}/100`);
    await this.renderer.render(
      'info',
      `Verification Steps: ${result.verificationPlan.steps.length}`,
    );
    await this.renderer.render(
      'info',
      `Review Required: ${result.riskAssessment.requiresHumanReview ? 'Yes' : 'No'}`,
    );

    if (result.recommendations.length > 0) {
      await this.renderer.renderSection('Recommendations');
      await this.renderer.renderList(result.recommendations);
    }
  }

  private async statusCommand(options: StatusCommandOptions): Promise<void> {
    await this.renderer.renderSection('AI Migration System Status');

    // Environment check
    await this.renderer.render('info', `Working Directory: ${process.cwd()}`);
    await this.renderer.render('info', `Output Directory: ${this.config.outputDir}`);
    await this.renderer.render('info', `Node Version: ${process.version}`);
    await this.renderer.render('info', `Platform: ${process.platform}`);

    // Configuration check
    await this.renderer.render('info', `AI Model: ${this.config.aiModel}`);
    await this.renderer.render(
      'info',
      `Telemetry: ${this.config.enableTelemetry ? 'Enabled' : 'Disabled'}`,
    );
    await this.renderer.render(
      'info',
      `Verification: ${this.config.enableVerification ? 'Enabled' : 'Disabled'}`,
    );

    // AI service check
    if (options.checkAi) {
      if (typeof process !== 'undefined' && process.env.OPENAI_API_KEY) {
        await this.renderer.render('success', '✅ OpenAI API Key: Present');
      } else {
        await this.renderer.render('error', '❌ OpenAI API Key: Missing');
      }
    }

    // Health check
    if (options.healthCheck) {
      try {
        const orchestrator = createProductionAIOrchestrator();
        const healthResult = await orchestrator.getSystemHealth();

        if (healthResult.success && healthResult.data) {
          await this.renderer.render('success', `System Health: ${healthResult.data.status}`);
          await this.renderer.render(
            'info',
            `Performance Score: ${healthResult.data.metrics.performanceScore.toFixed(1)}/100`,
          );
        }

        await orchestrator.shutdown();
      } catch (error) {
        await this.renderer.render('error', `Health check failed: ${error}`);
      }
    }
  }
}

// ============================================================================
// AI MIGRATION CLI
// ============================================================================

export class AIMigrationCLI {
  private readonly program: Command;
  private readonly context: PipelineContext<'cli'>;
  private readonly renderer: SimpleCLIRenderer;
  private readonly telemetryService: TelemetryService;
  private readonly commandRegistry: CLICommandRegistry;
  private readonly rl?: ReadlineInterface;

  constructor(config: MigrationConfiguration) {
    this.context = {
      operationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      params: {
        // Map config properties to params
      },
      metadata: {
        source: 'cli',
        user: process.env.USER || 'unknown',
      },
    };

    this.renderer = new SimpleCLIRenderer();
    this.telemetryService = new TelemetryService(config.enableTelemetry, config.outputDir);
    this.commandRegistry = new CLICommandRegistry(this.renderer, this.telemetryService, config);

    this.program = new Command();
    this.commandRegistry.register(this.program);

    // R-05: Environment detection for readline
    if (typeof process !== 'undefined' && process.stdin && process.stdout) {
      this.rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }

    this.setupEventHandlers();
  }

  /**
   * Main entry point with comprehensive error handling
   */
  async run(): Promise<ApiResponse<void>> {
    try {
      const envResult = await EnvironmentValidator.validate();
      if (!envResult.success) {
        return envResult;
      }

      await this.program.parseAsync();
      return createApiSuccess(undefined);
    } catch (error) {
      this.handleError(error as Error);
      return createApiError('EXECUTION_ERROR', 'CLI execution failed', {
        originalError: error,
      });
    } finally {
      if (this.rl) {
        this.rl.close();
      }
      if (this.context.config.enableTelemetry) {
        await this.telemetryService.flush(this.context.startTime);
      }
      this.renderer.dispose();
    }
  }

  private setupEventHandlers(): void {
    if (typeof process === 'undefined') return;

    process.on('SIGINT', async () => {
      await this.renderer.render('warning', '\n\n🛑 Gracefully shutting down...');
      if (this.context.config.enableTelemetry) {
        await this.telemetryService.flush(this.context.startTime);
      }
      this.renderer.dispose();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      await this.renderer.render('error', `💥 Uncaught Exception: ${error.message}`);
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
      await this.renderer.render('error', `💥 Unhandled Rejection: ${String(reason)}`);
      process.exit(1);
    });
  }

  private handleError(error: Error): void {
    this.renderer.render('error', `💥 Error: ${error.message}`);

    if (this.context.config.verbose && error.stack) {
      this.renderer.render('debug', `Stack trace: ${error.stack}`);
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export class AIMigrationCLIFactory {
  static create(config?: Partial<MigrationConfiguration>): ApiResponse<AIMigrationCLI> {
    // Create a config that extends MigrationConfiguration with the CLI-specific properties
    const DEFAULT_CONFIG = {
      // Standard MigrationConfiguration properties
      dryRun: false,
      interactive: false,
      force: false,
      skipValidation: false,
      frameworks: [],
      includePatterns: [],
      excludePatterns: [],
      validation: 'standard',
      environment: 'development',
      
      // Additional CLI-specific properties (previously from AICLIConfig)
      outputDir: './ai-migration-output',
      logLevel: 'info',
      enableTelemetry: true,
      aiModel: 'gpt-4',
      maxConcurrency: 4,
      enableVerification: true,
      verbose: false
    } as MigrationConfiguration;

    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    try {
      const cli = new AIMigrationCLI(fullConfig);
      return createApiSuccess(cli);
    } catch (error) {
      const err = error as Error;
      return createApiError('CLI_CREATION_ERROR', err.message, error);
    }
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
  const cliResult = AIMigrationCLIFactory.create();
  if (!cliResult.success) {
    console.error('Fatal error:', cliResult.error?.message);
    process.exit(1);
  }

  const runResult = await cliResult.data!.run();
  if (!runResult.success) {
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default AIMigrationCLI;
