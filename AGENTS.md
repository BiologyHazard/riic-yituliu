# AGENTS.md

## 项目概览

- 这是一个基于 Vue 3 + Vite + TypeScript 的前端项目，包含基建排班、素材信息、Monster Siren 等页面。
- 主要源码位于 `src/`，静态资源位于 `public/`，服务端代理函数位于 `functions/`。

## 常用命令

- `npm run dev`：启动本地开发服务器。
- `npm run build-only`：仅执行 Vite 生产构建（不包含字体处理）。
- `npm run build`：完整生产构建（下载字体 → 拆分字体 → Vite 构建）。
- `npm run preview`：预览生产构建产物。
- `npm run type-check`：运行 TypeScript / Vue 类型检查。
- `npm run lint`：执行 ESLint + Stylelint 检查。
- `npm run lint:eslint`：仅执行 ESLint 检查。
- `npm run lint:stylelint`：仅执行 Stylelint 检查。
- `npm run lint:fix`：自动修复 ESLint 和 Stylelint 可修复的问题。
- `npm run format`：使用 Prettier 格式化代码。
- `npm run format:check`：检查代码格式（不修改文件）。
- `npm run download-fonts`：下载项目依赖字体。
- `npm run split-fonts`：拆分字体文件。

## 验证建议

- 改动完成后建议运行 `npm run type-check` 以及 `npm run lint:fix`。
- 如果改动影响构建链路或资源加载，再补充 `npm run build`，一般改动则无需运行。

## 目录提示

- `src/components/`：通用组件。
- `src/views/`：路由页面。
- `src/composables/`：组合式逻辑。
- `src/utils/`：纯工具函数。
- `src/assets/`：样式、字体声明、图片和文本资源。

## 数据源架构

### 文件位置

所有数据源相关的配置、状态、URL 构建逻辑集中在 `src/utils/dataSources.ts`。

### 设计模式：策略模式

不同图片源（Torappu、yuanyan3060、Skland）的 URL 路径结构截然不同，简单的 `baseUrl` 拼接无法覆盖。因此每个源定义自带 `getUrl()` 函数，封装自身的 URL 构建策略：

```typescript
export interface AvatarSource {
  label: string;
  id: string;
  isGithub: boolean;
  getUrl: (charId: string, eliteLevel: number) => string; // 策略函数
}
```

- `getUrl` 的签名只暴露调用方真正关心的参数（如 `charId` + `eliteLevel`），内部自行查表获取 `skinId`、`iconId` 等中间数据
- 新增源只需在对应数组中添加一条带 `getUrl` 的记录，无需修改任何其他文件

### URL 构建链

```
组件调用 getAvatarUrl(charId, eliteLevel)
  → currentAvatarSource.value.getUrl(charId, eliteLevel)   // 源策略函数
  → 若 isGithub → 追加 currentMirror.value.prefix
  → 返回最终 URL
```

镜像逻辑集中在 `getAvatarUrl`/`getItemIconUrl`/`getBaseSkillIconUrl` 三个函数中，不在各源的 `getUrl` 中重复。

### 全局状态管理

用户选择的数据源 ID 通过 `useLocalStorage` 持久化。由于是全局单例状态（用户设置），使用模块级 `ref`/`computed` 导出，而非包装为 `useXxx()` 组合式函数。

### 注意事项

- 不要为 URL 构建函数添加无意义的包装层——如果函数只是 `return anotherFunction(args)`，直接使用后者
- 当文件的实际内容与文件名/目录语义不符时，应调整位置（如 `composables/useDataSource.ts` 不含组合式函数、`config/dataSources.ts` 含逻辑，于是合并为 `utils/dataSources.ts`）

## 代码风格

### 组件优先级

优先使用 Nuxt UI 提供的组件（如 `UButton`, `UInput`, `UInputNumber`, `UBadge`, `UFileUpload` 等），而不是原生 HTML 元素。

### 图标优先级

优先使用 Lucide 图标（如 `i-lucide-*`）。

### 样式优先级

优先使用 Nuxt UI 组件的 props（如 `variant`）来控制样式，而不是直接使用 Tailwind CSS 类。

### Vue 模板属性顺序

