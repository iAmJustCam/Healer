/**
 * Verification Steps Generator
 *
 * Generates tailored verification steps for different types of changes,
 * business domains, and risk levels. Uses canonical types only.
 */

import { 
  ApiResponse, 
  BusinessDomain, 
  Framework, 
  Severity,
  PipelineParams,
  PipelineContext,
  TransformationResult,
  ValidationError,
  MigrationSession,
  RiskAssessment,
  RiskLevel,
  createApiSuccess, 
  createApiError 
} from '@/types/canonical-types';

import { BusinessDomainSchema, SeveritySchema } from '@/shared-foundation/validation-schemas';
import { validateWithSchema } from '@/shared-foundation/validation-schemas';

// ============================================================================
// VERIFICATION STEP GENERATION FUNCTIONS
// ============================================================================

// ============================================================================
// STEP GENERATION FUNCTIONS
// ============================================================================

/**
 * Generates common verification steps for all changes
 */
function generateCommonVerificationSteps(severity: Severity): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const steps: string[] = [
      'Verify TypeScript compilation succeeds without errors',
      'Run automated tests to ensure functionality is preserved',
    ];

    if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
      steps.push('Perform manual testing of affected components');
      steps.push('Check browser console for unexpected errors during operation');
      steps.push("Verify bundle size hasn't increased significantly");
    }

    if (severity === Severity.CRITICAL) {
      steps.push('Execute comprehensive integration test suite');
      steps.push('Perform load testing on affected endpoints');
      steps.push('Validate error handling and recovery scenarios');
    }

    return createApiSuccess(steps);
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Common step generation failed', {
      error,
    });
  }
}

/**
 * Generates domain-specific verification steps
 */
function generateDomainSteps(
  domain: BusinessDomain,
  severity: Severity,
  userFlows?: readonly string[],
): ApiResponse<readonly string[]> {
  try {
    const domainValidation = validateWithSchema(BusinessDomainSchema, domain);
    if (!domainValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid business domain');
    }

    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const steps: string[] = [];

    switch (domain) {
      case BusinessDomain.USER_AUTHENTICATION:
        steps.push('Test user login with valid credentials');
        steps.push('Verify session persistence across page refreshes');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test authentication with invalid credentials');
          steps.push('Verify token expiration and refresh flows');
          steps.push('Check for proper error handling in authentication flows');
          steps.push('Verify logout functionality properly clears session data');
          steps.push('Test multi-factor authentication flows if applicable');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Perform security penetration testing');
          steps.push('Validate OAuth/SAML integration flows');
          steps.push('Test session hijacking prevention measures');
        }
        break;

      case BusinessDomain.DATA_PROCESSING:
        steps.push('Verify data transformation pipelines execute correctly');
        steps.push('Test data validation and sanitization');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test data processing with edge case inputs');
          steps.push('Verify data integrity throughout processing pipeline');
          steps.push('Check error handling for malformed data');
          steps.push('Test processing performance with large datasets');
          steps.push('Validate data output formats and schemas');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Test real-time data streaming scenarios');
          steps.push('Verify data backup and recovery procedures');
          steps.push('Test data processing under high load');
        }
        break;

      case BusinessDomain.SYSTEM_HEALTH:
        steps.push('Verify health metrics are collected correctly');
        steps.push('Test health status indicators display properly');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test system behavior when health metrics are unavailable');
          steps.push('Verify alerting thresholds and notifications');
          steps.push('Check historical metric data visualization');
          steps.push('Test resource utilization during metric collection');
          steps.push('Validate health check endpoint responses');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Test failover scenarios and recovery procedures');
          steps.push('Verify monitoring system integration');
          steps.push('Test alert escalation procedures');
        }
        break;

      case BusinessDomain.API_INTEGRATION:
        steps.push('Verify API requests succeed with valid data');
        steps.push('Test API error handling');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Verify request payload formatting');
          steps.push('Test API response parsing');
          steps.push('Check retry logic for failed requests');
          steps.push('Verify timeout handling');
          steps.push('Test API call cancellation');
          steps.push('Validate API versioning compatibility');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Test API rate limiting and throttling');
          steps.push('Verify API authentication and authorization');
          steps.push('Test circuit breaker patterns');
        }
        break;

      case BusinessDomain.USER_INTERFACE:
        steps.push('Verify components render without visual errors');
        steps.push('Test user interaction flows');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test component props validation');
          steps.push('Verify component lifecycle behaviors');
          steps.push('Check responsive layout on different screen sizes');
          steps.push('Test keyboard navigation and accessibility');
          steps.push('Verify state management during user interactions');
          steps.push('Test error boundary functionality');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Perform cross-browser compatibility testing');
          steps.push('Test performance with large component trees');
          steps.push('Verify WCAG accessibility compliance');
        }
        break;
    }

    // Add specific steps for user flows if provided
    if (userFlows && userFlows.length > 0) {
      userFlows.forEach((flow) => {
        steps.push(`Test complete user flow: ${flow}`);
      });
    }

    return createApiSuccess(steps);
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Domain step generation failed', {
      error,
    });
  }
}

