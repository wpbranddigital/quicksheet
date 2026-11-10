module.exports = {
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'globals': {
    'wp': 'readonly',
    'jQuery': 'readonly',
    'QSWP': 'readonly'
  },
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 12,
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'react-hooks'
  ],
  'rules': {
    'func-names': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'react/jsx-filename-extension': [
      1, { 'extensions': ['.js', '.jsx'] }
    ],
    'react/prop-types': 'off',
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    'no-process-exit': 'off',
    'no-unsafe-optional-chaining': 'off',
    'object-shorthand': 'warn',
    'class-methods-use-this': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  }
};