在 Vue 模板中，按照 linter 的要求（`vue/attributes-order`）来排序属性，例如将 `class` 放在 `label` 之前。

### 颜色类优先级

尽量避免使用 Tailwind 颜色表中的颜色类（如 `text-gray-800 dark:text-gray-200` `bg-slate-100 dark:bg-slate-800`），而是优先使用 Nuxt UI 提供的语义化颜色（如 `text-toned` `text-primary` `bg-muted` `bg-accented`）。

优先使用 Nuxt UI 提供的语义化颜色来统一深浅色主题（如 `text-toned` `text-primary` `bg-muted` `bg-accented`），而避免为深浅色主题分别写不同的颜色类（如 `text-gray-800 dark:text-gray-200`）。

但是，如果确实需要固定的颜色，或者 Nuxt UI 提供的语义化颜色不满足需求，可以使用 Tailwind 的颜色类，也可以写自定义的颜色。

### 语义化 CSS 属性优先级

优先使用基于语义方向的 css 属性（如 `margin-inline`, `margin-block`）而不是基于物理方向的属性（如 `margin-left`, `margin-top`）。在使用 Tailwind CSS 时，优先使用基于语义方向的工具类（如 `ms-2`, `mbs-2`）而不是基于物理方向的工具类（如 `ml-4`, `mt-2`）。

#### 场景 1：首选 【语义属性】margin/padding-inline/block（适应性布局）

在以下场景中，优先使用基于语义方向的属性：

- 文本流、常规文档流布局
- 需要支持多语言（LTR中文/英文 ↔ RTL阿拉伯语/希伯来语）
- 组件内边距、外边距跟随阅读方向
- 通用UI组件、自适应布局

**使用属性**：
`margin-block-start` / `margin-block-end` / `margin-inline-start` / `margin-inline-end` / `margin-block` / `margin-inline`
`padding-inline` / `padding-block` / `padding-block-start` / `padding-block-end` / `padding-inline-start` / `padding-inline-end`
`inset-block` / `inset-inline` / `inset-block-start` / `inset-block-end` / `inset-inline-start` / `inset-inline-end`
Tailwind：
`ms-*` / `me-*` / `mbs-*` / `mbe-*` / `mx-*` / `my-*`
`ps-*` / `pe-*` / `pbs-*` / `pbe-*` / `px-*` / `py-*`
`inset-s-*` / `inset-e-*` / `inset-bs-*` / `inset-be-*` / `inset-x-*` / `inset-y-*`

#### 场景 2：首选 【物理属性】left/right/top/bottom（固定视觉场景）

在以下场景中，优先使用基于物理方向的属性：

- 绝对定位/固定定位的视觉固定位置
- 明确要求「靠左/靠右/顶部固定」的视觉效果
- 不需要适配RTL语言的固定界面
- 像素级视觉定位

**使用属性**：
`margin-left` / `margin-right` / `margin-top` / `margin-bottom`
`padding-left` / `padding-right` / `padding-top` / `padding-bottom`
`top` / `left` / `right` / `bottom`
Tailwind：
`ml-*` / `mr-*` / `mt-*` / `mb-*`
`pl-*` / `pr-*` / `pt-*` / `pb-*`
`top-*` / `left-*` / `right-*` / `bottom-*`

### 函数定义风格

优先使用 function 关键字来定义有名字的函数，而不是使用箭头函数赋值。

正确示例：

- `function myFunction() { ... }` （对于有名字的函数，使用 function 关键字）
- `const x = computed(() => { ... });`（对于匿名函数或回调函数，使用箭头函数）

错误示例：

- `const myFunction = () => { ... };`（不要使用箭头函数赋值来定义有名字的函数）
- `const myFunction = function () { ... };`（虽然这是合法的，但不推荐使用 function 表达式来定义有名字的函数）
- `const x = computed(function () { ... });`（对于匿名函数或回调函数，使用箭头函数）

### 类型注解

总是为具名函数参数和返回值添加类型注解，但返回 `void` 的函数不写返回类型。

箭头函数不写类型注解。

定义 `ref` 或者 `computed` 等响应式变量时，总是添加类型注解，例如：

- `const count = ref<number>(0);`
- `const doubleCount = computed<number>(() => count.value * 2);`
