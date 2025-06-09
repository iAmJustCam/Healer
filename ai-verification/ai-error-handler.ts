/**
 * AI Error Handler
 *
 * Handles AI-specific errors and recovery strategies following constitutional requirements.
 * Uses canonical types only, validates all inputs, returns via factory patterns.
 */

import {
  ApiResponse,
  EntityId,
  Result,
  Severity,
  ApiError,
  Timestamp,
  AIErrorCategory,
  AIRecoveryType,
  AIErrorContext,
  AIErrorAnalysis,
  AIRecoveryStrategy,
  AIRecoveryAttempt,
  AIErrorReport,
  createApiSuccess,
  createApiError
} from '@/types/canonical-types';

import { SeveritySchema } from '@/shared-foundation/validation-schemas';
import { validateWithSchema } from '@/shared-foundation/validation-schemas';

// ============================================================================
// AI ERROR ANALYZER
// ============================================================================

// ============================================================================
// AI ERROR ANALYZER
// ============================================================================

class AIErrorAnalyzer {
  /**
   * Analyze AI error and determine recovery strategy with validation
   */
  static analyze(error: Error, context: AIErrorContext): ApiResponse<AIErrorAnalysis> {
    try {
      // Validate context
      if (!context.operation || !context.aiService) {
        return createApiError('VALIDATION_ERROR', 'Invalid error context provided');
      }

      const category = this.categorizeError(error);
      const severity = this.determineSeverity(category, error);
      const recoveryStrategy = this.determineRecoveryStrategy(category, context);

      const analysis: AIErrorAnalysis = {
        errorCategory: category,
        severity,
        cause: this.determineCause(error, category),
        impact: this.assessImpact(category, severity),
        recoveryStrategy,
        preventionMeasures: this.generatePreventionMeasures(category),
      };

      return createApiSuccess(analysis);
    } catch (analysisError) {
      return createApiError('ANALYSIS_ERROR', 'Error analysis failed', {
        originalError: error,
        analysisError,
      });
    }
  }

