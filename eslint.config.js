const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig([
  // 全局语言选项
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        browser: true,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },
  // React 配置
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: {
      react: require('eslint-plugin-react'),
    },
    rules: {
      'react/jsx-uses-react': 'error',
    },
  },
  // Handlebars 配置
  {
    files: ['**/*.hbs'],
    plugins: {
      hbs: require('eslint-plugin-hbs'),
    },
    rules: {
      // 这里可以添加 Handlebars 的规则
      'hbs/check-handlebars-syntax': 'warn',
    },
  },
]);