/**
 * Generates cascade-specific verification steps
 */
function generateCascadeTypeSteps(
  cascadeType: CascadeType,
  severity: Severity,
): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const steps: string[] = [];

    switch (cascadeType) {
      case 'TYPE_INFERENCE_CASCADE':
        steps.push('Check type inference in all affected files');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Verify explicit type annotations at module boundaries');
          steps.push('Test edge cases with complex types');
          steps.push('Check generic type parameter usage');
          steps.push('Verify type narrowing in conditional blocks');
          steps.push('Test union and intersection type handling');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Verify type compatibility across version boundaries');
          steps.push('Test compiler performance with complex type chains');
        }
        break;

      case 'MODULE_BOUNDARY_CASCADE':
        steps.push('Verify import resolution across module boundaries');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Check bundling and code splitting');
          steps.push('Verify circular dependency handling');
          steps.push('Test dynamic imports');
          steps.push('Check tree-shaking effectiveness');
          steps.push('Test module federation scenarios');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Verify micro-frontend integration');
          steps.push('Test module loading performance');
        }
        break;

      case 'ASYNC_BOUNDARY_CASCADE':
        steps.push('Verify async/await patterns are used consistently');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test error handling in async code paths');
          steps.push('Verify Promise chaining and composition');
          steps.push('Check for unhandled Promise rejections');
          steps.push('Test concurrent async operations');
          steps.push('Verify async operation cancellation');
          steps.push('Test async generator and iterator patterns');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Test async resource cleanup and memory leaks');
          steps.push('Verify async performance under load');
        }
        break;

      case 'FRAMEWORK_CONTRACT_CASCADE':
        steps.push('Verify component lifecycles function correctly');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test component mounting and unmounting');
          steps.push('Verify effect cleanup functions');
          steps.push('Check context provider/consumer relationships');
          steps.push('Test component prop changes and re-rendering');
          steps.push('Verify React key usage in lists');
          steps.push('Test Suspense and Error Boundary integration');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Test Server Side Rendering compatibility');
          steps.push('Verify hydration behavior');
        }
        break;

      case 'CSS_STYLE_CASCADE':
        steps.push('Verify visual appearance matches design specifications');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test responsive behavior across breakpoints');
          steps.push('Check CSS specificity and override patterns');
          steps.push('Verify CSS-in-JS theme integration');
          steps.push('Test CSS animations and transitions');
          steps.push('Check for CSS leakage between components');
          steps.push('Test dark mode and theme switching');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Perform visual regression testing');
          steps.push('Test CSS performance and bundle size');
        }
        break;

      case 'API_CONTRACT_CASCADE':
        steps.push('Verify API contracts are maintained');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Test API versioning compatibility');
          steps.push('Verify schema validation');
          steps.push('Check backward compatibility');
          steps.push('Test API documentation accuracy');
          steps.push('Verify error response formats');
          steps.push('Test GraphQL schema compatibility');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Perform contract testing with consumer services');
          steps.push('Test API performance and scaling');
        }
        break;

      case 'LOGGER_MIGRATION_CASCADE':
        steps.push('Verify logger calls are properly formatted');

        if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
          steps.push('Check structured logging context objects');
          steps.push('Verify log levels are applied correctly');
          steps.push('Test log filtering and aggregation');
          steps.push('Check source attribution in logs');
          steps.push('Verify logger performance impact');
          steps.push('Test log correlation and tracing');
        }

        if (severity === Severity.CRITICAL) {
          steps.push('Test log shipping and aggregation pipelines');
          steps.push('Verify log security and PII handling');
        }
        break;

      default:
        steps.push(`Verify ${cascadeType} effects are handled correctly`);
        break;
    }

    return createApiSuccess(steps);
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Cascade step generation failed', {
      error,
    });
  }
}

