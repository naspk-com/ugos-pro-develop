# AGENTS.md — ugnas-reader

> 给 AI 编码代理和新加入的工程师看的工作简报。这份文档把绿联云（UGOS Pro）开发者平台的关键信息浓缩成"动手做事时需要知道的"清单，不复述全部官方文档。原文请见 https://developer.ugnas.com/doc/

---

## 1. 产品上下文

**ugnas-reader** 是面向绿联云（UGOS Pro）NAS 设备的阅读器应用，目标是让用户把电子书 / 文档放在 NAS 上，通过 UGOS 桌面或浏览器进行集中阅读、管理与多端同步。

产品形态决定了以下技术选择倾向（不是硬性约束）：

- **前端**：在 UGOS 桌面以"独立窗口"打开（`open_type: inner`），便于复用系统登录态、JSSDK、桌面窗口能力。
- **后端**：需要扫描用户授权目录、解析常见格式（EPUB / PDF / MOBI / TXT / CBZ）、保存阅读进度与书签 → 倾向原生后端（Go），不走 Docker（避免 Docker 套件依赖）。
- **文件访问**：必须开启 `allow_add_access_path: true`，让用户授权"书库目录"。
- **认证**：直接使用系统登录态（透传 `Ugreen-Ttk` + 网关注入 `Ugreen-User-*` 请求头），不自建账号系统。

> 这些是初始默认选择，落地前应在 issue / PR 中显式讨论与确认。

---

## 2. 平台基本面（一定要先记住）

| 项 | 值 |
|---|---|
| 基础系统 | UGOS Pro（基于 Linux 内核的定制系统） |
| 最低系统版本 | 1.13.0.0000 |
| 支持的 CPU 架构 | `amd64`、`arm64`（两套二进制） |
| 推荐开发环境 | Debian 12（用于编译后端） |
| 应用包格式 | `.upk`（由 `ugcli pack` 产出） |
| 安装入口 | NAS 应用中心 → 手动安装 upk |
| 调试授权 | 需 `ugdev.sig` 文件放到 admin 用户的个人文件夹 |
| 后端可用语言 | C / C++ / Go 等编译型语言（产物必须是 Linux 可执行文件） |
| 前端 | 任意 web 框架；构建产物（html/js/css）放入 `www/` |
| 应用形态 | **原生应用** 或 **Docker 应用** 二选一 |

---

## 3. 工具链

### 3.1 ugcli（必装）

绿联官方命令行工具，负责"创建项目 / 改配置 / 校验 / 打包"。

下载（v1.1.0.12，多平台预编译二进制）：

- Linux x86_64: https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.12-linux-amd64
- Windows x86_64: https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.12-windows-amd64.exe
- macOS x86_64: https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.12-darwin-amd64

常用子命令：

```shell
ugcli create <app_id>           # 交互式创建项目骨架
ugcli config list               # 查看当前配置
ugcli config edit               # 交互式改配置
ugcli config edit i18n          # 改 / 新增多语言展示信息
ugcli check                     # 校验 project.yaml 与 rootfs 结构
ugcli pack --arch all --build 1 # 打包（两架构都打）
ugcli pack --arch arm64 -b 2    # 只打 arm64
```

打包产物：`build_dir/pkgs/upk/{arch}_{appid}_{version}.{build}.upk`

### 3.2 @ugreen-nas/core（前端 SDK，inner 模式才有用）

```bash
pnpm add @ugreen-nas/core
```

初始化（必须）：

```ts
import UGOSCore from '@ugreen-nas/core';
UGOSCore.init();
```

主要按需模块：
- `@ugreen-nas/core/cloudWindow` — 桌面窗口管理、能力调用入口（`cloudWindow.useCapacity(name, params)`）
- `keyboardControl` — 快捷键
- 详见 `.docs-md/frontend__ugos-core__*.md`

### 3.3 @ugreen-nas/builder-open（Vite 插件，可选）

为 Vite 项目提供 UGOS 主应用窗口元信息 / 多页 / 构建集成。

```bash
pnpm add -D @ugreen-nas/builder-open vite
```

最小 `vite.config.ts`：

```ts
import { defineConfig } from 'vite';
import { UgosViteBuilder } from '@ugreen-nas/builder-open';

const builder = new UgosViteBuilder({
  windowConfig: { width: 1200, height: 800 },
  getIgnoreFolder: (patterns: unknown) => patterns,
});

export default defineConfig({
  plugins: [...builder.pluginEntry()],
});
```

