# @ugreen-nas/builder-open API

> 来源: https://developer.ugnas.com/doc/frontend/ugos-builder/buildConfig.html

本文档描述 `@ugreen-nas/builder-open` 在 Vite 下的公开 API、参数、类型与用法。

## 导入方式

```typescript
import { UgosViteBuilder } from '@ugreen-nas/builder-open';
import type { BuildConfig } from '@ugreen-nas/builder-open';

// 可选：与子路径导入等价
import { UgosViteBuilder } from '@ugreen-nas/builder-open/vite';
```

## API 一览

| 符号 | 类别 | 说明 |
|------|------|------|
| `UgosViteBuilder` | class | 面向 Vite 的构建器 |
| `BuildConfig` | type | 构建配置（由 `@ugreen-nas/builder-core` 提供类型） |
| `pluginEntry` | 实例方法 | 返回 Vite 插件数组 |

## UgosViteBuilder

### 构造函数

```typescript
constructor(config: BuildConfig);
```

参数 `config` 为构建与产物元信息配置。在 `defineConfig` 的 `plugins` 中展开 `pluginEntry()` 的返回值。

## pluginEntry(options?)

```typescript
pluginEntry(options?: IPluginEntry): never[];
```

类型声明为 `never[]`，实际返回值为 `import('vite').Plugin[]`。在 Vite 中使用展开：

```typescript
plugins: [...builder.pluginEntry()],
```

### IPluginEntry

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|:--:|--------|------|
| `mode` | string | 否 | `''` | 传 `'analyze'` 时进入包体分析模式 |
| `removeConsoleExternal` | string[] | 否 | `[]` | 移除 `console` 时额外排除的资源路径 |

## BuildConfig

### 字段表

| 字段 | 类型 | 必填 | 默认 / 说明 |
|------|------|:--:|-------------|
| `windowConfig` | unknown | 强烈建议 | 窗口与桌面壳层使用的配置；缺失时校验会报错 |
| `getIgnoreFolder` | `(config: unknown, isElectron: boolean) => unknown` | 是 | 返回忽略规则列表；常与默认 `['**/node_modules/**']` 合并 |
| `langPath` | string | 否 | 默认 `'src/language'` |

## 最小可运行示例

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { UgosViteBuilder } from '@ugreen-nas/builder-open';
import path from 'node:path';

const builder = new UgosViteBuilder({
  windowConfig: { width: 1200, height: 800 },
  getIgnoreFolder: (patterns: unknown) => patterns,
});

export default defineConfig({
  plugins: [react(), ...builder.pluginEntry()],
});
```
