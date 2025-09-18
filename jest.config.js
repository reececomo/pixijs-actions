const tsconfig = 'src/__tests__/tsconfig.jest.json';
const setupFile = '<rootDir>/src/__tests__/jest.setup.ts';

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig }]
  },
  setupFilesAfterEnv: [setupFile],
  verbose: false,
};
