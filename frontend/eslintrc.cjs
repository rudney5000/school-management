module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    settings: {
        react: { version: 'detect' },
    },
    env: {
        browser: true,
        es2022: true,
    },
    rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
    },
    ignorePatterns: ['dist', 'node_modules'],
};