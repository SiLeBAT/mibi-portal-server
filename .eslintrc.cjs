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
    'jest.config.js',
    'jest-integration.config.js',
    'pm2.config.js',
    'typings/**'
  ],
  rules: {
    // no-any
    '@typescript-eslint/no-explicit-any': 'error',
    // adjacent-overload-signatures
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    // member-access: no-public
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    // no-console
    'no-console': 'error',
    // no-useless-constructor (unnecessary-constructor)
    '@typescript-eslint/no-useless-constructor': 'error',
    // no-duplicate-imports
    'no-duplicate-imports': 'error',
    // no-new-func (function-constructor)
    'no-new-func': 'error',
    // promise-function-async
    '@typescript-eslint/promise-function-async': 'error',
    // no-unbound-method
    '@typescript-eslint/unbound-method': 'error',
    // no-confusing-void-expression (no-void-expression)
    '@typescript-eslint/no-confusing-void-expression': 'error',
    // restrict-plus-operands
    '@typescript-eslint/restrict-plus-operands': 'error',
    // no-object-literal-type-assertion
    '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    // no-async-without-await
    '@typescript-eslint/require-await': 'error',
    // restrict-template-expressions (strict-string-expressions)
    '@typescript-eslint/restrict-template-expressions': 'error',
    // no-misused-promises (no-promise-as-boolean)
    '@typescript-eslint/no-misused-promises': 'error',
    // invalid-void — allow void in any generic type argument (e.g. Promise<void>, Observable<void>)
    '@typescript-eslint/no-invalid-void-type': ['error', { allowInGenericTypeArguments: true }],
    // no-unused-vars: ignore caught errors prefixed with _
    '@typescript-eslint/no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    // off — were explicitly false in tslint or matched mibi-parse-cloud
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-magic-numbers': 'off'
  }
};
