import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import svelteConfig from './svelte.config.js'

export default tseslint.config(
  { ignores: ['build/**', '.svelte-kit/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Svelte 组件里的 <script lang="ts"> 和 .svelte.ts 模块都要交给 TS 解析器。
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, svelteConfig },
    },
    rules: {
      // 路由是写死的字面量路径，没有配置 paths.base，不需要 resolve()。
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
)
