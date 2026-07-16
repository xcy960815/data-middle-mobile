const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['.expo/**', 'dist/**', 'node_modules/**', 'web-build/**'],
  },
  {
    files: ['src/hooks/use-color-scheme.web.ts'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
