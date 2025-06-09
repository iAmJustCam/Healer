import type { } from "@/types/shared-foundation.types";
import type { 
  ButtonProps, 
  ButtonConfig, 
  ComponentFactoryConfig 
} from "../../types/testing-ui.types";

/**
 * Component Test Factory - SOLID Compliant Test Component Generation
 *
 * @fileoverview Production-ready test components following SOLID principles
 * - SRP: Each component has single responsibility
 * - OCP: Open for extension via composition
 * - LSP: Substitutable component implementations
 * - ISP: Interface segregation for component concerns
 * - DIP: Dependency inversion for testable components
 *
 * Replaces: component.tsx, component-root.tsx (refactored and consolidated)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ============================================================================
// COMPONENT ABSTRACTIONS (Interface Segregation)
// ============================================================================

interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

interface Router {
  push(path: string): void;
  pathname: string;
}

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

interface ComponentState<T = unknown> {
  readonly value: T;
  setValue: (value: T) => void;
}

// ============================================================================
// MOCK IMPLEMENTATIONS (Dependency Inversion)
// ============================================================================

class MockLogger implements Logger {
  private readonly logs: Array<{ level: string; message: string; context?: Record<string, unknown> }> = [];

  info(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: 'info', message, context });
    console.log(`[INFO] ${message}`, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: 'warn', message, context });
    console.warn(`[WARN] ${message}`, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: 'error', message, context });
    console.error(`[ERROR] ${message}`, context);
  }

  getLogs(): readonly Array<{ level: string; message: string; context?: Record<string, unknown> }> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs.length = 0;
  }
}

class MockRouter implements Router {
  private _pathname = '/';
  private readonly navigationHistory: string[] = [];

  get pathname(): string {
    return this._pathname;
  }

  push(path: string): void {
    this.navigationHistory.push(path);
    this._pathname = path;
  }

  getNavigationHistory(): readonly string[] {
    return [...this.navigationHistory];
  }

  reset(): void {
    this._pathname = '/';
    this.navigationHistory.length = 0;
  }
}

// ============================================================================
// PURE COMPONENTS (Single Responsibility)
// ============================================================================

const OptimizedImage: React.FC<ImageProps> = ({ src, alt, width, height, className }) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    loading="lazy"
  />
);

const ButtonIcon: React.FC<{ shouldShow: boolean }> = ({ shouldShow }) => {
  if (!shouldShow) return null;

  return (
    <OptimizedImage
      src="/icons/button.png"
      alt="Button Icon"
      width={24}
      height={24}
      className="button-icon"
    />
  );
};

const ButtonLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="button-label">{children}</span>
);

const ButtonStatus: React.FC<{ data: unknown }> = ({ data }) => {
  if (!data) return null;

  const displayText = typeof data === 'string' ? data : 'Loaded';
  return <span className="button-status">{displayText}</span>;
};

// ============================================================================
// HOOKS (Single Responsibility)
// ============================================================================

const useButtonState = (initialConfig?: ButtonConfig): {
  isHovered: boolean;
  isPressed: boolean;
  asyncData: unknown;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
  };
} => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [asyncData, setAsyncData] = useState<unknown>(null);

  const handlers = {
    onMouseEnter: useCallback(() => setIsHovered(true), []),
    onMouseLeave: useCallback(() => setIsHovered(false), []),
    onMouseDown: useCallback(() => setIsPressed(true), []),
    onMouseUp: useCallback(() => setIsPressed(false), [])
  };

  return {
    isHovered,
    isPressed,
    asyncData,
    handlers
  };
};

const useAsyncData = (logger: Logger): {
  data: unknown;
  loadData: () => Promise<void>;
} => {
  const [data, setData] = useState<unknown>(null);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      logger.info('Starting data fetch');

      // Simulate async operation
      const response = await fetch('/api/data');
      const result = await response.json();

      setData(result);
      logger.info('Data loaded successfully', { data: result });
    } catch (error) {
      logger.error('Failed to load data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [logger]);

  return { data, loadData };
};

// ============================================================================
// STYLE UTILITIES (Pure Functions)
// ============================================================================

const createButtonClasses = (
  variant: string,
  isHovered: boolean,
  isPressed: boolean,
  isDisabled: boolean
): string => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const stateClasses: string[] = [];

  if (isHovered) stateClasses.push('hover');
  if (isPressed) stateClasses.push('pressed');
  if (isDisabled) stateClasses.push('disabled');

  return [baseClass, variantClass, ...stateClasses].join(' ');
};

const shouldShowImage = (config?: ButtonConfig): boolean => {
  return Boolean(config?.variants && config.variants.length > 0);
};

// ============================================================================
// BUSINESS LOGIC (Pure Functions)
// ============================================================================

const validateButtonProps = (props: ButtonProps): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!props.label || props.label.trim().length === 0) {
    errors.push('Label is required');
  }

  if (typeof props.onClick !== 'function') {
    errors.push('onClick handler is required');
  }

  if (props.variant && !['primary', 'secondary'].includes(props.variant)) {
    errors.push('Invalid variant');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const calculateRiskScore = (variant: string, disabled: boolean): number => {
  let score = 1.0;

  if (variant === 'primary') score += 0.5;
  if (disabled) score += 0.3;

  return score;
};

// ============================================================================
// MAIN COMPONENTS (Composition Root)
// ============================================================================

interface TestButtonProps extends ButtonProps {
  logger?: Logger;
  router?: Router;
}

export const TestButton: React.FC<TestButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  config,
  logger = new MockLogger(),
  router = new MockRouter()
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isHovered, isPressed, handlers } = useButtonState(config);
  const { data: asyncData, loadData } = useAsyncData(logger);

  // Validation
  const validation = validateButtonProps({ label, onClick, disabled, variant, config });
  if (!validation.isValid) {
    logger.error('Invalid button props', { errors: validation.errors });
    return null;
  }

  // Effects
  useEffect(() => {
    logger.info('Button mounted', { label, variant });

    // Load data on mount
    loadData().catch(error => {
      logger.error('Failed to load initial data', { error });
    });

    return () => {
      logger.info('Button unmounted');
    };
  }, [label, variant, logger, loadData]);

  // Event handlers
  const handleClick = useCallback(() => {
    try {
      onClick();

      if (variant === 'primary') {
        router.push('/success');
      }

      logger.info('Button clicked', {
        label,
        variant,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Button click failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [onClick, variant, router, logger, label]);

  // Computed values
  const isDisabled = disabled === true;
  const buttonClass = createButtonClasses(variant, isHovered, isPressed, isDisabled);
  const showImage = shouldShowImage(config);

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      onClick={handleClick}
      disabled={isDisabled}
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      onMouseDown={handlers.onMouseDown}
      onMouseUp={handlers.onMouseUp}
      aria-label={label}
      data-variant={variant}
      data-testid="test-button"
    >
      <ButtonIcon shouldShow={showImage} />
      <ButtonLabel>{label}</ButtonLabel>
      <ButtonStatus data={asyncData} />
    </button>
  );
};

// ============================================================================
// ENHANCED COMPONENT VARIANTS (Open/Closed Principle)
// ============================================================================

export const AsyncTestButton: React.FC<TestButtonProps> = (props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAsyncClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
      props.onClick();
    } finally {
      setIsLoading(false);
    }
  }, [props]);

  return (
    <TestButton
      {...props}
      onClick={handleAsyncClick}
      disabled={props.disabled || isLoading}
      label={isLoading ? 'Loading...' : props.label}
    />
  );
};

export const ValidatedTestButton: React.FC<TestButtonProps & {
  validation?: (props: ButtonProps) => boolean;
}> = ({ validation, ...props }) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (validation) {
      setIsValid(validation(props));
    }
  }, [validation, props]);

  if (!isValid) {
    return (
      <div className="invalid-button" data-testid="invalid-button">
        Invalid button configuration
      </div>
    );
  }

  return <TestButton {...props} />;
};

// ============================================================================
// HIGHER-ORDER COMPONENT (Composition Pattern)
// ============================================================================

interface WithLoggingProps {
  componentName?: string;
}

export function withLogging<P extends object>(
  Component: React.ComponentType<P & { logger?: Logger }>
): React.ComponentType<P & WithLoggingProps> {
  return function LoggedComponent(props: P & WithLoggingProps) {
    const logger = new MockLogger();
    const componentName = props.componentName || Component.displayName || 'Component';

    useEffect(() => {
      logger.info(`${componentName} rendered`);
      return () => {
        logger.info(`${componentName} unmounted`);
      };
    }, [logger, componentName]);

    return <Component {...(props as P)} logger={logger} />;
  };
}

// ============================================================================
// COMPONENT FACTORY (Factory Pattern)
// ============================================================================

export class ComponentFactory {
  constructor(private readonly config: ComponentFactoryConfig) {}

  createButton(props: ButtonProps): React.ReactElement {
    let ButtonComponent = TestButton;

    if (this.config.enableAsync) {
      ButtonComponent = AsyncTestButton;
    }

    if (this.config.enableValidation) {
      const ValidatedButton = ValidatedTestButton;
      ButtonComponent = ValidatedButton as any;
    }

    if (this.config.enableLogging) {
      ButtonComponent = withLogging(ButtonComponent);
    }

    const enhancedProps = {
      ...props,
      variant: props.variant || this.config.defaultVariant
    };

    return React.createElement(ButtonComponent, enhancedProps);
  }

  createButtonWithConfig(
    label: string,
    onClick: () => void,
    overrides?: Partial<ButtonProps>
  ): React.ReactElement {
    const props: ButtonProps = {
      label,
      onClick,
      variant: this.config.defaultVariant,
      ...overrides
    };

    return this.createButton(props);
  }
}

// ============================================================================
// TEST UTILITIES (Testing Support)
// ============================================================================

export const createTestComponentFactory = (config?: Partial<ComponentFactoryConfig>): ComponentFactory => {
  return new ComponentFactory({
    defaultVariant: 'primary',
    enableLogging: true,
    enableValidation: true,
    enableAsync: false,
    ...config
  });
};

export const createMockProps = (overrides?: Partial<ButtonProps>): ButtonProps => {
  return {
    label: 'Test Button',
    onClick: () => console.log('Button clicked'),
    variant: 'primary',
    disabled: false,
    ...overrides
  };
};

export const createMockLogger = (): MockLogger => new MockLogger();
export const createMockRouter = (): MockRouter => new MockRouter();