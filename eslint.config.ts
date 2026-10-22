import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import ts from 'typescript-eslint';

export default ts.config(
  ...ts.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
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
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/assets/css/main.css',
        attributes: [...getDefaultAttributes(), ['^v-bind:ui$', [{ match: 'objectValues' }]]],
      },
    },
  },
  eslintConfigPrettier,
);