Vite 版本要求：`^6 || ^7 || ^8`。React/Vue 示例分别在 `.docs-md/frontend__demo__react.md` 与 `frontend__demo__vue.md`。

---

## 4. 项目目录结构

`ugcli create` 出来的原生应用骨架：

```text
com.<vendor>.ugnas-reader/
├── project.yaml              # 应用配置（核心，详见 §5）
├── rootfs_amd64/             # amd64 专属
│   └── bin/                  #   后端可执行文件（必须）
├── rootfs_arm64/             # arm64 专属
│   └── bin/                  #   后端可执行文件（必须）
└── rootfs_common/            # 两架构共用
    ├── icon.png              #   256×256，<100KB，圆角模板，浅色背景
    └── www/                  #   前端构建产物（index.html、css/、js/、assets/）
```

> 同名文件以 `rootfs_<arch>` 为准。前端文件统一放 `rootfs_common/www`。

Docker 应用骨架（如果未来某些子能力需要 Docker）：

```text
rootfs_common/
├── icon.png
└── docker-compose.yaml       # 唯一允许的两个文件
rootfs_<arch>/
└── images/<image>.tar        # 每个 image 必须有且只有一个 tag、不能用 latest
```

安装到 NAS 后实际路径（注意软链）：

```text
/var/packages/<app_id>/ -> /volume{n}/@appstore/<app_id>
  ├── bin/
  ├── data    -> /volume{n}/@appdata/<app_id>     # 读写
  ├── log     -> /volume{n}/@applog/<app_id>      # 读写（应用日志收集目标）
  ├── cache   -> /volume{n}/@appcache/<app_id>    # 读写
  ├── shared/                                     # 用户授权目录的软链集合
  ├── icon.png
  └── www/
```

应用自身工作目录 = `data`（由系统设置 cwd）。

---

## 5. project.yaml — 配置参考

完整字段参考 `.docs-md/tools__project-yaml.md`。对 ugnas-reader 来说，关键字段是这套：

```yaml
spec_version: "2.1"
app_id: com.<vendor>.ugnas-reader     # 上架后不可改；只能小写字母 / 数字 / 点，必须字母开头
version: 0.1.0                        # x.y.z；打包时再 --build N 拼出最终 0.1.0.N
support_arch:
  - amd64
  - arm64
supports:                             # 不写则默认 [app, pc]
  - app
  - pc
start_cmd: bin/ugnas_reader --port=21010
port: 21010                           # 系统会在启动前检查端口未占用，启动后探活
proxy_path: api                       # /api/* 由网关代理转发到后端，并注入用户头
open_type: inner                      # inner 才能用 JSSDK 与系统登录态
tag_types:
  - media                             # 阅读器归类
depend_fw_version: 1.13.0.0000
support_migration: true               # 允许迁移到其他存储空间
allow_add_access_path: true           # ← Reader 必开；用户可授权书库目录
permissions:
  - NETWORK.ACCESS_INTERNET           # 联网（封面/元信息/同步）；按需
  # - SYSTEM.EXEC_SYSTEM_COMMAND      # 不需要就不要加，受限越多越安全
parameters:
  - key: LIBRARY_PATH
    type: path
    multi: true
    required: false
    changeable: true
    i18n:
      en-US: { name: "Library Folders", description: "Folders to scan for books" }
      zh-CN: { name: "书库目录",          description: "用于扫描的电子书目录（可多个）" }
i18n:
  en-US:
    name: "UGREEN NAS Reader"
    description: "Read EPUB / PDF / MOBI from your UGREEN NAS"
    author: "<author>"
    official: "https://example.com"
    help: "https://example.com/help"
    publisher: "<publisher>"
    publisher_link: "https://example.com"
  zh-CN:
    name: "绿联云阅读器"
    description: "在 UGOS Pro 上集中管理与阅读 EPUB / PDF / MOBI"
    author: "<作者>"
    official: "https://example.com"
    help: "https://example.com/help"
    publisher: "<发布者>"
    publisher_link: "https://example.com"
```

### 5.1 权限清单（目前 UGOS Pro 仅这两个声明权限）

| 权限 | 含义 |
|---|---|
| `SYSTEM.EXEC_SYSTEM_COMMAND` | 可执行 `/usr/bin` `/usr/sbin` 内置命令 |
| `NETWORK.ACCESS_INTERNET` | 可建立到外网的连接 |

