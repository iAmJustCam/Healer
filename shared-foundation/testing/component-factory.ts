/**
 * DEPRECATED: Component Factory has been moved to comply with Constitution
 * 
 * This file is a temporary compatibility layer to prevent breaking changes.
 * All React components have been moved out of the foundation layer to comply with P-05.
 * 
 * New location: ../../testing-ui/components/component-factory.tsx
 * 
 * Please update your imports to use the new location.
 */

import { 
  TestButton, 
  AsyncTestButton, 
  ValidatedTestButton, 
  withLogging,
  ComponentFactory,
  createTestComponentFactory,
  createMockProps,
  createMockLogger,
  createMockRouter
} from '../../testing-ui/components/component-factory';

// Re-export everything for backward compatibility
export {
  TestButton, 
  AsyncTestButton, 
  ValidatedTestButton, 
  withLogging,
  ComponentFactory,
  createTestComponentFactory,
  createMockProps,
  createMockLogger,
  createMockRouter
};

/**
 * @deprecated Please use the new location at ../../testing-ui/components/component-factory.tsx
 */
export default ComponentFactory;