/**
 * Pipeline Registry - Constitutional Compliance
 *
 * SSOT for ALL pipeline operations
 */

// Constitutional types (SSOT)

// Base pipeline operations
interface BasePipelineOps {
  validate(): ApiResponse<boolean>;
  execute(): ApiResponse<void>;
}

// Analysis Pipeline Operations (from violations analysis)
export interface AnalysisPipelineOps extends BasePipelineOps {
  analyze(request: {
    readonly scope: {
      readonly files?: string[];
      readonly directories?: string[];
      readonly patterns?: string[];
      readonly excludes?: string[];
    };
    readonly configuration: {
      readonly includeTests: boolean;
      readonly followSymlinks: boolean;
      readonly maxDepth: number;
      readonly timeout: number;
    };
  }): ApiResponse<{
    readonly summary: {
      readonly totalFiles: number;
      readonly linesOfCode: number;
    };
    readonly findings: Array<{
      readonly id: string;
      readonly type: 'issue' | 'opportunity' | 'risk';
      readonly description: string;
      readonly location: string;
    }>;
  }>;
}

// Assessment Pipeline Operations
export interface AssessmentPipelineOps extends BasePipelineOps {
  assess(request: {
    readonly targetFiles: FilePath[];
    readonly analysisDepth: 'surface' | 'deep' | 'comprehensive';
    readonly options: {
      readonly includeFixSuggestions: boolean;
      readonly calculateTrends: boolean;
      readonly securityAnalysis: boolean;
    };
  }): ApiResponse<{
    readonly quality: {
      readonly debtScore: number;
      readonly maintainabilityIndex: number;
    };
    readonly risk: {
      readonly overallRisk: string;
      readonly businessImpact: string;
    };
  }>;
}

// CLI Pipeline Operations
export interface CliPipelineOps extends BasePipelineOps {
  executeCommand(context: {
    readonly command: string;
    readonly arguments: Record<string, unknown>;
    readonly options: Record<string, unknown>;
    readonly workingDirectory: string;
  }): ApiResponse<{
    readonly success: boolean;
    readonly output?: {
      readonly type: 'text' | 'table' | 'json';
      readonly content: unknown;
    };
  }>;
}

// Configuration Pipeline Operations
export interface ConfigurationPipelineOps extends BasePipelineOps {
  loadConfiguration(sources: Array<{
    readonly type: 'file' | 'environment' | 'remote';
    readonly location: string;
    readonly priority: number;
  }>): ApiResponse<{
    readonly effective: Record<string, unknown>;
    readonly violations: Array<{
      readonly property: string;
      readonly message: string;
    }>;
  }>;
}

// Detection Pipeline Operations
export interface DetectionPipelineOps extends BasePipelineOps {
  detectPatterns(request: {
    readonly targets: string[];
    readonly options: {
      readonly includeTests: boolean;
      readonly followImports: boolean;
      readonly timeout: number;
    };
  }): ApiResponse<{
    readonly patterns: Array<{
      readonly id: string;
      readonly file: FilePath;
      readonly location: {
        readonly startLine: number;
        readonly endLine: number;
      };
    }>;
    readonly summary: {
      readonly total: number;
      readonly byFramework: Record<string, number>;
    };
  }>;
}

// Input Pipeline Operations
export interface InputPipelineOps extends BasePipelineOps {
  scanFiles(request: {
    readonly sources: Array<{
      readonly type: 'filesystem' | 'git' | 'archive';
      readonly location: string;
    }>;
    readonly options: {
      readonly recursive: boolean;
      readonly followSymlinks: boolean;
      readonly maxDepth?: number;
    };
  }): ApiResponse<{
    readonly files: Array<{
      readonly path: FilePath;
      readonly size: number;
      readonly modified: string;
    }>;
  }>;
}

// Mapping Pipeline Operations
export interface MappingPipelineOps extends BasePipelineOps {
  mapTypes(request: {
    readonly sourceFiles: FilePath[];
    readonly options: {
      readonly includeImports: boolean;
      readonly includeExports: boolean;
      readonly maxDepth: number;
    };
  }): ApiResponse<{
    readonly typeMap: {
      readonly types: Array<{
        readonly name: string;
        readonly location: FilePath;
        readonly exported: boolean;
      }>;
    };
  }>;
}

// Migration Pipeline Operations
export interface MigrationPipelineOps extends BasePipelineOps {
  migrateFiles(request: {
    readonly operations: Array<{
      readonly type: 'move' | 'copy' | 'rename';
      readonly source?: FilePath;
      readonly destination?: FilePath;
    }>;
    readonly options: {
      readonly dryRun: boolean;
      readonly createBackups: boolean;
      readonly updateReferences: boolean;
    };
  }): ApiResponse<{
    readonly successful: boolean;
    readonly operations: Array<{
      readonly status: 'success' | 'failure';
      readonly source?: FilePath;
      readonly destination?: FilePath;
    }>;
  }>;
}

