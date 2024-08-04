/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest', {
        tsconfig: 'src/__tests__/tsconfig.jest.json'
      }
    ]
  },
  verbose: false,
};
