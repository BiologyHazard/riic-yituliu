import eslintPluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import ts from 'typescript-eslint';

export default ts.config(
  ...ts.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'vue/attributes-order': [
        'warn',
        {
          alphabetical: true,
          sortLineLength: false,
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier,
);
