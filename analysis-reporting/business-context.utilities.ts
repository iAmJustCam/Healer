/**
 * Business Context Analysis Utilities
 *
 * CANONICAL MODEL COMPLIANCE:
 * ✓ Depends only on Foundation Types (Layer 0)
 * ✓ Pure utility functions only - no side effects
 * ✓ Environment-agnostic
 * ✓ Single responsibility: Business context analysis only (SRP)
 * ✓ All inputs validated with canonical schemas
 */

import { z } from 'zod';
import { ApiResponse, BusinessDomain, RiskLevel, createApiError } from '../types/canonical-types';
import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import { ApiUtilities } from '';

// Input validation schemas
const BusinessContextRequestSchema = z.object({
  filePath: z.string().min(1),
  content: z.string(),
});

const DomainDetectionRequestSchema = z.object({
  filePath: z.string().min(1),
  content: z.string(),
});

/**
 * Analyze business context for a file
 */
export function analyzeBusinessContext(request: unknown): ApiResponse<{
  domain: BusinessDomain;
  businessImpact: string;
  userFlowsAffected: readonly string[];
  criticality: number;
  dataHandlingRisk: boolean;
  accessControlRisk: boolean;
  customization: {
    isCustomized: boolean;
    customizationRisk: number;
  };
  dependencies: {
    internal: readonly string[];
    external: readonly string[];
  };
}> {
  // Validate inputs
  const validationResult = validateWithSchema(BusinessContextRequestSchema, request);
  if (!validationResult.success) {
    return ApiUtilities.error(
      createApiError('Invalid business context analysis request', 'VALIDATION_ERROR', {
        validationErrors: validationResult.error,
      }),
    );
  }

  const { filePath, content } = validationResult.data;

  try {
    const domain = detectBusinessDomain(filePath, content);
    const userFlows = identifyAffectedUserFlows(domain, content);
    const dataHandlingRisk = analyzeDataHandlingRisk(content);
    const accessControlRisk = analyzeAccessControlRisk(content);
    const customization = analyzeCustomization(content);
    const dependencies = extractDependencies(content);

    const criticality = calculateBusinessCriticality(
      domain,
      userFlows,
      dataHandlingRisk,
      accessControlRisk,
      customization.customizationRisk,
    );

    const businessImpact = generateBusinessImpact(domain, criticality >= 7 ? RiskLevel.HIGH : RiskLevel.MEDIUM);

    const analysis = {
      domain,
      businessImpact,
      userFlowsAffected: userFlows,
      criticality,
      dataHandlingRisk,
      accessControlRisk,
      customization,
      dependencies,
    };

    return ApiUtilities.ok(analysis);
  } catch (error) {
    return ApiUtilities.error(
      createApiError(
        `Business context analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ANALYSIS_ERROR',
        { filePath, error },
      ),
    );
  }
}

/**
 * Detect business domain from file path and content
 */
export function detectBusinessDomain(filePath: string, content: string): BusinessDomain {
  // Domain detection by path
  if (filePath.includes('/auth/') || filePath.includes('/login/')) {
    return BusinessDomain.USER_AUTHENTICATION;
  }
  if (filePath.includes('/api/') || filePath.includes('/bridge/')) {
    return BusinessDomain.API_INTEGRATION;
  }
  if (
    filePath.includes('/chart/') ||
    filePath.includes('/graph/') ||
    filePath.includes('Chart') ||
    filePath.includes('Visualization')
  ) {
    return BusinessDomain.DATA_PROCESSING;
  }
  if (
    filePath.includes('/health/') ||
    filePath.includes('/monitoring/') ||
    filePath.includes('Health') ||
    filePath.includes('Monitor')
  ) {
    return BusinessDomain.SYSTEM_HEALTH;
  }
  if (
    filePath.includes('/config/') ||
    filePath.includes('/settings/') ||
    filePath.includes('Config') ||
    filePath.includes('Setting')
  ) {
    return BusinessDomain.DATA_PROCESSING;
  }

  // Domain detection by content
  if (
    content.includes('React') ||
    content.includes('Component') ||
    content.includes('render') ||
    content.includes('useState')
  ) {
    return BusinessDomain.USER_INTERFACE;
  }
  if (
    content.includes('login') ||
    content.includes('auth') ||
    content.includes('token') ||
    content.includes('password')
  ) {
    return BusinessDomain.USER_AUTHENTICATION;
  }
  if (
    content.includes('fetch') ||
    content.includes('axios') ||
    content.includes('response') ||
    content.includes('request')
  ) {
    return BusinessDomain.API_INTEGRATION;
  }

  // Default to UI for component files, otherwise data processing
  if (filePath.includes('Component') || filePath.includes('.tsx')) {
    return BusinessDomain.USER_INTERFACE;
  }

  return BusinessDomain.DATA_PROCESSING;
}

/**
 * Generate business impact description
 */
export function generateBusinessImpact(domain: BusinessDomain, riskLevel: string): string {
  switch (domain) {
    case BusinessDomain.USER_AUTHENTICATION:
      return riskLevel === RiskLevel.CRITICAL || riskLevel === RiskLevel.HIGH
        ? 'Critical user flows affected: login, authentication, and session management. May impact all authenticated users.'
        : 'Authentication flows may experience minor issues.';

    case BusinessDomain.DATA_PROCESSING:
      return riskLevel === RiskLevel.CRITICAL || riskLevel === RiskLevel.HIGH
        ? 'Data processing and reporting features severely affected. Business intelligence capabilities at risk.'
        : 'Some data processing components may display incorrectly.';

    case BusinessDomain.SYSTEM_HEALTH:
      return riskLevel === RiskLevel.CRITICAL || riskLevel === RiskLevel.HIGH
        ? 'System health monitoring capabilities compromised. Operational visibility may be lost.'
        : 'Minor impact to health monitoring.';

    case BusinessDomain.API_INTEGRATION:
      return riskLevel === RiskLevel.CRITICAL || riskLevel === RiskLevel.HIGH
        ? 'API integrations at risk of failure. External data flow may be disrupted.'
        : 'Some API interactions may experience minor issues.';

    case BusinessDomain.USER_INTERFACE:
      return riskLevel === RiskLevel.CRITICAL || riskLevel === RiskLevel.HIGH
        ? 'User interface components severely affected. User experience significantly degraded.'
        : 'Minor UI issues may appear in some components.';

    default:
      return 'Unknown business impact.';
  }
}

/**
 * Calculate business criticality score (0-10)
 */
export function calculateBusinessCriticality(
  domain: BusinessDomain,
  userFlows: readonly string[],
  hasDataRisk: boolean,
  hasAccessRisk: boolean,
  customizationRisk: number,
): number {
  // Base criticality by domain
  let criticality = 5; // Default medium criticality

  switch (domain) {
    case BusinessDomain.USER_AUTHENTICATION:
      criticality = 8; // Authentication is highly critical
      break;
    case BusinessDomain.API_INTEGRATION:
      criticality = 7; // API integration is quite critical
      break;
    case BusinessDomain.SYSTEM_HEALTH:
      criticality = 6; // System health is moderately critical
      break;
    case BusinessDomain.DATA_PROCESSING:
      criticality = 5; // Data processing is somewhat critical
      break;
    case BusinessDomain.USER_INTERFACE:
      criticality = 4; // UI issues are important but less critical
      break;
  }

  // Adjust based on other factors
  if (hasDataRisk) criticality += 2;
  if (hasAccessRisk) criticality += 2;

  // Adjust based on customization risk
  criticality += customizationRisk * 0.2;

  // Adjust based on number of affected user flows
  criticality += Math.min(2, userFlows.length * 0.5);

  // Cap at 10
  return Math.min(10, criticality);
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

function identifyAffectedUserFlows(domain: BusinessDomain, content: string): string[] {
  const userFlows: string[] = [];

  switch (domain) {
    case BusinessDomain.USER_INTERFACE:
      if (content.includes('form') || content.includes('input')) userFlows.push('Form Submission');
      if (content.includes('navigation') || content.includes('router'))
        userFlows.push('Navigation');
      if (content.includes('drag') || content.includes('drop')) userFlows.push('Drag and Drop');
      if (content.includes('alert') || content.includes('notification'))
        userFlows.push('Notifications');
      break;

    case BusinessDomain.USER_AUTHENTICATION:
      if (content.includes('login')) userFlows.push('Login');
      if (content.includes('register') || content.includes('signup'))
        userFlows.push('Registration');
      if (content.includes('password')) userFlows.push('Password Management');
      if (content.includes('token') || content.includes('session'))
        userFlows.push('Session Management');
      break;

    case BusinessDomain.API_INTEGRATION:
      if (content.includes('GET') || content.includes('fetch')) userFlows.push('Data Retrieval');
      if (content.includes('POST') || content.includes('update')) userFlows.push('Data Submission');
      if (content.includes('DELETE')) userFlows.push('Data Deletion');
      if (content.includes('websocket')) userFlows.push('Realtime Updates');
      break;

    case BusinessDomain.DATA_PROCESSING:
      if (content.includes('chart') || content.includes('graph')) userFlows.push('Chart Viewing');
      if (content.includes('filter') || content.includes('sort')) userFlows.push('Data Filtering');
      if (content.includes('export') || content.includes('download')) userFlows.push('Data Export');
      if (content.includes('dashboard')) userFlows.push('Dashboard Interaction');
      break;

    case BusinessDomain.SYSTEM_HEALTH:
      if (content.includes('metrics') || content.includes('monitor'))
        userFlows.push('Metrics Viewing');
      if (content.includes('alert') || content.includes('notification'))
        userFlows.push('Alert Management');
      if (content.includes('log') || content.includes('trace')) userFlows.push('Log Analysis');
      break;
  }

  // If no specific flows identified, add a generic one
  if (userFlows.length === 0) {
    userFlows.push(`${domain.toString().replace('_', ' ')} Features`);
  }

  return userFlows;
}

function analyzeDataHandlingRisk(content: string): boolean {
  const dataRiskPatterns = [
    'password',
    'token',
    'secret',
    'credential',
    'social security',
    'credit card',
    'payment',
    'personal',
    'user data',
    'private',
    'PII',
  ];

  return dataRiskPatterns.some((pattern) => content.toLowerCase().includes(pattern));
}

function analyzeAccessControlRisk(content: string): boolean {
  const accessRiskPatterns = [
    'permission',
    'authorize',
    'access control',
    'role',
    'admin',
    'privilege',
    'security',
    'authenticate',
    'isAuthenticated',
    'canAccess',
  ];

  return accessRiskPatterns.some((pattern) => content.toLowerCase().includes(pattern));
}

function analyzeCustomization(content: string): {
  isCustomized: boolean;
  customizationRisk: number;
} {
  const customizationPatterns = [
    'theme',
    'customTheme',
    'custom',
    'override',
    'client specific',
    'customer',
    'tenant',
    'multi-tenant',
  ];

  const isCustomized = customizationPatterns.some((pattern) =>
    content.toLowerCase().includes(pattern),
  );

  // Calculate risk score based on number of customization patterns found
  const matchCount = customizationPatterns.filter((pattern) =>
    content.toLowerCase().includes(pattern),
  ).length;

  const customizationRisk = Math.min(10, matchCount * 2);

  return { isCustomized, customizationRisk };
}

function extractDependencies(content: string): {
  internal: readonly string[];
  external: readonly string[];
} {
  const internal: string[] = [];
  const external: string[] = [];

  // Find import statements
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];

    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      internal.push(importPath);
    } else {
      external.push(importPath);
    }
  }

  return { internal, external };
}
