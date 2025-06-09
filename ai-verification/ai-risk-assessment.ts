/**
 * AI Risk Assessment Engine
 *
 * Pure risk assessment functionality following constitutional requirements.
 * Uses canonical types only, validates all inputs, returns via factory patterns.
 */

import {
  ApiResponse,
  BusinessDomain,
  ConfidenceScore,
  FilePath,
  RiskLevel,
  RiskFactorType,
  RiskFactor,
  CascadeEffect,
  BusinessContext,
  AssessmentInput,
  RiskAssessmentResult,
  CascadeType,
  createApiSuccess,
  createApiError
} from '@/types/canonical-types';

// ============================================================================
// RISK ASSESSMENT ENGINE
// ============================================================================

// ============================================================================
// RISK ASSESSMENT ENGINE
// ============================================================================

/**
 * Validates and normalizes risk score to 0-100 scale
 */
function createRiskScore(value: number): ApiResponse<number> {
  if (typeof value !== 'number' || isNaN(value)) {
    return createApiError('VALIDATION_ERROR', 'Risk score must be a valid number');
  }

  if (value < 0 || value > 100) {
    return createApiError('VALIDATION_ERROR', 'Risk score must be between 0 and 100');
  }

  return createApiSuccess(Math.round(value * 10) / 10);
}

/**
 * Converts risk score to risk level using canonical thresholds
 */