  private static categorizeError(error: Error): AIErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return AIErrorCategory.RATE_LIMIT_EXCEEDED;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return AIErrorCategory.AUTHENTICATION_FAILURE;
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return AIErrorCategory.TIMEOUT;
    }
    if (message.includes('quota') || message.includes('limit exceeded')) {
      return AIErrorCategory.QUOTA_EXCEEDED;
    }
    if (message.includes('network') || message.includes('connection')) {
      return AIErrorCategory.NETWORK_ERROR;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return AIErrorCategory.TYPE_DEFINITION_ERROR;
    }
    if (message.includes('service unavailable') || message.includes('503')) {
      return AIErrorCategory.SERVICE_UNAVAILABLE;
    }
    if (message.includes('model') || message.includes('inference')) {
      return AIErrorCategory.MODEL_ERROR;
    }

    return AIErrorCategory.INTERNAL_ERROR;
  }

  private static determineSeverity(category: AIErrorCategory, error: Error): Severity {
    switch (category) {
      case AIErrorCategory.SERVICE_UNAVAILABLE:
      case AIErrorCategory.AUTHENTICATION_FAILURE:
        return Severity.CRITICAL;

      case AIErrorCategory.RATE_LIMIT_EXCEEDED:
      case AIErrorCategory.QUOTA_EXCEEDED:
      case AIErrorCategory.TIMEOUT:
        return Severity.ERROR;

      case AIErrorCategory.NETWORK_ERROR:
      case AIErrorCategory.MODEL_ERROR:
        return Severity.WARNING;

      case AIErrorCategory.TYPE_DEFINITION_ERROR:
      case AIErrorCategory.INVALID_REQUEST:
        return Severity.INFO;

      default:
        return Severity.ERROR;
    }
  }

  private static determineRecoveryStrategy(
    category: AIErrorCategory,
    context: AIErrorContext,
  ): AIRecoveryStrategy {
    switch (category) {
      case AIErrorCategory.RATE_LIMIT_EXCEEDED:
        return {
          type: AIRecoveryType.RETRY_WITH_BACKOFF,
          description: 'Wait for rate limit reset and retry with exponential backoff',
          autoRecoverable: true,
          estimatedRecoveryTime: 60,
          fallbackOptions: ['Use cached response', 'Queue for later processing'],
          requiredActions: ['Implement exponential backoff', 'Monitor rate limits'],
        };

      case AIErrorCategory.SERVICE_UNAVAILABLE:
        return {
          type: AIRecoveryType.CIRCUIT_BREAKER,
          description: 'Activate circuit breaker and use fallback mechanisms',
          autoRecoverable: true,
          estimatedRecoveryTime: 300,
          fallbackOptions: ['Use alternative AI service', 'Graceful degradation'],
          requiredActions: ['Enable circuit breaker', 'Monitor service health'],
        };

      case AIErrorCategory.TIMEOUT:
        return {
          type: AIRecoveryType.REDUCE_REQUEST_COMPLEXITY,
          description: 'Reduce request complexity and retry with shorter timeout',
          autoRecoverable: true,
          estimatedRecoveryTime: 30,
          fallbackOptions: ['Split request into smaller parts', 'Use simpler model'],
          requiredActions: ['Reduce input size', 'Optimize request parameters'],
        };

      case AIErrorCategory.AUTHENTICATION_FAILURE:
        return {
          type: AIRecoveryType.MANUAL_INTERVENTION,
          description: 'Authentication credentials need manual renewal',
          autoRecoverable: false,
          estimatedRecoveryTime: 0,
          fallbackOptions: ['Use cached responses', 'Disable AI features temporarily'],
          requiredActions: ['Renew API keys', 'Verify authentication configuration'],
        };

      default:
        return {
          type: AIRecoveryType.RETRY_WITH_BACKOFF,
          description: 'Generic retry strategy with exponential backoff',
          autoRecoverable: true,
          estimatedRecoveryTime: 120,
          fallbackOptions: ['Use default responses', 'Log for manual review'],
          requiredActions: ['Retry with backoff', 'Log error details'],
        };
    }
  }

  private static determineCause(error: Error, category: AIErrorCategory): string {
    switch (category) {
      case AIErrorCategory.RATE_LIMIT_EXCEEDED:
        return 'Too many requests sent to AI service within the rate limit window';
      case AIErrorCategory.SERVICE_UNAVAILABLE:
        return 'AI service is temporarily unavailable or experiencing downtime';
      case AIErrorCategory.AUTHENTICATION_FAILURE:
        return 'Invalid or expired API credentials for AI service authentication';
      case AIErrorCategory.TIMEOUT:
        return 'AI service request exceeded configured timeout threshold';
      case AIErrorCategory.QUOTA_EXCEEDED:
        return 'API usage quota has been exceeded for the current billing period';
      case AIErrorCategory.NETWORK_ERROR:
        return 'Network connectivity issues preventing communication with AI service';
      case AIErrorCategory.TYPE_DEFINITION_ERROR:
        return 'Request payload failed validation requirements of AI service';
      case AIErrorCategory.MODEL_ERROR:
        return 'AI model encountered an error during inference or processing';
      default:
        return `Unexpected error occurred: ${error.message}`;
    }
  }

  private static assessImpact(category: AIErrorCategory, severity: Severity): string {
    const severityImpact = {
      [Severity.CRITICAL]: 'blocks core functionality',
      [Severity.ERROR]: 'significantly affects user experience',
      [Severity.WARNING]: 'causes minor degradation',
      [Severity.INFO]: 'minimal impact on operations',
    };

    const categoryImpact = {
      [AIErrorCategory.SERVICE_UNAVAILABLE]: 'AI features completely unavailable',
      [AIErrorCategory.RATE_LIMIT_EXCEEDED]: 'AI requests delayed or queued',
      [AIErrorCategory.AUTHENTICATION_FAILURE]: 'AI service access denied',
      [AIErrorCategory.TIMEOUT]: 'AI requests taking too long',
      [AIErrorCategory.QUOTA_EXCEEDED]: 'AI service usage suspended',
      [AIErrorCategory.NETWORK_ERROR]: 'Intermittent AI service connectivity',
      [AIErrorCategory.TYPE_DEFINITION_ERROR]: 'Specific AI requests failing',
      [AIErrorCategory.MODEL_ERROR]: 'AI inference quality affected',
      [AIErrorCategory.INTERNAL_ERROR]: 'Unpredictable AI service behavior',
      [AIErrorCategory.INVALID_REQUEST]: 'Invalid AI requests rejected',
    };

    return `${categoryImpact[category]} and ${severityImpact[severity]}`;
  }

  private static generatePreventionMeasures(category: AIErrorCategory): readonly string[] {
    const baseMeasures = [
      'Implement comprehensive error monitoring',
      'Set up alerting for AI service issues',
      'Maintain fallback mechanisms',
    ];

    const categorySpecificMeasures: Record<AIErrorCategory, readonly string[]> = {
      [AIErrorCategory.RATE_LIMIT_EXCEEDED]: [
        'Implement request rate limiting',
        'Use request queuing mechanisms',
        'Monitor API usage patterns',
        'Implement adaptive rate limiting',
      ],
      [AIErrorCategory.SERVICE_UNAVAILABLE]: [
        'Implement circuit breaker pattern',
        'Set up service health monitoring',
        'Maintain backup AI service providers',
        'Cache frequently used responses',
      ],
      [AIErrorCategory.AUTHENTICATION_FAILURE]: [
        'Implement credential rotation',
        'Monitor API key expiration',
        'Set up automated credential renewal',
        'Maintain secure credential storage',
      ],
      [AIErrorCategory.TIMEOUT]: [
        'Optimize request payload size',
        'Implement request timeout tuning',
        'Use request complexity analysis',
        'Implement request splitting strategies',
      ],
      [AIErrorCategory.QUOTA_EXCEEDED]: [
        'Implement usage monitoring',
        'Set up quota alerts',
        'Plan quota increases',
        'Implement usage optimization',
      ],
      [AIErrorCategory.NETWORK_ERROR]: [
        'Implement network retry mechanisms',
        'Monitor network connectivity',
        'Use multiple network providers',
        'Implement offline capabilities',
      ],
      [AIErrorCategory.TYPE_DEFINITION_ERROR]: [
        'Implement request validation',
        'Maintain API schema documentation',
        'Use request sanitization',
        'Implement payload optimization',
      ],
      [AIErrorCategory.MODEL_ERROR]: [
        'Monitor model performance',
        'Implement model fallbacks',
        'Use model version management',
        'Maintain model quality metrics',
      ],
      [AIErrorCategory.INTERNAL_ERROR]: [
        'Implement comprehensive logging',
        'Monitor application health',
        'Use error tracking tools',
        'Maintain diagnostic capabilities',
      ],
      [AIErrorCategory.INVALID_REQUEST]: [
        'Implement request validation',
        'Use schema validation',
        'Maintain API documentation',
        'Implement request sanitization',
      ],
    };

    return [...baseMeasures, ...categorySpecificMeasures[category]];
  }
}

