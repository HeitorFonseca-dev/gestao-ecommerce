import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;
