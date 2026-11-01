# 我的应用

> 来源: https://developer.ugnas.com/doc/backend/quick-start/my-apps.html

「我的应用」文档模块提供 UGOS Pro 应用开发的示例项目下载。示例涵盖前后端典型场景，样式与交互保持一致，便于对照文档快速上手。

## 前端示例

以下示例基于 `@ugreen-nas/builder-open` 构建，演示 UGOS Pro 桌面应用的前端接入方式。

| 框架 | 技术栈 | 说明 | 下载 |
|------|--------|------|------|
| Vue | Vite 8 + Vue 3 + TypeScript | 应用能力、窗口管理、应用授权、项目基础信息等页面示例 | [下载 Vue 示例源码](https://developer.ugnas.com/demo/vue-demo.zip) |
| React | Vite + React + TypeScript | 与 Vue 示例功能对齐，页面结构与交互保持一致 | [下载 React 示例源码](https://developer.ugnas.com/demo/react-demo.zip) |

详细说明请参考：

- [Vue 示例](../frontend/demo/vue.md)
- [React 示例](../frontend/demo/react.md)

### 快速开始

```bash
# 以 Vue 示例为例（解压后进入 vue/ 目录）
unzip vue-demo.zip && cd vue
pnpm install
pnpm dev
```

React 示例同理：`unzip react-demo.zip && cd react`

## 后端示例

后端示例项目暂未提供独立下载包。可参考以下文档从零搭建：

- [开发原生应用](develop.md)：使用 Go 开发 HTTP 后端服务，配合 `ugcli` 打包
- [开发 Docker 应用](develop-docker-app.md)：基于 Docker 镜像的应用开发流程

也可通过 `ugcli create` 快速生成项目骨架：

```bash
ugcli create my-app
```

## 使用建议

- 建议先下载前端示例，了解 `@ugreen-nas/core` 能力调用与窗口管理；再参考后端文档完成后端服务开发。
- 示例项目中的 `project.yaml` 配置说明见 [project.yaml 配置说明](../tools/project-yaml.md)。
- 本地打包与测试请参考 [ugcli 使用指南](../tools/ugcli.md)。
