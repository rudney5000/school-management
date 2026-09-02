module.exports = {
  extends: ['../.eslintrc.base.cjs', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2022: true },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': ['error', { forbid: ['>', '"', '}'] }],
  },
};
