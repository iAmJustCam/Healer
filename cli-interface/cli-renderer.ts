/**
 * CLI Renderer Utility - Pure CLI Output Rendering
 * SRP: CLI output formatting and display only
 *
 * Follows Utilities Refactor Directive Constitution:
 * - No local type definitions (P-01)
 * - Imports types from canonical /types (R-01)
 * - Validates input with schemas (R-02)
 * - Returns via factory responses (R-03)
 * - Uses createApiError for errors (R-04)
 * - Environment detection before API use (R-05)
 */

import { ApiResponse } from '';

import { CLIError, CLIOutput, CLIResult, CLITheme } from '';

import { createApiSuccess, createApiError } from '@/utils/core/apiUtils';

/**
 * Default CLI theme colors and symbols
 */
const DEFAULT_THEME: CLITheme = {
  name: 'default',
  colors: {
    primary: '\x1b[36m', // cyan
    secondary: '\x1b[37m', // white
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    info: '\x1b[34m', // blue
    muted: '\x1b[90m', // gray
  },
  symbols: {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    arrow: '→',
    bullet: '•',
    checkbox: '☑',
    radio: '◉',
  },
  typography: {
    heading: { bold: true, color: '\x1b[1m' },
    body: { color: '\x1b[0m' },
    code: { color: '\x1b[90m' },
    emphasis: { italic: true, color: '\x1b[3m' },
  },
};

/**
 * Render CLI output to console
 * @param output - CLI output data to render
 * @param theme - Optional theme for styling
 * @returns ApiResponse<void>
 */
export async function renderCliOutput(
  output: CLIOutput,
  theme: CLITheme = DEFAULT_THEME,
): Promise<ApiResponse<void>> {
  try {
    // Environment detection
    if (typeof console === 'undefined') {
      return createApiError(
        createApiError('Console not available in this environment', 'ENVIRONMENT_ERROR'),
      );
    }

    // Validate output
    if (!output) {
      return createApiError(createApiError('Output is required', 'VALIDATION_ERROR'));
    }

    switch (output.type) {
      case 'text':
        console.log(output.formatted || output.content);
        break;

      case 'table':
        if (Array.isArray(output.content)) {
          console.table(output.content);
        } else {
          console.log(JSON.stringify(output.content, null, 2));
        }
        break;

      case 'tree':
        console.log(output.formatted || JSON.stringify(output.content, null, 2));
        break;

      case 'json':
        console.log(JSON.stringify(output.content, null, 2));
        break;

      case 'yaml':
        // Would require yaml library, for now use JSON
        console.log(JSON.stringify(output.content, null, 2));
        break;

      default:
        console.log(output.formatted || String(output.content));
    }

    return createApiSuccess(undefined);
  } catch (error) {
    return createApiError(createApiError(`Rendering failed: ${error}`, 'RENDER_ERROR'));
  }
}

/**
 * Render CLI error with styling
 * @param error - CLI error to render
 * @param theme - Optional theme for styling
 * @returns ApiResponse<void>
 */
export async function renderCliError(
  error: CLIError,
  theme: CLITheme = DEFAULT_THEME,
): Promise<ApiResponse<void>> {
  try {
    // Environment detection
    if (typeof console === 'undefined') {
      return createApiError(
        createApiError('Console not available in this environment', 'ENVIRONMENT_ERROR'),
      );
    }

    // Validate error
    if (!error) {
      return createApiError(createApiError('Error is required', 'VALIDATION_ERROR'));
    }

    const symbol = theme.symbols.error;
    const color = theme.colors.error;
    const reset = '\x1b[0m';

    console.error(`${color}${symbol} ${error.message}${reset}`);

    if (error.suggestion) {
      console.error(`${theme.colors.info}💡 ${error.suggestion}${reset}`);
    }

    if (error.details && typeof error.details === 'object') {
      console.error(`${theme.colors.muted}Details:${reset}`);
      console.error(JSON.stringify(error.details, null, 2));
    }

    return createApiSuccess(undefined);
  } catch (renderError) {
    return createApiError(
      createApiError(`Error rendering failed: ${renderError}`, 'ERROR_RENDER_ERROR'),
    );
  }
}

/**
 * Render success message with styling
 * @param message - Success message to display
 * @param theme - Optional theme for styling
 * @returns ApiResponse<void>
 */
export async function renderSuccess(
  message: string,
  theme: CLITheme = DEFAULT_THEME,
): Promise<ApiResponse<void>> {
  try {
    // Environment detection
    if (typeof console === 'undefined') {
      return createApiError(
        createApiError('Console not available in this environment', 'ENVIRONMENT_ERROR'),
      );
    }

    // Validate message
    if (!message?.trim()) {
      return createApiError(createApiError('Message is required', 'VALIDATION_ERROR'));
    }

    const symbol = theme.symbols.success;
    const color = theme.colors.success;
    const reset = '\x1b[0m';

    console.log(`${color}${symbol} ${message}${reset}`);

    return createApiSuccess(undefined);
  } catch (error) {
    return createApiError(
      createApiError(`Success rendering failed: ${error}`, 'SUCCESS_RENDER_ERROR'),
    );
  }
}

/**
 * Render CLI result with appropriate formatting
 * @param result - CLI result to render
 * @param theme - Optional theme for styling
 * @returns ApiResponse<void>
 */
export async function renderCliResult(
  result: CLIResult,
  theme: CLITheme = DEFAULT_THEME,
): Promise<ApiResponse<void>> {
  try {
    if (result.success && result.output) {
      await renderCliOutput(result.output, theme);
    }

    if (!result.success && result.error) {
      await renderCliError(result.error, theme);
    }

    return createApiSuccess(undefined);
  } catch (error) {
    return createApiError(createApiError(`Result rendering failed: ${error}`, 'RESULT_RENDER_ERROR'));
  }
}

/**
 * Create formatted table output from data
 * @param data - Array of objects to display as table
 * @param headers - Optional custom headers
 * @returns ApiResponse<CLIOutput>
 */
export async function createTableOutput(
  data: Record<string, unknown>[],
  headers?: string[],
): Promise<ApiResponse<CLIOutput>> {
  try {
    // Validate data
    if (!Array.isArray(data)) {
      return createApiError(createApiError('Data must be an array', 'VALIDATION_ERROR'));
    }

    const output: CLIOutput = {
      type: 'table',
      content: data,
      formatted: '', // Console.table will handle formatting
      raw: data,
    };

    return createApiSuccess(output);
  } catch (error) {
    return createApiError(createApiError(`Table creation failed: ${error}`, 'TABLE_ERROR'));
  }
}

/**
 * Create formatted JSON output
 * @param data - Data to format as JSON
 * @param indent - Indentation spaces (default: 2)
 * @returns ApiResponse<CLIOutput>
 */
export async function createJsonOutput(
  data: unknown,
  indent: number = 2,
): Promise<ApiResponse<CLIOutput>> {
  try {
    const formatted = JSON.stringify(data, null, indent);

    const output: CLIOutput = {
      type: 'json',
      content: data,
      formatted,
      raw: data,
    };

    return createApiSuccess(output);
  } catch (error) {
    return createApiError(createApiError(`JSON creation failed: ${error}`, 'JSON_ERROR'));
  }
}
