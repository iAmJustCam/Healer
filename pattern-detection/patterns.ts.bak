/**
 * Migration Configuration - SINGLE SOURCE OF TRUTH (June 2025)
 *
 * Consolidated configuration for bleeding-edge framework migrations with
 * comprehensive pre/post upgrade patterns based on June 2025 research.
 * Maintains DRY, SRP, and SSOT principles across the entire migration system.
 *
 * Frameworks covered:
 * - React 19 (stable)
 * - Next.js 15.3 (stable)
 * - TypeScript 5.8 (stable)
 * - Tailwind CSS 4.1 (stable)
 */

import {
  Framework,
  RiskLevel,
  TransformationCategory,
  TransformationStrategy,
} from '';

import { 
  MigrationConfig,
  React19MigrationConfig as React19Config,
  NextJS153MigrationConfig as NextJS153Config,
  TypeScript58MigrationConfig as TypeScript58Config,
  Tailwind41MigrationConfig as Tailwind41Config,
  ConsoleMigrationConfig as ConsoleConfig,
  TypeScriptDebtConfig,
  ComplexityConfig,
  PerformanceConfig,
  SafetyConfig,
  RollbackConfig
} from '';

export { Framework, RiskLevel, TransformationCategory, TransformationStrategy };

// Extended interfaces that include implementation details beyond the core types

interface ForwardRefMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  astPattern: RegExp;
  codemod: string;
  examples: {
    before: string;
    after: string;
  };
}

interface PropTypesMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  migrationStrategy: 'remove' | 'typescript' | 'separate-package';
  examples: {
    before: string;
    after: string;
  };
}

interface DefaultPropsMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  scope: 'function-components' | 'class-components' | 'both';
  examples: {
    before: string;
    after: string;
  };
}

interface StringRefsMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  migrationStrategy: 'ref-callback' | 'create-ref' | 'use-ref';
  examples: {
    before: string;
    after: string;
  };
}

interface LegacyContextMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  apis: string[];
  examples: {
    before: string;
    after: string;
  };
}

interface ModulePatternFactoriesMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  examples: {
    before: string;
    after: string;
  };
}

interface CreateFactoryMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  replacement: 'jsx';
  examples: {
    before: string;
    after: string;
  };
}

interface TestRendererMigration {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  replacement: 'react-testing-library' | 'separate-package';
  examples: {
    before: string;
    after: string;
  };
}

interface TypeScriptChangesMigration {
  description: string;
  codemod: string;
  changes: {
    elementProps: string;
    refTypes: string;
    contextTypes: string;
  };
}


interface AsyncRequestAPIsMigration {
  description: string;
  affectedAPIs: string[];
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  codemod: string;
  examples: {
    cookies: { before: string; after: string };
    headers: { before: string; after: string };
    params: { before: string; after: string };
    draftMode: { before: string; after: string };
  };
}

interface CachingSemanticsChanges {
  description: string;
  changes: {
    fetchRequests: string;
    routeHandlers: string;
    clientRouter: string;
  };
  migration: {
    optIn: string;
    optOut: string;
  };
}

interface RemovedAPIsMigration {
  description: string;
  removedAPIs: {
    requestGeo: {
      prePattern: string;
      postPattern: string;
      vercelAlternative: string;
    };
    requestIP: {
      prePattern: string;
      postPattern: string;
      vercelAlternative: string;
    };
  };
}

interface ESLintSupportChanges {
  description: string;
  eslint9Support: boolean;
  flatConfigSupport: boolean;
  deprecatedOptions: string[];
  migrationFlags: string[];
}

interface TurbopackChanges {
  description: string;
  stableInDev: boolean;
  performanceImprovements: string[];
}


interface ImportAssertionChanges {
  description: string;
  prePattern: string;
  postPattern: string;
  rollbackPattern: string;
  examples: {
    before: string;
    after: string;
  };
}

interface ESMInteroperabilityChanges {
  description: string;
  nodeJSSupport: string;
  commonJSESMInterop: boolean;
  changes: string[];
}

interface TypeInferenceImprovements {
  description: string;
  improvements: string[];
  potentialBreaking: string[];
}

