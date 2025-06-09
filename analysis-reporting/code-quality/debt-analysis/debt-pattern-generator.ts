import { } from '';
import { RiskLevel } from '../types/canonical-types';


/**
 * Test Samples Factory - TypeScript Debt Pattern Generator
 *
 * @fileoverview SOLID-compliant factory for generating TypeScript debt test patterns
 * - SRP: Each factory class generates specific debt pattern types
 * - OCP: Open for extension via strategy pattern
 * - LSP: Substitutable debt pattern generators
 * - ISP: Interface segregation for different debt concerns
 * - DIP: Dependency inversion for debt pattern creation
 *
 * Replaces: test-ts-samples.ts, more-obvious-issues.ts, test-file-with-issues.ts (consolidated)
 */

// ============================================================================
// DEBT PATTERN ABSTRACTIONS (Interface Segregation)
// ============================================================================

interface DebtPattern {
  readonly id: string;
  readonly category: DebtCategory;
  readonly severity: DebtSeverity;
  readonly description: string;
  readonly codeSnippet: string;
  readonly fixSuggestion: string;
}

interface DebtPatternGenerator {
  generate(): DebtPattern;
  generateMultiple(count: number): readonly DebtPattern[];
}

interface DebtReportGenerator {
  generateReport(patterns: readonly DebtPattern[]): DebtReport;
}

interface CodeSampleFactory {
  createSample(patterns: readonly DebtPattern[]): string;
}

// ============================================================================
// VALUE OBJECTS (Immutable)
// ============================================================================

type DebtCategory =
  | 'TYPE_SAFETY'
  | 'ERROR_HANDLING'
  | 'CODE_QUALITY'
  | 'PERFORMANCE'
  | 'MAINTAINABILITY'
  | 'SYNTAX_MODERNIZATION';

type DebtSeverity = RiskLevel.CRITICAL | RiskLevel.HIGH | RiskLevel.MEDIUM | RiskLevel.LOW;

interface DebtReport {
  readonly totalPatterns: number;
  readonly severityDistribution: Record<DebtSeverity, number>;
  readonly categoryDistribution: Record<DebtCategory, number>;
  readonly patterns: readonly DebtPattern[];
  readonly recommendations: readonly string[];
  readonly estimatedFixTime: number; // in minutes
}

interface DebtMetrics {
  readonly debtScore: number; // 0-10 scale
  readonly technicalDebtRatio: number; // 0-1 scale
  readonly maintainabilityIndex: number; // 0-100 scale
  readonly codeSmellCount: number;
}

// ============================================================================
// DEBT PATTERN CATALOG (Single Responsibility)
// ============================================================================

class TypeSafetyDebtGenerator implements DebtPatternGenerator {
  private static readonly PATTERNS = [
    {
      id: 'ANY_TYPE_USAGE',
      description: 'Using any type instead of specific types',
      codeSnippet: 'const userData: any = { name: "John", age: 30 };',
      fixSuggestion: 'Define proper interface: interface User { name: string; age: number; }',
    },
    {
      id: 'UNSAFE_TYPE_ASSERTION',
      description: 'Type assertion without validation',
      codeSnippet: 'const user = data as User;',
      fixSuggestion: 'Add type guard: if (isUser(data)) { const user = data; }',
    },
    {
      id: 'NON_NULL_ASSERTION',
      description: 'Non-null assertion without safety checks',
      codeSnippet: 'const element = document.getElementById(id)!;',
      fixSuggestion:
        'Add null check: const element = document.getElementById(id); if (!element) return;',
    },
    {
      id: 'MISSING_RETURN_TYPE',
      description: 'Function without explicit return type',
      codeSnippet:
        'function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }',
      fixSuggestion: 'Add return type: function calculateTotal(items: Item[]): number',
    },
    {
      id: 'RECORD_STRING_ANY',
      description: 'Using Record<string, any> instead of specific types',
      codeSnippet: 'const config: Record<string, any> = {};',
      fixSuggestion: 'Define specific interface or use Record<string, unknown>',
    },
  ];

  generate(): DebtPattern {
    const template =
      TypeSafetyDebtGenerator.PATTERNS[
        Math.floor(Math.random() * TypeSafetyDebtGenerator.PATTERNS.length)
      ];

    return {
      ...template,
      category: 'TYPE_SAFETY',
      severity: this.calculateSeverity(template.id),
    };
  }

