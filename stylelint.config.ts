import type { Config } from 'stylelint';

export default {
  extends: ['stylelint-config-standard', 'stylelint-config-html', 'stylelint-config-recess-order'],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', 'src/assets/fonts/**/*.css'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
  rules: {
    'at-rule-no-unknown': null,
    'color-hex-length': 'long',
    'comment-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'font-family-name-quotes': 'always-unless-keyword',
    'import-notation': 'string',
  },
} satisfies Config;