/**
 * Generates security-focused verification steps when needed
 */
function generateSecuritySteps(
  hasDataHandling: boolean,
  hasAccessControl: boolean,
  severity: Severity,
): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const steps: string[] = [];

    if (hasDataHandling) {
      steps.push('Verify sensitive data is not exposed in logs or client-side');
      steps.push('Check data validation and sanitization');
      steps.push('Test secure storage of sensitive information');

      if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
        steps.push('Test data encryption at rest and in transit');
        steps.push('Verify data retention and deletion policies');
        steps.push('Check GDPR/CCPA compliance requirements');
      }
    }

    if (hasAccessControl) {
      steps.push('Verify authorization checks are correctly applied');
      steps.push('Test access control with different user roles');
      steps.push('Check for proper permission validation');
      steps.push('Verify secure routing and navigation guards');

      if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
        steps.push('Test privilege escalation prevention');
        steps.push('Verify audit logging for access control events');
        steps.push('Test session management security');
      }
    }

    return createApiSuccess(steps);
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Security step generation failed', {
      error,
    });
  }
}

/**
 * Generates verification steps for external dependencies
 */
function generateDependencySteps(
  dependencies?: {
    readonly internal: readonly string[];
    readonly external: readonly string[];
  },
  severity?: Severity,
): ApiResponse<readonly string[]> {
  try {
    const steps: string[] = [];

    if (!dependencies) {
      return createApiSuccess(steps);
    }

    if (dependencies.external && dependencies.external.length > 0) {
      steps.push('Verify external dependencies are correctly initialized');

      if (
        dependencies.external.length > 3 ||
        severity === Severity.ERROR ||
        severity === Severity.CRITICAL
      ) {
        steps.push('Check for dependency version conflicts');
        steps.push('Verify bundle size impact of external dependencies');
        steps.push('Test dependency security vulnerabilities');
      }

      if (severity === Severity.CRITICAL) {
        steps.push('Verify dependency license compatibility');
        steps.push('Test dependency update and migration paths');
      }
    }

    if (dependencies.internal && dependencies.internal.length > 5) {
      steps.push('Check for circular dependencies in internal imports');
      steps.push('Verify module boundary contracts are maintained');

      if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
        steps.push('Test internal API stability');
        steps.push('Verify internal dependency versioning');
      }
    }

    return createApiSuccess(steps);
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Dependency step generation failed', {
      error,
    });
  }
}

// ============================================================================
// MAIN VERIFICATION STEP GENERATION
// ============================================================================

/**
 * Main function to generate verification steps using canonical types
 */
