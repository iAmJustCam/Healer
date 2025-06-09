import { FilePath, ApiResponse, createApiError, createApiSuccess, createFilePath, TransformationStrategy, ConfidenceScore, Violation } from '../types/canonical-types';

// ============================================================================
// INPUT VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate analysis configuration
 */
function validateAnalysisConfig(input: unknown): ApiResponse<AnalysisConfig> {
  if (!input || typeof input !== 'object') {
    return createApiError('VALIDATION_ERROR', 'Analysis config must be an object');
  }

  const config = input as Record<string, unknown>;

  // Provide defaults for missing properties
  const defaultConfig: AnalysisConfig = {
    includeTests: Boolean(config.includeTests),
    followSymlinks: Boolean(config.followSymlinks),
    maxDepth: typeof config.maxDepth === 'number' ? config.maxDepth : 10,
    timeout: typeof config.timeout === 'number' ? config.timeout : 30000,
    patterns: getDefaultPatterns(),
    complexity: getDefaultComplexity(),
  };

  return createApiSuccess(defaultConfig);
}

/**
 * Validate file path input
 */
function validateFilePath(input: unknown): ApiResponse<FilePath> {
  const pathResult = validationUtils.nonEmpty(input as string, 'file path');
  if (!apiUtils.isOk(pathResult)) {
    return pathResult as ApiResponse<FilePath>;
  }

  return createApiSuccess(createFilePath(pathResult.data));
}

/**
 * Validate file patterns input
 */
function validateFilePatterns(input: unknown): ApiResponse<string[]> {
  if (!Array.isArray(input)) {
    return createApiError('VALIDATION_ERROR', 'File patterns must be an array');
  }

  for (const pattern of input) {
    if (typeof pattern !== 'string' || !pattern.trim()) {
      return createApiError('VALIDATION_ERROR', 'All file patterns must be non-empty strings');
    }
  }

  return createApiSuccess(input as string[]);
}

// ============================================================================
// ENVIRONMENT DETECTION UTILITIES
// ============================================================================

/**
 * Check if file system APIs are available
 */
function checkFileSystemEnvironment(): ApiResponse<boolean> {
  const checks = [
    typeof fs.readFileSync === 'function',
    typeof glob === 'function',
    typeof path.resolve === 'function',
  ];

  if (!checks.every(Boolean)) {
    return createApiError('ENVIRONMENT_ERROR', 'File system APIs not available');
  }

  return createApiSuccess(true);
}

// ============================================================================
// PATTERN DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect patterns in file content
 */
export function detectPatterns(
  filePath: unknown,
  content: unknown,
  configInput: unknown = {},
): ApiResponse<DetectedPatterns> {
  const pathResult = validateFilePath(filePath);
  if (!apiUtils.isOk(pathResult)) {
    return pathResult as ApiResponse<DetectedPatterns>;
  }

  if (typeof content !== 'string') {
    return createApiError('VALIDATION_ERROR', 'Content must be a string');
  }

  const configResult = validateAnalysisConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<DetectedPatterns>;
  }

  const config = configResult.data;
  const file = pathResult.data;

  return safeUtils.execute(
    () => {
      const patterns: DetectedPatterns = {
        react19: detectReact19Patterns(content, config.patterns.react19),
        nextjs153: detectNextJS153Patterns(content, config.patterns.nextjs153),
        typescript58: detectTypeScript58Patterns(content, config.patterns.typescript58),
        tailwind41: detectTailwind41Patterns(content, file, config.patterns.tailwind41),
        console: detectConsolePatterns(content, config.patterns.console),
        typescriptDebt: detectTypeScriptDebtPatterns(content, config.patterns.typescriptDebt),
      };

      // Calculate modernization potential for each framework
      calculateModernizationPotential(patterns, config);

      return patterns;
    },
    'PATTERN_DETECTION_ERROR',
    contextUtils.fileContext('detectPatterns', file),
  );
}

/**
 * Analyze single file
 */
