/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: { project: ['./tsconfig.eslint.json'] },
  root: true,
  ignorePatterns: [
    'src/**/__mocks__/**',
    'src/**/__tests__/**',
    'test/**',
    'dist/*',
    'lib/*',
    'config/**',
    'jest.config.js',
    'jest-integration.config.js',
    'pm2.config.js'
  ],
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'error',
    'no-new-func': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    'no-duplicate-imports': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/require-await': 'error',
    // Express 5 route handlers are intentionally async (rejected promises are
    // forwarded to the error middleware), so allow promise-returning functions
    // as arguments while keeping the rest of the rule active.
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { arguments: false } }],
    '@typescript-eslint/no-invalid-void-type': ['error', { allowInGenericTypeArguments: true }],
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }]
  },
  overrides: [
    {
      // Standalone CLI scripts (migration, smoke tests): console is their intended output.
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
