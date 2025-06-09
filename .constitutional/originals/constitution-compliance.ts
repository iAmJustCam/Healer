/**
 * Constitution Compliance Service
 * Enforces code quality constitution and standards
 */

import { ConstitutionComplianceResult, FilePath, Result } from '@types';

export class ConstitutionComplianceService {
  private readonly rules: ConstitutionRule[] = [
    {
      id: 'API-001',
      type: 'prohibition',
      pattern: /return.*(?:success|error).*(?:!|:)/g,
      severity: 'warning',
      message: 'Consider using createApiSuccess/err for consistent response format',
      autoFixable: true
    },
    {
      id: 'TYPE-001', 
      type: 'requirement',
      pattern: /:\s*any(?:\s|;|,|$)/g,
      severity: 'error',
      message: 'Avoid using "any" type, use specific types instead',
      autoFixable: false
    },
    {
      id: 'IMPORT-001',
      type: 'requirement', 
      pattern: /import.*from\s+['"]\.\.\/.*types/g,
      severity: 'warning',
      message: 'Use @types alias instead of relative type imports',
      autoFixable: true
    }
  ];

  async validateFile(filePath: FilePath): Promise<Result<ConstitutionComplianceResult>> {
    try {
      const content = await this.readFile(filePath);
      const violations = this.checkViolations(content, filePath);
      
      const result: ConstitutionComplianceResult = {
        overallScore: this.calculateComplianceScore(violations),
        violations,
        autoFixable: violations.filter(v => v.autoFixable).length,
        manualReviewRequired: violations.filter(v => !v.autoFixable).length
      };

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Validation failed')
      };
    }
  }

  private checkViolations(content: string, filePath: FilePath): ConstitutionViolation[] {
    const violations: ConstitutionViolation[] = [];
    const lines = content.split('\n');

    this.rules.forEach(rule => {
      lines.forEach((line, index) => {
        const matches = line.match(rule.pattern);
        if (matches) {
          violations.push({
            ruleId: rule.id,
            type: rule.type,
            severity: rule.severity,
            file: filePath,
            line: index + 1,
            message: rule.message,
            code: line.trim(),
            autoFixable: rule.autoFixable
          });
        }
      });
    });

    return violations;
  }

  private calculateComplianceScore(violations: ConstitutionViolation[]): number {
    const severityWeights = { error: 3, warning: 1, info: 0.5 };
    const totalDeductions = violations.reduce((sum, v) => sum + severityWeights[v.severity], 0);
    return Math.max(0, 100 - totalDeductions);
  }

  private async readFile(filePath: FilePath): Promise<string> {
    // Implementation would read file content
    return '';
  }
}

interface ConstitutionRule {
  id: string;
  type: 'requirement' | 'prohibition';
  pattern: RegExp;
  severity: 'error' | 'warning' | 'info';
  message: string;
  autoFixable: boolean;
}

interface ConstitutionViolation {
  ruleId: string;
  type: 'requirement' | 'prohibition';
  severity: 'error' | 'warning' | 'info';
  file: FilePath;
  line: number;
  message: string;
  code: string;
  autoFixable: boolean;
}
