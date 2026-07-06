module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
  env: {
    development: {
      plugins: [
        [
          'module-resolver',
          {
            root: ['.'],
            alias: {
              '@': './src',
            },
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          },
        ],
      ],
    },
    production: {
      plugins: [
        [
          'module-resolver',
          {
            root: ['.'],
            alias: {
              '@': './src',
            },
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          },
        ],
      ],
    },
  },
};
