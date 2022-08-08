const path = require('path');
module.exports = {
    env: {
        browser: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: path.resolve(__dirname, './tsconfig.base.json'),
        tsconfigRootDir: __dirname
    },
    rules: {
        '@typescript-eslint/consistent-type-imports': [
            'error',
            { prefer: 'type-imports' }
        ],
        '@typescript-eslint/consistent-type-exports': [
            'error',
            { fixMixedExportsWithInlineTypeSpecifier: true }
        ]
    }
};
