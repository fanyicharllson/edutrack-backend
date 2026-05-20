/** @type {import('jest').Config} */
const path = require('path');

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Direct transform without preset
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { 
      tsconfig: path.join(__dirname, 'tsconfig.json'),
      isolatedModules: true,
    }],
  },
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/types/**',
    '!src/generated/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
