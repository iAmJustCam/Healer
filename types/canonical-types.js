"use strict";
/**
 * Canonical Types - THE Single Source of Truth (SSOT)
 *
 * Constitutional compliance: This is the ONLY authoritative source for core types.
 * All other modules MUST import from this file via @types alias.
 *
 * Version: 1.0.0
 * Ratified by: Architecture Council
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskFactorType = exports.MitigationStrategyType = exports.Priority = exports.VerificationCategory = exports.ReviewerType = exports.SeniorityLevel = exports.DeploymentStrategy = exports.DeploymentEnvironment = exports.AIRecoveryType = exports.AIErrorCategory = exports.VerificationStepCategory = exports.ChartType = exports.MessageDirection = exports.WebSocketMessageType = exports.WebSocketStatus = exports.BusinessDomain = exports.Severity = exports.ErrorCategory = exports.TransformationStatus = exports.Framework = exports.TransformationStrategy = exports.ValidationLevel = exports.OutputFormat = exports.ComplexityLevel = exports.ConfidenceScore = exports.RiskLevel = void 0;
exports.createApiSuccess = createApiSuccess;
exports.createApiError = createApiError;
exports.createApiResponse = createApiResponse;
exports.createSystemError = createSystemError;
exports.createEntityId = createEntityId;
exports.createOperationId = createOperationId;
exports.createTimestamp = createTimestamp;
exports.createFilePath = createFilePath;
exports.createDirectoryPath = createDirectoryPath;
exports.createPatternId = createPatternId;
exports.createTransformationId = createTransformationId;
exports.createWebSocketConnectionId = createWebSocketConnectionId;
exports.createWebSocketMessageId = createWebSocketMessageId;
exports.createWebSocketChannelName = createWebSocketChannelName;
exports.createChartId = createChartId;
/// ============================================================================
// CANONICAL TYPE ENUMS
/// ============================================================================
/**
 * Common type for risk levels
 */
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["CRITICAL"] = "CRITICAL";
    RiskLevel["HIGH"] = "HIGH";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["LOW"] = "LOW";
    RiskLevel["NONE"] = "NONE";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
/**
 * Common type for confidence scores
 */
var ConfidenceScore;
(function (ConfidenceScore) {
    ConfidenceScore["LOW"] = "LOW";
    ConfidenceScore["MEDIUM"] = "MEDIUM";
    ConfidenceScore["HIGH"] = "HIGH";
    ConfidenceScore["CERTAIN"] = "CERTAIN";
})(ConfidenceScore || (exports.ConfidenceScore = ConfidenceScore = {}));
/**
 * Common type for complexity levels
 */
var ComplexityLevel;
(function (ComplexityLevel) {
    ComplexityLevel["SIMPLE"] = "SIMPLE";
    ComplexityLevel["MODERATE"] = "MODERATE";
    ComplexityLevel["COMPLEX"] = "COMPLEX";
    ComplexityLevel["EXTREME"] = "EXTREME";
})(ComplexityLevel || (exports.ComplexityLevel = ComplexityLevel = {}));
/**
 * Common type for output formats
 */
var OutputFormat;
(function (OutputFormat) {
    OutputFormat["JSON"] = "JSON";
    OutputFormat["YAML"] = "YAML";
    OutputFormat["TEXT"] = "TEXT";
    OutputFormat["HTML"] = "HTML";
    OutputFormat["MARKDOWN"] = "MARKDOWN";
})(OutputFormat || (exports.OutputFormat = OutputFormat = {}));
/**
 * Common type for validation levels
 */
var ValidationLevel;
(function (ValidationLevel) {
    ValidationLevel["MINIMAL"] = "MINIMAL";
    ValidationLevel["STANDARD"] = "STANDARD";
    ValidationLevel["STRICT"] = "STRICT";
    ValidationLevel["EXHAUSTIVE"] = "EXHAUSTIVE";
})(ValidationLevel || (exports.ValidationLevel = ValidationLevel = {}));
/**
 * Common type for transformation strategies
 */
var TransformationStrategy;
(function (TransformationStrategy) {
    TransformationStrategy["IN_PLACE"] = "IN_PLACE";
    TransformationStrategy["COPY_MODIFY"] = "COPY_MODIFY";
    TransformationStrategy["CREATE_NEW"] = "CREATE_NEW";
    TransformationStrategy["HYBRID"] = "HYBRID";
    TransformationStrategy["INCREMENTAL"] = "INCREMENTAL";
})(TransformationStrategy || (exports.TransformationStrategy = TransformationStrategy = {}));
/**
 * Common type for framework identifiers
 */
