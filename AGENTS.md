## 代码风格

- 优先使用 Nuxt UI 提供的组件，而不是原生 HTML 元素。
- 优先使用 Nuxt UI 组件的 props（如 `variant`）来控制样式，而不是直接使用 Tailwind CSS 类。
- 优先使用 Nuxt UI 提供的语义化颜色来统一深浅色主题（如 `text-toned` `text-primary` `bg-muted` `bg-accented`），避免为深浅色主题分别单独定义颜色。但是，如果确实需要固定的颜色，或者 Nuxt UI 提供的语义化颜色不满足需求，可以使用 Tailwind 的颜色类，也可以写自定义的颜色。
- 优先使用 Lucide 图标（如 `i-lucide-*`）。
- 如果遇到 eslint 的 `vue/attributes-order` 规则报错，运行 `pnpm lint:fix` 即可自动修复。

## 类型注解

遵循 `frontend-function-definition` 技能的要求。

定义 `ref` 或者 `computed` 等响应式变量时，总是使用泛型添加类型注解，例如：

- `const count = ref<number>(0);`
- `const doubleCount = computed<number>(() => count.value * 2);`