> 默认环境 **没有** 联网与系统命令访问；用到才声明，能不要就不要。

### 5.2 parameters 类型

`string` / `number` / `path` / `password`，支持 `multi`、`required`、`changeable`、`max_length` / `min_length` / `verify_regexp`。

### 5.3 支持的语言

`en-US`、`zh-CN`、`de-DE`、`ja-JP`、`fr-FR`、`nl-NL`、`pt-PT`、`es-ES`、`it-IT`、`ko-KR`、`zh-TW`

---

## 6. 运行环境（沙箱）

> 后端必须假设自己在一个被严重限制的进程里。

### 6.1 运行用户

应用安装时系统自动建一个**专属非 root 用户**，全部进程以此用户身份运行。

### 6.2 注入的环境变量

| 变量 | 含义 |
|---|---|
| `UGAPP_INSTALL_DIR` | 应用安装目录 |
| `UGAPP_DATA_DIR`    | 数据目录（cwd） |
| `UGAPP_CACHE_DIR`   | 缓存目录 |
| `UGAPP_LOG_DIR`     | 日志目录 |
| `UGAPP_SHARED_DIR`  | 用户授权可访问目录的软链集合 |

`parameters` 里声明的 `key` 也会作为环境变量注入（区分大小写）。

> 别用 `UGAPP_` 前缀给自己的 `parameters.key`。

### 6.3 可访问的文件系统

只读：`/lib`、`/sys`、`/dev`
读写：`/var/packages/<appid>/data`、`/log`、`/cache`、`/shared`（已授权）
其他用户/共享目录默认**不可访问**，必须 `allow_add_access_path: true` + 用户在设置页授权。

### 6.4 进程生命周期

- 启动后系统对 `port` 探活判断"是否启动完成"。
- 停止时先发 `SIGTERM`，**10 秒内**必须退出，否则发 `SIGKILL`。
- 后端要实现优雅停机（保存阅读进度、刷盘、关连接）。

### 6.5 日志

- stdout / stderr 自动重定向到 `<log>/<app_id>.log`
- 应用自己写的日志也放 `log/` 目录（系统诊断时会收集）
- **自己滚日志**（系统不帮你切）
- 调试时直接看 `/var/packages/<app_id>/log/<app_id>.log`

---

## 7. 端口与网关

- 每个 inner 应用，系统会分配一对 http/https 域名 + 一个 UGREENlink 公网域名（自动支持远程访问）。
- 命中 `proxy_path` 前缀（例如 `/api/...`）的请求会被网关代理到 `port`，并在请求头注入用户信息。
- 应用可监听其它端口，但**不会被代理、不能远程访问、不被探活**。
- 推荐 ugnas-reader：`port: 21010`，`proxy_path: api` → 前端访问 `/api/v1/...`。

---

## 8. 登录认证集成（inner 模式专用）

### 8.1 前置条件

- `open_type: inner`
- 配置 `proxy_path`

### 8.2 前端拿 token（用 JSSDK）

```ts
import UGOSCore from '@ugreen-nas/core';
import cloudWindow from '@ugreen-nas/core/cloudWindow';

UGOSCore.init();
const info = await cloudWindow.useCapacity('getThirdToken');
const ugToken = info?.third_token ?? null;

await fetch('/api/v1/info', {
  headers: ugToken ? { 'Ugreen-Ttk': ugToken } : {},
});
```

### 8.3 后端从请求头取用户信息

| Header | 含义 |
|---|---|
| `Ugreen-User-ID`   | 用户 ID |
| `Ugreen-User-Name` | 用户名 |
| `Ugreen-User-Type` | `admin` / `users` |

> 这些头由网关注入，应用只信网关来的请求；本地直连 `port` 时这些头不存在（也别允许直连）。

`getThirdToken` 同时返回用户的 `dateFormat` / `timeFormat` / `temperatureUnit` / `lang`，前端可直接使用。

---

## 9. 桌面开放能力（cloudWindow.useCapacity）

通用调用方式：

```ts
const res = await cloudWindow.useCapacity('<capName>', { /* params */ });
```

ugnas-reader 可能用到的能力（节选，完整见 `.docs-md/frontend__capacity__capacity.md`）：

