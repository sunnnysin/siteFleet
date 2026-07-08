module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@react-native-async-storage|@react-native-google-signin|react-native-screens|react-native-safe-area-context|react-native-html-to-pdf|react-native-share|firebase|@firebase)/)',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/envMock.ts',
    '^@/firebase/auth$': '<rootDir>/__mocks__/firebaseAuthMock.ts',
    '^@/firebase/config$': '<rootDir>/__mocks__/firebaseConfigMock.ts',
    '^@/services/driverReportService$':
      '<rootDir>/__mocks__/driverReportServiceMock.ts',
    '^@/services/pumpReportService$':
      '<rootDir>/__mocks__/pumpReportServiceMock.ts',
    '^@/services/summaryReportService$':
      '<rootDir>/__mocks__/summaryReportServiceMock.ts',
    '^@/services/billReportService$':
      '<rootDir>/__mocks__/billReportServiceMock.ts',
    '^@/services/goraulSummaryReportService$':
      '<rootDir>/__mocks__/goraulSummaryReportServiceMock.ts',
    '^@/services/goraulBillReportService$':
      '<rootDir>/__mocks__/goraulBillReportServiceMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
