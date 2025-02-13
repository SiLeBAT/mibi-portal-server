/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '((\\.|/)(test|spec))\\.(ts)$',
  roots: ['test'],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFilesAfterEnv: ['./test/setup.ts'],
  testTimeout: 30000
};