// ============================================================================
// AI ERROR RECOVERY ENGINE
// ============================================================================

class AIErrorRecoveryEngine {
  /**
   * Execute recovery strategy for AI error with validation
   */
  static async executeRecovery(
    error: ApiError,
    strategy: AIRecoveryStrategy,
    context: AIErrorContext,
  ): Promise<ApiResponse<AIRecoveryAttempt>> {
    try {
      // Validate inputs
      if (!error || !strategy || !context) {
        return createApiError('VALIDATION_ERROR', 'Invalid recovery parameters');
      }

      const attemptId = this.generateAttemptId();
      const startedAt = this.createTimestamp();

      const attempt: AIRecoveryAttempt = {
        attemptId,
        strategy: strategy.type,
        startedAt,
        success: false,
        details: '',
      };

      // Execute recovery based on strategy type
      const recoveryResult = await this.executeStrategy(strategy, context);

      const completedAt = this.createTimestamp();
      const finalAttempt: AIRecoveryAttempt = {
        ...attempt,
        completedAt,
        success: recoveryResult.success,
        details: recoveryResult.success
          ? 'Recovery strategy executed successfully'
          : recoveryResult.error?.message || 'Recovery strategy failed',
        nextStrategy: recoveryResult.success ? undefined : this.getNextStrategy(strategy.type),
      };

      return createApiSuccess(finalAttempt);
    } catch (executionError) {
      return createApiError('RECOVERY_ERROR', 'Recovery execution failed', {
        originalError: error,
        executionError,
      });
    }
  }

