# React Example for Builder-Open

> 来源: https://developer.ugnas.com/doc/frontend/demo/react.html

本示例展示如何在 **Vite 8 + React + TypeScript** 项目中接入 `@ugreen-nas/builder-open`，并通过路由组织一个可扩展的 UGOS Pro 主应用演示界面。

## 技术栈

| 类别 | 说明 |
|------|------|
| 运行时 | React 19、TypeScript |
| 构建 | Vite 8、`@vitejs/plugin-react` |
| 构建器 | `@ugreen-nas/builder-open`（UGOS Vite 构建插件） |
| 测试/类型 | Vitest、`tsc`（`tsc -b` 参与 build） |
| 路由 | `react-router-dom` |
| 包管理 | 以 pnpm 为例（亦可用 npm、yarn） |

## 目录结构

```
./
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── public/
├── src/
│   ├── main.tsx
│   ├── router.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── assets/
│   ├── pages/
│   │   ├── CapacityPage.tsx
│   │   ├── WindowManagementPage.tsx
│   │   ├── ApplicationAuthorizationPage.tsx
│   │   └── ProjectBasicInfoPage.tsx
│   ├── hooks/
│   │   └── useApplicationAuthorizationInfo.ts
│   └── builder-open.integration.test.ts
└── README.md
```

## 页面与路由

左侧侧边栏菜单顺序：1. 应用能力 2. 应用窗口管理 3. 应用授权 4. 项目基础信息。根路径 `/` 默认重定向到 `/project-basic-info`。

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 默认入口 | 重定向到 `/project-basic-info` |
| `/capacity` | 应用能力 | 展示 `cloudWindow.useCapacity(...)` 的能力调用示例 |
| `/window-management` | 应用窗口管理 | 展示窗口状态读取与窗口控制示例 |
| `/application-authorization` | 应用授权 | 展示鉴权请求流程与 `/demoapi/v1/info` 返回字段 |
| `/project-basic-info` | 项目基础信息 | 展示 `package.json` 中的基础元数据 |

## 功能说明

### 应用能力

通过 `cloudWindow.useCapacity(...)` 展示以下能力调用：

- `getThirdToken`
- `getComputerName`
- `getDeviceLocation`
- `checkComputerPathExists({ path: '/' })`
- `openAppCenterDetail({ appCenterType: 1 })`

### 应用窗口管理

展示窗口状态，提供窗口操作示例：读取状态、设置为 1024×640、居中、最大化、取消最大化、最小化、恢复、开启/取消置顶。

### 应用授权

通过 `useApplicationAuthorizationInfo` 封装鉴权数据获取逻辑：先调用 `getThirdToken`，若返回 `third_token` 则请求 `/demoapi/v1/info` 时附带 `Ugreen-Ttk` 请求头。

### 项目基础信息

展示 `package.json` 中的包名称、应用 ID、发布名称、作者、项目描述、版本号。

## 快速开始

```bash
pnpm install
pnpm dev
```

## 构建与校验

```bash
pnpm run typecheck
pnpm run test:run
pnpm run build
```

## 示例源码下载

[下载 React 示例源码](https://developer.ugnas.com/demo/react-demo.zip)