interface PerformanceChanges {
  description: string;
  improvements: {
    languageService: string;
    buildTimes: string;
    memoryUsage: string;
  };
}


interface ConfigurationFormatChanges {
  description: string;
  prePattern: string;
  postPattern: string;
  migration: {
    automated: boolean;
    codemod: string;
  };
  examples: {
    before: string;
    after: string;
  };
}

interface BrowserSupportChanges {
  description: string;
  minimum: {
    safari: string;
    chrome: string;
    firefox: string;
  };
  droppedSupport: string[];
  fallbacks: string[];
}

interface EngineChanges {
  description: string;
  oxideEngine: boolean;
  rustComponents: string[];
  performanceGains: {
    fullRebuilds: string;
    incrementalBuilds: string;
  };
}

interface DeprecatedUtilitiesChanges {
  description: string;
  removedUtilities: string[];
  replacements: Record<string, string>;
}

interface PostCSSChanges {
  description: string;
  separatePackages: string[];
  vitePlugin: string;
  migration: string;
}

interface ColorChanges {
  description: string;
  borderDefault: string;
  ringDefault: string;
  placeholderColor: string;
}

interface NewFeaturesConfig {
  textShadows: boolean;
  maskUtilities: boolean;
  containerQueries: boolean;
  cascadeLayers: boolean;
  overflowWrap: boolean;
}

interface StructuredLoggingConfig {
  enabled: boolean;
  format: 'json' | 'kv';
  metadataFields: string[];
}

interface ComplexityWeights {
  anyTypeUsage: number;
  unsafeAssertion: number;
  emptyCatch: number;
  strictModeViolation: number;
  nonNullAssertion: number;
  missingReturnType: number;
  implicitAny: number;
  untypedObjects: number;
}

interface ComponentCriticalityConfig {
  typeMultipliers: {
    core: number;
    domain: number;
    bridge: number;
    ui: number;
    utility: number;
  };
  pathOverrides: Record<string, number>;
}

interface TypeAnalysisConfig {
  cascadeDetection: boolean;
  inferenceMapping: boolean;
  dependencyTracking: boolean;
  propTracking: boolean;
}

interface ComplexityScoring {
  forwardRef: number;
  imperativeHandle: number;
  refCallback: number;
  refObject: number;
  stringRef: number;
}

interface ContextPatterns {
  serverComponent: RegExp[];
  routeHandler: RegExp[];
  middleware: RegExp[];
}

interface ServerComponentPatterns {
  filePatterns: string[];
  directoryPatterns: string[];
}

interface CompatModeSettings {
  strict: boolean;
  skipLibCheck: boolean;
  noImplicitAny: boolean;
}

interface TypeCheckingSettings {
  checkJs: boolean;
  allowJs: boolean;
  declaration: boolean;
}



// Using the canonical type directly rather than extending it

// Using the canonical type directly rather than extending it