var Framework;
(function (Framework) {
    Framework["REACT"] = "REACT";
    Framework["ANGULAR"] = "ANGULAR";
    Framework["VUE"] = "VUE";
    Framework["SVELTE"] = "SVELTE";
    Framework["EXPRESS"] = "EXPRESS";
    Framework["NEST"] = "NEST";
    Framework["NEXT"] = "NEXT";
    Framework["NUXT"] = "NUXT";
})(Framework || (exports.Framework = Framework = {}));
/**
 * Transformation status enum values
 */
var TransformationStatus;
(function (TransformationStatus) {
    TransformationStatus["PENDING"] = "PENDING";
    TransformationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TransformationStatus["COMPLETED"] = "COMPLETED";
    TransformationStatus["FAILED"] = "FAILED";
    TransformationStatus["SKIPPED"] = "SKIPPED";
    TransformationStatus["CANCELLED"] = "CANCELLED";
})(TransformationStatus || (exports.TransformationStatus = TransformationStatus = {}));
/**
 * Error category classifications
 */
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["TRANSFORMATION"] = "TRANSFORMATION";
    ErrorCategory["COMPILATION"] = "COMPILATION";
    ErrorCategory["RUNTIME"] = "RUNTIME";
    ErrorCategory["CONFIGURATION"] = "CONFIGURATION";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
/**
 * Severity levels for errors and warnings
 */
var Severity;
(function (Severity) {
    Severity["CRITICAL"] = "CRITICAL";
    Severity["ERROR"] = "ERROR";
    Severity["WARNING"] = "WARNING";
    Severity["INFO"] = "INFO";
    Severity["DEBUG"] = "DEBUG";
    Severity["HIGH"] = "HIGH";
    Severity["MEDIUM"] = "MEDIUM";
    Severity["LOW"] = "LOW";
})(Severity || (exports.Severity = Severity = {}));
/**
 * Common type for business domains
 */
