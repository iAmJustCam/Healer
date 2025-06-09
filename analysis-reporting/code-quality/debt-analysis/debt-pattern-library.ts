/**
 * Production Debt Pattern Library
 * Core business feature: Identifies and quantifies technical debt
 */

import { 
  DebtPattern, 
  BusinessDomain, 
  RiskLevel, 
  ConfidenceScore 
} from '@types';

export class DebtPatternLibrary {
  private readonly patterns: Map<string, DebtPatternDefinition> = new Map();

  constructor() {
    this.initializePatterns();
  }

  // BUSINESS FEATURE: Analyze code for debt patterns
  analyzeCode(content: string, filePath: string): DebtAnalysisResult {
    const detectedPatterns: DetectedPattern[] = [];
    let totalDebtScore = 0;

    for (const [id, definition] of this.patterns) {
      const matches = this.findPatternMatches(content, definition);
      
      if (matches.length > 0) {
        const severity = this.calculateSeverity(matches, definition);
        const businessImpact = this.assessBusinessImpact(filePath, definition);
        
        detectedPatterns.push({
          id,
          definition,
          matches,
          severity,
          businessImpact,
          estimatedFixTime: this.estimateFixTime(matches, definition)
        });

        totalDebtScore += this.calculateDebtContribution(matches, severity);
      }
    }

    return {
      filePath,
      totalDebtScore,
      riskLevel: this.categorizeRisk(totalDebtScore),
      patterns: detectedPatterns,
      businessRecommendations: this.generateBusinessRecommendations(detectedPatterns),
      estimatedCost: this.calculateBusinessCost(detectedPatterns)
    };
  }

  // BUSINESS FEATURE: Generate executive summary
  generateExecutiveSummary(results: DebtAnalysisResult[]): ExecutiveSummary {
    const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
    const criticalIssues = results.filter(r => r.riskLevel === RiskLevel.CRITICAL).length;
    
    return {
      totalTechnicalDebt: totalCost,
      criticalIssuesCount: criticalIssues,
      recommendedActions: this.prioritizeActions(results),
      roi: this.calculateROI(totalCost),
      timeline: this.generateTimeline(results)
    };
  }

  private initializePatterns(): void {
    // TYPE SAFETY PATTERNS (High business impact)
    this.patterns.set('any-type-usage', {
      id: 'any-type-usage',
      category: 'TYPE_SAFETY',
      businessPriority: RiskLevel.HIGH,
      pattern: /:\s*any(?:\s|;|,|$)/g,
      description: 'Usage of "any" type reduces type safety',
      businessImpact: 'Increases runtime errors, reduces developer productivity',
      fixComplexity: RiskLevel.MEDIUM,
      estimatedHours: 0.5
    });

    this.patterns.set('unsafe-type-assertion', {
      id: 'unsafe-type-assertion',
      category: 'TYPE_SAFETY', 
      businessPriority: RiskLevel.CRITICAL,
      pattern: /as\s+\w+(?:\s|;|,|$)/g,
      description: 'Type assertion without validation',
      businessImpact: 'High risk of runtime failures in production',
      fixComplexity: RiskLevel.HIGH,
      estimatedHours: 2
    });

    // ERROR HANDLING PATTERNS (Critical for reliability)
    this.patterns.set('empty-catch-block', {
      id: 'empty-catch-block',
      category: 'ERROR_HANDLING',
      businessPriority: RiskLevel.CRITICAL,
      pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
      description: 'Empty catch blocks hide errors',
      businessImpact: 'Silent failures, difficult debugging, poor user experience',
      fixComplexity: RiskLevel.MEDIUM,
      estimatedHours: 1
    });

    // Add more patterns...
  }

  private calculateBusinessCost(patterns: DetectedPattern[]): number {
    const hourlyRate = 150; // $150/hour developer cost
    const totalHours = patterns.reduce((sum, p) => sum + p.estimatedFixTime, 0);
    
    // Add business risk multiplier
    const riskMultiplier = patterns.some(p => p.severity === RiskLevel.CRITICAL) ? 2.5 : 1.5;
    
    return Math.round(totalHours * hourlyRate * riskMultiplier);
  }

  private generateBusinessRecommendations(patterns: DetectedPattern[]): string[] {
    const recommendations: string[] = [];
    
    const criticalPatterns = patterns.filter(p => p.severity === RiskLevel.CRITICAL);
    if (criticalPatterns.length > 0) {
      recommendations.push(`Address ${criticalPatterns.length} critical issues immediately before next release`);
    }

    const typeIssues = patterns.filter(p => p.definition.category === 'TYPE_SAFETY');
    if (typeIssues.length > 5) {
      recommendations.push('Implement stricter TypeScript configuration to prevent future type safety issues');
    }

    return recommendations;
  }

  private calculateROI(totalCost: number): ROIAnalysis {
    // Business logic: Calculate return on investment for fixing debt
    const productivityGain = totalCost * 0.3; // 30% productivity improvement
    const bugReduction = totalCost * 0.4; // 40% reduction in bug-related costs
    const maintainabilityGain = totalCost * 0.2; // 20% easier maintenance
    
    return {
      investmentCost: totalCost,
      expectedReturns: productivityGain + bugReduction + maintainabilityGain,
      paybackMonths: 6,
      annualSavings: (productivityGain + bugReduction + maintainabilityGain) * 2
    };
  }

  // ... other business methods
}

interface DebtPatternDefinition {
  id: string;
  category: string;
  businessPriority: RiskLevel.LOW | RiskLevel.MEDIUM | RiskLevel.HIGH | RiskLevel.CRITICAL;
  pattern: RegExp;
  description: string;
  businessImpact: string;
  fixComplexity: RiskLevel.LOW | RiskLevel.MEDIUM | RiskLevel.HIGH;
  estimatedHours: number;
}

interface DetectedPattern {
  id: string;
  definition: DebtPatternDefinition;
  matches: RegExpMatchArray[];
  severity: RiskLevel;
  businessImpact: string;
  estimatedFixTime: number;
}

interface DebtAnalysisResult {
  filePath: string;
  totalDebtScore: number;
  riskLevel: RiskLevel;
  patterns: DetectedPattern[];
  businessRecommendations: string[];
  estimatedCost: number;
}

interface ExecutiveSummary {
  totalTechnicalDebt: number;
  criticalIssuesCount: number;
  recommendedActions: string[];
  roi: ROIAnalysis;
  timeline: string;
}

interface ROIAnalysis {
  investmentCost: number;
  expectedReturns: number;
  paybackMonths: number;
  annualSavings: number;
}