  private static async executeStrategy(
    strategy: AIRecoveryStrategy,
    context: AIErrorContext,
  ): Promise<Result<void>> {
    try {
      switch (strategy.type) {
        case AIRecoveryType.RETRY_WITH_BACKOFF:
          await this.executeRetryWithBackoff(context);
          break;

        case AIRecoveryType.CIRCUIT_BREAKER:
          await this.executeCircuitBreaker(context);
          break;

        case AIRecoveryType.FALLBACK_TO_CACHE:
          await this.executeFallbackToCache(context);
          break;

        case AIRecoveryType.USE_ALTERNATIVE_MODEL:
          await this.executeAlternativeModel(context);
          break;

        case AIRecoveryType.GRACEFUL_DEGRADATION:
          await this.executeGracefulDegradation(context);
          break;

        default:
          return {
            success: false,
            error: createApiError('STRATEGY_ERROR', `Unsupported recovery strategy: ${strategy.type}`),
          };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: createApiError('EXECUTION_ERROR', 'Strategy execution failed', { error }),
      };
    }
  }

  private static async executeRetryWithBackoff(context: AIErrorContext): Promise<void> {
    // Implementation would include exponential backoff logic
    const delay = Math.min(1000 * Math.pow(2, 3), 30000); // Max 30 seconds
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private static async executeCircuitBreaker(context: AIErrorContext): Promise<void> {
    // Implementation would include circuit breaker state management
    // For now, this is a placeholder
  }

  private static async executeFallbackToCache(context: AIErrorContext): Promise<void> {
    // Implementation would include cache lookup and fallback logic
    // For now, this is a placeholder
  }

  private static async executeAlternativeModel(context: AIErrorContext): Promise<void> {
    // Implementation would include alternative model selection and switching
    // For now, this is a placeholder
  }

  private static async executeGracefulDegradation(context: AIErrorContext): Promise<void> {
    // Implementation would include feature degradation logic
    // For now, this is a placeholder
  }

  private static getNextStrategy(currentStrategy: AIRecoveryType): AIRecoveryType | undefined {
    const strategyChain: Record<AIRecoveryType, AIRecoveryType | undefined> = {
      [AIRecoveryType.RETRY_WITH_BACKOFF]: AIRecoveryType.FALLBACK_TO_CACHE,
      [AIRecoveryType.FALLBACK_TO_CACHE]: AIRecoveryType.USE_ALTERNATIVE_MODEL,
      [AIRecoveryType.USE_ALTERNATIVE_MODEL]: AIRecoveryType.GRACEFUL_DEGRADATION,
      [AIRecoveryType.GRACEFUL_DEGRADATION]: AIRecoveryType.MANUAL_INTERVENTION,
      [AIRecoveryType.CIRCUIT_BREAKER]: AIRecoveryType.GRACEFUL_DEGRADATION,
      [AIRecoveryType.REDUCE_REQUEST_COMPLEXITY]: AIRecoveryType.RETRY_WITH_BACKOFF,
      [AIRecoveryType.QUEUE_FOR_RETRY]: AIRecoveryType.FALLBACK_TO_CACHE,
      [AIRecoveryType.MANUAL_INTERVENTION]: undefined,
    };

    return strategyChain[currentStrategy];
  }

  private static generateAttemptId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static createTimestamp(): Timestamp {
    return new Date().toISOString() as Timestamp;
  }
}

// ============================================================================
// AI ERROR HANDLER IMPLEMENTATION
// ============================================================================

export class AIErrorHandler {
  private errorReports: AIErrorReport[] = [];
  private recoveryAttempts: Map<string, AIRecoveryAttempt[]> = new Map();

  /**
   * Handle AI error with comprehensive analysis and recovery
   */
  async handleError(error: Error, context: AIErrorContext): Promise<ApiResponse<AIErrorReport>> {
    try {
      // Convert Error to ApiError if needed
      const systemError = this.convertToApiError(error, context);

      // Analyze the error
      const analysisResult = AIErrorAnalyzer.analyze(error, context);
      if (!analysisResult.success || !analysisResult.data) {
        return analysisResult.error ? analysisResult : createApiError('ANALYSIS_ERROR', 'Error analysis failed');
      }

      // Create error report
      const errorReport: AIErrorReport = {
        error: systemError,
        context,
        analysis: analysisResult.data,
        recoveryAttempts: [],
        resolved: false,
        reportedAt: new Date().toISOString() as Timestamp,
      };

      // Attempt recovery if auto-recoverable
      if (analysisResult.data.recoveryStrategy.autoRecoverable) {
        const recoveryResult = await AIErrorRecoveryEngine.executeRecovery(
          systemError,
          analysisResult.data.recoveryStrategy,
          context,
        );

        if (recoveryResult.success && recoveryResult.data) {
          errorReport.recoveryAttempts = [recoveryResult.data];
          errorReport.resolved = recoveryResult.data.success;
        }
      }

      // Store error report
      this.errorReports.push(errorReport);

      return createApiSuccess(errorReport);
    } catch (handlingError) {
      return createApiError('HANDLER_ERROR', 'Error handling failed', {
        originalError: error,
        handlingError,
      });
    }
  }

