module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  moduleNameMapper: {
    "^@entities/(.*)$": "<rootDir>/src/domain/entities/$1",
    "^@usecases/(.*)$": "<rootDir>/src/domain/usecases/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
  },
}