| 能力 | 用途 |
|---|---|
| `getThirdToken` | 拿登录 token + 用户偏好（日期/时间/温度单位/lang） |
| `openApp` | 跳到其他应用，例如打开文件管理器 `com.ugreen.filemgr` 定位到某书 |
| `openLocalPath` | 在 NAS 文件管理器中展示某个本地路径 |
| `openAppCenterDetail` | 跳应用中心管理/详情 |
| `getDeviceLocation` | 设备所在地区，默认 `'China'` |
| `getComputerName` / `getComputerUserFolder` | 客户端本机信息 |
| `addApiEncryptIgnore` | 把某些接口路径加进加密白名单 |

错误模式：调用不存在的能力会 reject 一个 `"<name> not found"`。务必每次 `try/catch`。

---

## 10. 窗口（cloudWindowConfig 节选）

inner 模式下窗口由 UGOS 桌面壳层管理。默认值参考 `.docs-md/frontend__ugos-core__windowConfig.md`，关键项：

| 字段 | 默认 | 备注 |
|---|---|---|
| `width` / `height` | 800 / 600 | Reader 建议 1200×800 起步 |
| `minWidth` / `minHeight` | 0 | 阅读视图建议 800×560 防止被拉到不可读 |
| `resizable` / `movable` / `maximizable` / `minimizable` | true | 阅读器建议全部保持 true |
| `radius` | 12 | 窗口圆角 |
| `background` | `#fff` | 暗色主题需自定义 |
| `cacheTime` | 0 | 设 > 0 可让关闭后保活，再打开秒回（强制 `hideOnClose: true`） |
| `controlArea` | true | 顶部可拖拽条；设 `false` 必须自己实现拖拽 |

---

## 11. 开发 / 测试 / 发布 流程

### 11.1 本地开发

1. 准备 Debian 12 编译环境（Linux 主机 / WSL / VM 均可），用于交叉编译两套架构二进制。
2. 安装 `ugcli`，验证 `ugcli --version`。
3. `ugcli create com.<vendor>.ugnas-reader`，按提示选 `inner`、`port=21010`、`proxy_path=api`。
4. 后端开发：按 Linux 服务规范监听 `--port`，处理 `SIGTERM` 优雅退出。
5. 前端开发：用 Vite + builder-open，dev 阶段可 mock `useCapacity` 与 `/api/*` 返回。

### 11.2 打包

```shell
# 把后端可执行文件分别拷到 rootfs_amd64/bin 和 rootfs_arm64/bin
# 把前端 dist/* 拷到 rootfs_common/www
ugcli check
ugcli pack --arch all --build 1
```

### 11.3 NAS 上测试（必须）

1. 准备一台 UGOS Pro ≥ 1.13.0.0000 的 NAS。
2. 申请开发者授权（联系绿联官方，提交 NAS 设备的**序列号、MAC 地址、管理员用户名**；通过"控制面板 > 关于本机"查询）。
3. 拿到的授权文件**重命名为 `ugdev.sig`**，上传到 admin 用户的个人文件夹。
4. 应用中心 → 手动安装 → 选 upk → 安装。
5. 安装后日志路径：`/var/packages/<app_id>/log/<app_id>.log`。

### 11.4 上线发布

打通本地测试后，把 upk **通过邮件发给绿联官方审核**（不是 webhook，不是上传站，是邮件 — 按官方"应用上架流程"页面给的联系方式），审核通过后由官方上架到应用中心。

参考：https://developer.ugnas.com/doc/flow.html

### 11.5 开发者身份认证（注册阶段需要）

- 个人开发者（中国大陆）：身份证号 + 手机号
- 个人开发者（境外，含港澳台）：身份证明文件 + 地址证明文件
- 企业开发者（中国大陆）：营业执照 + 统一社会信用代码
- 企业开发者（境外）：注册证书 + 授权代表证件 + 授权证明
- 审核周期：完整提交后 3–7 个工作日（中国大陆节假日顺延）
- 详情：`.docs-md/review__developer-identity__authentication-disclosure.md`

---

## 12. 给 AI 代理的"约束清单" — 写代码前必读