export function generateVerificationSteps(
  input: PipelineParams<'verification'>,
): ApiResponse<readonly string[]> {
  try {
    // Validate input
    const severityValidation = validateWithSchema(SeveritySchema, input.severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity in input');
    }

    const domainValidation = validateWithSchema(BusinessDomainSchema, input.domain);
    if (!domainValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid domain in input');
    }

    // Start with common steps
    const commonStepsResult = generateCommonVerificationSteps(input.severity);
    if (!commonStepsResult.success || !commonStepsResult.data) {
      return commonStepsResult.error ? commonStepsResult : createApiError('GENERATION_ERROR', 'Common steps generation failed');
    }
    let steps = [...commonStepsResult.data];

    // Add domain-specific steps
    const domainStepsResult = generateDomainSteps(input.domain, input.severity, input.userFlows);
    if (!domainStepsResult.success || !domainStepsResult.data) {
      return domainStepsResult.error ? domainStepsResult : createApiError('GENERATION_ERROR', 'Domain steps generation failed');
    }
    steps = [...steps, ...domainStepsResult.data];

    // Add cascade-type specific steps
    const cascadeStepsResult = generateCascadeTypeSteps(input.cascadeType, input.severity);
    if (!cascadeStepsResult.success || !cascadeStepsResult.data) {
      return cascadeStepsResult.error ? cascadeStepsResult : createApiError('GENERATION_ERROR', 'Cascade steps generation failed');
    }
    steps = [...steps, ...cascadeStepsResult.data];

    // Add security steps if needed
    if (input.hasDataHandling || input.hasAccessControl) {
      const securityStepsResult = generateSecuritySteps(
        input.hasDataHandling,
        input.hasAccessControl,
        input.severity,
      );
      if (!securityStepsResult.success || !securityStepsResult.data) {
        return securityStepsResult.error ? securityStepsResult : createApiError('GENERATION_ERROR', 'Security steps generation failed');
      }
      steps = [...steps, ...securityStepsResult.data];
    }

    // Add dependency-related steps
    if (input.dependencies) {
      const dependencyStepsResult = generateDependencySteps(input.dependencies, input.severity);
      if (!dependencyStepsResult.success || !dependencyStepsResult.data) {
        return dependencyStepsResult.error ? dependencyStepsResult : createApiError('GENERATION_ERROR', 'Dependency steps generation failed');
      }
      steps = [...steps, ...dependencyStepsResult.data];
    }

    // Deduplicate steps
    const uniqueSteps = Array.from(new Set(steps));

    // Limit steps based on severity level to avoid overwhelming
    const stepLimit =
      input.severity === Severity.CRITICAL
        ? 20
        : input.severity === Severity.ERROR
          ? 15
          : input.severity === Severity.WARNING
            ? 10
            : 7;

    return createApiSuccess(uniqueSteps.slice(0, stepLimit));
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Verification steps generation failed', { error });
  }
}

/**
 * Generate structured verification plan using canonical types
 */
export function generateMigrationSession(input: PipelineParams<'verification'>): ApiResponse<MigrationSession> {
  try {
    const stepDescriptionsResult = generateVerificationSteps(input);
    if (!stepDescriptionsResult.success || !stepDescriptionsResult.data) {
      return stepDescriptionsResult.error ? stepDescriptionsResult : createApiError('STEP_ERROR', 'Step generation failed');
    }

    const stepDescriptions = stepDescriptionsResult.data;

    const steps: VerificationStep[] = stepDescriptions.map((description, index) => ({
      id: `step-${index + 1}`,
      description,
      category: categorizeVerificationStep(description),
      automated: isAutomatedStep(description),
      estimatedMinutes: estimateStepDuration(description, input.severity),
      prerequisites: [], // TODO: Add dependency analysis
    }));

    const totalMinutes = steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);

    const plan: MigrationSession = { // Using MigrationSession instead of MigrationSession
      id: `plan-${Date.now()}`,
      targetIssues: [], // Provided by caller
      steps,
      estimatedTotalMinutes: totalMinutes,
      riskLevel: input.severity,
      requiredEnvironments: determineRequiredEnvironments(input),
    };

    return createApiSuccess(plan);
  } catch (error) {
    return createApiError('PLAN_ERROR', 'Verification plan generation failed', {
      error,
    });
  }
}

