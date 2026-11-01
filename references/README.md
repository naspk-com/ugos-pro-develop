# 绿联云 (UGREEN NAS / UGOS Pro / HomeAgent) 开发者参考文档

来源: https://developer.ugnas.com/
抓取日期: 2026-11-01

## 文档结构（对应官方站点最新目录）

```
references/
├── flow.md                                  # 应用上架流程（顶层）
├── quick-start/                             # 快速开始
│   ├── prepare.md                           # 开发准备
│   ├── develop.md                           # 原生应用
│   ├── develop-docker-app.md                # Docker 应用
│   ├── testing.md                           # 测试应用
│   ├── publish.md                           # 发布应用
│   └── my-apps.md                           # 我的应用（示例项目）
├── application/                             # 应用架构
│   ├── product-series.md                    # 产品线与机型支持
│   ├── install-directory.md                 # 安装目录
│   ├── runtime-environment.md               # 运行环境
│   ├── app-port.md                          # 应用端口
│   ├── start-stop.md                        # 应用启停
│   ├── app-config.md                        # 应用配置
│   └── open-type.md                         # 打开方式
├── system-capabilities/                     # 系统能力
│   └── login-auth.md                        # 登录认证
├── tools/                                   # 开发工具
│   ├── ugcli.md                             # ugcli
│   └── project-yaml.md                      # project.yaml
├── frontend/                                # 前端开发
│   ├── ugos-core/                           # UGOS Core SDK
│   │   ├── install.md                       # 初始化/安装
│   │   ├── cloudWindow.md                   # 窗口管理
│   │   ├── windowConfig.md                  # 窗口配置
│   │   ├── mediaCenter.md                   # 媒体管理
│   │   └── keyboardControl.md               # 快捷键
│   ├── ugos-builder/                        # 构建工具
│   │   ├── index.md                         # @ugreen-nas/builder-open
│   │   └── buildConfig.md                   # 打包配置 API
│   ├── capacity/                            # 桌面开放能力
│   │   └── capacity.md                      # 能力调用说明
│   └── demo/                                # 示例项目
│       ├── vue.md                           # Vue 示例
│       └── react.md                         # React 示例
└── review/                                  # 管理规则
    └── developer-identity/
        └── authentication-disclosure.md     # 开发者身份审核与管理
```

## 文件索引

| 文件 | 内容 | 官方 URL |
|------|------|----------|
| flow.md | 应用上架流程 | /doc/flow.html |
| quick-start/prepare.md | 开发准备 | /doc/backend/quick-start/prepare.html |
| quick-start/develop.md | 原生应用 | /doc/backend/quick-start/develop.html |
| quick-start/develop-docker-app.md | Docker 应用 | /doc/backend/quick-start/develop-docker-app.html |
| quick-start/testing.md | 测试应用 | /doc/backend/quick-start/testing.html |
| quick-start/publish.md | 发布应用 | /doc/backend/quick-start/publish.html |
| quick-start/my-apps.md | 我的应用 | /doc/backend/quick-start/my-apps.html |
| application/product-series.md | 产品线与机型支持 | /doc/backend/application/product-series.html |
| application/install-directory.md | 安装目录 | /doc/backend/application/install-directory.html |
| application/runtime-environment.md | 运行环境 | /doc/backend/application/runtime-environment.html |
| application/app-port.md | 应用端口 | /doc/backend/application/app-port.html |
| application/start-stop.md | 应用启停 | /doc/backend/application/start-stop.html |
| application/app-config.md | 应用配置 | /doc/backend/application/app-config.html |
| application/open-type.md | 打开方式 | /doc/backend/application/open-type.html |
| system-capabilities/login-auth.md | 登录认证 | /doc/backend/system-capabilities/login-auth.html |
| tools/ugcli.md | ugcli | /doc/tools/ugcli.html |
| tools/project-yaml.md | project.yaml | /doc/tools/project-yaml.html |
| frontend/ugos-core/install.md | UGOS Core 初始化 | /doc/frontend/ugos-core/install.html |
| frontend/ugos-core/cloudWindow.md | 窗口管理 | /doc/frontend/ugos-core/cloudWindow.html |
| frontend/ugos-core/windowConfig.md | 窗口配置 | /doc/frontend/ugos-core/windowConfig.html |
| frontend/ugos-core/mediaCenter.md | 媒体管理 | /doc/frontend/ugos-core/mediaCenter.html |
| frontend/ugos-core/keyboardControl.md | 快捷键 | /doc/frontend/ugos-core/keyboardControl.html |
| frontend/ugos-builder/index.md | builder-open | /doc/frontend/ugos-builder/index.html |
| frontend/ugos-builder/buildConfig.md | 打包配置 API | /doc/frontend/ugos-builder/buildConfig.html |
| frontend/capacity/capacity.md | 桌面开放能力 | /doc/frontend/capacity/capacity.html |
| frontend/demo/vue.md | Vue 示例 | /doc/frontend/demo/vue.html |
| frontend/demo/react.md | React 示例 | /doc/frontend/demo/react.html |
| review/developer-identity/authentication-disclosure.md | 开发者身份审核 | /doc/review/developer-identity/authentication-disclosure.html |
