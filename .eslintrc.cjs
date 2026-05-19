/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: { project: ['./tsconfig.json'] },
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
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-invalid-void-type': ['error', { allowInGenericTypeArguments: true }],
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }]
  }
};