export function analyzeFile(
  filePath: unknown,
  configInput: unknown = {},
): ApiResponse<FileAnalysis> {
  const pathResult = validateFilePath(filePath);
  if (!apiUtils.isOk(pathResult)) {
    return pathResult as ApiResponse<FileAnalysis>;
  }

  const configResult = validateAnalysisConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<FileAnalysis>;
  }

  const config = configResult.data;
  const file = pathResult.data;

  const envCheck = checkFileSystemEnvironment();
  if (!apiUtils.isOk(envCheck)) {
    return envCheck as ApiResponse<FileAnalysis>;
  }

  return safeUtils.execute(
    () => {
      // Read file content
      const content = fs.readFileSync(file, 'utf-8');

      // Detect patterns
      const patternsResult = detectPatterns(file, content, config);
      if (!apiUtils.isOk(patternsResult)) {
        throw new Error(patternsResult.error.message);
      }

      const detectedPatterns = patternsResult.data;

      // Calculate complexity score
      const complexityScore = calculateComplexityScore(detectedPatterns, config.complexity);

      // Determine transformation strategy
      const transformationStrategy = determineStrategy(complexityScore, detectedPatterns, config);

      // Calculate confidence metrics
      const confidenceMetrics = calculateConfidence(
        transformationStrategy,
        complexityScore,
        detectedPatterns,
      );

      // Assess risk
      const riskAssessment = calculateRisk(complexityScore, detectedPatterns);

      // Estimate duration
      const estimatedDuration = estimateDuration(
        transformationStrategy,
        complexityScore,
        detectedPatterns,
      );

      return {
        filePath: file,
        transformationStrategy,
        complexityScore,
        detectedPatterns,
        confidenceMetrics,
        riskAssessment,
        estimatedDuration,
      };
    },
    'FILE_ANALYSIS_ERROR',
    contextUtils.fileContext('analyzeFile', file),
  );
}

/**
 * Get files to analyze
 */
export async function getFilesToAnalyze(
  patternsInput: unknown,
  excludePatternsInput: unknown = [],
  rootDir: unknown = process.cwd(),
): Promise<ApiResponse<FilePath[]>> {
  const patternsResult = validateFilePatterns(patternsInput);
  if (!apiUtils.isOk(patternsResult)) {
    return patternsResult as ApiResponse<FilePath[]>;
  }

  const excludeResult = validateFilePatterns(excludePatternsInput);
  if (!apiUtils.isOk(excludeResult)) {
    return excludeResult as ApiResponse<FilePath[]>;
  }

  if (typeof rootDir !== 'string' || !rootDir.trim()) {
    return createApiError('VALIDATION_ERROR', 'Root directory must be a non-empty string');
  }

  const envCheck = checkFileSystemEnvironment();
  if (!apiUtils.isOk(envCheck)) {
    return envCheck as ApiResponse<FilePath[]>;
  }

  return safeUtils.executeAsync(
    async () => {
      const patterns = patternsResult.data;
      const exclude = excludeResult.data;

      const files = await glob(patterns, { ignore: exclude, cwd: rootDir });
      return files.map((f) => createFilePath(path.resolve(rootDir, f)));
    },
    'FILE_DISCOVERY_ERROR',
    contextUtils.sessionContext('getFilesToAnalyze', rootDir),
  );
}

/**
 * Determine transformation strategy
 */
export function determineTransformationStrategy(
  complexityScore: unknown,
  detectedPatterns: unknown,
  configInput: unknown = {},
): ApiResponse<TransformationStrategy> {
  if (typeof complexityScore !== 'number' || complexityScore < 0 || complexityScore > 1) {
    return createApiError('VALIDATION_ERROR', 'Complexity score must be a number between 0 and 1');
  }

  if (!detectedPatterns || typeof detectedPatterns !== 'object') {
    return createApiError('VALIDATION_ERROR', 'Detected patterns must be an object');
  }

  const configResult = validateAnalysisConfig(configInput);
  if (!apiUtils.isOk(configResult)) {
    return configResult as ApiResponse<TransformationStrategy>;
  }

  const config = configResult.data;
  const patterns = detectedPatterns as DetectedPatterns;

  return safeUtils.execute(
    () => {
      return determineStrategy(complexityScore, patterns, config);
    },
    'STRATEGY_DETERMINATION_ERROR',
    contextUtils.sessionContext('determineStrategy', 'system'),
  );
}

