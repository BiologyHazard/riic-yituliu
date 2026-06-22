# riic-yituliu

明日方舟基建一图流排班表 — 基于 Vue 3 + Vite + TypeScript + Nuxt UI 的前端项目。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Nuxt UI 4 + Tailwind CSS 4
- **路由**: Vue Router 4
- **工具库**: VueUse, TanStack Vue Virtual
- **代码规范**: ESLint + Prettier + Stylelint

## 项目结构

```
src/
├── assets/       # 样式、字体、图片、JSON 等静态资源
├── components/   # 通用 Vue 组件
├── composables/  # 组合式逻辑
├── router/       # 路由配置
├── types/        # TypeScript 类型定义
├── utils/        # 纯工具函数
└── views/        # 路由页面
```

## 环境要求

- Node.js ^20.19.0 或 >=22.12.0

## 项目设置

```sh
npm install
```

## 可用脚本

### 开发服务器

```sh
npm run dev        # 启动本地开发服务器（热重载）
```

### 构建

```sh
npm run build-only  # 仅执行 Vite 生产构建（不含字体处理）
npm run build       # 完整构建：下载字体 → 拆分字体 → Vite 构建
npm run preview     # 预览生产构建产物
```

### 类型检查

```sh
npm run type-check
```

### 代码规范检查

```sh
npm run lint              # ESLint + Stylelint 并行检查
npm run lint:eslint       # 仅 ESLint 检查
npm run lint:stylelint    # 仅 Stylelint 检查
npm run lint:fix          # 自动修复可修复的 ESLint 和 Stylelint 问题
```

### 格式化

```sh
npm run format         # 使用 Prettier 格式化代码
npm run format:check   # 检查代码格式（不修改文件）
```

### 字体处理

```sh
npm run download-fonts  # 下载项目依赖字体（HarmonyOS Sans SC, Alibaba PuHuiTi 3.0, JetBrains Mono, Outfit）
npm run split-fonts     # 拆分字体文件以优化加载
```

## IDE 推荐

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（禁用 Vetur）
- 浏览器推荐安装 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
