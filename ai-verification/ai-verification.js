"use strict";
/**
 * AI Verification Engine
 *
 * Verification step generation, mitigation strategies, and review requirements.
 * Uses canonical types only, validates all inputs, returns via factory patterns.
 */
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
exports.VerificationEngine = void 0;
var canonical_types_1 = require("../types/canonical-types");
// ============================================================================
// VERIFICATION STEP GENERATOR
// ============================================================================
// ============================================================================
// VERIFICATION STEP GENERATOR
// ============================================================================
var VerificationStepGenerator = /** @class */ (function () {
    function VerificationStepGenerator() {
    }
    VerificationStepGenerator.generateSteps = function (context) {
        var _a, _b;
        try {
            var steps = [];
            var risk = context.riskAssessment;
            // Always include compilation verification
            steps.push(this.createCompilationStep());
            // Add domain-specific steps
            if (context.businessContext) {
                var domainSteps = this.generateDomainSpecificSteps(context.businessContext, risk);
                steps.push.apply(steps, domainSteps);
            }
            // Add cascade-specific steps
            var cascadeSteps = this.generateCascadeSpecificSteps(risk.cascadeType, risk);
            steps.push.apply(steps, cascadeSteps);
            // Add risk-level specific steps
            var riskSteps = this.generateRiskLevelSteps(risk.level, risk);
            steps.push.apply(steps, riskSteps);
            // Add security steps if needed
            if (((_a = context.businessContext) === null || _a === void 0 ? void 0 : _a.accessControlRisk) || ((_b = context.businessContext) === null || _b === void 0 ? void 0 : _b.dataHandlingRisk)) {
                var securitySteps = this.generateSecuritySteps(context.businessContext);
                steps.push.apply(steps, securitySteps);
            }
            // Sort by priority and add dependencies
            var optimizedSteps = this.optimizeStepOrder(steps);
            return (0, canonical_types_1.createApiSuccess)(optimizedSteps);
        }
        catch (error) {
            return (0, canonical_types_1.createApiError)((0, canonical_types_1.createApiError)('Verification step generation failed', 'GENERATION_ERROR', { error: error }));
        }
    };
    VerificationStepGenerator.createCompilationStep = function () {
        return {
            id: "compile-check-".concat(Date.now()),
            description: 'Verify TypeScript compilation succeeds without errors',
            category: canonical_types_1.VerificationCategory.COMPILATION,
            priority: canonical_types_1.Priority.CRITICAL,
            estimatedTimeMinutes: 2,
            automatable: true,
            dependencies: [],
            successCriteria: ['No compilation errors', 'No type errors', 'Build succeeds'],
            toolsRequired: ['TypeScript compiler', 'Build system'],
        };
    };
    VerificationStepGenerator.generateDomainSpecificSteps = function (businessContext, risk) {
        var steps = [];
        switch (businessContext.domain) {
            case canonical_types_1.BusinessDomain.USER_AUTHENTICATION:
                steps.push({
                    id: "auth-flow-test-".concat(Date.now()),
                    description: 'Test user authentication flow with valid credentials',
                    category: canonical_types_1.VerificationCategory.INTEGRATION_TESTING,
                    priority: canonical_types_1.Priority.HIGH,
                    estimatedTimeMinutes: 15,
                    automatable: true,
                    dependencies: ['compile-check'],
                    successCriteria: ['Login succeeds', 'Session created', 'User redirected'],
                    toolsRequired: ['Test framework', 'Browser automation'],
                });
                if (risk.level === canonical_types_1.RiskLevel.HIGH || risk.level === canonical_types_1.RiskLevel.CRITICAL) {
                    steps.push({
                        id: "auth-security-review-".concat(Date.now()),
                        description: 'Security review of authentication changes',
                        category: canonical_types_1.VerificationCategory.SECURITY_TESTING,
                        priority: canonical_types_1.Priority.CRITICAL,
                        estimatedTimeMinutes: 60,
                        automatable: false,
                        dependencies: ['auth-flow-test'],
                        successCriteria: [
                            'No security vulnerabilities',
                            'Proper input validation',
                            'Secure token handling',
                        ],
                        toolsRequired: ['Security scanner', 'Manual review'],
                    });
                }
                break;
            case canonical_types_1.BusinessDomain.API_INTEGRATION:
                steps.push({
                    id: "api-contract-test-".concat(Date.now()),
                    description: 'Verify API requests succeed with valid data',
                    category: canonical_types_1.VerificationCategory.INTEGRATION_TESTING,
                    priority: canonical_types_1.Priority.HIGH,
                    estimatedTimeMinutes: 25,
                    automatable: true,
                    dependencies: ['compile-check'],
                    successCriteria: ['API calls succeed', 'Response format correct', 'Error handling works'],
                    toolsRequired: ['Test framework', 'API mocks'],
                });
                break;
            default:
                steps.push({
                    id: "ui-component-test-".concat(Date.now()),
                    description: 'Verify UI components render without visual errors',
                    category: canonical_types_1.VerificationCategory.INTEGRATION_TESTING,
                    priority: canonical_types_1.Priority.MEDIUM,
                    estimatedTimeMinutes: 15,
                    automatable: true,
                    dependencies: ['compile-check'],
                    successCriteria: ['Components render', 'No visual regressions', 'Interactions work'],
                    toolsRequired: ['Test framework', 'Visual testing'],
                });
        }
        return steps;
    };
    VerificationStepGenerator.generateCascadeSpecificSteps = function (cascadeType, risk) {
        var steps = [];
        switch (cascadeType) {
            case 'TYPE_INFERENCE_CASCADE':
                steps.push({
                    id: "type-inference-test-".concat(Date.now()),
                    description: 'Check type inference in all affected files',
                    category: canonical_types_1.VerificationCategory.COMPILATION,
                    priority: canonical_types_1.Priority.HIGH,
                    estimatedTimeMinutes: 10,
                    automatable: true,
                    dependencies: ['compile-check'],
                    successCriteria: [
                        'Type inference works',
                        'No implicit any',
                        'Generic constraints satisfied',
                    ],
                    toolsRequired: ['TypeScript compiler', 'Type checker'],
                });
                break;
            case 'ASYNC_BOUNDARY_CASCADE':
                steps.push({
                    id: "async-pattern-test-".concat(Date.now()),
                    description: 'Verify async/await patterns are used consistently',
                    category: canonical_types_1.VerificationCategory.UNIT_TESTING,
                    priority: canonical_types_1.Priority.HIGH,
                    estimatedTimeMinutes: 15,
                    automatable: true,
                    dependencies: ['compile-check'],
                    successCriteria: [
                        'Async patterns consistent',
                        'Error handling correct',
                        'No unhandled promises',
                    ],
                    toolsRequired: ['Test framework', 'Async testing tools'],
                });
                break;
        }
        return steps;
    };
    VerificationStepGenerator.generateRiskLevelSteps = function (riskLevel, risk) {
        var steps = [];
        if (riskLevel === canonical_types_1.RiskLevel.HIGH || riskLevel === canonical_types_1.RiskLevel.CRITICAL) {
            steps.push({
                id: "comprehensive-testing-".concat(Date.now()),
                description: 'Run comprehensive test suite including edge cases',
                category: canonical_types_1.VerificationCategory.INTEGRATION_TESTING,
                priority: canonical_types_1.Priority.HIGH,
                estimatedTimeMinutes: 30,
                automatable: true,
                dependencies: ['compile-check'],
                successCriteria: ['All tests pass', 'Edge cases covered', 'Performance acceptable'],
                toolsRequired: ['Test framework', 'Performance tools'],
            });
        }
        return steps;
    };
    VerificationStepGenerator.generateSecuritySteps = function (businessContext) {
        var steps = [];
        if (businessContext.accessControlRisk) {
            steps.push({
                id: "access-control-test-".concat(Date.now()),
                description: 'Verify access control mechanisms function correctly',
                category: canonical_types_1.VerificationCategory.SECURITY_TESTING,
                priority: canonical_types_1.Priority.CRITICAL,
                estimatedTimeMinutes: 45,
                automatable: true,
                dependencies: ['compile-check'],
                successCriteria: [
                    'Access controls work',
                    'Unauthorized access blocked',
                    'Permissions correct',
                ],
                toolsRequired: ['Security testing tools', 'Test framework'],
            });
        }
        return steps;
    };
    VerificationStepGenerator.optimizeStepOrder = function (steps) {
        return __spreadArray([], steps, true).sort(function (a, b) {
            var priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            var priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) {
                return priorityDiff;
            }
            // If same priority, prefer automatable steps
            if (a.automatable && !b.automatable)
                return -1;
            if (!a.automatable && b.automatable)
                return 1;
            return 0;
        });
    };
    return VerificationStepGenerator;
}());
// ============================================================================
// MITIGATION STRATEGY GENERATOR
// ============================================================================
var MitigationStrategyGenerator = /** @class */ (function () {
    function MitigationStrategyGenerator() {
    }
    MitigationStrategyGenerator.createStrategy = function (context) {
        try {
            var risk = context.riskAssessment;
            var riskLevel = risk.level;
            var cascadeType = risk.cascadeType;
            // Determine strategy type based on risk characteristics
            var strategyType = this.determineStrategyType(riskLevel, cascadeType, context);
            var strategy = this.createStrategyByType(strategyType, risk, context);
            return (0, canonical_types_1.createApiSuccess)(strategy);
        }
        catch (error) {
            return (0, canonical_types_1.createApiError)((0, canonical_types_1.createApiError)('Mitigation strategy generation failed', 'STRATEGY_ERROR', { error: error }));
        }
    };
    MitigationStrategyGenerator.determineStrategyType = function (riskLevel, cascadeType, context) {
        var _a;
        // Critical risk always requires feature flags
        if (riskLevel === canonical_types_1.RiskLevel.CRITICAL) {
            return canonical_types_1.MitigationStrategyType.FEATURE_FLAGS;
        }
        // High risk with production deployment
        if (riskLevel === canonical_types_1.RiskLevel.HIGH &&
            ((_a = context.deploymentContext) === null || _a === void 0 ? void 0 : _a.environment) === canonical_types_1.DeploymentEnvironment.PRODUCTION) {
            return canonical_types_1.MitigationStrategyType.PHASED_ROLLOUT;
        }
        // Default strategy
        return canonical_types_1.MitigationStrategyType.TESTING_ENHANCEMENT;
    };
    MitigationStrategyGenerator.createStrategyByType = function (type, risk, context) {
        switch (type) {
            case canonical_types_1.MitigationStrategyType.FEATURE_FLAGS:
                return {
                    type: type,
                    description: 'Deploy with feature flags for instant rollback capability.',
                    implementationSteps: [
                        'Wrap new functionality in feature flags',
                        'Deploy with flags disabled',
                        'Enable for internal users first',
                        'Monitor metrics and error rates',
                        'Gradually increase rollout percentage',
                    ],
                    rollbackPlan: 'Instantly disable feature flag to rollback changes',
                    monitoringRequirements: [
                        'Error rate monitoring',
                        'Performance metrics',
                        'Feature flag usage tracking',
                    ],
                    riskReduction: 0.9,
                    complexity: 6,
                    timeToImplement: 4,
                };
            default:
                return {
                    type: canonical_types_1.MitigationStrategyType.TESTING_ENHANCEMENT,
                    description: 'Enhanced testing procedures with additional validation steps.',
                    implementationSteps: [
                        'Expand test coverage',
                        'Add integration tests',
                        'Manual testing of critical paths',
                        'Deploy with enhanced monitoring',
                    ],
                    rollbackPlan: 'Standard rollback procedures using version control',
                    monitoringRequirements: ['Test coverage metrics', 'Error rate monitoring'],
                    riskReduction: 0.5,
                    complexity: 4,
                    timeToImplement: 2,
                };
        }
    };
    return MitigationStrategyGenerator;
}());
// ============================================================================
// REVIEW REQUIREMENT ANALYZER
// ============================================================================
var ReviewRequirementAnalyzer = /** @class */ (function () {
    function ReviewRequirementAnalyzer() {
    }
    ReviewRequirementAnalyzer.determineRequirement = function (context) {
        try {
            var risk = context.riskAssessment;
            var riskLevel = risk.level;
            // Determine if review is required
            var required = this.isReviewRequired(riskLevel, context);
            if (!required) {
                var requirement_1 = {
                    required: false,
                    reviewers: [],
                    focusAreas: [],
                    estimatedTimeHours: 0,
                    approvalThreshold: 0,
                    escalationCriteria: [],
                };
                return (0, canonical_types_1.createApiSuccess)(requirement_1);
            }
            // Determine reviewers needed
            var reviewers = this.determineReviewers(riskLevel, context);
            // Determine focus areas
            var focusAreas = this.determineFocusAreas(risk, context.businessContext);
            var requirement = {
                required: required,
                reviewers: reviewers,
                focusAreas: focusAreas,
                estimatedTimeHours: this.estimateReviewTime(riskLevel, focusAreas),
                approvalThreshold: this.determineApprovalThreshold(riskLevel, reviewers.length),
                escalationCriteria: this.determineEscalationCriteria(riskLevel),
            };
            return (0, canonical_types_1.createApiSuccess)(requirement);
        }
        catch (error) {
            return (0, canonical_types_1.createApiError)((0, canonical_types_1.createApiError)('Review requirement analysis failed', 'REVIEW_ERROR', {
                error: error,
            }));
        }
    };
    ReviewRequirementAnalyzer.isReviewRequired = function (riskLevel, context) {
        return riskLevel === canonical_types_1.RiskLevel.HIGH || riskLevel === canonical_types_1.RiskLevel.CRITICAL;
    };
    ReviewRequirementAnalyzer.determineReviewers = function (riskLevel, context) {
        var reviewers = [];
        if (riskLevel === canonical_types_1.RiskLevel.HIGH || riskLevel === canonical_types_1.RiskLevel.CRITICAL) {
            reviewers.push(canonical_types_1.ReviewerType.SENIOR_DEVELOPER);
        }
        if (riskLevel === canonical_types_1.RiskLevel.CRITICAL) {
            reviewers.push(canonical_types_1.ReviewerType.TECH_LEAD);
        }
        return reviewers;
    };
    ReviewRequirementAnalyzer.determineFocusAreas = function (risk, businessContext) {
        var focusAreas = [];
        // Add cascade-specific focus areas
        switch (risk.cascadeType) {
            case 'TYPE_INFERENCE_CASCADE':
                focusAreas.push('Type safety and inference');
                break;
            case 'ASYNC_BOUNDARY_CASCADE':
                focusAreas.push('Async pattern correctness');
                break;
        }
        return focusAreas;
    };
    ReviewRequirementAnalyzer.estimateReviewTime = function (riskLevel, focusAreas) {
        var baseTime = riskLevel === canonical_types_1.RiskLevel.CRITICAL ? 4 : 2;
        baseTime += focusAreas.length * 0.5;
        return Math.ceil(baseTime);
    };
    ReviewRequirementAnalyzer.determineApprovalThreshold = function (riskLevel, reviewerCount) {
        if (riskLevel === canonical_types_1.RiskLevel.CRITICAL) {
            return Math.max(2, Math.ceil(reviewerCount * 0.8));
        }
        return Math.max(1, Math.ceil(reviewerCount * 0.6));
    };
    ReviewRequirementAnalyzer.determineEscalationCriteria = function (riskLevel) {
        var criteria = [];
        if (riskLevel === canonical_types_1.RiskLevel.CRITICAL) {
            criteria.push('Any reviewer raises blocking concerns');
            criteria.push('Security issues identified');
        }
        return criteria;
    };
    return ReviewRequirementAnalyzer;
}());
// ============================================================================
// TIME ESTIMATOR
// ============================================================================
var TimeEstimator = /** @class */ (function () {
    function TimeEstimator() {
    }
    TimeEstimator.calculateTotalTime = function (steps, strategy, reviewRequirement) {
        var stepTime = steps.reduce(function (total, step) { return total + step.estimatedTimeMinutes; }, 0) / 60;
        var strategyTime = strategy.timeToImplement;
        var reviewTime = reviewRequirement.estimatedTimeHours;
        return Math.ceil(stepTime + strategyTime + reviewTime);
    };
    return TimeEstimator;
}());
// ============================================================================
// CONFIDENCE CALCULATOR
// ============================================================================
var ConfidenceCalculator = /** @class */ (function () {
    function ConfidenceCalculator() {
    }
    ConfidenceCalculator.calculateVerificationConfidence = function (context, steps) {
        var confidence = context.riskAssessment.confidence;
        // Adjust based on verification thoroughness
        var automatableStepsRatio = steps.filter(function (step) { return step.automatable; }).length; // steps.length;
        confidence *= 0.7 + automatableStepsRatio * 0.3;
        return Math.min(confidence, 1.0);
    };
    return ConfidenceCalculator;
}());
// ============================================================================
// VERIFICATION ENGINE
// ============================================================================
var VerificationEngine = /** @class */ (function () {
    function VerificationEngine() {
    }
    /**
     * Generate verification plan for the given context
     */
    VerificationEngine.generatePlan = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var stepsResult, strategyResult, reviewResult, estimatedTotalTime, confidence, plan;
            return __generator(this, function (_a) {
                try {
                    stepsResult = VerificationStepGenerator.generateSteps(context);
                    if (!stepsResult.success || !stepsResult.data) {
                        return [2 /*return*/, (0, canonical_types_1.createApiError)(stepsResult.error || (0, canonical_types_1.createApiError)('Step generation failed', 'STEP_ERROR'))];
                    }
                    strategyResult = MitigationStrategyGenerator.createStrategy(context);
                    if (!strategyResult.success || !strategyResult.data) {
                        return [2 /*return*/, (0, canonical_types_1.createApiError)(strategyResult.error || (0, canonical_types_1.createApiError)('Strategy generation failed', 'STRATEGY_ERROR'))];
                    }
                    reviewResult = ReviewRequirementAnalyzer.determineRequirement(context);
                    if (!reviewResult.success || !reviewResult.data) {
                        return [2 /*return*/, (0, canonical_types_1.createApiError)(reviewResult.error || (0, canonical_types_1.createApiError)('Review analysis failed', 'REVIEW_ERROR'))];
                    }
                    estimatedTotalTime = TimeEstimator.calculateTotalTime(stepsResult.data, strategyResult.data, reviewResult.data);
                    confidence = ConfidenceCalculator.calculateVerificationConfidence(context, stepsResult.data);
                    plan = {
                        steps: stepsResult.data,
                        strategy: strategyResult.data,
                        reviewRequirement: reviewResult.data,
                        estimatedTotalTime: estimatedTotalTime,
                        confidence: confidence,
                        context: context,
                    };
                    return [2 /*return*/, (0, canonical_types_1.createApiSuccess)(plan)];
                }
                catch (error) {
                    return [2 /*return*/, (0, canonical_types_1.createApiError)((0, canonical_types_1.createApiError)('Verification plan generation failed', 'PLAN_ERROR', {
                            error: error,
                        }))];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Quick verification plan generation
     */
    VerificationEngine.quickPlan = function (riskAssessment) {
        return __awaiter(this, void 0, void 0, function () {
            var context;
            return __generator(this, function (_a) {
                context = { riskAssessment: riskAssessment };
                return [2 /*return*/, this.generatePlan(context)];
            });
        });
    };
    /**
     * Generate verification steps only
     */
    VerificationEngine.generateSteps = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, VerificationStepGenerator.generateSteps(context)];
            });
        });
    };
    /**
     * Generate mitigation strategy only
     */
    VerificationEngine.generateStrategy = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, MitigationStrategyGenerator.createStrategy(context)];
            });
        });
    };
    /**
     * Determine review requirement only
     */
    VerificationEngine.determineReviewRequirement = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ReviewRequirementAnalyzer.determineRequirement(context)];
            });
        });
    };
    return VerificationEngine;
}());
exports.VerificationEngine = VerificationEngine;