// ============================================================================
// PRIVATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get default pattern configuration
 */
function getDefaultPatterns(): PatternConfig {
  return {
    react19: {
      astPatterns: [/forwardRef/g, /useRef\(\s*\)/g],
      stringReplacements: {
        'React.FC<': '(',
        'React.FunctionComponent<': '(',
      },
      complexityWeights: {
        forwardRef: 0.5,
        useRefWithoutParam: 0.3,
        propTypes: 0.2,
      },
    },
    nextjs153: {
      astPatterns: [/cookies|headers|params/g],
      stringReplacements: {},
      complexityWeights: {
        asyncAPIUsage: 0.4,
        legacyRouter: 0.3,
      },
    },
    typescript58: {
      astPatterns: [/import\s+type/g],
      stringReplacements: {
        ' assert {': ' with {',
        'Array<string>': 'string[]',
      },
      complexityWeights: {
        importAssertions: 0.4,
        namespaceImports: 0.3,
      },
    },
    tailwind41: {
      astPatterns: [/transition/g],
      stringReplacements: {},
      complexityWeights: {
        proseClasses: 0.3,
        ring3Classes: 0.2,
      },
    },
    console: {
      astPatterns: [/\$\{/g, /Object\./g],
      stringReplacements: {
        'console.log(': 'logger.info(',
        'console.warn(': 'logger.warn(',
        'console.error(': 'logger.error(',
      },
      complexityWeights: {
        complexConsole: 0.3,
      },
    },
    typescriptDebt: {
      astPatterns: [
        /:\s*any/g,
        /as\s+\w+/g,
        /try\s*\{[^}]*\}\s*catch[^{]*\{\s*\}/g,
        /function\s+\w+\([^)]*\)(?!\s*:)/g,
        /\w+!/g,
      ],
      stringReplacements: {},
      complexityWeights: {
        anyTypeUsage: 0.5,
        unsafeAssertion: 0.4,
        emptyCatch: 0.3,
      },
    },
  };
}

/**
 * Get default complexity configuration
 */
function getDefaultComplexity(): ComplexityConfig {
  return {
    weights: {
      react: 0.3,
      nextjs: 0.3,
      typescript: 0.2,
      console: 0.1,
      typescriptDebt: 0.3,
    },
    thresholds: {
      astRequired: 0.7,
      stringPreferred: 0.4,
    },
  };
}

/**
 * Detect React 19 patterns
 */
function detectReact19Patterns(content: string, config: FrameworkPatternConfig): React19Patterns {
  return {
    hasForwardRef: config.astPatterns[0]?.test(content) || false,
    hasUseRefWithoutParam: config.astPatterns[1]?.test(content) || false,
    hasPropTypes: /PropTypes/.test(content),
    hasReactFC: /React\.(FC|FunctionComponent)/.test(content),
    hasStringRefs: /ref\s*=\s*["'][^"']+["']/.test(content),
    modernizationPotential: 0, // Will be calculated later
  };
}

/**
 * Detect Next.js 15.3 patterns
 */
