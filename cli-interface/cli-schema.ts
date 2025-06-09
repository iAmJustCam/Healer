/**
 * CLI Schema Definitions - Zod Validation Schemas
 * SRP: CLI data validation only
 *
 * Follows Utilities Refactor Directive Constitution:
 * - No local type definitions (P-01)
 * - Imports types from canonical /types (R-01)
 * - Provides schemas for validation (R-02)
 * - No framework dependencies (pure utilities)
 */

import { z } from 'zod';

import {
  ArgumentValidation,
  CLIArgument,
  CLICommand,
  CLIContext,
  CLIError,
  CLIMetadata,
  CLIOption,
  CLIOutput,
  CLIResult,
  CLITheme,
} from '@/types/cli.pipeline';

/**
 * Schema for CLI argument validation
 */
export const ArgumentValidationSchema = z.object({
  pattern: z.string().optional(),
  choices: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  exists: z.boolean().optional(),
}) satisfies z.ZodType<ArgumentValidation>;

/**
 * Schema for CLI arguments
 */
export const CLIArgumentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean(),
  type: z.enum(['string', 'number', 'boolean', 'file', 'directory']),
  validation: ArgumentValidationSchema.optional(),
}) satisfies z.ZodType<CLIArgument>;

/**
 * Schema for CLI options
 */
export const CLIOptionSchema = z.object({
  name: z.string().min(1),
  short: z.string().optional(),
  description: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'array']),
  default: z.unknown().optional(),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  validation: ArgumentValidationSchema.optional(),
}) satisfies z.ZodType<CLIOption>;

/**
 * Schema for CLI examples
 */
export const CLIExampleSchema = z.object({
  description: z.string().min(1),
  command: z.string().min(1),
  output: z.string().optional(),
});

/**
 * Schema for CLI commands
 */
export const CLICommandSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  aliases: z.array(z.string()),
  arguments: z.array(CLIArgumentSchema),
  options: z.array(CLIOptionSchema),
  examples: z.array(CLIExampleSchema),
  subCommands: z.array(z.lazy(() => CLICommandSchema)).optional(),
}) satisfies z.ZodType<CLICommand>;

/**
 * Schema for CLI context
 */
export const CLIContextSchema = z.object({
  command: z.string().min(1),
  arguments: z.record(z.unknown()),
  options: z.record(z.unknown()),
  workingDirectory: z.string().min(1),
  environment: z.record(z.string()),
  user: z.string().optional(),
}) satisfies z.ZodType<CLIContext>;

/**
 * Schema for CLI output
 */
export const CLIOutputSchema = z.object({
  type: z.enum(['text', 'table', 'tree', 'json', 'yaml']),
  content: z.unknown(),
  formatted: z.string(),
  raw: z.unknown().optional(),
}) satisfies z.ZodType<CLIOutput>;

/**
 * Schema for CLI errors
 */
export const CLIErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  suggestion: z.string().optional(),
  details: z.unknown().optional(),
  recoverable: z.boolean(),
  exitCode: z.number(),
}) satisfies z.ZodType<CLIError>;

/**
 * Schema for CLI metadata
 */
export const CLIMetadataSchema = z.object({
  executionTime: z.number().min(0),
  memoryUsage: z.number().min(0),
  commandChain: z.array(z.string()),
  flags: z.array(z.string()),
  version: z.string().min(1),
}) satisfies z.ZodType<CLIMetadata>;

/**
 * Schema for CLI results
 */
export const CLIResultSchema = z.object({
  success: z.boolean(),
  output: CLIOutputSchema.optional(),
  error: CLIErrorSchema.optional(),
  metadata: CLIMetadataSchema,
}) satisfies z.ZodType<CLIResult>;

/**
 * Schema for theme colors
 */
export const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  success: z.string(),
  warning: z.string(),
  error: z.string(),
  info: z.string(),
  muted: z.string(),
});

/**
 * Schema for theme symbols
 */
export const ThemeSymbolsSchema = z.object({
  success: z.string(),
  error: z.string(),
  warning: z.string(),
  info: z.string(),
  arrow: z.string(),
  bullet: z.string(),
  checkbox: z.string(),
  radio: z.string(),
});

/**
 * Schema for text styles
 */
export const TextStyleSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  color: z.string().optional(),
  background: z.string().optional(),
});

/**
 * Schema for theme typography
 */
export const ThemeTypographySchema = z.object({
  heading: TextStyleSchema,
  body: TextStyleSchema,
  code: TextStyleSchema,
  emphasis: TextStyleSchema,
});

/**
 * Schema for CLI themes
 */
export const CLIThemeSchema = z.object({
  name: z.string().min(1),
  colors: ThemeColorsSchema,
  symbols: ThemeSymbolsSchema,
  typography: ThemeTypographySchema,
}) satisfies z.ZodType<CLITheme>;

/**
 * Schema for progress configuration
 */
export const ProgressConfigSchema = z.object({
  total: z.number().min(0),
  current: z.number().min(0),
  label: z.string().optional(),
  format: z.enum(['bar', 'percentage', 'fraction', 'spinner']),
  showEta: z.boolean(),
  showRate: z.boolean(),
});

/**
 * Schema for CLI arguments array (command line parsing)
 */
export const CLIArgsSchema = z.array(z.string());

/**
 * Schema for CLI options object (parsed from arguments)
 */
export const CLIOptionsSchema = z.object({
  projectPath: z.string().optional(),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  validateFile: z.string().optional(),
  configFile: z.string().optional(),
  outputFile: z.string().optional(),
  format: z
    .nativeEnum({
      CONSOLE: 'console',
      JSON: 'json',
      HTML: 'html',
    })
    .optional(),
  verbose: z.boolean().optional(),
  backup: z.boolean().optional(),
  restore: z.string().optional(),
  restoreLatest: z.boolean().optional(),
  restoreSha: z.string().optional(),
  list: z.boolean().optional(),
  trends: z.boolean().optional(),
  help: z.boolean().optional(),
});

/**
 * Validation function for CLI arguments
 */
export function validateCliArgs(args: unknown) {
  return CLIArgsSchema.safeParse(args);
}

/**
 * Validation function for CLI context
 */
export function validateCliContext(context: unknown) {
  return CLIContextSchema.safeParse(context);
}

/**
 * Validation function for CLI commands
 */
export function validateCliCommand(command: unknown) {
  return CLICommandSchema.safeParse(command);
}

/**
 * Validation function for CLI results
 */
export function validateCliResult(result: unknown) {
  return CLIResultSchema.safeParse(result);
}

/**
 * Validation function for CLI output
 */
export function validateCliOutput(output: unknown) {
  return CLIOutputSchema.safeParse(output);
}

/**
 * Validation function for CLI errors
 */
export function validateCliError(error: unknown) {
  return CLIErrorSchema.safeParse(error);
}

/**
 * Validation function for CLI themes
 */
export function validateCliTheme(theme: unknown) {
  return CLIThemeSchema.safeParse(theme);
}
