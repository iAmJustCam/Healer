/**
 * Pattern Transformation Utilities
 *
 * CONSTITUTIONAL COMPLIANCE:
 * ✓ No local type definitions (R-01)
 * ✓ Canonical imports only (R-02)
 * ✓ Validated I/O with schemas (R-03)
 * ✓ Factory response pattern (R-04)
 * ✓ Environment-agnostic (R-05)
 *
 * Single Responsibility: Pattern transformation and code modernization
 */

import { validateWithSchema } from '../shared-REFACTORED/schemas/validation.schemas';
import {
  ApiResponse,
  Framework,
  TransformationStatus,
  TransformationStrategy,
} from '';
import {
  DetectedPatterns,
  TransformationBatch,
  TransformationRequest,
  TransformationResult,
  TransformationRule,
} from '';
import { createApiSuccess, createApiError } from '';

// ============================================================================
// TRANSFORMATION ENGINE CORE
// ============================================================================

export const PatternTransformer = {
  /**
   * Transform content based on detected patterns
   */
  transformContent: (
    content: string,
    patterns: DetectedPatterns,
    strategy: TransformationStrategy = TransformationStrategy.STRING,
  ): ApiResponse<TransformationResult> => {
    const validation = validateWithSchema(
      { content: 'string', patterns: 'object', strategy: 'string' },
      { content, patterns, strategy },
    );

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid transformation input', 'VALIDATION_ERROR', {
          validation: validation.error,
        }),
      );
    }

    try {
      let transformedContent = content;
      const changes: any[] = [];
      const startTime = Date.now();

      // Apply React 19 transformations
      if (
        patterns.react19.hasForwardRef ||
        patterns.react19.hasPropTypes ||
        patterns.react19.hasStringRefs
      ) {
        const reactResult = applyReactTransformations(
          transformedContent,
          patterns.react19,
          strategy,
        );
        if (reactResult.success) {
          transformedContent = reactResult.data.content;
          changes.push(...reactResult.data.changes);
        }
      }

      // Apply Next.js 15.3 transformations
      if (patterns.nextjs153.hasAsyncAPIUsage || patterns.nextjs153.hasLegacyRouter) {
        const nextResult = applyNextJSTransformations(
          transformedContent,
          patterns.nextjs153,
          strategy,
        );
        if (nextResult.success) {
          transformedContent = nextResult.data.content;
          changes.push(...nextResult.data.changes);
        }
      }

      // Apply TypeScript 5.8 transformations
      if (patterns.typescript58.hasImportAssertions) {
        const tsResult = applyTypeScriptTransformations(
          transformedContent,
          patterns.typescript58,
          strategy,
        );
        if (tsResult.success) {
          transformedContent = tsResult.data.content;
          changes.push(...tsResult.data.changes);
        }
      }

      // Apply Tailwind 4.1 transformations
      if (patterns.tailwind41.hasOldTransitionSyntax || patterns.tailwind41.hasTailwindDirectives) {
        const tailwindResult = applyTailwindTransformations(
          transformedContent,
          patterns.tailwind41,
          strategy,
        );
        if (tailwindResult.success) {
          transformedContent = tailwindResult.data.content;
          changes.push(...tailwindResult.data.changes);
        }
      }

      // Apply TypeScript debt cleanup
      if (patterns.typescriptDebt.hasAnyTypes || patterns.typescriptDebt.hasUnsafeAssertions) {
        const debtResult = applyDebtCleanup(transformedContent, patterns.typescriptDebt, strategy);
        if (debtResult.success) {
          transformedContent = debtResult.data.content;
          changes.push(...debtResult.data.changes);
        }
      }

      const result: TransformationResult = {
        success: true,
        originalContent: content,
        transformedContent,
        changes,
        status: changes.length > 0 ? TransformationStatus.COMPLETED : TransformationStatus.SKIPPED,
        timestamp: new Date().toISOString() as any,
      };

      return createApiSuccess(result);
    } catch (error) {
      return createApiError(
        createApiError('Content transformation failed', 'TRANSFORMATION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Generate transformation rules from patterns
   */
  generateRules: (
    patterns: DetectedPatterns,
    framework?: Framework,
  ): ApiResponse<TransformationRule[]> => {
    try {
      const rules: TransformationRule[] = [];

      // Generate React rules
      if (!framework || framework === Framework.REACT19_19) {
        rules.push(...generateReactRules(patterns.react19));
      }

      // Generate Next.js rules
      if (!framework || framework === Framework.NEXTJS15JS_15) {
        rules.push(...generateNextJSRules(patterns.nextjs153));
      }

      // Generate TypeScript rules
      if (!framework || framework === Framework.TYPESCRIPT5_5) {
        rules.push(...generateTypeScriptRules(patterns.typescript58));
        rules.push(...generateDebtRules(patterns.typescriptDebt));
      }

      // Generate Tailwind rules
      if (!framework || framework === Framework.TAILWIND4_4) {
        rules.push(...generateTailwindRules(patterns.tailwind41));
      }

      return createApiSuccess(rules);
    } catch (error) {
      return createApiError(
        createApiError('Rule generation failed', 'RULE_GENERATION_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },

  /**
   * Create transformation batch for multiple files
   */
  createBatch: (requests: TransformationRequest[]): ApiResponse<TransformationBatch[]> => {
    const validation = validateWithSchema({ requests: 'array' }, { requests });

    if (!validation.success) {
      return createApiError(
        createApiError('Invalid batch input', 'VALIDATION_ERROR', { validation: validation.error }),
      );
    }

    try {
      const batches: TransformationBatch[] = [];
      const batchSize = 10; // Process 10 files per batch

      for (let i = 0; i < requests.length; i += batchSize) {
        const batchRequests = requests.slice(i, i + batchSize);
        const files = batchRequests.map((req) => req.files).flat();

        // Estimate duration based on file count and complexity
        const estimatedDuration = files.length * 0.5; // 0.5 seconds per file

        // Determine priority based on rule complexity
        const priority = determineBatchPriority(batchRequests);

        batches.push({
          id: `batch-${Math.random().toString(36).substr(2, 9)}`,
          files,
          estimatedDuration,
          priority,
        });
      }

      return createApiSuccess(batches);
    } catch (error) {
      return createApiError(
        createApiError('Batch creation failed', 'BATCH_ERROR', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  },
} as const;

// ============================================================================
// FRAMEWORK-SPECIFIC TRANSFORMATIONS (PRIVATE)
// ============================================================================

function applyReactTransformations(
  content: string,
  patterns: any,
  strategy: TransformationStrategy,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    let transformedContent = content;
    const changes: any[] = [];

    // Transform forwardRef patterns
    if (patterns.hasForwardRef) {
      const forwardRefResult = transformForwardRef(transformedContent, strategy);
      if (forwardRefResult.success) {
        transformedContent = forwardRefResult.data.content;
        changes.push(...forwardRefResult.data.changes);
      }
    }

    // Remove PropTypes
    if (patterns.hasPropTypes) {
      const propTypesResult = removePropTypes(transformedContent);
      if (propTypesResult.success) {
        transformedContent = propTypesResult.data.content;
        changes.push(...propTypesResult.data.changes);
      }
    }

    // Transform string refs
    if (patterns.hasStringRefs) {
      const stringRefsResult = transformStringRefs(transformedContent);
      if (stringRefsResult.success) {
        transformedContent = stringRefsResult.data.content;
        changes.push(...stringRefsResult.data.changes);
      }
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('React transformation failed', 'REACT_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function applyNextJSTransformations(
  content: string,
  patterns: any,
  strategy: TransformationStrategy,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    let transformedContent = content;
    const changes: any[] = [];

    // Add await to async APIs
    if (patterns.hasAsyncAPIUsage) {
      const asyncResult = addAwaitToAsyncAPIs(transformedContent);
      if (asyncResult.success) {
        transformedContent = asyncResult.data.content;
        changes.push(...asyncResult.data.changes);
      }
    }

    // Update router imports
    if (patterns.hasLegacyRouter) {
      const routerResult = updateRouterImports(transformedContent);
      if (routerResult.success) {
        transformedContent = routerResult.data.content;
        changes.push(...routerResult.data.changes);
      }
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Next.js transformation failed', 'NEXTJS_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function applyTypeScriptTransformations(
  content: string,
  patterns: any,
  strategy: TransformationStrategy,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    let transformedContent = content;
    const changes: any[] = [];

    // Update import assertions
    if (patterns.hasImportAssertions) {
      const assertionResult = updateImportAssertions(transformedContent);
      if (assertionResult.success) {
        transformedContent = assertionResult.data.content;
        changes.push(...assertionResult.data.changes);
      }
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('TypeScript transformation failed', 'TYPESCRIPT_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function applyTailwindTransformations(
  content: string,
  patterns: any,
  strategy: TransformationStrategy,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    let transformedContent = content;
    const changes: any[] = [];

    // Update deprecated classes
    if (patterns.hasOldTransitionSyntax) {
      const transitionResult = updateTailwindClasses(transformedContent);
      if (transitionResult.success) {
        transformedContent = transitionResult.data.content;
        changes.push(...transitionResult.data.changes);
      }
    }

    // Update directives
    if (patterns.hasTailwindDirectives) {
      const directivesResult = updateTailwindDirectives(transformedContent);
      if (directivesResult.success) {
        transformedContent = directivesResult.data.content;
        changes.push(...directivesResult.data.changes);
      }
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Tailwind transformation failed', 'TAILWIND_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function applyDebtCleanup(
  content: string,
  patterns: any,
  strategy: TransformationStrategy,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    let transformedContent = content;
    const changes: any[] = [];

    // Replace any types with unknown
    if (patterns.hasAnyTypes) {
      transformedContent = transformedContent.replace(/:\s*any\b/g, ': unknown');
      changes.push({
        rule: 'any-to-unknown',
        framework: Framework.TYPESCRIPT5_5,
        line: 0,
        before: ': any',
        after: ': unknown',
        riskLevel: 'medium',
      });
    }

    // Replace unsafe assertions
    if (patterns.hasUnsafeAssertions) {
      // This is a simplified transformation - real implementation would need AST parsing
      transformedContent = transformedContent.replace(/as\s+any\b/g, 'as unknown');
      changes.push({
        rule: 'unsafe-assertion',
        framework: Framework.TYPESCRIPT5_5,
        line: 0,
        before: 'as any',
        after: 'as unknown',
        riskLevel: 'medium',
      });
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Debt cleanup failed', 'DEBT_CLEANUP_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// SPECIFIC TRANSFORMATION FUNCTIONS (PRIVATE)
// ============================================================================

function transformForwardRef(
  content: string,
  strategy: TransformationStrategy,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Simple string-based transformation for React.forwardRef
    const forwardRefPattern = /React\.forwardRef<([^>]+)>\(\(([^,]+),\s*([^)]+)\)\s*=>\s*\{/g;

    transformedContent = transformedContent.replace(
      forwardRefPattern,
      (match, typeArg, propsParam, refParam) => {
        changes.push({
          rule: 'forwardRef-replacement',
          framework: Framework.REACT19_19,
          line: 0, // Would need line tracking in real implementation
          before: match,
          after: `function Component({ ref, ...${propsParam.trim()} }: ${propsParam.trim()}Props & { ref?: React.Ref<${typeArg}> }) {`,
          riskLevel: 'high',
        });

        return `function Component({ ref, ...${propsParam.trim()} }: ${propsParam.trim()}Props & { ref?: React.Ref<${typeArg}> }) {`;
      },
    );

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('forwardRef transformation failed', 'FORWARDREF_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function removePropTypes(content: string): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Remove PropTypes imports
    const propTypesImportPattern = /import\s+PropTypes\s+from\s+['"]prop-types['"];?\s*\n?/g;
    transformedContent = transformedContent.replace(propTypesImportPattern, (match) => {
      changes.push({
        rule: 'propTypes-import-removal',
        framework: Framework.REACT19_19,
        line: 0,
        before: match.trim(),
        after: '/ PropTypes removed - use TypeScript interfaces',
        riskLevel: 'medium',
      });
      return '/ PropTypes removed - use TypeScript interfaces\n';
    });

    // Remove PropTypes assignments
    const propTypesPattern = /\w+\.propTypes\s*=\s*\{[^}]*\};?\s*\n?/g;
    transformedContent = transformedContent.replace(propTypesPattern, (match) => {
      changes.push({
        rule: 'propTypes-assignment-removal',
        framework: Framework.REACT19_19,
        line: 0,
        before: match.trim(),
        after: '/ Replaced with TypeScript interface',
        riskLevel: 'medium',
      });
      return '/ Replaced with TypeScript interface\n';
    });

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('PropTypes removal failed', 'PROPTYPES_REMOVAL_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function transformStringRefs(content: string): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Transform string refs to useRef pattern
    const stringRefPattern = /ref\s*=\s*["']([^"']+)["']/g;

    transformedContent = transformedContent.replace(stringRefPattern, (match, refName) => {
      changes.push({
        rule: 'string-ref-replacement',
        framework: Framework.REACT19_19,
        line: 0,
        before: match,
        after: `ref={${refName}Ref}`,
        riskLevel: 'high',
      });

      return `ref={${refName}Ref}`;
    });

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('String refs transformation failed', 'STRING_REFS_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function addAwaitToAsyncAPIs(content: string): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Add await to cookies(), headers(), params(), draftMode()
    const asyncAPIPattern = /(?<!await\s+)(cookies|headers|params|draftMode)\s*\(\s*\)/g;

    transformedContent = transformedContent.replace(asyncAPIPattern, (match, apiName) => {
      changes.push({
        rule: 'async-api-await',
        framework: Framework.NEXTJS15JS_15,
        line: 0,
        before: match,
        after: `await ${match}`,
        riskLevel: 'high',
      });

      return `await ${match}`;
    });

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Async API transformation failed', 'ASYNC_API_TRANSFORM_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function updateRouterImports(content: string): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Update next/router to next/navigation
    const routerImportPattern = /import\s*\{([^}]+)\}\s*from\s*['"]next\/router['"];?/g;

    transformedContent = transformedContent.replace(routerImportPattern, (match, imports) => {
      changes.push({
        rule: 'router-import-update',
        framework: Framework.NEXTJS15JS_15,
        line: 0,
        before: match,
        after: `import { ${imports} } from 'next/navigation';`,
        riskLevel: 'medium',
      });

      return `import { ${imports} } from 'next/navigation';`;
    });

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Router import update failed', 'ROUTER_IMPORT_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function updateImportAssertions(content: string): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Replace assert with with in import statements
    const assertPattern = /import\s+([^"']+)\s+from\s+(['"][^"']+['"])\s+assert\s*\{([^}]+)\}/g;

    transformedContent = transformedContent.replace(
      assertPattern,
      (match, importSpec, modulePath, assertionSpec) => {
        changes.push({
          rule: 'import-assertion-update',
          framework: Framework.TYPESCRIPT5_5,
          line: 0,
          before: match,
          after: `import ${importSpec} from ${modulePath} with {${assertionSpec}}`,
          riskLevel: 'low',
        });

        return `import ${importSpec} from ${modulePath} with {${assertionSpec}}`;
      },
    );

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Import assertion update failed', 'IMPORT_ASSERTION_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function updateTailwindClasses(content: string): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    const classUpdates = {
      'transition-color': 'transition-colors',
      'bg-opacity-': 'bg-opacity-[',
      'text-opacity-': 'text-opacity-[',
      'border-opacity-': 'border-opacity-[',
    };

    for (const [oldClass, newClass] of Object.entries(classUpdates)) {
      const pattern = new RegExp(`\\b${oldClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g');

      transformedContent = transformedContent.replace(pattern, (match) => {
        changes.push({
          rule: 'tailwind-class-update',
          framework: Framework.TAILWIND4_4,
          line: 0,
          before: match,
          after: newClass,
          riskLevel: 'low',
        });

        return newClass;
      });
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Tailwind class update failed', 'TAILWIND_CLASS_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function updateTailwindDirectives(
  content: string,
): ApiResponse<{ content: string; changes: any[] }> {
  try {
    const changes: any[] = [];
    let transformedContent = content;

    // Replace @tailwind directives with @import
    const directivePattern = /@tailwind\s+(base|components|utilities);?\s*\n?/g;
    let hasDirectives = false;

    transformedContent = transformedContent.replace(directivePattern, (match, directive) => {
      hasDirectives = true;
      return '';
    });

    if (hasDirectives) {
      // Add single @import at the beginning
      transformedContent = '@import "tailwindcss";\n\n' + transformedContent;

      changes.push({
        rule: 'tailwind-directive-update',
        framework: Framework.TAILWIND4_4,
        line: 0,
        before: '@tailwind base; @tailwind components; @tailwind utilities;',
        after: '@import "tailwindcss";',
        riskLevel: 'medium',
      });
    }

    return createApiSuccess({ content: transformedContent, changes });
  } catch (error) {
    return createApiError(
      createApiError('Tailwind directive update failed', 'TAILWIND_DIRECTIVE_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// RULE GENERATION FUNCTIONS (PRIVATE)
// ============================================================================

function generateReactRules(patterns: any): TransformationRule[] {
  const rules: TransformationRule[] = [];

  if (patterns.hasForwardRef) {
    rules.push({
      id: 'react-forwardref-removal',
      pattern: /React\.forwardRef\s*\(/,
      replacement: 'function component with ref prop',
      conditions: [{ type: 'file-extension', value: '.tsx' }],
    });
  }

  if (patterns.hasPropTypes) {
    rules.push({
      id: 'react-proptypes-removal',
      pattern: /\.propTypes\s*=/,
      replacement: '/ Use TypeScript interfaces instead',
      conditions: [],
    });
  }

  if (patterns.hasStringRefs) {
    rules.push({
      id: 'react-string-refs',
      pattern: /ref\s*=\s*["'][^"']+["']/,
      replacement: 'ref={useRef()}',
      conditions: [],
    });
  }

  return rules;
}

function generateNextJSRules(patterns: any): TransformationRule[] {
  const rules: TransformationRule[] = [];

  if (patterns.hasAsyncAPIUsage) {
    rules.push({
      id: 'nextjs-async-api',
      pattern: /(?<!await\s+)(cookies|headers|params)\(\)/,
      replacement: 'await $1()',
      conditions: [
        { type: 'file-extension', value: '.tsx' },
        { type: 'custom', value: 'isServerComponent' },
      ],
    });
  }

  if (patterns.hasLegacyRouter) {
    rules.push({
      id: 'nextjs-router-import',
      pattern: /from\s+['"]next\/router['"]/,
      replacement: 'from "next/navigation"',
      conditions: [],
    });
  }

  return rules;
}

function generateTypeScriptRules(patterns: any): TransformationRule[] {
  const rules: TransformationRule[] = [];

  if (patterns.hasImportAssertions) {
    rules.push({
      id: 'typescript-import-assertions',
      pattern: /assert\s*\{/,
      replacement: 'with {',
      conditions: [{ type: 'file-extension', value: '.ts' }],
    });
  }

  if (patterns.hasArrayGenericSyntax) {
    rules.push({
      id: 'typescript-array-syntax',
      pattern: /Array<(\w+)>/,
      replacement: '$1[]',
      conditions: [],
    });
  }

  return rules;
}

function generateTailwindRules(patterns: any): TransformationRule[] {
  const rules: TransformationRule[] = [];

  if (patterns.hasOldTransitionSyntax) {
    rules.push({
      id: 'tailwind-transition-syntax',
      pattern: /\btransition-color\b/,
      replacement: 'transition-colors',
      conditions: [{ type: 'file-extension', value: '.css' }],
    });
  }

  if (patterns.hasTailwindDirectives) {
    rules.push({
      id: 'tailwind-directives',
      pattern: /@tailwind\s+(base|components|utilities);?/,
      replacement: '@import "tailwindcss";',
      conditions: [],
    });
  }

  return rules;
}

function generateDebtRules(patterns: any): TransformationRule[] {
  const rules: TransformationRule[] = [];

  if (patterns.hasAnyTypes) {
    rules.push({
      id: 'typescript-any-replacement',
      pattern: /:\s*any\b/,
      replacement: ': unknown',
      conditions: [],
    });
  }

  if (patterns.hasUnsafeAssertions) {
    rules.push({
      id: 'typescript-unsafe-assertions',
      pattern: /as\s+any\b/,
      replacement: 'as unknown',
      conditions: [],
    });
  }

  if (patterns.hasEmptyCatchBlocks) {
    rules.push({
      id: 'typescript-empty-catch',
      pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
      replacement: 'catch (error) { console.error("Error:", error); }',
      conditions: [],
    });
  }

  return rules;
}

// ============================================================================
// BATCH PROCESSING HELPERS (PRIVATE)
// ============================================================================

function determineBatchPriority(requests: TransformationRequest[]): 'low' | 'medium' | 'high' {
  let highPriorityCount = 0;
  let totalRules = 0;

  for (const request of requests) {
    totalRules += request.rules.length;

    // Count high-priority transformations
    for (const rule of request.rules) {
      if (
        rule.id.includes('forwardref') ||
        rule.id.includes('async-api') ||
        rule.id.includes('string-refs')
      ) {
        highPriorityCount++;
      }
    }
  }

  const highPriorityRatio = totalRules > 0 ? highPriorityCount / totalRules : 0;

  if (highPriorityRatio > 0.5) return 'high';
  if (highPriorityRatio > 0.2) return 'medium';
  return 'low';
}

// ============================================================================
// VALIDATION HELPERS (PRIVATE)
// ============================================================================

function validateTransformationStrategy(strategy: TransformationStrategy): boolean {
  return Object.values(TransformationStrategy).includes(strategy);
}

function validateTransformationRule(rule: TransformationRule): ApiResponse<TransformationRule> {
  try {
    if (!rule.id || !rule.pattern || !rule.replacement) {
      return createApiError(
        createApiError('Invalid transformation rule', 'RULE_VALIDATION_ERROR', { rule }),
      );
    }

    return createApiSuccess(rule);
  } catch (error) {
    return createApiError(
      createApiError('Rule validation failed', 'VALIDATION_ERROR', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const TransformationUtils = {
  /**
   * Check if content needs transformation
   */
  needsTransformation: (patterns: DetectedPatterns): boolean => {
    return (
      patterns.react19.modernizationPotential > 0 ||
      patterns.nextjs153.modernizationPotential > 0 ||
      patterns.typescript58.modernizationPotential > 0 ||
      patterns.tailwind41.modernizationPotential > 0 ||
      patterns.typescriptDebt.modernizationPotential > 0
    );
  },

  /**
   * Estimate transformation complexity
   */
  estimateComplexity: (patterns: DetectedPatterns): 'low' | 'medium' | 'high' => {
    let complexity = 0;

    if (patterns.react19.hasForwardRef) complexity += 3;
    if (patterns.react19.hasStringRefs) complexity += 4;
    if (patterns.nextjs153.hasAsyncAPIUsage) complexity += 3;
    if (patterns.typescriptDebt.hasAnyTypes) complexity += 2;

    if (complexity >= 6) return 'high';
    if (complexity >= 3) return 'medium';
    return 'low';
  },

  /**
   * Get transformation priority
   */
  getPriority: (patterns: DetectedPatterns): number => {
    let priority = 0;

    // High priority patterns
    if (patterns.react19.hasStringRefs) priority += 5;
    if (patterns.nextjs153.hasAsyncAPIUsage) priority += 4;
    if (patterns.react19.hasForwardRef) priority += 3;

    // Medium priority patterns
    if (patterns.typescriptDebt.hasAnyTypes) priority += 2;
    if (patterns.tailwind41.hasOldTransitionSyntax) priority += 1;

    return Math.min(10, priority);
  },
} as const;
