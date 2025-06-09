/**
 * Debt Metrics Calculator
 * Calculates comprehensive technical debt metrics for business reporting
 */

import { 
  DebtPattern, 
  DebtAnalysisResult, 
  BusinessDomain,
  RiskLevel 
} from '@types';

export class DebtMetricsCalculator {
  calculateDebtScore(patterns: readonly DebtPattern[]): number {
    const severityWeights = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    const totalWeight = patterns.reduce((sum, pattern) => {
      return sum + severityWeights[pattern.severity];
    }, 0);

    const maxPossibleWeight = patterns.length * severityWeights.CRITICAL;
    return maxPossibleWeight > 0 ? (totalWeight / maxPossibleWeight) * 10 : 0;
  }

  calculateBusinessImpact(
    patterns: readonly DebtPattern[],
    domain: BusinessDomain
  ): BusinessImpactAnalysis {
    const criticalPatterns = patterns.filter(p => p.severity === RiskLevel.CRITICAL);
    const domainSpecificPatterns = patterns.filter(p => 
      this.isRelevantToDomain(p, domain)
    );

    return {
      domain,
      riskLevel: this.assessRiskLevel(criticalPatterns.length, patterns.length),
      userImpact: this.calculateUserImpact(domainSpecificPatterns),
      businessCost: this.estimateBusinessCost(patterns),
      urgency: this.calculateUrgency(criticalPatterns, domainSpecificPatterns)
    };
  }

  private isRelevantToDomain(pattern: DebtPattern, domain: BusinessDomain): boolean {
    // Business logic to determine pattern relevance to domain
    const domainPatternMap = {
      USER_INTERFACE: ['REACT_COMPONENT', 'CSS_STYLE', 'ACCESSIBILITY'],
      USER_AUTHENTICATION: ['SECURITY', 'ERROR_HANDLING', 'VALIDATION'],
      API_INTEGRATION: ['ASYNC_AWAIT', 'ERROR_HANDLING', 'TYPE_SAFETY'],
      DATA_VISUALIZATION: ['PERFORMANCE', 'TYPE_SAFETY', 'COMPLEXITY'],
      SYSTEM_HEALTH: ['MONITORING', 'ERROR_HANDLING', 'PERFORMANCE'],
      CONFIGURATION: ['VALIDATION', 'TYPE_SAFETY', 'CONFIGURATION']
    };

    return domainPatternMap[domain]?.some(keyword => 
      pattern.category.includes(keyword) || pattern.description.includes(keyword)
    ) || false;
  }

  private assessRiskLevel(criticalCount: number, totalCount: number): RiskLevel {
    const criticalRatio = criticalCount / Math.max(totalCount, 1);
    
    if (criticalRatio > 0.3) return RiskLevel.CRITICAL;
    if (criticalRatio > 0.15) return RiskLevel.HIGH; 
    if (criticalRatio > 0.05) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private calculateUserImpact(patterns: readonly DebtPattern[]): string {
    const impactPatterns = patterns.filter(p => 
      ['TYPE_SAFETY', 'ERROR_HANDLING', 'PERFORMANCE'].includes(p.category)
    );
    
    if (impactPatterns.length > 5) return 'High user experience degradation risk';
    if (impactPatterns.length > 2) return 'Moderate user experience impact';
    return 'Minimal direct user impact';
  }

  private estimateBusinessCost(patterns: readonly DebtPattern[]): number {
    // Simple cost estimation based on pattern severity and count
    const costPerSeverity = {
      CRITICAL: 1000,
      HIGH: 500,
      MEDIUM: 200,
      LOW: 50
    };

    return patterns.reduce((cost, pattern) => {
      return cost + costPerSeverity[pattern.severity];
    }, 0);
  }

  private calculateUrgency(
    critical: readonly DebtPattern[], 
    domainSpecific: readonly DebtPattern[]
  ): 'immediate' | 'high' | 'medium' | 'low' {
    if (critical.length > 3) return 'immediate';
    if (critical.length > 0 || domainSpecific.length > 10) return 'high';
    if (domainSpecific.length > 5) return 'medium';
    return 'low';
  }
}

interface BusinessImpactAnalysis {
  domain: BusinessDomain;
  riskLevel: RiskLevel;
  userImpact: string;
  businessCost: number;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
}
