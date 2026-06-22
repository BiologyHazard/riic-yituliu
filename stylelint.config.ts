import type { Config } from 'stylelint';

export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss',
    'stylelint-config-html',
    'stylelint-config-recess-order',
  ],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', 'src/assets/fonts/**/*.css'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  rules: {
    'custom-property-empty-line-before': null,
    'color-hex-length': 'long',
    'font-family-name-quotes': 'always-unless-keyword',
    'scss/at-rule-no-unknown': null,
    'scss/double-slash-comment-empty-line-before': null,
  },
} satisfies Config;