function detectNextJS153Patterns(
  content: string,
  config: FrameworkPatternConfig,
): NextJS153Patterns {
  return {
    hasAsyncAPIUsage: config.astPatterns[0]?.test(content) || false,
    hasLegacyRouter: Object.keys(config.stringReplacements).some((pattern) =>
      content.includes(pattern.replace(/['"]/g, '')),
    ),
    hasImageComponent:
      /from ['"]next\/image['"]/.test(content) && /layout\s*=|objectFit\s*=/.test(content),
    hasGeoIPUsage: /request\.(geo|ip)/.test(content),
    needsAwaitInjection:
      config.astPatterns[0]?.test(content) && !/await\s+(cookies|headers|params)/.test(content),
    modernizationPotential: 0, // Will be calculated later
  };
}

/**
 * Detect TypeScript 5.8 patterns
 */
function detectTypeScript58Patterns(
  content: string,
  config: FrameworkPatternConfig,
): TypeScript58Patterns {
  return {
    hasImportAssertions: config.astPatterns[0]?.test(content) || false,
    hasNamespaceImports:
      /import\s+\*\s+as\s+/.test(content) && !/import\s+\*\s+as\s+React/.test(content),
    hasInterfaceExtends: /interface\s+\w+\s+extends\s+/.test(content),
    hasArrayGenericSyntax: Object.keys(config.stringReplacements).some((pattern) =>
      content.includes(pattern),
    ),
    modernizationPotential: 0, // Will be calculated later
  };
}

/**
 * Detect Tailwind 4.1 patterns
 */
function detectTailwind41Patterns(
  content: string,
  filePath: FilePath,
  config: FrameworkPatternConfig,
): Tailwind41Patterns {
  return {
    hasProseClasses: /\bprose-/.test(content),
    hasRing3Classes: /\bring-3\b/.test(content),
    hasBorderGrayClasses: /\bborder-gray-\d+\b/.test(content),
    hasOldTransitionSyntax: config.astPatterns[0]?.test(content) || false,
    hasTailwindDirectives: filePath.endsWith('.css') && /@apply|@tailwind/.test(content),
    modernizationPotential: 0, // Will be calculated later
  };
}

/**
 * Detect console patterns
 */
function detectConsolePatterns(content: string, config: FrameworkPatternConfig): ConsolePatterns {
  const hasComplex = config.astPatterns.some((pattern) => pattern.test(content));

  return {
    hasSimpleConsole: /console\.(log|error|warn|info|debug|trace)\s*\(\s*[^,)]+\s*\)/.test(content),
    hasComplexConsole: hasComplex,
    hasTemplateLiterals: config.astPatterns[0]?.test(content) || false,
    hasObjectMethods: config.astPatterns[1]?.test(content) || false,
    migrationComplexity: hasComplex ? 'complex' : 'simple',
  };
}

/**
 * Detect TypeScript debt patterns
 */
function detectTypeScriptDebtPatterns(
  content: string,
  config: FrameworkPatternConfig,
): TypeScriptDebtPatterns {
  const hasAnyTypes = config.astPatterns[0]?.test(content) || false;
  const hasUnsafeAssertions = config.astPatterns[1]?.test(content) || false;
  const hasEmptyCatchBlocks = config.astPatterns[2]?.test(content) || false;
  const hasMissingReturnTypes = config.astPatterns[3]?.test(content) || false;
  const hasNonNullAssertions = config.astPatterns[4]?.test(content) || false;

  let severityScore = 0;
  if (hasAnyTypes) severityScore += config.complexityWeights.anyTypeUsage || 0.5;
  if (hasUnsafeAssertions) severityScore += config.complexityWeights.unsafeAssertion || 0.4;
  if (hasEmptyCatchBlocks) severityScore += config.complexityWeights.emptyCatch || 0.3;

  let typeSafetyGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (severityScore < 0.1) typeSafetyGrade = 'A';
  else if (severityScore < 0.25) typeSafetyGrade = 'B';
  else if (severityScore < 0.5) typeSafetyGrade = 'C';
  else if (severityScore < 0.75) typeSafetyGrade = 'D';
  else typeSafetyGrade = 'F';

  return {
    hasAnyTypes,
    hasUnsafeAssertions,
    hasEmptyCatchBlocks,
    hasNonNullAssertions,
    hasMissingReturnTypes,
    hasStrictModeViolations: /var\s+\w+/.test(content) || /\w+\.length\s*==\s*0/.test(content),
    hasImplicitAny: /:\s*any\b/.test(content),
    hasUntypedObjects: /=\s*{[^}]*}\s*;/.test(content),
    hasTodoComments: /\/\/\s*TODO/.test(content),
    hasOutdatedSyntax: /Array<\w+>/.test(content),
    severityScore,
    modernizationPotential: 0, // Will be calculated later
    typeSafetyGrade,
  };
}

/**
 * Calculate modernization potential
 */
function calculateModernizationPotential(patterns: DetectedPatterns, config: AnalysisConfig): void {
  // React 19 potential
  let reactPotential = 0;
  if (patterns.react19.hasForwardRef)
    reactPotential += config.patterns.react19.complexityWeights.forwardRef || 0.5;
  if (patterns.react19.hasUseRefWithoutParam)
    reactPotential += config.patterns.react19.complexityWeights.useRefWithoutParam || 0.3;
  if (patterns.react19.hasPropTypes)
    reactPotential += config.patterns.react19.complexityWeights.propTypes || 0.2;
  (patterns.react19 as any).modernizationPotential = Math.min(1, reactPotential);

  // Next.js potential
  let nextPotential = 0;
  if (patterns.nextjs153.hasAsyncAPIUsage) nextPotential += 0.4;
  if (patterns.nextjs153.hasLegacyRouter) nextPotential += 0.3;
  if (patterns.nextjs153.hasImageComponent) nextPotential += 0.2;
  (patterns.nextjs153 as any).modernizationPotential = Math.min(1, nextPotential);

  // TypeScript potential
  let tsPotential = 0;
  if (patterns.typescript58.hasImportAssertions) tsPotential += 0.4;
  if (patterns.typescript58.hasNamespaceImports) tsPotential += 0.3;
  if (patterns.typescript58.hasInterfaceExtends) tsPotential += 0.2;
  (patterns.typescript58 as any).modernizationPotential = Math.min(1, tsPotential);

  // Tailwind potential
  let tailwindPotential = 0;
  if (patterns.tailwind41.hasProseClasses) tailwindPotential += 0.3;
  if (patterns.tailwind41.hasRing3Classes) tailwindPotential += 0.2;
  if (patterns.tailwind41.hasBorderGrayClasses) tailwindPotential += 0.2;
  (patterns.tailwind41 as any).modernizationPotential = Math.min(1, tailwindPotential);

  // TypeScript debt potential
  const debtPotential = patterns.typescriptDebt.severityScore;
  (patterns.typescriptDebt as any).modernizationPotential = Math.min(1, debtPotential);
}

/**
 * Calculate complexity score
 */
function calculateComplexityScore(
  patterns: DetectedPatterns,
  config: ComplexityConfig,
): ComplexityScore {
  let complexity = 0;
  const weights = config.weights;

  // React complexity
  if (patterns.react19.hasForwardRef) complexity += weights.react * 0.5;
  if (patterns.react19.hasUseRefWithoutParam) complexity += weights.react * 0.3;

  // Next.js complexity
  if (patterns.nextjs153.needsAwaitInjection) complexity += weights.nextjs * 0.3;
  if (patterns.nextjs153.hasGeoIPUsage) complexity += weights.nextjs * 0.2;

  // TypeScript complexity
  if (patterns.typescript58.hasImportAssertions) complexity += weights.typescript * 0.2;
  if (patterns.typescript58.hasInterfaceExtends) complexity += weights.typescript * 0.2;

  // Console complexity
  if (patterns.console.migrationComplexity === 'complex') complexity += weights.console * 0.3;

  // TypeScript debt complexity
  if (patterns.typescriptDebt.hasAnyTypes) complexity += weights.typescriptDebt * 0.5;
  if (patterns.typescriptDebt.hasUnsafeAssertions) complexity += weights.typescriptDebt * 0.4;

  return Math.min(1, complexity) as ComplexityScore;
}

/**
 * Determine transformation strategy
 */
function determineStrategy(
  complexityScore: number,
  patterns: DetectedPatterns,
  config: AnalysisConfig,
): TransformationStrategy {
  // Skip if no modernization potential
  const totalPotential =
    patterns.react19.modernizationPotential +
    patterns.nextjs153.modernizationPotential +
    patterns.typescript58.modernizationPotential +
    patterns.tailwind41.modernizationPotential +
    patterns.typescriptDebt.modernizationPotential +
    (patterns.console.hasSimpleConsole || patterns.console.hasComplexConsole ? 1 : 0);

  if (totalPotential === 0) {
    return TransformationStrategy.IN_PLACE; // Use canonical enum
  }

  // Force AST for high-risk patterns
  if (
    patterns.typescriptDebt.hasAnyTypes ||
    patterns.typescriptDebt.hasUnsafeAssertions ||
    patterns.typescriptDebt.severityScore > 0.6
  ) {
    return TransformationStrategy.CREATE_NEW; // Use canonical enum
  }

  // Use HYBRID for high complexity
  if (
    complexityScore > config.complexity.thresholds.astRequired ||
    patterns.react19.hasForwardRef ||
    patterns.nextjs153.needsAwaitInjection ||
    patterns.console.migrationComplexity === 'complex'
  ) {
    return TransformationStrategy.HYBRID; // Use canonical enum
  }

  // Use COPY_MODIFY for moderate patterns
  return complexityScore > config.complexity.thresholds.stringPreferred
    ? TransformationStrategy.COPY_MODIFY
    : TransformationStrategy.IN_PLACE;
}

/**
 * Calculate confidence metrics
 */
function calculateConfidence(
  strategy: TransformationStrategy,
  complexityScore: number,
  patterns: DetectedPatterns,
): ConfidenceMetrics {
  // Base confidence decreases with complexity
  let transformationAccuracy = Math.max(0.7, 1 - complexityScore * 0.4);

  // Adjust based on strategy appropriateness
  if (strategy === TransformationStrategy.HYBRID && complexityScore > 0.5) {
    transformationAccuracy = Math.min(transformationAccuracy + 0.1, 0.95);
  } else if (strategy === TransformationStrategy.IN_PLACE && complexityScore < 0.3) {
    transformationAccuracy = Math.min(transformationAccuracy + 0.15, 0.98);
  }

  // Safety score based on known patterns
  let safetyScore = 0.9;
  if (patterns.react19.hasForwardRef) safetyScore -= 0.1;
  if (patterns.nextjs153.needsAwaitInjection) safetyScore -= 0.1;
  if (patterns.typescriptDebt.hasAnyTypes) safetyScore -= 0.15;

  const overallConfidence = (transformationAccuracy + safetyScore) / 2;

  return {
    transformationAccuracy: Math.max(0.5, transformationAccuracy) as ConfidenceScore,
    safetyScore: Math.max(0.5, safetyScore) as ConfidenceScore,
    overallConfidence: Math.max(0.6, overallConfidence) as ConfidenceScore,
  };
}

/**
 * Calculate risk assessment
 */
function calculateRisk(complexityScore: number, patterns: DetectedPatterns): FileRiskAssessment {
  let breakingChangeProbability = complexityScore * 0.6;

  // Add risk factors
  if (patterns.react19.hasForwardRef) breakingChangeProbability += 0.2;
  if (patterns.nextjs153.needsAwaitInjection) breakingChangeProbability += 0.15;
  if (patterns.typescriptDebt.hasAnyTypes) breakingChangeProbability += 0.1;

  const rollbackComplexity = Math.min(0.9, complexityScore + 0.2);

  const performanceImpact: 'positive' | 'neutral' | 'negative' =
    patterns.console.hasSimpleConsole || patterns.typescriptDebt.modernizationPotential > 0.3
      ? 'positive'
      : 'neutral';

  return {
    breakingChangeProbability: Math.min(0.9, breakingChangeProbability),
    performanceImpact,
    rollbackComplexity,
  };
}

/**
 * Estimate transformation duration
 */
function estimateDuration(
  strategy: TransformationStrategy,
  complexityScore: number,
  patterns: DetectedPatterns,
): number {
  const baseTime = strategy === TransformationStrategy.HYBRID ? 0.8 : 0.2; // seconds
  let complexityMultiplier = 1 + complexityScore * 2;

  // Additional time for TypeScript debt complexity
  if (patterns.typescriptDebt.severityScore > 0.5) {
    complexityMultiplier += 0.5;
  }

  return baseTime * complexityMultiplier;
}