function riskScoreToLevel(score: number): RiskLevel {
  if (score >= 85) return RiskLevel.CRITICAL;
  if (score >= 60) return RiskLevel.HIGH;
  if (score >= 35) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

/**
 * Risk factor analyzer - pure functions with validation
 */
class RiskFactorAnalyzer {
  static analyze(input: AssessmentInput): ApiResponse<readonly RiskFactor[]> {
    try {
      const factors: RiskFactor[] = [];

      // Analyze all risk factor types
      const asyncResult = this.analyzeAsyncComplexity(input);
      if (asyncResult.success && asyncResult.data) factors.push(asyncResult.data);

      const typeSafetyResult = this.analyzeTypeSafety(input);
      if (typeSafetyResult.success && typeSafetyResult.data) factors.push(typeSafetyResult.data);

      const componentResult = this.analyzeComponentComplexity(input);
      if (componentResult.success && componentResult.data) factors.push(componentResult.data);

      const dependencyResult = this.analyzeExternalDependencies(input);
      if (dependencyResult.success && dependencyResult.data) factors.push(dependencyResult.data);

      const businessResult = this.analyzeBusinessCriticality(input);
      if (businessResult.success && businessResult.data) factors.push(businessResult.data);

      const transformationResult = this.analyzeTransformationCount(input);
      if (transformationResult.success && transformationResult.data)
        factors.push(transformationResult.data);

      const patternResult = this.analyzePatternComplexity(input);
      if (patternResult.success && patternResult.data) factors.push(patternResult.data);

      // Filter out zero-value factors
      const validFactors = factors.filter((factor) => factor.value > 0);

      return createApiSuccess(validFactors);
    } catch (error) {
      return createApiError('ANALYSIS_ERROR', 'Risk factor analysis failed', {
        error,
      });
    }
  }

  private static analyzeAsyncComplexity(input: AssessmentInput): ApiResponse<RiskFactor> {
    const content = input.content;
    let complexity = 0;
    const confidence = 0.9;

    // Check for async patterns
    if (content.includes('async') || content.includes('Promise')) {
      complexity += 0.4;
    }
    if (content.includes('await') && content.includes('try')) {
      complexity += 0.2;
    }
    if (content.includes('.then(') || content.includes('.catch(')) {
      complexity += 0.3;
    }
    if (content.includes('Promise.all') || content.includes('Promise.race')) {
      complexity += 0.4;
    }

    // Check for async transformations
    const asyncTransformations = input.transformations.filter(
      (t) => t.type === 'async' || t.patterns.some((p) => p.includes('async')),
    );
    complexity += asyncTransformations.length * 0.1;

    const factor: RiskFactor = {
      type: RiskFactorType.ASYNC_COMPLEXITY,
      weight: 0.3,
      value: Math.min(complexity, 1),
      description: 'Complexity introduced by asynchronous code patterns',
      confidence: confidence as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static analyzeTypeSafety(input: AssessmentInput): ApiResponse<RiskFactor> {
    const content = input.content;
    let unsafetyScore = 0;
    const confidence = 0.95;

    // Check for type safety issues
    if (content.includes(': any')) {
      unsafetyScore += 0.4;
    }
    if (content.includes('as any')) {
      unsafetyScore += 0.6;
    }
    if (content.includes('!.')) {
      unsafetyScore += 0.3;
    }
    if (content.includes('/ @ts-ignore')) {
      unsafetyScore += 0.8;
    }

    // Check for TypeScript debt patterns
    const tsDebtTransformations = input.transformations.filter(
      (t) => t.type === 'typescript' || t.type === 'typescriptDebt',
    );
    unsafetyScore += tsDebtTransformations.reduce((sum, t) => sum + t.count, 0) * 0.06;

    const factor: RiskFactor = {
      type: RiskFactorType.TYPE_SAFETY,
      weight: 0.25,
      value: Math.min(unsafetyScore, 1),
      description: 'Risk from type safety violations and TypeScript debt',
      confidence: confidence as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static analyzeComponentComplexity(input: AssessmentInput): ApiResponse<RiskFactor> {
    const content = input.content;
    let complexity = 0;
    const confidence = 0.8;

    // Count React hooks and patterns
    const hookMatches = content.match(/use\w+\(/g) || [];
    complexity += hookMatches.length * 0.1;

    // Check for complex patterns
    if (content.includes('forwardRef')) {
      complexity += 0.4;
    }
    if (content.includes('useImperativeHandle')) {
      complexity += 0.6;
    }
    if (content.includes('useMemo') || content.includes('useCallback')) {
      complexity += 0.2;
    }

    // Check for JSX complexity
    const jsxDepth = this.calculateJSXDepth(content);
    complexity += jsxDepth * 0.06;

    const factor: RiskFactor = {
      type: RiskFactorType.COMPONENT_COMPLEXITY,
      weight: 0.2,
      value: Math.min(complexity, 1),
      description: 'Complexity of React component patterns and structure',
      confidence: confidence as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static analyzeExternalDependencies(input: AssessmentInput): ApiResponse<RiskFactor> {
    const content = input.content;
    let dependencyRisk = 0;
    const confidence = 0.85;

    // Count import statements
    const imports = content.match(/import.*from/g) || [];
    dependencyRisk += imports.length * 0.04;

    // Check for external API calls
    if (content.includes('fetch(') || content.includes('axios')) {
      dependencyRisk += 0.4;
    }
    if (content.includes('localStorage') || content.includes('sessionStorage')) {
      dependencyRisk += 0.2;
    }

    // Check for file system operations
    if (content.includes('fs.') || content.includes('readFile') || content.includes('writeFile')) {
      dependencyRisk += 0.3;
    }

    const factor: RiskFactor = {
      type: RiskFactorType.EXTERNAL_DEPENDENCIES,
      weight: 0.15,
      value: Math.min(dependencyRisk, 1),
      description: 'Risk from external dependencies and side effects',
      confidence: confidence as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static analyzeBusinessCriticality(input: AssessmentInput): ApiResponse<RiskFactor> {
    const context = input.businessContext;
    const filePath = input.filePath;
    let criticality = 0;
    let confidence = 0.7;

    // Use business context if available
    if (context) {
      criticality = context.criticality;
      confidence = 0.9;
    } else {
      // Infer criticality from file path
      if (filePath.includes('/auth/') || filePath.includes('/login/')) {
        criticality = 0.8;
      } else if (filePath.includes('/api/') || filePath.includes('/server/')) {
        criticality = 0.7;
      } else if (filePath.includes('/component/') || filePath.includes('/page/')) {
        criticality = 0.5;
      } else if (filePath.includes('/util/') || filePath.includes('/helper/')) {
        criticality = 0.4;
      } else {
        criticality = 0.2;
      }
    }

    const factor: RiskFactor = {
      type: RiskFactorType.BUSINESS_CRITICALITY,
      weight: 0.2,
      value: Math.min(criticality, 1),
      description: 'Business impact and criticality of the component',
      confidence: confidence as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static analyzeTransformationCount(input: AssessmentInput): ApiResponse<RiskFactor> {
    const totalTransformations = input.transformations.reduce((sum, t) => sum + t.count, 0);
    const complexity = Math.min(totalTransformations / 15, 1);

    const factor: RiskFactor = {
      type: RiskFactorType.TRANSFORMATION_COUNT,
      weight: 0.18,
      value: complexity,
      description: 'Risk from the number of transformations required',
      confidence: 0.95 as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static analyzePatternComplexity(input: AssessmentInput): ApiResponse<RiskFactor> {
    let complexity = 0;
    const confidence = 0.85;

    // Analyze pattern complexity from transformations
    for (const transformation of input.transformations) {
      // High-risk patterns
      const highRiskPatterns = transformation.patterns.filter(
        (pattern) =>
          pattern.includes('any') ||
          pattern.includes('non-null') ||
          pattern.includes('Promise') ||
          pattern.includes('async') ||
          pattern.includes('forwardRef'),
      );
      complexity += highRiskPatterns.length * 0.16;

      // Medium-risk patterns
      const mediumRiskPatterns = transformation.patterns.filter(
        (pattern) =>
          pattern.includes('useState') ||
          pattern.includes('useEffect') ||
          pattern.includes('router') ||
          pattern.includes('Image'),
      );
      complexity += mediumRiskPatterns.length * 0.1;
    }

    const factor: RiskFactor = {
      type: RiskFactorType.PATTERN_COMPLEXITY,
      weight: 0.22,
      value: Math.min(complexity, 1),
      description: 'Complexity of the patterns being transformed',
      confidence: confidence as ConfidenceScore,
    };

    return createApiSuccess(factor);
  }

  private static calculateJSXDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (let i = 0; i < content.length; i++) {
      if (content[i] === '<' && content[i + 1] !== '/') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (content[i] === '<' && content[i + 1] === '/') {
        currentDepth--;
      }
    }

    return maxDepth;
  }
}

/**
 * Risk score calculator - pure function with validation
 */
class RiskScoreCalculator {
  static calculate(factors: readonly RiskFactor[]): ApiResponse<number> {
    if (factors.length === 0) {
      return createApiSuccess(0);
    }

    try {
      // Weighted sum of all risk factors
      const weightedSum = factors.reduce((sum, factor) => {
        return sum + factor.weight * factor.value * factor.confidence;
      }, 0);

      // Total possible weight (for normalization)
      const totalWeight = factors.reduce((sum, factor) => {
        return sum + factor.weight * factor.confidence;
      }, 0);

      // Normalize to 0-100 scale
      const normalizedScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

      return createRiskScore(normalizedScore);
    } catch (error) {
      return createApiError('CALCULATION_ERROR', 'Risk score calculation failed', {
        error,
      });
    }
  }
}

/**
 * Main risk assessment engine - validates inputs and coordinates analysis
 */
export class RiskAssessmentEngine {
  /**
   * Assess risk for the given input with full validation
   */
  static async assess(input: AssessmentInput): Promise<ApiResponse<RiskAssessmentResult>> {
    // Validate input
    if (!input.filePath || !input.content || !input.transformations) {
      return createApiError('VALIDATION_ERROR', 'Invalid assessment input');
    }

    try {
      // Analyze risk factors
      const factorsResult = RiskFactorAnalyzer.analyze(input);
      if (!factorsResult.success || !factorsResult.data) {
        return factorsResult.error ? factorsResult : createApiError('ANALYSIS_ERROR', 'Factor analysis failed');
      }

      // Calculate risk score
      const scoreResult = RiskScoreCalculator.calculate(factorsResult.data);
      if (!scoreResult.success || scoreResult.data === undefined) {
        return scoreResult.error ? scoreResult : createApiError('CALCULATION_ERROR', 'Score calculation failed');
      }

      const score = scoreResult.data;
      const level = riskScoreToLevel(score);

      // Determine cascade type and effects
      const cascadeType = this.determineCascadeType(input, factorsResult.data);
      const cascadeEffects = this.predictCascadeEffects(cascadeType, factorsResult.data, input);

      // Analyze business context
      const businessDomain = this.determineBusinessDomain(input);
      const businessImpact = this.analyzeBusinessImpact(businessDomain, level, input);

      // Calculate overall confidence
      const confidence = this.calculateConfidence(factorsResult.data, input);

      // Get dominant risk factor
      const dominantFactor = this.getDominantRiskFactor(factorsResult.data);

      const result: RiskAssessmentResult = {
        score,
        level,
        factors: factorsResult.data,
        cascadeType,
        cascadeEffects,
        businessDomain,
        businessImpact,
        confidence,
        requiresVerification: level !== RiskLevel.LOW || cascadeEffects.length > 0,
        requiresHumanReview:
          level === RiskLevel.CRITICAL ||
          (level === RiskLevel.HIGH && cascadeEffects.length > 2) ||
          confidence < 0.7,
        affectedComponents: cascadeEffects.flatMap((effect) => effect.affectedComponents),
        dominantRiskFactor: dominantFactor?.type,
      };

      return createApiSuccess(result);
    } catch (error) {
      return createApiError('ASSESSMENT_ERROR', 'Risk assessment failed', { error });
    }
  }

  private static determineCascadeType(
    input: AssessmentInput,
    factors: readonly RiskFactor[],
  ): CascadeType {
    const content = input.content;
    const transformations = input.transformations;

    // Count cascade indicators
    const cascadeIndicators = {
      typeInference: 0,
      moduleBoundary: 0,
      asyncBoundary: 0,
      frameworkContract: 0,
      cssStyle: 0,
      apiContract: 0,
      loggerMigration: 0,
      configurationDrift: 0,
    };

    // Analyze type inference cascades
    if (content.includes(': any') || content.includes('as any')) {
      cascadeIndicators.typeInference += 2;
    }
    if (transformations.some((t) => t.type === 'typescript' || t.type === 'typescriptDebt')) {
      cascadeIndicators.typeInference += 1;
    }

    // Analyze module boundary cascades
    if (content.includes('import') && content.includes('export')) {
      cascadeIndicators.moduleBoundary += 1;
    }

    // Analyze async boundary cascades
    if (content.includes('async') && content.includes('await')) {
      cascadeIndicators.asyncBoundary += 2;
    }

    // Analyze framework contract cascades
    if (content.includes('forwardRef') || content.includes('useImperativeHandle')) {
      cascadeIndicators.frameworkContract += 2;
    }

    // Find the dominant cascade type
    const maxIndicator = Math.max(...Object.values(cascadeIndicators));

    // Check for compound interactions
    const highIndicators = Object.values(cascadeIndicators).filter((value) => value >= 2);
    if (highIndicators.length > 1) {
      return CascadeType.COMPOUND_INTERACTION;
    }

    // Return the cascade type with highest indicator
    if (cascadeIndicators.typeInference === maxIndicator && maxIndicator > 0) {
      return CascadeType.TYPE_INFERENCE_CASCADE;
    }
    if (cascadeIndicators.asyncBoundary === maxIndicator && maxIndicator > 0) {
      return CascadeType.ASYNC_BOUNDARY_CASCADE;
    }
    if (cascadeIndicators.frameworkContract === maxIndicator && maxIndicator > 0) {
      return CascadeType.FRAMEWORK_CONTRACT_CASCADE;
    }

    // Default to type inference cascade
    return CascadeType.TYPE_INFERENCE_CASCADE;
  }

  private static predictCascadeEffects(
    cascadeType: CascadeType,
    factors: readonly RiskFactor[],
    input: AssessmentInput,
  ): readonly CascadeEffect[] {
    const effects: CascadeEffect[] = [];

    // Calculate base severity from risk factors
    const baseSeverity = factors.reduce(
      (max, factor) => Math.max(max, factor.weight * factor.value),
      0,
    );

    switch (cascadeType) {
      case CascadeType.TYPE_INFERENCE_CASCADE:
        effects.push({
          type: cascadeType,
          severity: Math.min(baseSeverity + 0.2, 1),
          affectedComponents: this.extractTypeReferences(input.content),
          prediction: this.getTypeInferencePrediction(baseSeverity),
          mitigationComplexity: 0.6,
        });
        break;

      case CascadeType.ASYNC_BOUNDARY_CASCADE:
        effects.push({
          type: cascadeType,
          severity: Math.min(baseSeverity + 0.15, 1),
          affectedComponents: this.extractAsyncReferences(input.content),
          prediction: this.getAsyncBoundaryPrediction(baseSeverity),
          mitigationComplexity: 0.7,
        });
        break;

      case CascadeType.FRAMEWORK_CONTRACT_CASCADE:
        effects.push({
          type: cascadeType,
          severity: Math.min(baseSeverity + 0.1, 1),
          affectedComponents: this.extractComponentReferences(input.content),
          prediction: this.getFrameworkContractPrediction(baseSeverity),
          mitigationComplexity: 0.5,
        });
        break;

      default:
        effects.push({
          type: cascadeType,
          severity: baseSeverity,
          affectedComponents: [],
          prediction: `${cascadeType} effects predicted`,
          mitigationComplexity: 0.4,
        });
    }

    return effects;
  }

  private static determineBusinessDomain(input: AssessmentInput): BusinessDomain {
    const filePath = input.filePath.toLowerCase();
    const content = input.content.toLowerCase();

    // Check file path patterns
    if (
      filePath.includes('/auth/') ||
      filePath.includes('/login/') ||
      filePath.includes('/user/')
    ) {
      return BusinessDomain.USER_AUTHENTICATION;
    }
    if (
      filePath.includes('/api/') ||
      filePath.includes('/bridge/') ||
      filePath.includes('/integration/')
    ) {
      return BusinessDomain.API_INTEGRATION;
    }

    // Check content patterns
    if (
      content.includes('authentication') ||
      content.includes('login') ||
      content.includes('jwt')
    ) {
      return BusinessDomain.USER_AUTHENTICATION;
    }
    if (content.includes('fetch') || content.includes('api') || content.includes('endpoint')) {
      return BusinessDomain.API_INTEGRATION;
    }

    // Default to UI
    return BusinessDomain.USER_INTERFACE;
  }

  private static analyzeBusinessImpact(
    domain: BusinessDomain,
    riskLevel: RiskLevel,
    input: AssessmentInput,
  ): string {
    const isHighRisk = riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL;

    switch (domain) {
      case BusinessDomain.USER_AUTHENTICATION:
        return isHighRisk
          ? 'Critical user flows affected: login, authentication, and session management. May impact all authenticated users.'
          : 'Authentication flows may experience minor issues affecting user login experience.';

      case BusinessDomain.API_INTEGRATION:
        return isHighRisk
          ? 'API integrations at risk of failure. External data flow may be disrupted affecting core functionality.'
          : 'Some API interactions may experience minor issues without affecting core features.';

      case BusinessDomain.USER_INTERFACE:
        return isHighRisk
          ? 'User interface components severely affected. User experience significantly degraded across multiple screens.'
          : 'Minor UI issues may appear in some components without affecting core user flows.';

      default:
        return isHighRisk
          ? 'Significant impact to application functionality with potential for user-visible issues.'
          : 'Minor impact to application functionality with minimal user visibility.';
    }
  }

  private static calculateConfidence(
    factors: readonly RiskFactor[],
    input: AssessmentInput,
  ): ConfidenceScore {
    if (factors.length === 0) {
      return 0.5 as ConfidenceScore;
    }

    // Average confidence of all factors
    const avgFactorConfidence =
      factors.reduce((sum, factor) => sum + factor.confidence, 0) / factors.length;

    // Adjust based on input quality
    let inputQualityFactor = 1.0;

    // Reduce confidence if content is very short or lacks context
    if (input.content.length < 100) {
      inputQualityFactor *= 0.8;
    }

    // Reduce confidence if no transformations provided
    if (input.transformations.length === 0) {
      inputQualityFactor *= 0.7;
    }

    // Increase confidence if business context provided
    if (input.businessContext) {
      inputQualityFactor *= 1.1;
    }

    return Math.min(avgFactorConfidence * inputQualityFactor, 1.0) as ConfidenceScore;
  }

  private static getDominantRiskFactor(factors: readonly RiskFactor[]): RiskFactor | undefined {
    return factors.reduce(
      (max, factor) =>
        !max || factor.weight * factor.value > max.weight * max.value ? factor : max,
      undefined as RiskFactor | undefined,
    );
  }

  private static extractTypeReferences(content: string): readonly string[] {
    const typeRegex = /(?:interface|type|class)\s+(\w+)/g;
    const matches: string[] = [];
    let match;

    while ((match = typeRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  private static extractAsyncReferences(content: string): readonly string[] {
    const asyncRegex = /(async\s+function\s+(\w+)|const\s+(\w+)\s*=\s*async)/g;
    const matches: string[] = [];
    let match;

    while ((match = asyncRegex.exec(content)) !== null) {
      matches.push(match[2] || match[3] || 'anonymous');
    }

    return matches;
  }

  private static extractComponentReferences(content: string): readonly string[] {
    const componentRegex = /(?:function|const)\s+([A-Z]\w+)/g;
    const matches: string[] = [];
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  private static getTypeInferencePrediction(severity: number): string {
    if (severity > 0.7) {
      return 'Severe type inference failure cascading through components. Will cause compilation errors across dependent modules.';
    } else if (severity > 0.4) {
      return 'Type inference issues may affect components with potential TypeScript errors.';
    } else {
      return 'Minor type inference issues that can be resolved locally.';
    }
  }

  private static getAsyncBoundaryPrediction(severity: number): string {
    if (severity > 0.7) {
      return 'Severe async/sync boundary violations that will cause runtime failures across components.';
    } else if (severity > 0.4) {
      return 'Async boundary issues may affect components with potential runtime errors.';
    } else {
      return 'Minor async pattern issues that can be resolved locally.';
    }
  }

  private static getFrameworkContractPrediction(severity: number): string {
    if (severity > 0.7) {
      return 'Critical framework contract violations affecting components. Component rendering and lifecycle failures expected.';
    } else if (severity > 0.4) {
      return 'Framework contract issues may affect components with potential rendering errors.';
    } else {
      return 'Minor framework pattern issues that can be resolved locally.';
    }
  }
}