// Planning Pipeline Operations
export interface PlanningPipelineOps extends BasePipelineOps {
  createPlan(request: {
    readonly strategyId: string;
    readonly targetFiles: FilePath[];
    readonly constraints: Array<{
      readonly type: 'time' | 'resource' | 'dependency';
      readonly value: string | number;
    }>;
  }): ApiResponse<{
    readonly id: string;
    readonly phases: Array<{
      readonly id: string;
      readonly name: string;
      readonly operations: Array<{
        readonly type: 'transform' | 'move' | 'validate';
        readonly target: FilePath;
      }>;
    }>;
  }>;
}

// Reporting Pipeline Operations
export interface ReportingPipelineOps extends BasePipelineOps {
  generateReport(request: {
    readonly source: {
      readonly type: 'migration' | 'verification' | 'assessment';
      readonly id: string;
    };
    readonly options: {
      readonly format: 'json' | 'html' | 'markdown';
      readonly detailLevel: 'summary' | 'standard' | 'detailed';
    };
  }): ApiResponse<{
    readonly id: string;
    readonly title: string;
    readonly summary: {
      readonly status: 'success' | 'partial' | 'failure';
      readonly overview: string;
    };
  }>;
}

// Strategy Pipeline Operations
export interface StrategyPipelineOps extends BasePipelineOps {
  selectStrategy(request: {
    readonly detectionResults: string;
    readonly assessmentResults: string;
    readonly constraints: Array<{
      readonly type: 'time' | 'resources' | 'risk';
      readonly value: string | number;
    }>;
  }): ApiResponse<{
    readonly recommendedStrategy: {
      readonly id: string;
      readonly name: string;
      readonly description: string;
    };
    readonly alternatives: Array<{
      readonly id: string;
      readonly name: string;
    }>;
  }>;
}

// Transformation Pipeline Operations
export interface TransformationPipelineOps extends BasePipelineOps {
  transformFiles(request: {
    readonly files: FilePath[];
    readonly rules: Array<{
      readonly id: string;
      readonly pattern: string;
      readonly replacement: string;
    }>;
    readonly options: {
      readonly dryRun: boolean;
      readonly validateSyntax: boolean;
    };
  }): ApiResponse<{
    readonly successful: boolean;
    readonly transformations: Array<{
      readonly file: FilePath;
      readonly changes: Array<{
        readonly location: { readonly line: number };
        readonly description: string;
      }>;
    }>;
  }>;
}

// Validation Pipeline Operations
export interface ValidationPipelineOps extends BasePipelineOps {
  validateInput(request: {
    readonly target: unknown;
    readonly schema: {
      readonly version: string;
      readonly properties: Array<{
        readonly name: string;
        readonly type: string;
        readonly required: boolean;
      }>;
    };
    readonly options: {
      readonly mode: 'strict' | 'permissive';
      readonly coerceTypes?: boolean;
    };
  }): ApiResponse<{
    readonly valid: boolean;
    readonly errors: Array<{
      readonly path: string;
      readonly message: string;
    }>;
  }>;
}

// Verification Pipeline Operations
export interface VerificationPipelineOps extends BasePipelineOps {
  verifyMigration(request: {
    readonly migrationId: string;
    readonly targetPaths: FilePath[];
    readonly verificationTypes: Array<{
      readonly name: string;
      readonly enabled: boolean;
    }>;
  }): ApiResponse<{
    readonly successful: boolean;
    readonly verifications: Array<{
      readonly type: string;
      readonly status: 'success' | 'failure' | 'warning';
    }>;
  }>;
}

// Legacy pipeline types (will be deprecated)
export interface CodequalityPipelineOps extends BasePipelineOps {}
export interface MigrationenginePipelineOps extends BasePipelineOps {}
export interface PatterndetectionPipelineOps extends BasePipelineOps {}
export interface TestingPipelineOps extends BasePipelineOps {}

// Pipeline registry interface
export interface PipelineRegistry {
  analysis: AnalysisPipelineOps;
  assessment: AssessmentPipelineOps;
  cli: CliPipelineOps;
  configuration: ConfigurationPipelineOps;
  detection: DetectionPipelineOps;
  input: InputPipelineOps;
  mapping: MappingPipelineOps;
  migration: MigrationPipelineOps;
  planning: PlanningPipelineOps;
  reporting: ReportingPipelineOps;
  strategy: StrategyPipelineOps;
  transformation: TransformationPipelineOps;
  validation: ValidationPipelineOps;
  verification: VerificationPipelineOps;

  // Legacy (deprecated)
  "code-quality": CodequalityPipelineOps;
  "migration-engine": MigrationenginePipelineOps;
  "pattern-detection": PatterndetectionPipelineOps;
  testing: TestingPipelineOps;
}