  /**
   * Get recovery strategy for specific error type
   */
  getRecoveryStrategy(error: Error, context: AIErrorContext): ApiResponse<AIRecoveryStrategy> {
    const analysisResult = AIErrorAnalyzer.analyze(error, context);
    if (!analysisResult.success || !analysisResult.data) {
      return analysisResult.error ? analysisResult : createApiError('ANALYSIS_ERROR', 'Strategy analysis failed');
    }

    return createApiSuccess(analysisResult.data.recoveryStrategy);
  }

  /**
   * Get error reports with optional filtering
   */
  getErrorReports(filter?: {
    severity?: Severity;
    category?: AIErrorCategory;
    resolved?: boolean;
  }): ApiResponse<readonly AIErrorReport[]> {
    try {
      let filteredReports = [...this.errorReports];

      if (filter) {
        if (filter.severity) {
          const severityValidation = validateWithSchema(SeveritySchema, filter.severity);
          if (!severityValidation.success) {
            return createApiError('VALIDATION_ERROR', 'Invalid severity filter');
          }
          filteredReports = filteredReports.filter(
            (report) => report.analysis.severity === filter.severity,
          );
        }

        if (filter.category) {
          filteredReports = filteredReports.filter(
            (report) => report.analysis.errorCategory === filter.category,
          );
        }

        if (filter.resolved !== undefined) {
          filteredReports = filteredReports.filter((report) => report.resolved === filter.resolved);
        }
      }

      return createApiSuccess(filteredReports);
    } catch (error) {
      return createApiError('RETRIEVAL_ERROR', 'Failed to retrieve error reports', { error });
    }
  }

  /**
   * Clear resolved error reports
   */
  clearResolvedErrors(): ApiResponse<number> {
    try {
      const initialCount = this.errorReports.length;
      this.errorReports = this.errorReports.filter((report) => !report.resolved);
      const clearedCount = initialCount - this.errorReports.length;

      return createApiSuccess(clearedCount);
    } catch (error) {
      return createApiError('CLEAR_ERROR', 'Failed to clear resolved errors', { error });
    }
  }

  private convertToApiError(error: Error, context: AIErrorContext): ApiError {
    return {
      code: `AI_${error.name.toUpperCase()}`,
      message: error.message,
      details: {
        operation: context.operation,
        sessionId: context.sessionId,
        additionalInfo: {
          aiService: context.aiService,
          correlationId: context.correlationId,
          ...context.additionalInfo,
        },
      },
      timestamp: context.timestamp,
      recoverable: true, // AI errors are generally recoverable
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create production AI error handler
 */
export function createProductionAIErrorHandler(): AIErrorHandler {
  return new AIErrorHandler();
}

/**
 * Create development AI error handler with additional logging
 */
export function createDevelopmentAIErrorHandler(): AIErrorHandler {
  const handler = new AIErrorHandler();

  // In development, we might want additional logging or debugging features
  const originalHandleError = handler.handleError.bind(handler);
  handler.handleError = async (error: Error, context: AIErrorContext) => {
    console.warn('AI Error Handler - Development Mode:', error.message, context);
    return originalHandleError(error, context);
  };

  return handler;
}

/**
 * Create AI error context for current operation
 */
export function createAIErrorContext(
  operation: string,
  aiService: string,
  sessionId?: EntityId,
  correlationId?: EntityId,
  additionalInfo?: Record<string, unknown>,
): AIErrorContext {
  return {
    operation,
    aiService,
    sessionId,
    correlationId,
    timestamp: new Date().toISOString() as Timestamp,
    additionalInfo,
  };
}

export default AIErrorHandler;
