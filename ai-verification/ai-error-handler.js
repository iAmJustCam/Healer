"use strict";
/**
 * AI Error Handler
 *
 * Handles AI-specific errors and recovery strategies following constitutional requirements.
 * Uses canonical types only, validates all inputs, returns via factory patterns.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIErrorHandler = void 0;
exports.createProductionAIErrorHandler = createProductionAIErrorHandler;
exports.createDevelopmentAIErrorHandler = createDevelopmentAIErrorHandler;
exports.createAIErrorContext = createAIErrorContext;
var canonical_types_1 = require("../types/canonical-types");
var validation_schemas_1 = require("../shared-foundation/validation-schemas");
var validation_schemas_2 = require("../shared-foundation/validation-schemas");
// ============================================================================
// AI ERROR ANALYZER
// ============================================================================
// ============================================================================
// AI ERROR ANALYZER
// ============================================================================
var AIErrorAnalyzer = /** @class */ (function () {
    function AIErrorAnalyzer() {
    }
    /**
     * Analyze AI error and determine recovery strategy with validation
     */
    AIErrorAnalyzer.analyze = function (error, context) {
        try {
            // Validate context
            if (!context.operation || !context.aiService) {
                return (0, canonical_types_1.createApiError)('VALIDATION_ERROR', 'Invalid error context provided');
            }
            var category = this.categorizeError(error);
            var severity = this.determineSeverity(category, error);
            var recoveryStrategy = this.determineRecoveryStrategy(category, context);
            var analysis = {
                errorCategory: category,
                severity: severity,
                cause: this.determineCause(error, category),
                impact: this.assessImpact(category, severity),
                recoveryStrategy: recoveryStrategy,
                preventionMeasures: this.generatePreventionMeasures(category),
            };
            return (0, canonical_types_1.createApiSuccess)(analysis);
        }
        catch (analysisError) {
            return (0, canonical_types_1.createApiError)('ANALYSIS_ERROR', 'Error analysis failed', {
                originalError: error,
                analysisError: analysisError,
            });
        }
    };
    AIErrorAnalyzer.categorizeError = function (error) {
        var message = error.message.toLowerCase();
        if (message.includes('rate limit') || message.includes('too many requests')) {
            return canonical_types_1.AIErrorCategory.RATE_LIMIT_EXCEEDED;
        }
        if (message.includes('unauthorized') || message.includes('authentication')) {
            return canonical_types_1.AIErrorCategory.AUTHENTICATION_FAILURE;
        }
        if (message.includes('timeout') || message.includes('timed out')) {
            return canonical_types_1.AIErrorCategory.TIMEOUT;
        }
        if (message.includes('quota') || message.includes('limit exceeded')) {
            return canonical_types_1.AIErrorCategory.QUOTA_EXCEEDED;
        }
        if (message.includes('network') || message.includes('connection')) {
            return canonical_types_1.AIErrorCategory.NETWORK_ERROR;
        }
        if (message.includes('validation') || message.includes('invalid')) {
            return canonical_types_1.AIErrorCategory.VALIDATION_ERROR;
        }
        if (message.includes('service unavailable') || message.includes('503')) {
            return canonical_types_1.AIErrorCategory.SERVICE_UNAVAILABLE;
        }
        if (message.includes('model') || message.includes('inference')) {
            return canonical_types_1.AIErrorCategory.MODEL_ERROR;
        }
        return canonical_types_1.AIErrorCategory.INTERNAL_ERROR;
    };
    AIErrorAnalyzer.determineSeverity = function (category, error) {
        switch (category) {
            case canonical_types_1.AIErrorCategory.SERVICE_UNAVAILABLE:
            case canonical_types_1.AIErrorCategory.AUTHENTICATION_FAILURE:
                return canonical_types_1.Severity.CRITICAL;
            case canonical_types_1.AIErrorCategory.RATE_LIMIT_EXCEEDED:
            case canonical_types_1.AIErrorCategory.QUOTA_EXCEEDED:
            case canonical_types_1.AIErrorCategory.TIMEOUT:
                return canonical_types_1.Severity.ERROR;
            case canonical_types_1.AIErrorCategory.NETWORK_ERROR:
            case canonical_types_1.AIErrorCategory.MODEL_ERROR:
                return canonical_types_1.Severity.WARNING;
            case canonical_types_1.AIErrorCategory.VALIDATION_ERROR:
            case canonical_types_1.AIErrorCategory.INVALID_REQUEST:
                return canonical_types_1.Severity.INFO;
            default:
                return canonical_types_1.Severity.ERROR;
        }
    };
    AIErrorAnalyzer.determineRecoveryStrategy = function (category, context) {
        switch (category) {
            case canonical_types_1.AIErrorCategory.RATE_LIMIT_EXCEEDED:
                return {
                    type: canonical_types_1.AIRecoveryType.RETRY_WITH_BACKOFF,
                    description: 'Wait for rate limit reset and retry with exponential backoff',
                    autoRecoverable: true,
                    estimatedRecoveryTime: 60,
                    fallbackOptions: ['Use cached response', 'Queue for later processing'],
                    requiredActions: ['Implement exponential backoff', 'Monitor rate limits'],
                };
            case canonical_types_1.AIErrorCategory.SERVICE_UNAVAILABLE:
                return {
                    type: canonical_types_1.AIRecoveryType.CIRCUIT_BREAKER,
                    description: 'Activate circuit breaker and use fallback mechanisms',
                    autoRecoverable: true,
                    estimatedRecoveryTime: 300,
                    fallbackOptions: ['Use alternative AI service', 'Graceful degradation'],
                    requiredActions: ['Enable circuit breaker', 'Monitor service health'],
                };
            case canonical_types_1.AIErrorCategory.TIMEOUT:
                return {
                    type: canonical_types_1.AIRecoveryType.REDUCE_REQUEST_COMPLEXITY,
                    description: 'Reduce request complexity and retry with shorter timeout',
                    autoRecoverable: true,
                    estimatedRecoveryTime: 30,
                    fallbackOptions: ['Split request into smaller parts', 'Use simpler model'],
                    requiredActions: ['Reduce input size', 'Optimize request parameters'],
                };
            case canonical_types_1.AIErrorCategory.AUTHENTICATION_FAILURE:
                return {
                    type: canonical_types_1.AIRecoveryType.MANUAL_INTERVENTION,
                    description: 'Authentication credentials need manual renewal',
                    autoRecoverable: false,
                    estimatedRecoveryTime: 0,
                    fallbackOptions: ['Use cached responses', 'Disable AI features temporarily'],
                    requiredActions: ['Renew API keys', 'Verify authentication configuration'],
                };
            default:
                return {
                    type: canonical_types_1.AIRecoveryType.RETRY_WITH_BACKOFF,
                    description: 'Generic retry strategy with exponential backoff',
                    autoRecoverable: true,
                    estimatedRecoveryTime: 120,
                    fallbackOptions: ['Use default responses', 'Log for manual review'],
                    requiredActions: ['Retry with backoff', 'Log error details'],
                };
        }
    };
    AIErrorAnalyzer.determineCause = function (error, category) {
        switch (category) {
            case canonical_types_1.AIErrorCategory.RATE_LIMIT_EXCEEDED:
                return 'Too many requests sent to AI service within the rate limit window';
            case canonical_types_1.AIErrorCategory.SERVICE_UNAVAILABLE:
                return 'AI service is temporarily unavailable or experiencing downtime';
            case canonical_types_1.AIErrorCategory.AUTHENTICATION_FAILURE:
                return 'Invalid or expired API credentials for AI service authentication';
            case canonical_types_1.AIErrorCategory.TIMEOUT:
                return 'AI service request exceeded configured timeout threshold';
            case canonical_types_1.AIErrorCategory.QUOTA_EXCEEDED:
                return 'API usage quota has been exceeded for the current billing period';
            case canonical_types_1.AIErrorCategory.NETWORK_ERROR:
                return 'Network connectivity issues preventing communication with AI service';
            case canonical_types_1.AIErrorCategory.VALIDATION_ERROR:
                return 'Request payload failed validation requirements of AI service';
            case canonical_types_1.AIErrorCategory.MODEL_ERROR:
                return 'AI model encountered an error during inference or processing';
            default:
                return "Unexpected error occurred: ".concat(error.message);
        }
    };
    AIErrorAnalyzer.assessImpact = function (category, severity) {
        var _a, _b;
        var severityImpact = (_a = {},
            _a[canonical_types_1.Severity.CRITICAL] = 'blocks core functionality',
            _a[canonical_types_1.Severity.ERROR] = 'significantly affects user experience',
            _a[canonical_types_1.Severity.WARNING] = 'causes minor degradation',
            _a[canonical_types_1.Severity.INFO] = 'minimal impact on operations',
            _a);
        var categoryImpact = (_b = {},
            _b[canonical_types_1.AIErrorCategory.SERVICE_UNAVAILABLE] = 'AI features completely unavailable',
            _b[canonical_types_1.AIErrorCategory.RATE_LIMIT_EXCEEDED] = 'AI requests delayed or queued',
            _b[canonical_types_1.AIErrorCategory.AUTHENTICATION_FAILURE] = 'AI service access denied',
            _b[canonical_types_1.AIErrorCategory.TIMEOUT] = 'AI requests taking too long',
            _b[canonical_types_1.AIErrorCategory.QUOTA_EXCEEDED] = 'AI service usage suspended',
            _b[canonical_types_1.AIErrorCategory.NETWORK_ERROR] = 'Intermittent AI service connectivity',
            _b[canonical_types_1.AIErrorCategory.VALIDATION_ERROR] = 'Specific AI requests failing',
            _b[canonical_types_1.AIErrorCategory.MODEL_ERROR] = 'AI inference quality affected',
            _b[canonical_types_1.AIErrorCategory.INTERNAL_ERROR] = 'Unpredictable AI service behavior',
            _b[canonical_types_1.AIErrorCategory.INVALID_REQUEST] = 'Invalid AI requests rejected',
            _b);
        return "".concat(categoryImpact[category], " and ").concat(severityImpact[severity]);
    };
    AIErrorAnalyzer.generatePreventionMeasures = function (category) {
        var _a;
        var baseMeasures = [
            'Implement comprehensive error monitoring',
            'Set up alerting for AI service issues',
            'Maintain fallback mechanisms',
        ];
        var categorySpecificMeasures = (_a = {},
            _a[canonical_types_1.AIErrorCategory.RATE_LIMIT_EXCEEDED] = [
                'Implement request rate limiting',
                'Use request queuing mechanisms',
                'Monitor API usage patterns',
                'Implement adaptive rate limiting',
            ],
            _a[canonical_types_1.AIErrorCategory.SERVICE_UNAVAILABLE] = [
                'Implement circuit breaker pattern',
                'Set up service health monitoring',
                'Maintain backup AI service providers',
                'Cache frequently used responses',
            ],
            _a[canonical_types_1.AIErrorCategory.AUTHENTICATION_FAILURE] = [
                'Implement credential rotation',
                'Monitor API key expiration',
                'Set up automated credential renewal',
                'Maintain secure credential storage',
            ],
            _a[canonical_types_1.AIErrorCategory.TIMEOUT] = [
                'Optimize request payload size',
                'Implement request timeout tuning',
                'Use request complexity analysis',
                'Implement request splitting strategies',
            ],
            _a[canonical_types_1.AIErrorCategory.QUOTA_EXCEEDED] = [
                'Implement usage monitoring',
                'Set up quota alerts',
                'Plan quota increases',
                'Implement usage optimization',
            ],
            _a[canonical_types_1.AIErrorCategory.NETWORK_ERROR] = [
                'Implement network retry mechanisms',
                'Monitor network connectivity',
                'Use multiple network providers',
                'Implement offline capabilities',
            ],
            _a[canonical_types_1.AIErrorCategory.VALIDATION_ERROR] = [
                'Implement request validation',
                'Maintain API schema documentation',
                'Use request sanitization',
                'Implement payload optimization',
            ],
            _a[canonical_types_1.AIErrorCategory.MODEL_ERROR] = [
                'Monitor model performance',
                'Implement model fallbacks',
                'Use model version management',
                'Maintain model quality metrics',
            ],
            _a[canonical_types_1.AIErrorCategory.INTERNAL_ERROR] = [
                'Implement comprehensive logging',
                'Monitor application health',
                'Use error tracking tools',
                'Maintain diagnostic capabilities',
            ],
            _a[canonical_types_1.AIErrorCategory.INVALID_REQUEST] = [
                'Implement request validation',
                'Use schema validation',
                'Maintain API documentation',
                'Implement request sanitization',
            ],
            _a);
        return __spreadArray(__spreadArray([], baseMeasures, true), categorySpecificMeasures[category], true);
    };
    return AIErrorAnalyzer;
}());
// ============================================================================
// AI ERROR RECOVERY ENGINE
// ============================================================================
var AIErrorRecoveryEngine = /** @class */ (function () {
    function AIErrorRecoveryEngine() {
    }
    /**
     * Execute recovery strategy for AI error with validation
     */
    AIErrorRecoveryEngine.executeRecovery = function (error, strategy, context) {
        return __awaiter(this, void 0, void 0, function () {
            var attemptId, startedAt, attempt, recoveryResult, completedAt, finalAttempt, executionError_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        // Validate inputs
                        if (!error || !strategy || !context) {
                            return [2 /*return*/, (0, canonical_types_1.createApiError)('VALIDATION_ERROR', 'Invalid recovery parameters')];
                        }
                        attemptId = this.generateAttemptId();
                        startedAt = this.createTimestamp();
                        attempt = {
                            attemptId: attemptId,
                            strategy: strategy.type,
                            startedAt: startedAt,
                            success: false,
                            details: '',
                        };
                        return [4 /*yield*/, this.executeStrategy(strategy, context)];
                    case 1:
                        recoveryResult = _b.sent();
                        completedAt = this.createTimestamp();
                        finalAttempt = __assign(__assign({}, attempt), { completedAt: completedAt, success: recoveryResult.success, details: recoveryResult.success
                                ? 'Recovery strategy executed successfully'
                                : ((_a = recoveryResult.error) === null || _a === void 0 ? void 0 : _a.message) || 'Recovery strategy failed', nextStrategy: recoveryResult.success ? undefined : this.getNextStrategy(strategy.type) });
                        return [2 /*return*/, (0, canonical_types_1.createApiSuccess)(finalAttempt)];
                    case 2:
                        executionError_1 = _b.sent();
                        return [2 /*return*/, (0, canonical_types_1.createApiError)('RECOVERY_ERROR', 'Recovery execution failed', {
                                originalError: error,
                                executionError: executionError_1,
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AIErrorRecoveryEngine.executeStrategy = function (strategy, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 13, , 14]);
                        _a = strategy.type;
                        switch (_a) {
                            case canonical_types_1.AIRecoveryType.RETRY_WITH_BACKOFF: return [3 /*break*/, 1];
                            case canonical_types_1.AIRecoveryType.CIRCUIT_BREAKER: return [3 /*break*/, 3];
                            case canonical_types_1.AIRecoveryType.FALLBACK_TO_CACHE: return [3 /*break*/, 5];
                            case canonical_types_1.AIRecoveryType.USE_ALTERNATIVE_MODEL: return [3 /*break*/, 7];
                            case canonical_types_1.AIRecoveryType.GRACEFUL_DEGRADATION: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.executeRetryWithBackoff(context)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 3: return [4 /*yield*/, this.executeCircuitBreaker(context)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 5: return [4 /*yield*/, this.executeFallbackToCache(context)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 7: return [4 /*yield*/, this.executeAlternativeModel(context)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, this.executeGracefulDegradation(context)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11: return [2 /*return*/, {
                            success: false,
                            error: (0, canonical_types_1.createApiError)('STRATEGY_ERROR', "Unsupported recovery strategy: ".concat(strategy.type)),
                        }];
                    case 12: return [2 /*return*/, { success: true }];
                    case 13:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: (0, canonical_types_1.createApiError)('EXECUTION_ERROR', 'Strategy execution failed', { error: error_1 }),
                            }];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    AIErrorRecoveryEngine.executeRetryWithBackoff = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delay = Math.min(1000 * Math.pow(2, 3), 30000);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AIErrorRecoveryEngine.executeCircuitBreaker = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    AIErrorRecoveryEngine.executeFallbackToCache = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    AIErrorRecoveryEngine.executeAlternativeModel = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    AIErrorRecoveryEngine.executeGracefulDegradation = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    AIErrorRecoveryEngine.getNextStrategy = function (currentStrategy) {
        var _a;
        var strategyChain = (_a = {},
            _a[canonical_types_1.AIRecoveryType.RETRY_WITH_BACKOFF] = canonical_types_1.AIRecoveryType.FALLBACK_TO_CACHE,
            _a[canonical_types_1.AIRecoveryType.FALLBACK_TO_CACHE] = canonical_types_1.AIRecoveryType.USE_ALTERNATIVE_MODEL,
            _a[canonical_types_1.AIRecoveryType.USE_ALTERNATIVE_MODEL] = canonical_types_1.AIRecoveryType.GRACEFUL_DEGRADATION,
            _a[canonical_types_1.AIRecoveryType.GRACEFUL_DEGRADATION] = canonical_types_1.AIRecoveryType.MANUAL_INTERVENTION,
            _a[canonical_types_1.AIRecoveryType.CIRCUIT_BREAKER] = canonical_types_1.AIRecoveryType.GRACEFUL_DEGRADATION,
            _a[canonical_types_1.AIRecoveryType.REDUCE_REQUEST_COMPLEXITY] = canonical_types_1.AIRecoveryType.RETRY_WITH_BACKOFF,
            _a[canonical_types_1.AIRecoveryType.QUEUE_FOR_RETRY] = canonical_types_1.AIRecoveryType.FALLBACK_TO_CACHE,
            _a[canonical_types_1.AIRecoveryType.MANUAL_INTERVENTION] = undefined,
            _a);
        return strategyChain[currentStrategy];
    };
    AIErrorRecoveryEngine.generateAttemptId = function () {
        return "recovery_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    AIErrorRecoveryEngine.createTimestamp = function () {
        return new Date().toISOString();
    };
    return AIErrorRecoveryEngine;
}());
// ============================================================================
// AI ERROR HANDLER IMPLEMENTATION
// ============================================================================
var AIErrorHandler = /** @class */ (function () {
    function AIErrorHandler() {
        this.errorReports = [];
        this.recoveryAttempts = new Map();
    }
    /**
     * Handle AI error with comprehensive analysis and recovery
     */
    AIErrorHandler.prototype.handleError = function (error, context) {
        return __awaiter(this, void 0, void 0, function () {
            var systemError, analysisResult, errorReport, recoveryResult, handlingError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        systemError = this.convertToApiError(error, context);
                        analysisResult = AIErrorAnalyzer.analyze(error, context);
                        if (!analysisResult.success || !analysisResult.data) {
                            return [2 /*return*/, analysisResult.error ? analysisResult : (0, canonical_types_1.createApiError)('ANALYSIS_ERROR', 'Error analysis failed')];
                        }
                        errorReport = {
                            error: systemError,
                            context: context,
                            analysis: analysisResult.data,
                            recoveryAttempts: [],
                            resolved: false,
                            reportedAt: new Date().toISOString(),
                        };
                        if (!analysisResult.data.recoveryStrategy.autoRecoverable) return [3 /*break*/, 2];
                        return [4 /*yield*/, AIErrorRecoveryEngine.executeRecovery(systemError, analysisResult.data.recoveryStrategy, context)];
                    case 1:
                        recoveryResult = _a.sent();
                        if (recoveryResult.success && recoveryResult.data) {
                            errorReport.recoveryAttempts = [recoveryResult.data];
                            errorReport.resolved = recoveryResult.data.success;
                        }
                        _a.label = 2;
                    case 2:
                        // Store error report
                        this.errorReports.push(errorReport);
                        return [2 /*return*/, (0, canonical_types_1.createApiSuccess)(errorReport)];
                    case 3:
                        handlingError_1 = _a.sent();
                        return [2 /*return*/, (0, canonical_types_1.createApiError)('HANDLER_ERROR', 'Error handling failed', {
                                originalError: error,
                                handlingError: handlingError_1,
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get recovery strategy for specific error type
     */
    AIErrorHandler.prototype.getRecoveryStrategy = function (error, context) {
        var analysisResult = AIErrorAnalyzer.analyze(error, context);
        if (!analysisResult.success || !analysisResult.data) {
            return analysisResult.error ? analysisResult : (0, canonical_types_1.createApiError)('ANALYSIS_ERROR', 'Strategy analysis failed');
        }
        return (0, canonical_types_1.createApiSuccess)(analysisResult.data.recoveryStrategy);
    };
    /**
     * Get error reports with optional filtering
     */
    AIErrorHandler.prototype.getErrorReports = function (filter) {
        try {
            var filteredReports = __spreadArray([], this.errorReports, true);
            if (filter) {
                if (filter.severity) {
                    var severityValidation = (0, validation_schemas_2.validateWithSchema)(validation_schemas_1.SeveritySchema, filter.severity);
                    if (!severityValidation.success) {
                        return (0, canonical_types_1.createApiError)('VALIDATION_ERROR', 'Invalid severity filter');
                    }
                    filteredReports = filteredReports.filter(function (report) { return report.analysis.severity === filter.severity; });
                }
                if (filter.category) {
                    filteredReports = filteredReports.filter(function (report) { return report.analysis.errorCategory === filter.category; });
                }
                if (filter.resolved !== undefined) {
                    filteredReports = filteredReports.filter(function (report) { return report.resolved === filter.resolved; });
                }
            }
            return (0, canonical_types_1.createApiSuccess)(filteredReports);
        }
        catch (error) {
            return (0, canonical_types_1.createApiError)('RETRIEVAL_ERROR', 'Failed to retrieve error reports', { error: error });
        }
    };
    /**
     * Clear resolved error reports
     */
    AIErrorHandler.prototype.clearResolvedErrors = function () {
        try {
            var initialCount = this.errorReports.length;
            this.errorReports = this.errorReports.filter(function (report) { return !report.resolved; });
            var clearedCount = initialCount - this.errorReports.length;
            return (0, canonical_types_1.createApiSuccess)(clearedCount);
        }
        catch (error) {
            return (0, canonical_types_1.createApiError)('CLEAR_ERROR', 'Failed to clear resolved errors', { error: error });
        }
    };
    AIErrorHandler.prototype.convertToApiError = function (error, context) {
        return {
            code: "AI_".concat(error.name.toUpperCase()),
            message: error.message,
            details: {
                operation: context.operation,
                sessionId: context.sessionId,
                additionalInfo: __assign({ aiService: context.aiService, correlationId: context.correlationId }, context.additionalInfo),
            },
            timestamp: context.timestamp,
            recoverable: true, // AI errors are generally recoverable
        };
    };
    return AIErrorHandler;
}());
exports.AIErrorHandler = AIErrorHandler;
// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================
/**
 * Create production AI error handler
 */
function createProductionAIErrorHandler() {
    return new AIErrorHandler();
}
/**
 * Create development AI error handler with additional logging
 */
function createDevelopmentAIErrorHandler() {
    var _this = this;
    var handler = new AIErrorHandler();
    // In development, we might want additional logging or debugging features
    var originalHandleError = handler.handleError.bind(handler);
    handler.handleError = function (error, context) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.warn('AI Error Handler - Development Mode:', error.message, context);
            return [2 /*return*/, originalHandleError(error, context)];
        });
    }); };
    return handler;
}
/**
 * Create AI error context for current operation
 */
function createAIErrorContext(operation, aiService, sessionId, correlationId, additionalInfo) {
    return {
        operation: operation,
        aiService: aiService,
        sessionId: sessionId,
        correlationId: correlationId,
        timestamp: new Date().toISOString(),
        additionalInfo: additionalInfo,
    };
}
exports.default = AIErrorHandler;
