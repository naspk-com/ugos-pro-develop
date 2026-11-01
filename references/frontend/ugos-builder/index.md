# @ugreen-nas/builder-open

> 来源: https://developer.ugnas.com/doc/frontend/ugos-builder/index.html
> UGOS Pro 构建工具 - 简单易用的 Vite 打包插件

## 特性

- 基于 Vite - 快速开发和构建体验
- 多页应用支持 - MPA 开箱即用
- TypeScript - 完整类型支持
- 扩展钩子 - 灵活的生命周期钩子系统
- 开箱即用 - 零配置快速开始

## 环境要求

- **Vite**：`^6.0.0 || ^7.0.0 || ^8.0.0`（与 `@ugreen-nas/builder-core` 一致）
- 若使用 Vite 8 脚手架，可参考本仓库 `examples/vue`、`examples/react`

## 安装

```bash
npm install @ugreen-nas/builder-open vite
# 或
pnpm add @ugreen-nas/builder-open vite
yarn add @ugreen-nas/builder-open vite
```

## 快速开始

在项目根目录创建 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import { UgosViteBuilder } from '@ugreen-nas/builder-open';

const builder = new UgosViteBuilder({
  windowConfig: {
    width: 1200,
    height: 800,
  },
  getIgnoreFolder: (c: unknown) => c,
});

export default defineConfig({
  plugins: [builder.pluginEntry()],
});
```

## 配置选项

### BuildConfig

```typescript
interface BuildConfig {
  // 窗口配置
  windowConfig?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
  };
  // 构建选项
  buildOptions?: {
    minify?: boolean;
    sourcemap?: boolean;
    outDir?: string;
  };
}
```

## 项目结构示例

```
my-ugos-app/
├── src/
│   ├── main/
│   │   └── index.html          # 主应用入口
├── vite.config.ts
└── package.json
```

## 构建输出

构建后会生成：

```
dist/
├── index.html              # 主应用
├── assets/                 # 静态资源
└── version.json           # 版本信息
```