/**
 * Categorize verification step type
 */
function categorizeVerificationStep(description: string): VerificationStepCategory {
  if (
    description.toLowerCase().includes('security') ||
    description.toLowerCase().includes('auth') ||
    description.toLowerCase().includes('permission')
  ) {
    return VerificationStepCategory.SECURITY;
  }
  if (
    description.toLowerCase().includes('performance') ||
    description.toLowerCase().includes('load') ||
    description.toLowerCase().includes('bundle')
  ) {
    return VerificationStepCategory.PERFORMANCE;
  }
  if (
    description.toLowerCase().includes('accessibility') ||
    description.toLowerCase().includes('wcag') ||
    description.toLowerCase().includes('keyboard')
  ) {
    return VerificationStepCategory.ACCESSIBILITY;
  }
  if (
    description.toLowerCase().includes('api') ||
    description.toLowerCase().includes('integration') ||
    description.toLowerCase().includes('contract')
  ) {
    return VerificationStepCategory.INTEGRATION;
  }
  return VerificationStepCategory.FUNCTIONAL;
}

/**
 * Determine if a step can be automated
 */
function isAutomatedStep(description: string): boolean {
  const automatedKeywords = [
    'compilation',
    'automated test',
    'bundle size',
    'lint',
    'type check',
    'unit test',
    'integration test',
    'dependency check',
  ];

  return automatedKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword.toLowerCase()),
  );
}

/**
 * Estimate step duration based on complexity
 */
function estimateStepDuration(description: string, severity: Severity): number {
  let baseMinutes = 5; // Default

  if (description.toLowerCase().includes('manual testing')) baseMinutes = 15;
  if (description.toLowerCase().includes('comprehensive')) baseMinutes = 30;
  if (description.toLowerCase().includes('integration')) baseMinutes = 20;
  if (description.toLowerCase().includes('security')) baseMinutes = 25;
  if (description.toLowerCase().includes('performance')) baseMinutes = 20;

  // Adjust based on severity
  const severityMultiplier =
    severity === Severity.CRITICAL
      ? 2
      : severity === Severity.ERROR
        ? 1.5
        : severity === Severity.WARNING
          ? 1.2
          : 1;

  return Math.round(baseMinutes * severityMultiplier);
}

/**
 * Determine required environments for testing
 */
function determineRequiredEnvironments(input: VerificationInput): readonly string[] {
  const environments = ['development'];

  if (input.severity === Severity.ERROR || input.severity === Severity.CRITICAL) {
    environments.push('staging');
  }

  if (input.severity === Severity.CRITICAL) {
    environments.push('production');
  }

  if (input.context.userFacing) {
    environments.push('browser-testing');
  }

  if (input.domain === BusinessDomain.API_INTEGRATION) {
    environments.push('api-testing');
  }

  return environments;
}

// ============================================================================
// FRAMEWORK-SPECIFIC STEP GENERATORS
// ============================================================================

/**
 * Generate verification steps for TypeScript-specific changes using canonical categories
 */