var BusinessDomain;
(function (BusinessDomain) {
    BusinessDomain["AUTHENTICATION"] = "AUTHENTICATION";
    BusinessDomain["AUTHORIZATION"] = "AUTHORIZATION";
    BusinessDomain["USER_MANAGEMENT"] = "USER_MANAGEMENT";
    BusinessDomain["DATA_PROCESSING"] = "DATA_PROCESSING";
    BusinessDomain["REPORTING"] = "REPORTING";
    BusinessDomain["INTEGRATION"] = "INTEGRATION";
    BusinessDomain["CORE_BUSINESS"] = "CORE_BUSINESS";
    BusinessDomain["INFRASTRUCTURE"] = "INFRASTRUCTURE";
})(BusinessDomain || (exports.BusinessDomain = BusinessDomain = {}));
// WebSocket status enum (from schemas)
var WebSocketStatus;
(function (WebSocketStatus) {
    WebSocketStatus["CONNECTING"] = "CONNECTING";
    WebSocketStatus["OPEN"] = "OPEN";
    WebSocketStatus["CLOSING"] = "CLOSING";
    WebSocketStatus["CLOSED"] = "CLOSED";
    WebSocketStatus["RECONNECTING"] = "RECONNECTING";
})(WebSocketStatus || (exports.WebSocketStatus = WebSocketStatus = {}));
// WebSocket message type enum (from schemas)
var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType["PING"] = "PING";
    WebSocketMessageType["PONG"] = "PONG";
    WebSocketMessageType["AUTH"] = "AUTH";
    WebSocketMessageType["ERROR"] = "ERROR";
    WebSocketMessageType["DATA"] = "DATA";
    WebSocketMessageType["SUBSCRIBE"] = "SUBSCRIBE";
    WebSocketMessageType["UNSUBSCRIBE"] = "UNSUBSCRIBE";
    WebSocketMessageType["SUBSCRIBED"] = "SUBSCRIBED";
    WebSocketMessageType["UNSUBSCRIBED"] = "UNSUBSCRIBED";
    WebSocketMessageType["SYSTEM"] = "SYSTEM";
})(WebSocketMessageType || (exports.WebSocketMessageType = WebSocketMessageType = {}));
// Message direction enum (from schemas)
var MessageDirection;
(function (MessageDirection) {
    MessageDirection["INCOMING"] = "INCOMING";
    MessageDirection["OUTGOING"] = "OUTGOING";
})(MessageDirection || (exports.MessageDirection = MessageDirection = {}));
// Chart enums
var ChartType;
(function (ChartType) {
    ChartType["LINE"] = "LINE";
    ChartType["BAR"] = "BAR";
    ChartType["PIE"] = "PIE";
    ChartType["SCATTER"] = "SCATTER";
    ChartType["RADAR"] = "RADAR";
    ChartType["NETWORK"] = "NETWORK";
})(ChartType || (exports.ChartType = ChartType = {}));
/// ============================================================================
// DOMAIN: AI VERIFICATION TYPES
/// ============================================================================
// AI Verification Step Category
var VerificationStepCategory;
(function (VerificationStepCategory) {
    VerificationStepCategory["FUNCTIONAL"] = "FUNCTIONAL";
    VerificationStepCategory["PERFORMANCE"] = "PERFORMANCE";
    VerificationStepCategory["SECURITY"] = "SECURITY";
    VerificationStepCategory["ACCESSIBILITY"] = "ACCESSIBILITY";
    VerificationStepCategory["INTEGRATION"] = "INTEGRATION";
})(VerificationStepCategory || (exports.VerificationStepCategory = VerificationStepCategory = {}));
// AI Error Handler Types
var AIErrorCategory;
(function (AIErrorCategory) {
    AIErrorCategory["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    AIErrorCategory["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    AIErrorCategory["AUTHENTICATION_FAILURE"] = "AUTHENTICATION_FAILURE";
    AIErrorCategory["INVALID_REQUEST"] = "INVALID_REQUEST";
    AIErrorCategory["MODEL_ERROR"] = "MODEL_ERROR";
    AIErrorCategory["TIMEOUT"] = "TIMEOUT";
    AIErrorCategory["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
    AIErrorCategory["NETWORK_ERROR"] = "NETWORK_ERROR";
    AIErrorCategory["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    AIErrorCategory["VALIDATION_ERROR"] = "VALIDATION_ERROR";
})(AIErrorCategory || (exports.AIErrorCategory = AIErrorCategory = {}));
var AIRecoveryType;
(function (AIRecoveryType) {
    AIRecoveryType["RETRY_WITH_BACKOFF"] = "RETRY_WITH_BACKOFF";
    AIRecoveryType["FALLBACK_TO_CACHE"] = "FALLBACK_TO_CACHE";
    AIRecoveryType["USE_ALTERNATIVE_MODEL"] = "USE_ALTERNATIVE_MODEL";
    AIRecoveryType["REDUCE_REQUEST_COMPLEXITY"] = "REDUCE_REQUEST_COMPLEXITY";
    AIRecoveryType["MANUAL_INTERVENTION"] = "MANUAL_INTERVENTION";
    AIRecoveryType["CIRCUIT_BREAKER"] = "CIRCUIT_BREAKER";
    AIRecoveryType["GRACEFUL_DEGRADATION"] = "GRACEFUL_DEGRADATION";
    AIRecoveryType["QUEUE_FOR_RETRY"] = "QUEUE_FOR_RETRY";
})(AIRecoveryType || (exports.AIRecoveryType = AIRecoveryType = {}));
var DeploymentEnvironment;
(function (DeploymentEnvironment) {
    DeploymentEnvironment["DEVELOPMENT"] = "DEVELOPMENT";
    DeploymentEnvironment["TESTING"] = "TESTING";
    DeploymentEnvironment["STAGING"] = "STAGING";
    DeploymentEnvironment["PRODUCTION"] = "PRODUCTION";
})(DeploymentEnvironment || (exports.DeploymentEnvironment = DeploymentEnvironment = {}));
var DeploymentStrategy;
(function (DeploymentStrategy) {
    DeploymentStrategy["BLUE_GREEN"] = "BLUE_GREEN";
    DeploymentStrategy["ROLLING"] = "ROLLING";
    DeploymentStrategy["CANARY"] = "CANARY";
    DeploymentStrategy["RECREATE"] = "RECREATE";
})(DeploymentStrategy || (exports.DeploymentStrategy = DeploymentStrategy = {}));
var SeniorityLevel;
(function (SeniorityLevel) {
    SeniorityLevel["JUNIOR"] = "JUNIOR";
    SeniorityLevel["MID"] = "MID";
    SeniorityLevel["SENIOR"] = "SENIOR";
    SeniorityLevel["PRINCIPAL"] = "PRINCIPAL";
})(SeniorityLevel || (exports.SeniorityLevel = SeniorityLevel = {}));
var ReviewerType;
(function (ReviewerType) {
    ReviewerType["SENIOR_DEVELOPER"] = "SENIOR_DEVELOPER";
    ReviewerType["TECH_LEAD"] = "TECH_LEAD";
    ReviewerType["ARCHITECT"] = "ARCHITECT";
    ReviewerType["SECURITY_SPECIALIST"] = "SECURITY_SPECIALIST";
    ReviewerType["DOMAIN_EXPERT"] = "DOMAIN_EXPERT";
    ReviewerType["QA_SPECIALIST"] = "QA_SPECIALIST";
})(ReviewerType || (exports.ReviewerType = ReviewerType = {}));
var VerificationCategory;
(function (VerificationCategory) {
    VerificationCategory["COMPILATION"] = "COMPILATION";
    VerificationCategory["UNIT_TESTING"] = "UNIT_TESTING";
    VerificationCategory["INTEGRATION_TESTING"] = "INTEGRATION_TESTING";
    VerificationCategory["MANUAL_TESTING"] = "MANUAL_TESTING";
    VerificationCategory["CODE_REVIEW"] = "CODE_REVIEW";
    VerificationCategory["PERFORMANCE_TESTING"] = "PERFORMANCE_TESTING";
    VerificationCategory["SECURITY_TESTING"] = "SECURITY_TESTING";
    VerificationCategory["ACCESSIBILITY_TESTING"] = "ACCESSIBILITY_TESTING";
    VerificationCategory["FUNCTIONAL"] = "FUNCTIONAL";
    VerificationCategory["INTEGRATION"] = "INTEGRATION";
    VerificationCategory["SECURITY"] = "SECURITY";
    VerificationCategory["PERFORMANCE"] = "PERFORMANCE";
    VerificationCategory["ACCESSIBILITY"] = "ACCESSIBILITY";
})(VerificationCategory || (exports.VerificationCategory = VerificationCategory = {}));
var Priority;
(function (Priority) {
    Priority["CRITICAL"] = "CRITICAL";
    Priority["HIGH"] = "HIGH";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["LOW"] = "LOW";
})(Priority || (exports.Priority = Priority = {}));
var MitigationStrategyType;
(function (MitigationStrategyType) {
    MitigationStrategyType["FEATURE_FLAGS"] = "FEATURE_FLAGS";
    MitigationStrategyType["PHASED_ROLLOUT"] = "PHASED_ROLLOUT";
    MitigationStrategyType["CIRCUIT_BREAKER"] = "CIRCUIT_BREAKER";
    MitigationStrategyType["FALLBACK_IMPLEMENTATION"] = "FALLBACK_IMPLEMENTATION";
    MitigationStrategyType["MONITORING_ENHANCEMENT"] = "MONITORING_ENHANCEMENT";
    MitigationStrategyType["TESTING_ENHANCEMENT"] = "TESTING_ENHANCEMENT";
    MitigationStrategyType["CODE_REVIEW_ENHANCEMENT"] = "CODE_REVIEW_ENHANCEMENT";
    MitigationStrategyType["GRADUAL_MIGRATION"] = "GRADUAL_MIGRATION";
})(MitigationStrategyType || (exports.MitigationStrategyType = MitigationStrategyType = {}));
// AI Risk Assessment Types
var RiskFactorType;
(function (RiskFactorType) {
    RiskFactorType["ASYNC_COMPLEXITY"] = "ASYNC_COMPLEXITY";
    RiskFactorType["TYPE_SAFETY"] = "TYPE_SAFETY";
    RiskFactorType["COMPONENT_COMPLEXITY"] = "COMPONENT_COMPLEXITY";
    RiskFactorType["EXTERNAL_DEPENDENCIES"] = "EXTERNAL_DEPENDENCIES";
    RiskFactorType["BUSINESS_CRITICALITY"] = "BUSINESS_CRITICALITY";
    RiskFactorType["TRANSFORMATION_COUNT"] = "TRANSFORMATION_COUNT";
    RiskFactorType["PATTERN_COMPLEXITY"] = "PATTERN_COMPLEXITY";
})(RiskFactorType || (exports.RiskFactorType = RiskFactorType = {}));
/// ============================================================================
// DOMAIN: TRANSFORMATION ENGINE TYPES
/// ============================================================================
// Error Resolver Types
(function (ErrorCategory) {
    ErrorCategory["IMPORT_PATH"] = "import_path";
    ErrorCategory["TYPE_DEFINITION"] = "type_definition";
    ErrorCategory["TYPE_ASSERTION"] = "type_assertion";
    ErrorCategory["MISSING_EXPORT"] = "missing_export";
    ErrorCategory["SYNTAX_ERROR"] = "syntax_error";
    ErrorCategory["MODULE_RESOLUTION"] = "module_resolution";
    ErrorCategory["DUPLICATE_IDENTIFIER"] = "duplicate_identifier";
    ErrorCategory["GENERIC_CONSTRAINT"] = "generic_constraint";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
/// ============================================================================
// FACTORY FUNCTIONS
/// ============================================================================
/**
 * Create an API response success result
 */
function createApiSuccess(data, metadata) {
    return {
        success: true,
        data: data,
        metadata: metadata
            ? __assign({ requestId: generateRequestId(), timestamp: new Date().toISOString(), duration: 0, source: 'pipeline', version: '1.0' }, metadata) : undefined,
    };
}
/**
 * Create an API error response
 */
function createApiError(code, message, details, options) {
    return {
        success: false,
        error: __assign({ code: code, message: message, details: details, timestamp: new Date().toISOString(), recoverable: false }, options),
    };
}
/**
 * Create API response (alias for createApiSuccess with error support)
 */
function createApiResponse(data, error) {
    if (error) {
        return createApiError(error.code, error.message, error.details, error);
    }
    return createApiSuccess(data);
}
/**
 * Create system error (transforms to ApiError format)
 */
function createSystemError(code, message, operation, path, details) {
    return {
        code: code,
        message: message,
        details: details,
        path: path,
        timestamp: new Date().toISOString(),
        recoverable: !code.includes('CRITICAL') && !code.includes('FATAL'),
        suggestion: generateSuggestion(code, operation),
    };
}
/**
 * Create entity ID
 */
function createEntityId(value) {
    return value;
}
/**
 * Create operation ID
 */
function createOperationId() {
    return "op_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
/**
 * Create timestamp
 */
function createTimestamp() {
    return new Date().toISOString();
}
/**
 * Create file path from string
 */
function createFilePath(path) {
    return path;
}
/**
 * Create directory path from string
 */
function createDirectoryPath(path) {
    return path;
}
/**
 * Create pattern ID
 */
function createPatternId(value) {
    return value;
}
/**
 * Create transformation ID
 */
function createTransformationId() {
    return "tf_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
/**
 * Create WebSocket connection ID
 */
function createWebSocketConnectionId() {
    return "ws_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
/**
 * Create WebSocket message ID
 */
function createWebSocketMessageId() {
    return "msg_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
/**
 * Create WebSocket channel name
 */
function createWebSocketChannelName(channel) {
    return channel;
}
/**
 * Create chart ID
 */
function createChartId() {
    return "chart_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
/**
 * Generate a unique request ID
 */
function generateRequestId() {
    return "req_".concat(Math.random().toString(36).substring(2, 15));
}
/**
 * Generate helpful suggestion based on error code
 */
function generateSuggestion(code, operation) {
    var suggestions = {
        TYPE_ANALYSIS_LOAD_FAILED: 'Ensure type-analysis.json exists in tools/type-consolidation/',
        IMPORT_REWRITING_FAILED: 'Check file permissions and TypeScript configuration',
        VALIDATION_ERROR: 'Review input data format and schema requirements',
        COMPILATION_ERROR: 'Run tsc --noEmit to see detailed compilation issues',
    };
    return suggestions[code] || "Check ".concat(operation, " implementation and dependencies");
}
/// ============================================================================
// EXPORTS SUMMARY
/// ============================================================================
/**
 * This module exports ALL canonical types as the Single Source of Truth (SSOT).
 *
 * Constitutional Compliance:
 * - All types MUST be imported from this file via @types alias
 * - No local type definitions allowed in domain code
 * - Domain-specific extensions ONLY via pipeline declaration files
 *
 * Import pattern for consumers:
 * import { ApiResponse, EntityId, ValidationLevel } from '@types';
 */ 
