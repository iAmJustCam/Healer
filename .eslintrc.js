/**
 * ESLint Configuration for Constitutional Compliance
 * 
 * Implements the Constitutional Mandate C-01:
 * "ESLint rule 'no-local-types' errors on violations"
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'custom'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Constitutional Enforcement Rule
    'custom/no-local-types': [
      'error',
      {
        allowedFiles: [
          './types/canonical-types.ts',
          '**/*.pipeline.d.ts',
          '**/*.test.ts',
          '**/*.spec.ts',
        ],
        exemptTypes: [
          'Props', // React component props
          'State', // React component state
        ],
        suggestCanonical: true,
        strictImports: true,
      },
    ],
    // Additional rules to support constitutional principles
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' }
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'custom/no-local-types': 'off',
      }
    }
  ]
};