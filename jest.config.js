module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@react-native-async-storage|@react-native-google-signin|react-native-screens|react-native-safe-area-context|firebase|@firebase)/)',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/envMock.ts',
    '^@/firebase/auth$': '<rootDir>/__mocks__/firebaseAuthMock.ts',
    '^@/firebase/config$': '<rootDir>/__mocks__/firebaseConfigMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