export function generateTypeScriptVerificationSteps(
  severity: Severity,
  features: readonly string[],
): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const baseSteps = [
      'Verify TypeScript compilation succeeds without errors',
      'Check for any type inference issues in related files',
    ];

    const additionalSteps: string[] = [];

    // Add steps based on specific features
    if (features.includes('array')) {
      additionalSteps.push('Verify array type syntax is consistent (T[] vs. Array<T>)');
    }

    if (features.includes('any')) {
      additionalSteps.push('Check replacement of "any" types with more specific types');
      additionalSteps.push('Verify type narrowing is used where appropriate');
    }

    if (features.includes('equality')) {
      additionalSteps.push('Verify strict equality operators (=== and !==) are used correctly');
      additionalSteps.push('Test null/undefined handling with strict equality');
    }

    if (features.includes('non-null')) {
      additionalSteps.push('Verify non-null assertions are replaced with proper null checks');
      additionalSteps.push('Test with potentially null values to ensure safe handling');
    }

    // Add high/critical severity steps
    if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
      additionalSteps.push('Test edge cases with complex types');
      additionalSteps.push('Verify generic type parameter usage');
      additionalSteps.push('Check for proper error handling with type guards');
      additionalSteps.push('Verify interfaces and type definitions are consistent');
    }

    if (severity === Severity.CRITICAL) {
      additionalSteps.push('Perform comprehensive type system integration testing');
      additionalSteps.push('Verify type compatibility across major version boundaries');
    }

    // Combine and deduplicate
    const allSteps = [...baseSteps, ...additionalSteps];
    const uniqueSteps = Array.from(new Set(allSteps));

    // Limit based on severity level
    const stepLimit =
      severity === Severity.CRITICAL
        ? 12
        : severity === Severity.ERROR
          ? 9
          : severity === Severity.WARNING
            ? 6
            : 4;

    return createApiSuccess(uniqueSteps.slice(0, stepLimit));
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'TypeScript verification steps generation failed', {
      error,
    });
  }
}

/**
 * Generate verification steps for React/Next.js specific changes using canonical types
 */
export function generateReactVerificationSteps(
  severity: Severity,
  features: readonly string[],
): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const baseSteps = [
      'Verify components render correctly',
      'Test component props and state management',
    ];

    const additionalSteps: string[] = [];

    // Add steps based on specific features
    if (features.includes('fc')) {
      additionalSteps.push('Verify function component type definitions are correct');
      additionalSteps.push('Check prop type definitions for function components');
    }

    if (features.includes('image')) {
      additionalSteps.push('Verify Next.js Image component renders correctly');
      additionalSteps.push('Test image loading with different sizes and priorities');
      additionalSteps.push('Check image optimization settings');
    }

    if (features.includes('router')) {
      additionalSteps.push('Verify router navigation works as expected');
      additionalSteps.push('Test route parameters and query strings');
      additionalSteps.push('Check client-side navigation performance');
    }

    // Add high/critical severity steps
    if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
      additionalSteps.push('Test component mounting and unmounting lifecycle');
      additionalSteps.push('Verify effect cleanup functions run correctly');
      additionalSteps.push('Check for memory leaks in components');
      additionalSteps.push('Test component performance with React DevTools');
      additionalSteps.push('Verify error boundaries catch and handle exceptions');
    }

    if (severity === Severity.CRITICAL) {
      additionalSteps.push('Test Server Side Rendering and hydration');
      additionalSteps.push('Verify Concurrent Features compatibility');
      additionalSteps.push('Test accessibility compliance with screen readers');
    }

    // Combine and deduplicate
    const allSteps = [...baseSteps, ...additionalSteps];
    const uniqueSteps = Array.from(new Set(allSteps));

    // Limit based on severity level
    const stepLimit =
      severity === Severity.CRITICAL
        ? 12
        : severity === Severity.ERROR
          ? 9
          : severity === Severity.WARNING
            ? 6
            : 4;

    return createApiSuccess(uniqueSteps.slice(0, stepLimit));
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'React verification steps generation failed', { error });
  }
}

/**
 * Generate verification steps for Tailwind CSS specific changes using canonical types
 */