- **架构**：每次出二进制产物，必须分 amd64 + arm64 两份，且交叉编译验证可执行。
- **进程模型**：长驻 HTTP 服务，监听 `--port=<port>`，handle `SIGTERM` 10s 内退。
- **权限**：默认无网、无系统命令、不能访问用户文件 — 任何需要这三类能力的代码，**先在 `project.yaml` 里声明再写**。
- **路径**：写文件**只能**在 `UGAPP_DATA_DIR` / `UGAPP_CACHE_DIR` / `UGAPP_LOG_DIR` 与用户授权目录（`UGAPP_SHARED_DIR`）下；不要硬编码 `/var/packages/...`。
- **认证**：永远不要自建用户系统。所有用户身份信息从 `Ugreen-User-*` 请求头里读；本地未带头的请求按"未登录"处理（建议直接 401）。
- **日志**：写到 `UGAPP_LOG_DIR`；自己做切割与上限。
- **多语言**：所有用户可见文案走 `i18n`，至少 `en-US` + `zh-CN`，根据 `getThirdToken().lang` 切换。
- **多端**：`supports` 至少 `app` + `pc`；前端布局要适配 mobile（NAS 移动端会用同一份 webview）。
- **图标**：256×256 PNG，<100KB，圆角模板（套用 https://developer.ugnas.com/icon_template.zip ），浅色背景配 0.5pt 8% 黑描边。
- **静态资源**：`css/js` 必须做指纹（文件名 hash 或 `?v=...`），UGOS web 服务器会发 `Cache-Control` 头允许缓存。
- **Docker 应用（如未来用）**：禁用 `privileged`、`cap_add`、`host pid/ipc`、`host` 网络；`image` tag 不能 `latest`；compose 变量必须先在 `parameters` 里声明（除 `${TZ}` 这个内置变量）。
- **不要做**：不要在没确认的情况下假设 root 权限、不要 fork 写 `/etc`、不要监听 < 1024 的端口（非 root 用户跑不起来）。

---

## 13. 参考资料

官方文档（VitePress 站，建议有更新时重新抓取 `.docs-raw/`）：

- 流程总览：https://developer.ugnas.com/doc/flow.html
- 开发准备：https://developer.ugnas.com/doc/backend/quick-start/prepare.html
- 原生应用开发：https://developer.ugnas.com/doc/backend/quick-start/develop.html
- Docker 应用开发：https://developer.ugnas.com/doc/backend/quick-start/develop-docker-app.html
- 应用测试：https://developer.ugnas.com/doc/backend/quick-start/testing.html
- 应用发布：https://developer.ugnas.com/doc/backend/quick-start/publish.html
- 运行环境：https://developer.ugnas.com/doc/backend/application/runtime-environment.html
- 安装目录：https://developer.ugnas.com/doc/backend/application/install-directory.html
- 应用启停：https://developer.ugnas.com/doc/backend/application/start-stop.html
- 端口与代理：https://developer.ugnas.com/doc/backend/application/app-port.html
- 应用配置（parameters）：https://developer.ugnas.com/doc/backend/application/app-config.html
- 打开方式：https://developer.ugnas.com/doc/backend/application/open-type.html
- 登录认证：https://developer.ugnas.com/doc/backend/system-capabilities/login-auth.html
- ugcli：https://developer.ugnas.com/doc/tools/ugcli.html
- project.yaml：https://developer.ugnas.com/doc/tools/project-yaml.html
- UGOS Core SDK：https://developer.ugnas.com/doc/frontend/ugos-core/install.html
- cloudWindow：https://developer.ugnas.com/doc/frontend/ugos-core/cloudWindow.html
- 桌面开放能力：https://developer.ugnas.com/doc/frontend/capacity/capacity.html
- 窗口配置：https://developer.ugnas.com/doc/frontend/ugos-core/windowConfig.html
- 快捷键控制：https://developer.ugnas.com/doc/frontend/ugos-core/keyboardControl.html
- builder-open：https://developer.ugnas.com/doc/frontend/ugos-builder/index.html
- builder-open API：https://developer.ugnas.com/doc/frontend/ugos-builder/buildConfig.html
- React 示例：https://developer.ugnas.com/doc/frontend/demo/react.html
- Vue 示例：https://developer.ugnas.com/doc/frontend/demo/vue.html
- 开发者身份认证：https://developer.ugnas.com/doc/review/developer-identity/authentication-disclosure.html

---

## 14. 待决策（占位）

- 后端技术栈：Go / C++ / Rust？（默认倾向 Go）
- 前端技术栈：React / Vue / Svelte？（默认倾向 React，参考官方 demo）
- 元数据数据库：SQLite（嵌入 `data/` 目录）？
- 阅读核心：自研 / foliate-js / readium-js / pdf.js？
- 同步策略：仅本地 / 通过 NAS 共享存储 / 走云端？
- 是否提供 OPDS 接口对接外部阅读器？

> 这些决定都要写到 README / docs 而不是埋在代码里。