  generateMultiple(count: number): readonly DebtPattern[] {
    return Array.from({ length: count }, () => this.generate());
  }

  private calculateSeverity(patternId: string): DebtSeverity {
    const severityMap: Record<string, DebtSeverity> = {
      ANY_TYPE_USAGE: RiskLevel.HIGH,
      UNSAFE_TYPE_ASSERTION: RiskLevel.CRITICAL,
      NON_NULL_ASSERTION: RiskLevel.HIGH,
      MISSING_RETURN_TYPE: RiskLevel.MEDIUM,
      RECORD_STRING_ANY: RiskLevel.MEDIUM,
    };
    return severityMap[patternId] || RiskLevel.LOW;
  }
}

class ErrorHandlingDebtGenerator implements DebtPatternGenerator {
  private static readonly PATTERNS = [
    {
      id: 'EMPTY_CATCH_BLOCK',
      description: 'Empty catch block swallowing errors',
      codeSnippet: 'try { riskyOperation(); } catch (error) { /* empty */ }',
      fixSuggestion:
        'Add proper error handling: catch (error) { logger.error("Operation failed", error); }',
    },
    {
      id: 'MISSING_ERROR_HANDLING',
      description: 'Async operation without error handling',
      codeSnippet: 'const data = await fetch("/api/data").then(res => res.json());',
      fixSuggestion:
        'Add error handling: try { const data = await fetch("/api/data").then(res => res.json()); } catch (error) { handleError(error); }',
    },
    {
      id: 'UNSAFE_DIVISION',
      description: 'Division without zero check',
      codeSnippet: 'function divide(a: number, b: number) { return a / b; }',
      fixSuggestion: 'Add validation: if (b === 0) throw new Error("Division by zero");',
    },
    {
      id: 'UNSAFE_ARRAY_ACCESS',
      description: 'Array access without bounds checking',
      codeSnippet: 'const firstItem = items[0].value;',
      fixSuggestion:
        'Add bounds check: const firstItem = items.length > 0 ? items[0].value : undefined;',
    },
  ];

  generate(): DebtPattern {
    const template =
      ErrorHandlingDebtGenerator.PATTERNS[
        Math.floor(Math.random() * ErrorHandlingDebtGenerator.PATTERNS.length)
      ];

    return {
      ...template,
      category: 'ERROR_HANDLING',
      severity: this.calculateSeverity(template.id),
    };
  }

  generateMultiple(count: number): readonly DebtPattern[] {
    return Array.from({ length: count }, () => this.generate());
  }

  private calculateSeverity(patternId: string): DebtSeverity {
    const severityMap: Record<string, DebtSeverity> = {
      EMPTY_CATCH_BLOCK: RiskLevel.HIGH,
      MISSING_ERROR_HANDLING: RiskLevel.MEDIUM,
      UNSAFE_DIVISION: RiskLevel.MEDIUM,
      UNSAFE_ARRAY_ACCESS: RiskLevel.HIGH,
    };
    return severityMap[patternId] || RiskLevel.LOW;
  }
}

class CodeQualityDebtGenerator implements DebtPatternGenerator {
  private static readonly PATTERNS = [
    {
      id: 'CONSOLE_STATEMENTS',
      description: 'Console statements left in production code',
      codeSnippet: 'console.log("Debug: processing data", data);',
      fixSuggestion: 'Replace with proper logging: logger.info("Processing data", { data });',
    },
    {
      id: 'TODO_COMMENTS',
      description: 'TODO comments indicating incomplete implementation',
      codeSnippet: '/ TODO: Implement proper authentication',
      fixSuggestion: 'Complete implementation or create proper ticket',
    },
    {
      id: 'LOOSE_EQUALITY',
      description: 'Using loose equality operators',
      codeSnippet: 'if (value == null) { return; }',
      fixSuggestion: 'Use strict equality: if (value === null || value === undefined) { return; }',
    },
    {
      id: 'UNTYPED_OBJECT',
      description: 'Object without type annotation',
      codeSnippet: 'const config = { apiUrl: "https:/api.example.com", timeout: 5000 };',
      fixSuggestion: 'Add type annotation: const config: ApiConfig = { ... }',
    },
  ];