const config: MigrationConfig = {
  patterns: {
    react19: {
      version: {
        from: '18.3.1',
        to: '19.0.0',
        releaseDate: '2024-12-05',
      },

      breakingChanges: {
        forwardRef: {
          description: 'React.forwardRef is no longer needed as ref is now a regular prop',
          prePattern: 'React.forwardRef((props, ref) => { /* component */ })',
          postPattern: 'function Component({ ref, ...props }) { /* component */ }',
          rollbackPattern: 'React.forwardRef((props, ref) => { /* component */ })',
          astPattern: /React\.forwardRef\s*\(/,
          codemod: 'react-codemod/19.0.0/replace-reactdom-render',
          examples: {
            before: `const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref} {...props} />;
});`,
            after: `function Button({ ref, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <button ref={ref} {...props} />;
}`,
          },
        },

        propTypes: {
          description: 'PropTypes are no longer supported in React core',
          prePattern: 'Component.propTypes = { /* types */ }',
          postPattern: '/ Remove propTypes, use TypeScript instead',
          rollbackPattern: 'Component.propTypes = { /* types */ }',
          migrationStrategy: 'typescript',
          examples: {
            before: `Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};`,
            after: `interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}`,
          },
        },

        defaultProps: {
          description: 'defaultProps removed from function components, use ES6 defaults',
          prePattern: 'Component.defaultProps = { /* defaults */ }',
          postPattern: 'function Component({ prop = defaultValue }) { /* component */ }',
          rollbackPattern: 'Component.defaultProps = { /* defaults */ }',
          scope: 'function-components',
          examples: {
            before: `Button.defaultProps = {
  variant: 'primary',
  size: 'medium'
};`,
            after: `function Button({
  variant = 'primary',
  size = 'medium'
}: ButtonProps) { /* component */ }`,
          },
        },

        stringRefs: {
          description: 'String refs are no longer supported',
          prePattern: '<div ref="myRef">',
          postPattern: 'const myRef = useRef(); <div ref={myRef}>',
          rollbackPattern: '<div ref="myRef">',
          migrationStrategy: 'use-ref',
          examples: {
            before: '<div ref="myDiv">Content</div>',
            after: `const myDiv = useRef<HTMLDivElement>(null);
<div ref={myDiv}>Content</div>`,
          },
        },

        legacyContext: {
          description: 'Legacy Context API (contextTypes, getChildContext) removed',
          prePattern: 'static contextTypes = { /* types */ }',
          postPattern: 'const Context = React.createContext(defaultValue)',
          rollbackPattern: 'static contextTypes = { /* types */ }',
          apis: ['contextTypes', 'getChildContext', 'childContextTypes'],
          examples: {
            before: `class MyComponent extends React.Component {
  static contextTypes = { theme: PropTypes.object };
}`,
            after: `const ThemeContext = React.createContext(defaultTheme);
function MyComponent() {
  const theme = useContext(ThemeContext);
}`,
          },
        },

        modulePatternFactories: {
          description: 'Module pattern factories no longer supported',
          prePattern: 'function Component() { return { render() { /* jsx */ } }; }',
          postPattern: 'function Component() { return /* jsx */; }',
          rollbackPattern: 'function Component() { return { render() { /* jsx */ } }; }',
          examples: {
            before: `function MyComponent() {
  return {
    render() {
      return <div>Hello</div>;
    }
  };
}`,
            after: `function MyComponent() {
  return <div>Hello</div>;
}`,
          },
        },

        createFactory: {
          description: 'React.createFactory removed, use JSX instead',
          prePattern: "const factory = React.createFactory('div')",
          postPattern: 'const element = <div />',
          rollbackPattern: "const factory = React.createFactory('div')",
          replacement: 'jsx',
          examples: {
            before: `const factory = React.createFactory('div');
const element = factory({ className: 'test' });`,
            after: `const element = <div className="test" />;`,
          },
        },

        testRenderer: {
          description: 'react-test-renderer/shallow removed, use separate package',
          prePattern: "import { shallow } from 'react-test-renderer/shallow'",
          postPattern: "import { shallow } from 'react-shallow-renderer'",
          rollbackPattern: "import { shallow } from 'react-test-renderer/shallow'",
          replacement: 'separate-package',
          examples: {
            before: `import { shallow } from 'react-test-renderer/shallow';`,
            after: `import { shallow } from 'react-shallow-renderer';`,
          },
        },

        typeScriptChanges: {
          description: 'TypeScript types updated for React 19',
          codemod: 'types-react-codemod@latest preset-19',
          changes: {
            elementProps: 'Element.props access may require type assertion',
            refTypes: 'Ref types simplified, forwardRef types removed',
            contextTypes: 'Legacy context types removed',
          },
        },
      },

      astPatterns: [
        /React\.forwardRef\s*\(/,
        /useRef\s*\(\s*\)/,
        /useImperativeHandle/,
        /<[A-Z][A-Za-z]*.*?ref\s*=/,
        /\.propTypes\s*=/,
        /\.defaultProps\s*=/,
        /ref\s*=\s*["'][^"']+["']/,
        /contextTypes\s*=/,
        /getChildContext\s*\(/,
        /React\.createFactory\s*\(/,
      ],

      stringReplacements: {
        'React.FC<': '(',
        'React.FunctionComponent<': '(',
        'React.VFC<': '(',
        'React.VoidFunctionComponent<': '(',
        'React.memo(': 'memo(',
        'React.Fragment>': 'Fragment>',
        'React.StrictMode>': 'StrictMode>',
        "import React from 'prop-types';": '/ PropTypes removed in React 19',
        'React.createFactory(': '/ Use JSX instead: ',
        'react-test-renderer/shallow': 'react-shallow-renderer',
      },

      componentTypeWeights: {
        functional: 1.0,
        class: 1.5,
        hoc: 2.0,
        context: 1.8,
        forwardRef: 2.5,
      },

      complexityScoring: {
        forwardRef: 10,
        imperativeHandle: 9,
        refCallback: 7,
        refObject: 6,
        stringRef: 10,
      },

      rollbackPatterns: {
        '({ ref, ...props })': 'React.forwardRef((props, ref) =>',
        '/ PropTypes removed in React 19': "import React from 'prop-types';",
        'useRef<': 'useRef(',
        '/ Use JSX instead: ': 'React.createFactory(',
      },
    },

    nextjs153: {
      version: {
        from: '14.2.0',
        to: '15.3.0',
        releaseDate: '2024-10-21',
      },

      breakingChanges: {
        asyncRequestAPIs: {
          description: 'cookies(), headers(), params, draftMode() are now async',
          affectedAPIs: ['cookies', 'headers', 'params', 'draftMode', 'searchParams'],
          prePattern: 'const cookieStore = cookies()',
          postPattern: 'const cookieStore = await cookies()',
          rollbackPattern: 'const cookieStore = cookies()',
          codemod: 'npx @next/codemod@canary next-async-request-api',
          examples: {
            cookies: {
              before: `const cookieStore = cookies();
const token = cookieStore.get('token');`,
              after: `const cookieStore = await cookies();
const token = cookieStore.get('token');`,
            },
            headers: {
              before: `const headersList = headers();
const userAgent = headersList.get('user-agent');`,
              after: `const headersList = await headers();
const userAgent = headersList.get('user-agent');`,
            },
            params: {
              before: `const { id } = params;`,
              after: `const { id } = await params;`,
            },
            draftMode: {
              before: `const { isEnabled } = draftMode();`,
              after: `const { isEnabled } = await draftMode();`,
            },
          },
        },

        cachingSemantics: {
          description: 'Default caching behavior changed for fetch and Route Handlers',
          changes: {
            fetchRequests: 'fetch now defaults to no-store unless explicitly cached',
            routeHandlers: 'GET Route Handlers no longer cached by default',
            clientRouter: 'Client Router Cache no longer cached by default',
          },
          migration: {
            optIn: 'Add { cache: "force-cache" } to fetch requests for caching',
            optOut: 'Add { cache: "no-store" } to explicitly disable caching',
          },
        },

        removedAPIs: {
          description: 'request.geo and request.ip removed from NextRequest',
          removedAPIs: {
            requestGeo: {
              prePattern: 'request.geo.city',
              postPattern: 'geolocation(request).city',
              vercelAlternative: 'import { geolocation } from "@vercel/functions"',
            },
            requestIP: {
              prePattern: 'request.ip',
              postPattern: 'ipAddress(request)',
              vercelAlternative: 'import { ipAddress } from "@vercel/functions"',
            },
          },
        },

        eslintSupport: {
          description: 'ESLint 9 support with flat config',
          eslint9Support: true,
          flatConfigSupport: true,
          deprecatedOptions: ['--ext', '--ignore-path'],
          migrationFlags: ['ESLINT_USE_FLAT_CONFIG=false'],
        },

        turbopackImprovements: {
          description: 'Turbopack stable in development mode',
          stableInDev: true,
          performanceImprovements: [
            'Faster hot reload',
            'Improved bundling performance',
            'Better memory usage',
          ],
        },
      },

      astPatterns: [
        /\b(cookies|headers|params|draftMode)\s*\(\s*\)/,
        /const\s+\w+\s*=\s*(cookies|headers|params)\s*\(/,
        /request\.geo\./,
        /request\.ip\b/,
        /getServerSideProps/,
        /getStaticProps/,
        /getStaticPaths/,
      ],

      stringReplacements: {
        'useRouter().query': '(await params)',
        'router.query': '(await params)',
        getServerSideProps: 'DEPRECATED - Convert to Server Component',
        getStaticProps: 'DEPRECATED - Convert to Server Component',
        getStaticPaths: 'DEPRECATED - Use generateStaticParams',
        'next/router': 'next/navigation',
        'request.geo.': 'geolocation(request).',
        'request.ip': 'ipAddress(request)',
        'cookies()': 'await cookies()',
        'headers()': 'await headers()',
        'draftMode()': 'await draftMode()',
      },

      contextPatterns: {
        serverComponent: [/page\.(tsx?|jsx?)$/, /layout\.(tsx?|jsx?)$/],
        routeHandler: [/route\.(ts|js)$/],
        middleware: [/middleware\.(ts|js)$/],
      },

      serverComponentPatterns: {
        filePatterns: ['page.tsx', 'layout.tsx', 'route.ts'],
        directoryPatterns: ['app/api/', 'app/actions/'],
      },

      rollbackPatterns: {
        'await cookies()': 'cookies()',
        'await headers()': 'headers()',
        'await params': 'params',
        'await draftMode()': 'draftMode()',
        'geolocation(request)': 'request.geo',
        'ipAddress(request)': 'request.ip',
      },
    },

    typescript58: {
      version: {
        from: '5.7.2',
        to: '5.8.0',
        releaseDate: '2025-02-28',
      },

      breakingChanges: {
        importAssertions: {
          description: 'Import assertions deprecated in favor of "with" syntax',
          prePattern: 'import data from "./data.json" assert { type: "json" }',
          postPattern: 'import data from "./data.json" with { type: "json" }',
          rollbackPattern: 'import data from "./data.json" assert { type: "json" }',
          examples: {
            before: 'import data from "./data.json" assert { type: "json" };',
            after: 'import data from "./data.json" with { type: "json" };',
          },
        },

        esmInteroperability: {
          description: 'Improved ESM/CommonJS interoperability with Node.js 22',
          nodeJSSupport: '22+',
          commonJSESMInterop: true,
          changes: [
            'require() can now import ESM modules',
            'Better dual-package support',
            'Reduced need for dual-publishing',
          ],
        },

        typeInference: {
          description: 'Enhanced type inference may break existing code',
          improvements: [
            'Better control flow analysis',
            'More precise union type narrowing',
            'Improved conditional type inference',
          ],
          potentialBreaking: [
            'More precise types may cause compatibility issues',
            'Stricter type checking may reveal hidden errors',
          ],
        },

        performanceChanges: {
          description: 'Significant performance improvements',
          improvements: {
            languageService: '10-20% faster operations',
            buildTimes: '5-8% faster when using TypeScript API',
            memoryUsage: 'Optimized memory usage with trade-offs',
          },
        },
      },

      stringReplacements: {
        'assert { type: "json" }': 'with { type: "json" }',
        'assert { type: "css" }': 'with { type: "css" }',
        'skipLibCheck: false': 'skipLibCheck: true',
        'noImplicitAny: false': 'noImplicitAny: true',
        'noUnusedLocals: false': 'noUnusedLocals: true',
        'noUnusedParameters: false': 'noUnusedParameters: true',
        ': any': ': unknown',
        'as any': 'as unknown',
        '== null': '=== null',
        '== undefined': '=== undefined',
        '!= null': '!== null',
        '!= undefined': '!== undefined',
      },

      compatMode: {
        strict: true,
        skipLibCheck: true,
        noImplicitAny: true,
      },

      typeChecking: {
        checkJs: false,
        allowJs: true,
        declaration: true,
      },

      rollbackPatterns: {
        'with { type: "json" }': 'assert { type: "json" }',
        'with { type: "css" }': 'assert { type: "css" }',
        ': unknown': ': any',
        'as unknown': 'as any',
      },
    },

    tailwind41: {
      version: {
        from: '3.4.0',
        to: '4.1.0',
        releaseDate: '2025-01-25',
      },

      breakingChanges: {
        configurationFormat: {
          description: 'Configuration moved from JavaScript to CSS',
          prePattern: 'module.exports = { theme: { colors: { ... } } }',
          postPattern: '@theme { --color-primary: #3b82f6; }',
          migration: {
            automated: true,
            codemod: 'npx @tailwindcss/upgrade',
          },
          examples: {
            before: `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}`,
            after: `@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
}`,
          },
        },

        browserSupport: {
          description: 'Requires modern browsers, drops support for older versions',
          minimum: {
            safari: '16.4+',
            chrome: '111+',
            firefox: '128+',
          },
          droppedSupport: ['Safari 15 and below', 'Chrome 110 and below', 'Firefox 127 and below'],
          fallbacks: [
            'Graceful degradation for colors',
            'Fallback shadows for older browsers',
            'Basic layout support maintained',
          ],
        },

        engineChanges: {
          description: 'New Oxide engine with Rust performance improvements',
          oxideEngine: true,
          rustComponents: ['Parser', 'CSS generation', 'Optimization'],
          performanceGains: {
            fullRebuilds: 'Up to 5x faster',
            incrementalBuilds: 'Over 100x faster (microseconds)',
          },
        },

        deprecatedUtilities: {
          description: 'Removed utilities deprecated in v3',
          removedUtilities: [
            'transform',
            'filter',
            'backdrop-filter',
            'text-opacity-*',
            'bg-opacity-*',
            'border-opacity-*',
            'divide-opacity-*',
            'ring-opacity-*',
            'shadow-opacity-*',
          ],
          replacements: {
            'bg-black bg-opacity-25': 'bg-black/25',
            'text-white text-opacity-50': 'text-white/50',
            'border-gray-500 border-opacity-75': 'border-gray-500/75',
          },
        },

        postCSSChanges: {
          description: 'PostCSS plugin and CLI moved to separate packages',
          separatePackages: ['@tailwindcss/postcss', '@tailwindcss/cli', '@tailwindcss/vite'],
          vitePlugin: '@tailwindcss/vite',
          migration: 'Install @tailwindcss/postcss separately for PostCSS usage',
        },

        colorChanges: {
          description: 'Default color values changed for better consistency',
          borderDefault: 'Changed from gray-200 to currentColor',
          ringDefault: 'Changed from 3px blue to 1px currentColor',
          placeholderColor: 'Changed from gray-400 to 50% opacity of current text',
        },
      },

      complexPatterns: [
        /transition-\[transform[^\]]*\]/,
        /className.*\$\{.*\}/,
        /@apply\s+[^;]+/,
        /@tailwind\s+(base|components|utilities)/,
        /tailwind\.config\.(js|ts)/,
        /bg-opacity-\d+/,
        /text-opacity-\d+/,
        /border-opacity-\d+/,
      ],

      stringReplacements: {
        '@tailwind base;': '@import "tailwindcss";',
        '@tailwind components;': '',
        '@tailwind utilities;': '',
        tailwindcss: '@tailwindcss/postcss',
        'bg-opacity-25': '/25',
        'text-opacity-50': '/50',
        'border-opacity-75': '/75',
        'shadow-sm': 'shadow-xs',
        shadow: 'shadow-sm',
        'shadow-md': 'shadow',
        'shadow-lg': 'shadow-md',
        'shadow-xl': 'shadow-lg',
        'shadow-2xl': 'shadow-xl',
        prose: 'typography',
        'prose-sm': 'typography-sm',
        'prose-lg': 'typography-lg',
      },

      classTranslation: {
        'shadow-sm': 'shadow-xs',
        shadow: 'shadow-sm',
        'shadow-md': 'shadow',
        'shadow-lg': 'shadow-md',
        'shadow-xl': 'shadow-lg',
        'shadow-2xl': 'shadow-xl',
        prose: 'typography',
        'prose-sm': 'typography-sm',
        'prose-base': 'typography-base',
        'prose-lg': 'typography-lg',
        'prose-xl': 'typography-xl',
        'prose-2xl': 'typography-2xl',
        'dark:prose-invert': 'dark:typography-invert',
      },

      newFeatures: {
        textShadows: true,
        maskUtilities: true,
        containerQueries: true,
        cascadeLayers: true,
        overflowWrap: true,
      },

      rollbackPatterns: {
        '@import "tailwindcss";': '@tailwind base;\n@tailwind components;\n@tailwind utilities;',
        '/25': 'bg-opacity-25',
        '/50': 'text-opacity-50',
        '/75': 'border-opacity-75',
        'shadow-xs': 'shadow-sm',
        'shadow-sm': 'shadow',
        typography: 'prose',
        '@tailwindcss/postcss': 'tailwindcss',
      },
    },

    console: {
      complexPatterns: [
        /console\.[a-z]+\s*\(\s*`/,
        /\{[^}]*console\./,
        /console\.[a-z]+\s*\([^)]*\{/,
      ],

      logLevelMap: {
        'console.error': 'logger.error',
        'console.warn': 'logger.warn',
        'CLIRenderer.render': 'logger.info',
        'console.info': 'logger.info',
        'console.debug': 'logger.debug',
        'console.trace': 'logger.debug',
        error: 'error',
        warn: 'warn',
        info: 'info',
        log: 'info',
        debug: 'debug',
        trace: 'trace',
      },

      structuredLogging: {
        enabled: true,
        format: 'json',
        metadataFields: ['timestamp', 'level', 'component', 'context'],
      },

      rollbackPatterns: {
        'logger.error': 'console.error',
        'logger.warn': 'console.warn',
        'logger.info': 'CLIRenderer.render',
        'logger.debug': 'console.debug',
      },
    },

    typescriptDebt: {
      astPatterns: [
        /:\s*any\b(?!\s*\|\s*\w)/,
        /\s+as\s+\w+(?:\[\])?(?!\s*\|\s*null)/,
        /catch\s*\([^)]*\)\s*{\s*}/,
        /function\s+\w+\([^)]*\)\s*{/,
        /!\.|!\[|!\s*;/,
        /==\s*(?:null|undefined)/,
        /typeof\s+\w+\s*==\s*['"]undefined['"]/,
        /\.length\s*>\s*0/,
      ],

      stringReplacements: {
        ': any': ': unknown',
        'as any': 'as unknown',
        '== null': '=== null',
        '== undefined': '=== undefined',
        '!= null': '!== null',
        '!= undefined': '!== undefined',
        '.indexOf(': '.includes(',
      },

      severityMap: {
        any: 'high',
        unsafe_assertion: 'high',
        empty_catch: 'medium',
        missing_return_type: 'medium',
        non_null_assertion: 'high',
        loose_equality: 'medium',
        typeof_undefined: 'medium',
        length_check: 'low',
      },

      complexityWeights: {
        anyTypeUsage: 10,
        unsafeAssertion: 8,
        emptyCatch: 6,
        strictModeViolation: 9,
        nonNullAssertion: 7,
        missingReturnType: 5,
        implicitAny: 9,
        untypedObjects: 7,
      },

      componentCriticality: {
        typeMultipliers: {
          core: 2.0,
          domain: 1.5,
          bridge: 1.8,
          ui: 1.2,
          utility: 1.0,
        },
        pathOverrides: {
          'src/core/': 2.0,
          'src/bridge/': 1.8,
          'src/domains/foundation/': 1.8,
          'src/app/api/': 1.7,
        },
      },

      typeAnalysis: {
        cascadeDetection: true,
        inferenceMapping: true,
        dependencyTracking: true,
        propTracking: true,
      },
    },
  },

  complexity: {
    thresholds: {
      cyclomaticComplexity: 15,
      cognitiveComplexity: 12,
      linesOfCode: 250,
      maintainabilityIndex: 65,
    },
    weights: {
      cyclomaticWeight: 0.3,
      cognitiveWeight: 0.4,
      locWeight: 0.1,
      maintainabilityWeight: 0.2,
    },
  },

  performance: {
    bundleSize: {
      total: 250,
      individual: 50,
      dynamicImport: 20,
    },
    runtime: {
      renderTime: 50,
      interactionDelay: 100,
      memoryUsage: 50,
    },
  },

  safety: {
    migrationSafety: {
      maxBatchSize: 5,
      requireTests: true,
      autoRollback: true,
      verificationSteps: [
        'Static type checking',
        'Unit tests',
        'Integration tests',
        'Visual regression',
        'Performance benchmarking',
      ],
    },
    businessImpact: {
      criticalPaths: ['src/app/api/', 'src/core/foundation/', 'src/bridge/'],
      impactMatrix: {
        core: 0.9,
        bridge: 0.8,
        ui: 0.6,
        utils: 0.4,
      },
      riskThresholds: {
        high: 0.7,
        medium: 0.4,
        low: 0.2,
      },
    },
  },

  rollback: {
    enabled: true,
    strategies: {
      automatic: true,
      manual: true,
      conditional: true,
    },
    triggers: {
      testFailures: true,
      buildFailures: true,
      lintFailures: true,
      typeCheckFailures: true,
    },
    preserveBackups: {
      duration: 30,
      maxVersions: 10,
    },
  },
};

export default config;
export const patterns = config;

export const frameworkVersions = {
  react: {
    current: '19.0.0',
    previous: '18.3.1',
    breaking: ['19.0.0'],
    releaseDate: '2024-12-05',
    lts: '18.3.1',
  },
  nextjs: {
    current: '15.3.0',
    previous: '14.2.0',
    breaking: ['15.0.0', '15.3.0'],
    releaseDate: '2024-10-21',
    lts: '14.2.0',
  },
  typescript: {
    current: '5.8.0',
    previous: '5.7.2',
    breaking: ['5.8.0'],
    releaseDate: '2025-02-28',
    lts: '5.7.2',
  },
  tailwind: {
    current: '4.1.0',
    previous: '3.4.0',
    breaking: ['4.0.0', '4.1.0'],
    releaseDate: '2025-01-25',
    lts: '3.4.0',
  },
};

export const filePatterns = {
  include: [
    'src/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}',
    'pages/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'utils/**/*.{ts,tsx,js,jsx}',
    'hooks/**/*.{ts,tsx,js,jsx}',
    '*.{ts,tsx,js,jsx}',
    '**/*.css',
    'tailwind.config.{js,ts}',
    'next.config.{js,ts,mjs}',
    'tsconfig.json',
  ],
  exclude: [
    '**/node_modules/**',
    '**/*.d.ts',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/.git/**',
    '**/scripts/migrate/backups/**',
    '**/src/core/foundation/logger.ts',
    '**/.turbo/**',
    '**/out/**',
  ],
  specialCases: [
    'src/core/foundation/logger.ts',
    'tailwind.config.{js,ts}',
    'next.config.{js,ts,mjs}',
    'app/**/layout.tsx',
    'app/**/page.tsx',
    'app/**/route.ts',
  ],
};

export const riskFactors = {
  critical: [
    'React forwardRef patterns requiring manual intervention',
    'Next.js async API usage without proper await handling',
    'Tailwind config.js to CSS migration in complex setups',
    'TypeScript 5.8 import assertion breaking changes',
    'Multiple framework breaking changes in single component',
  ],
  high: [
    'React forwardRef patterns with complex prop handling',
    'Next.js async API usage in middleware',
    'Tailwind deprecated utilities with custom implementations',
    'TypeScript interface inheritance chains with any types',
    'Template literal console calls with dynamic content',
    'Cross-framework dependencies detected',
    'Multiple any type usages detected',
    'Unsafe type assertions without validation',
    'Empty catch blocks hiding errors',
    'High concentration of TypeScript debt',
  ],
  medium: [
    'Simple React forwardRef patterns',
    'Next.js router migration needed',
    'Tailwind shadow/prose class updates',
    'TypeScript namespace imports with high usage',
    'Console object method patterns',
    'Functions missing return type annotations',
    'Non-null assertions without proper checks',
    'Object literals without type definitions',
    'TODO/FIXME comments indicating incomplete code',
  ],
  low: [
    'Basic PropTypes removal',
    'Simple import assertion updates',
    'Standard Tailwind class replacements',
    'Simple console logging patterns',
    'Array generic syntax updates',
    'Minor type annotation improvements needed',
    'Simple Array<T> → T[] syntax updates',
    'Comment formatting standardization',
  ],
};