export function generateTailwindVerificationSteps(
  severity: Severity,
  features: readonly string[],
): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const baseSteps = [
      'Verify components display correctly with updated Tailwind classes',
      'Check responsive behavior across breakpoints',
    ];

    const additionalSteps: string[] = [];

    // Add steps based on specific features
    if (features.includes('classes')) {
      additionalSteps.push('Verify deprecated class names are replaced with new equivalents');
      additionalSteps.push('Check for visual regressions after class name updates');
    }

    if (features.includes('directives')) {
      additionalSteps.push('Verify Tailwind directives are correctly implemented');
      additionalSteps.push('Check CSS build output for correct Tailwind processing');
    }

    if (features.includes('theme')) {
      additionalSteps.push('Verify theme customizations are applied correctly');
      additionalSteps.push('Test dark mode and theme switching if applicable');
    }

    // Add high/critical severity steps
    if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
      additionalSteps.push('Test component appearance in all supported browsers');
      additionalSteps.push('Verify CSS specificity conflicts are resolved');
      additionalSteps.push('Check CSS bundle size optimization');
      additionalSteps.push('Test for CSS leakage between components');
      additionalSteps.push('Verify animations and transitions function correctly');
    }

    if (severity === Severity.CRITICAL) {
      additionalSteps.push('Perform visual regression testing with baseline images');
      additionalSteps.push('Test CSS performance impact on page load times');
      additionalSteps.push('Verify print stylesheet compatibility');
    }

    // Combine and deduplicate
    const allSteps = [...baseSteps, ...additionalSteps];
    const uniqueSteps = Array.from(new Set(allSteps));

    // Limit based on severity level
    const stepLimit =
      severity === Severity.CRITICAL
        ? 12
        : severity === Severity.ERROR
          ? 9
          : severity === Severity.WARNING
            ? 6
            : 4;

    return createApiSuccess(uniqueSteps.slice(0, stepLimit));
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Tailwind verification steps generation failed', {
      error,
    });
  }
}

/**
 * Generate verification steps for Logger migration specific changes using canonical types
 */
export function generateLoggerVerificationSteps(
  severity: Severity,
  features: readonly string[],
): ApiResponse<readonly string[]> {
  try {
    const severityValidation = validateWithSchema(SeveritySchema, severity);
    if (!severityValidation.success) {
      return createApiError('VALIDATION_ERROR', 'Invalid severity level');
    }

    const baseSteps = [
      'Verify logger calls are correctly formatted',
      'Check log levels are applied appropriately',
    ];

    const additionalSteps: string[] = [];

    // Add steps based on specific features
    if (features.includes('context')) {
      additionalSteps.push('Verify context objects contain relevant information');
      additionalSteps.push('Check structured logging format is consistent');
    }

    if (features.includes('source')) {
      additionalSteps.push('Verify log source attribution is correct');
      additionalSteps.push('Check source naming conventions are followed');
    }

    if (features.includes('levels')) {
      additionalSteps.push('Verify log level mapping from console to logger is appropriate');
      additionalSteps.push('Test log filtering by level works correctly');
    }

    // Add high/critical severity steps
    if (severity === Severity.ERROR || severity === Severity.CRITICAL) {
      additionalSteps.push('Test logger performance impact on application');
      additionalSteps.push('Verify sensitive data is not logged inappropriately');
      additionalSteps.push('Check error objects are properly serialized in logs');
      additionalSteps.push('Test logging during error conditions');
      additionalSteps.push('Verify log aggregation and search functionality');
    }

    if (severity === Severity.CRITICAL) {
      additionalSteps.push('Test log shipping pipeline reliability');
      additionalSteps.push('Verify log correlation across distributed services');
      additionalSteps.push('Test log security and encryption requirements');
    }

    // Combine and deduplicate
    const allSteps = [...baseSteps, ...additionalSteps];
    const uniqueSteps = Array.from(new Set(allSteps));

    // Limit based on severity level
    const stepLimit =
      severity === Severity.CRITICAL
        ? 12
        : severity === Severity.ERROR
          ? 9
          : severity === Severity.WARNING
            ? 6
            : 4;

    return createApiSuccess(uniqueSteps.slice(0, stepLimit));
  } catch (error) {
    return createApiError('GENERATION_ERROR', 'Logger verification steps generation failed', { error });
  }
}