  generate(): DebtPattern {
    const template =
      CodeQualityDebtGenerator.PATTERNS[
        Math.floor(Math.random() * CodeQualityDebtGenerator.PATTERNS.length)
      ];

    return {
      ...template,
      category: 'CODE_QUALITY',
      severity: this.calculateSeverity(template.id),
    };
  }

  generateMultiple(count: number): readonly DebtPattern[] {
    return Array.from({ length: count }, () => this.generate());
  }

  private calculateSeverity(patternId: string): DebtSeverity {
    const severityMap: Record<string, DebtSeverity> = {
      CONSOLE_STATEMENTS: RiskLevel.LOW,
      TODO_COMMENTS: RiskLevel.MEDIUM,
      LOOSE_EQUALITY: RiskLevel.MEDIUM,
      UNTYPED_OBJECT: RiskLevel.LOW,
    };
    return severityMap[patternId] || RiskLevel.LOW;
  }
}

class SyntaxModernizationDebtGenerator implements DebtPatternGenerator {
  private static readonly PATTERNS = [
    {
      id: 'ARRAY_TYPE_SYNTAX',
      description: 'Using Array<T> instead of T[] syntax',
      codeSnippet: 'type ButtonVariants = Array<string>;',
      fixSuggestion: 'Use T[] syntax: type ButtonVariants = string[];',
    },
    {
      id: 'OBJECT_ASSIGN_USAGE',
      description: 'Using Object.assign instead of spread operator',
      codeSnippet: 'const merged = Object.assign({}, defaults, options);',
      fixSuggestion: 'Use spread operator: const merged = { ...defaults, ...options };',
    },
    {
      id: 'VAR_DECLARATION',
      description: 'Using var instead of const/let',
      codeSnippet: 'var count = 0;',
      fixSuggestion: 'Use const or let: const count = 0;',
    },
    {
      id: 'FUNCTION_DECLARATION',
      description: 'Using function declaration in inappropriate context',
      codeSnippet: 'function handleClick() { /* ... */ }',
      fixSuggestion: 'Use arrow function: const handleClick = () => { /* ... */ };',
    },
  ];

  generate(): DebtPattern {
    const template =
      SyntaxModernizationDebtGenerator.PATTERNS[
        Math.floor(Math.random() * SyntaxModernizationDebtGenerator.PATTERNS.length)
      ];

    return {
      ...template,
      category: 'SYNTAX_MODERNIZATION',
      severity: RiskLevel.LOW, // Syntax modernization is generally low severity
    };
  }

  generateMultiple(count: number): readonly DebtPattern[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

// ============================================================================
// DEBT REPORT GENERATOR (Single Responsibility)
// ============================================================================

class ProductionDebtReportGenerator implements DebtReportGenerator {
  generateReport(patterns: readonly DebtPattern[]): DebtReport {
    const severityDistribution = this.calculateSeverityDistribution(patterns);
    const categoryDistribution = this.calculateCategoryDistribution(patterns);
    const recommendations = this.generateRecommendations(patterns);
    const estimatedFixTime = this.calculateEstimatedFixTime(patterns);

    return {
      totalPatterns: patterns.length,
      severityDistribution,
      categoryDistribution,
      patterns,
      recommendations,
      estimatedFixTime,
    };
  }

  private calculateSeverityDistribution(
    patterns: readonly DebtPattern[],
  ): Record<DebtSeverity, number> {
    const distribution: Record<DebtSeverity, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    patterns.forEach((pattern) => {
      distribution[pattern.severity]++;
    });

    return distribution;
  }

  private calculateCategoryDistribution(
    patterns: readonly DebtPattern[],
  ): Record<DebtCategory, number> {
    const distribution: Record<DebtCategory, number> = {
      TYPE_SAFETY: 0,
      ERROR_HANDLING: 0,
      CODE_QUALITY: 0,
      PERFORMANCE: 0,
      MAINTAINABILITY: 0,
      SYNTAX_MODERNIZATION: 0,
    };

    patterns.forEach((pattern) => {
      distribution[pattern.category]++;
    });

    return distribution;
  }

  private generateRecommendations(patterns: readonly DebtPattern[]): readonly string[] {
    const recommendations: string[] = [];
    const severityDistribution = this.calculateSeverityDistribution(patterns);

    if (severityDistribution.CRITICAL > 0) {
      recommendations.push('Address CRITICAL issues immediately before deployment');
    }

    if (severityDistribution.HIGH > 0) {
      recommendations.push('Plan HIGH severity fixes in next sprint');
    }

    if (severityDistribution.MEDIUM > 0) {
      recommendations.push('Schedule MEDIUM severity fixes in upcoming iterations');
    }

    const categoryDistribution = this.calculateCategoryDistribution(patterns);

    if (categoryDistribution.TYPE_SAFETY > 5) {
      recommendations.push('Consider enabling stricter TypeScript compiler options');
    }

    if (categoryDistribution.ERROR_HANDLING > 3) {
      recommendations.push('Implement comprehensive error handling strategy');
    }

    return recommendations;
  }

  private calculateEstimatedFixTime(patterns: readonly DebtPattern[]): number {
    const timePerSeverity: Record<DebtSeverity, number> = {
      CRITICAL: 60, // 1 hour
      HIGH: 30, // 30 minutes
      MEDIUM: 15, // 15 minutes
      LOW: 5, // 5 minutes
    };

    return patterns.reduce((total, pattern) => {
      return total + timePerSeverity[pattern.severity];
    }, 0);
  }
}

// ============================================================================
// CODE SAMPLE FACTORY (Composition Pattern)
// ============================================================================

class TypeScriptCodeSampleFactory implements CodeSampleFactory {
  createSample(patterns: readonly DebtPattern[]): string {
    const header = this.generateHeader();
    const imports = this.generateImports();
    const patternSections = patterns.map((pattern) => this.generatePatternSection(pattern));
    const footer = this.generateFooter(patterns);

    return [header, imports, '', ...patternSections, '', footer].join('\n');
  }

  private generateHeader(): string {
    return `/**
 * Generated TypeScript Debt Patterns Sample
 *
 * This file contains intentional TypeScript issues for debt detection testing.
 * Generated on: ${new Date().toISOString()}
 */`;
  }

  private generateImports(): string {
    return `
// Mock logger for examples
interface Logger {
  info(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
}

const logger: Logger = {
  info: console.log,
  error: console.error
};`;
  }

  private generatePatternSection(pattern: DebtPattern): string {
    return `
/ ${pattern.category} - ${pattern.severity}
// Issue: ${pattern.description}
// Fix: ${pattern.fixSuggestion}
${pattern.codeSnippet}
`;
  }

  private generateFooter(patterns: readonly DebtPattern[]): string {
    const severityCount = patterns.reduce(
      (acc, pattern) => {
        acc[pattern.severity] = (acc[pattern.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const summary = Object.entries(severityCount)
      .map(([severity, count]) => `/   ${severity}: ${count}`)
      .join('\n');

    return `
// ============================================================================
// DEBT SUMMARY
// ============================================================================
// Total patterns: ${patterns.length}
${summary}
/
// This file is generated for testing purposes only.
// Run the debt analyzer to identify and fix these issues.

export {}; // Make this a module`;
  }
}

// ============================================================================
// DEBT ANALYZER (Strategy Pattern)
// ============================================================================

class DebtAnalyzer {
  constructor(
    private readonly generators: readonly DebtPatternGenerator[],
    private readonly reportGenerator: DebtReportGenerator,
    private readonly sampleFactory: CodeSampleFactory,
  ) {}

  analyzePatterns(config: AnalysisConfig): AnalysisResult {
    const patterns: DebtPattern[] = [];

    // Generate patterns from all generators
    this.generators.forEach((generator) => {
      const count = config.patternsPerCategory;
      patterns.push(...generator.generateMultiple(count));
    });

    // Shuffle patterns for realistic distribution
    const shuffledPatterns = this.shuffleArray(patterns);

    // Generate report
    const report = this.reportGenerator.generateReport(shuffledPatterns);

    // Calculate metrics
    const metrics = this.calculateMetrics(shuffledPatterns);

    // Generate code sample
    const codeSample = this.sampleFactory.createSample(shuffledPatterns.slice(0, 10)); // Limit for readability

    return {
      patterns: shuffledPatterns,
      report,
      metrics,
      codeSample,
      generatedAt: new Date().toISOString(),
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateMetrics(patterns: readonly DebtPattern[]): DebtMetrics {
    const severityWeights: Record<DebtSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const totalWeight = patterns.reduce((sum, pattern) => {
      return sum + severityWeights[pattern.severity];
    }, 0);

    const maxPossibleWeight = patterns.length * severityWeights.CRITICAL;
    const debtScore = (totalWeight / maxPossibleWeight) * 10;

    // Technical debt ratio (0-1 scale)
    const technicalDebtRatio = Math.min(patterns.length / 100, 1); // Normalize to 100 patterns max

    // Maintainability index (inverse of debt score, scaled to 0-100)
    const maintainabilityIndex = Math.max(0, 100 - debtScore * 10);

    return {
      debtScore: Math.round(debtScore * 100) / 100,
      technicalDebtRatio: Math.round(technicalDebtRatio * 100) / 100,
      maintainabilityIndex: Math.round(maintainabilityIndex),
      codeSmellCount: patterns.length,
    };
  }
}

// ============================================================================
// CONFIGURATION AND RESULT TYPES
// ============================================================================

interface AnalysisConfig {
  readonly patternsPerCategory: number;
  readonly includeSamples: boolean;
  readonly severityFilter?: DebtSeverity[];
  readonly categoryFilter?: DebtCategory[];
}

interface AnalysisResult {
  readonly patterns: readonly DebtPattern[];
  readonly report: DebtReport;
  readonly metrics: DebtMetrics;
  readonly codeSample: string;
  readonly generatedAt: string;
}

// ============================================================================
// FACTORY BUILDER (Builder Pattern)
// ============================================================================

class DebtAnalyzerBuilder {
  private generators: DebtPatternGenerator[] = [];
  private reportGenerator: DebtReportGenerator = new ProductionDebtReportGenerator();
  private sampleFactory: CodeSampleFactory = new TypeScriptCodeSampleFactory();

  withTypeSafetyDebt(): this {
    this.generators.push(new TypeSafetyDebtGenerator());
    return this;
  }

  withErrorHandlingDebt(): this {
    this.generators.push(new ErrorHandlingDebtGenerator());
    return this;
  }

  withCodeQualityDebt(): this {
    this.generators.push(new CodeQualityDebtGenerator());
    return this;
  }

  withSyntaxModernizationDebt(): this {
    this.generators.push(new SyntaxModernizationDebtGenerator());
    return this;
  }

  withAllDebtTypes(): this {
    return this.withTypeSafetyDebt()
      .withErrorHandlingDebt()
      .withCodeQualityDebt()
      .withSyntaxModernizationDebt();
  }

  withCustomReportGenerator(generator: DebtReportGenerator): this {
    this.reportGenerator = generator;
    return this;
  }

  withCustomSampleFactory(factory: CodeSampleFactory): this {
    this.sampleFactory = factory;
    return this;
  }

  build(): DebtAnalyzer {
    if (this.generators.length === 0) {
      throw new Error('At least one debt pattern generator must be specified');
    }

    return new DebtAnalyzer(this.generators, this.reportGenerator, this.sampleFactory);
  }
}

// ============================================================================
// CONVENIENCE FACTORIES (Facade Pattern)
// ============================================================================

export class TestSamplesFactory {
  static createStandardAnalyzer(): DebtAnalyzer {
    return new DebtAnalyzerBuilder().withAllDebtTypes().build();
  }

  static createTypeSafetyAnalyzer(): DebtAnalyzer {
    return new DebtAnalyzerBuilder().withTypeSafetyDebt().build();
  }

  static createMinimalSample(patternCount: number = 5): string {
    const analyzer = TestSamplesFactory.createStandardAnalyzer();
    const config: AnalysisConfig = {
      patternsPerCategory: Math.ceil(patternCount / 4), // Distribute across 4 categories
      includeSamples: true,
    };

    const result = analyzer.analyzePatterns(config);
    return result.codeSample;
  }

  static createComprehensiveAnalysis(config?: Partial<AnalysisConfig>): AnalysisResult {
    const analyzer = TestSamplesFactory.createStandardAnalyzer();
    const defaultConfig: AnalysisConfig = {
      patternsPerCategory: 3,
      includeSamples: true,
      ...config,
    };

    return analyzer.analyzePatterns(defaultConfig);
  }

  static createCriticalIssuesSample(): string {
    const criticalPatterns: DebtPattern[] = [
      {
        id: 'CRITICAL_ANY_USAGE',
        category: 'TYPE_SAFETY',
        severity: RiskLevel.CRITICAL,
        description: 'Critical any type usage in API boundary',
        codeSnippet: 'export const processApiData = (data: any): any => { return data.result; }',
        fixSuggestion: 'Define proper interfaces for API data',
      },
      {
        id: 'CRITICAL_ERROR_SWALLOW',
        category: 'ERROR_HANDLING',
        severity: RiskLevel.CRITICAL,
        description: 'Critical error swallowing in async operation',
        codeSnippet: 'async function saveData(data) { try { await api.save(data); } catch {} }',
        fixSuggestion: 'Add proper error handling and logging',
      },
      {
        id: 'CRITICAL_NULL_ASSERTION',
        category: 'TYPE_SAFETY',
        severity: RiskLevel.CRITICAL,
        description: 'Dangerous non-null assertion on external data',
        codeSnippet: 'const userId = externalData.user.id!;',
        fixSuggestion: 'Add proper null checking before access',
      },
    ];

    const factory = new TypeScriptCodeSampleFactory();
    return factory.createSample(criticalPatterns);
  }
}

// ============================================================================
// TEST UTILITIES (Testing Support)
// ============================================================================

export class DebtPatternTestUtils {
  static createMockPattern(overrides?: Partial<DebtPattern>): DebtPattern {
    return {
      id: 'MOCK_PATTERN',
      category: 'TYPE_SAFETY',
      severity: RiskLevel.MEDIUM,
      description: 'Mock debt pattern for testing',
      codeSnippet: 'const value: any = getData();',
      fixSuggestion: 'Add proper type annotation',
      ...overrides,
    };
  }

  static createMockAnalysisConfig(overrides?: Partial<AnalysisConfig>): AnalysisConfig {
    return {
      patternsPerCategory: 2,
      includeSamples: true,
      ...overrides,
    };
  }

  static validateDebtPattern(pattern: DebtPattern): boolean {
    return !!(
      pattern.id &&
      pattern.category &&
      pattern.severity &&
      pattern.description &&
      pattern.codeSnippet &&
      pattern.fixSuggestion
    );
  }

  static calculateSeverityScore(patterns: readonly DebtPattern[]): number {
    const weights: Record<DebtSeverity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return patterns.reduce((score, pattern) => score + weights[pattern.severity], 0);
  }
}

// ============================================================================
// PREDEFINED SAMPLES (Constants)
// ============================================================================

export const SAMPLE_DEBT_PATTERNS = {
  OBVIOUS_ISSUES: `
/**
 * Obvious TypeScript Issues Sample
 * Contains the most common and easily detectable debt patterns
 */

// ISSUE: ANY TYPE
const userData: any = { name: 'John', age: 30 };

// ISSUE: RECORD<STRING, ANY>
const config: Record<string, any> = {};

// ISSUE: ANY ARRAY
const items: any[] = [];

// ISSUE: TYPE ASSERTION WITHOUT VALIDATION
const user = apiResponse as User;

// ISSUE: NON-NULL ASSERTION
function getName(user?: { name?: string }): string {
  return user!.name!;
}

// ISSUE: EMPTY CATCH BLOCK
try {
  riskyOperation();
} catch (e) {
  // Empty catch block
}

// ISSUE: CONSOLE STATEMENTS
console.log('Debug info', userData);
console.error('Something went wrong');

// ISSUE: LOOSE EQUALITY
if (value == null) {
  return;
}

// ISSUE: TODO COMMENT
// TODO: Fix this implementation

export { userData, config, items, user, getName };
`,

  SUBTLE_ISSUES: `
/**
 * Subtle TypeScript Issues Sample
 * Contains harder to detect debt patterns that require deeper analysis
 */

// ISSUE: Function overloads without proper implementation
function processData(input: string): string;
function processData(input: number): number;
function processData(input: any): any {
  return input;
}

// ISSUE: Overly permissive generic constraints
function transform<T extends any>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// ISSUE: Implicit any in complex expressions
const calculations = items.map(item =>
  item.values.reduce((sum, val) => sum + val.amount)
);

// ISSUE: Unsafe property access chains
const result = data?.user?.profile?.settings?.theme?.color;

// ISSUE: Missing error boundaries in promise chains
fetch('/api/data')
  .then(res => res.json())
  .then(data => processData(data))
  .then(result => updateUI(result));

export { processData, transform, calculations, result };
`,

  CRITICAL_ISSUES: TestSamplesFactory.createCriticalIssuesSample(),
};

// ============================================================================
// PUBLIC API EXPORTS
// ============================================================================
