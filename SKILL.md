---
name: ugos-pro-develop
description: 绿联云（UGREEN NAS / UGOS Pro / HomeAgent）应用开发参考库。当需要开发、打包、上架 UGOS Pro 系统的原生应用或 Docker 应用时应使用此技能，覆盖 ugcli 工具、project.yaml 配置、应用架构、产品线分发、登录认证、前端 JSSDK（UGOS Core）、桌面开放能力、前端构建工具（builder-open）与开发者身份审核等。触发词：绿联云、UGREEN、UGOS Pro、HomeAgent、ugcli、project.yaml、NAS应用开发、Docker NAS应用、upk打包、builder-open、ugreen-nas/core。
author: SakuraNeko
email: devneko@outlook.com
agent_created: true
metadata:
  source: https://developer.ugnas.com/
  fetched: "2026-11-01"
---

# 绿联云 (UGREEN NAS / UGOS Pro / HomeAgent) 应用开发

> 官方文档: https://developer.ugnas.com/doc/backend/quick-start/prepare.html
> 参考文档: `references/` 目录（按官方目录结构组织，索引见 `references/README.md`）
> 示例项目: `assets/examples/` 目录（可直接复制使用的样板代码）

## 使用方式

此技能采用渐进式披露：本文件只保留开发核心流程与关键约束，详细字段表、完整 API 参考、示例项目说明等放在 `references/` 下，按需读取；可直接复制使用的完整示例项目放在 `assets/examples/` 下。

| 任务 | 参考文件 |
|------|----------|
| 开发准备 / 授权流程 | `references/quick-start/prepare.md` |
| 原生应用开发 | `references/quick-start/develop.md` |
| Docker 应用开发 | `references/quick-start/develop-docker-app.md` |
| 测试 / 发布 / 示例项目 | `references/quick-start/testing.md` · `publish.md` · `my-apps.md` |
| 产品线与机型 | `references/application/product-series.md` |
| 安装目录 / 运行环境 / 端口 / 启停 / 配置 / 打开方式 | `references/application/*.md` |
| 登录认证 | `references/system-capabilities/login-auth.md` |
| ugcli 工具 | `references/tools/ugcli.md` |
| project.yaml 完整字段 | `references/tools/project-yaml.md` |
| 前端 UGOS Core（初始化/窗口/媒体/快捷键） | `references/frontend/ugos-core/*.md` |
| 桌面开放能力 | `references/frontend/capacity/capacity.md` |
| 前端构建工具 builder-open | `references/frontend/ugos-builder/*.md` |
| 示例项目（Vue/React） | `references/frontend/demo/*.md` |
| 上架流程 / 身份审核 | `references/flow.md` · `references/review/developer-identity/authentication-disclosure.md` |

### 内置示例项目（assets/examples/）

| 项目 | 类型 | 说明 |
|------|------|------|
| `assets/examples/vue-demo/` | 前端示例 | Vite 8 + Vue 3 + TS，含能力调用/窗口/授权/基础信息页面 |
| `assets/examples/react-demo/` | 前端示例 | Vite 8 + React 19 + TS，与 Vue 示例功能对齐 |
| `assets/examples/ugnas-reader/` | 完整原生应用 | Go 后端 + React 前端 + project.yaml + rootfs 结构（电子书阅读器 MVP） |

使用示例项目时，将其内容复制到工作区作为开发起点；`ugnas-reader` 可作为原生应用目录结构与 project.yaml 配置的完整参照。

---

## 开发准备（要点）

- **开发环境**：Debian 12，用于编译后端、本地测试、生成 UPK
- **开发者工具**：`ugcli`（当前 1.1.0.25），从绿联云开发者平台下载
- **测试设备**：绿联 NAS（UGOS Pro ≥ 1.13.0.0000）或 HomeAgent（最低固件联系绿联确认）
- **支持架构**：amd64 / arm64

**开发者授权流程**（安装测试必需）：

1. 邮件联系绿联官方，提供设备序列号、MAC 地址、管理员用户名
2. 授权文件重命名为 `ugdev.sig`，上传到管理员个人文件夹
3. UGOS Pro **≥ 1.16.0.0000** 时，再打开 **应用中心 > 设置 > 应用开发设置 > 授权**，完成整机授权

> 授权到期后在「应用开发设置」上传新授权文件更新。

---

## 产品线分发

应用按产品线分发，**一个安装包对应一条产品线**：

| 产品线 | 说明 |
|--------|------|
| `nasync` | 绿联 NAS |
| `homeagent` | HomeAgent |

- `project.yaml` 的 `product_series` 为列表，未配置时按 `nasync` 处理
- NAS 包与 HomeAgent 包**不能交叉安装**
- 同时上架两条产品线时分别打包、分别提交审核

**rootfs 叠加规则**（打包时后层覆盖同路径文件）：

```
rootfs_common → rootfs_{arch} → rootfs_{series} → rootfs_{arch}_{series}
```

---

## 原生应用开发流程

1. **后端**：仅支持 C/C++、Go 等编译型语言，编译出 `myapp_serv` 放入 `rootfs_{arch}/bin/`
2. **前端**：任意框架（Vue/React），构建产物放入 `rootfs_common/www/`
3. **图标**：256×256 PNG <100KB，白色/浅色背景 + 0.5 粗 8% 黑描边，套用官方圆角模板
4. **打包**：`ugcli pack --build 1`，输出 `build_dir/pkgs/upk/{arch}_{product_series}_{appid}_{version}.upk`

**缓存处理**（系统会设 Cache-Control）：CSS/JS 用文件名哈希或查询参数版本号。

---

## Docker 应用开发

与原生应用的关键区别：

- `is_docker_app: true`、`depend_docker_version: "1.7.0.0000"`（均必填）
- 不设 `start_cmd`
- `rootfs_common/` 只放 `icon.png` + `docker-compose.yaml`；镜像 tar 放 `rootfs_{arch}/images/`

**镜像规范**：每个镜像一个 tar、单 tag（不能用 latest）；两架构分别导出。

**Compose 变量**：内置 `TZ`；自定义变量与 `parameters[].key` 一致，用 `${VAR}` 引用。

**安全限制**：禁用 `privileged`、`cap_add`、`host pid/ipc`、`host` 网络模式。

> Docker 应用能否上架 HomeAgent，需联系绿联确认。

---

## project.yaml 关键字段（完整见 references/tools/project-yaml.md）

| 字段 | 必填 | 说明 |
|------|:--:|------|
| `spec_version` | ✅ | 固定 `"2.1"` |
| `app_id` | ✅ | `com.公司名.应用名`，上架后不可改 |
| `version` | ✅ | `x.y.z`，打包 `--build` 追加构建号 → `x.y.z.b` |
| `support_arch` | ✅ | `amd64` / `arm64` |
| `product_series` | ❌ | `nasync` / `homeagent`，默认 `nasync` |
| `start_cmd` | ✅ | 启动命令（Docker 应用无需） |
| `port` | ✅ | HTTP 服务端口 |
| `proxy_path` | ❌ | 网关代理路径前缀 |
| `open_type` | ✅ | `inner`（桌面窗口，支持 JSSDK）/ `tab`（浏览器标签页） |
| `tag_types` | ✅ | system/media/utility/security/download/backup/devtool |
| `depend_fw_version` | ❌ | 最低固件版本，声明 permissions 时必填 |
| `permissions` | ❌ | 权限声明 |
| `parameters` | ❌ | 自定义配置项 |
| `i18n` | ✅ | 多语言展示信息 |

**权限类型**：

| 权限 | 说明 | 最低版本 |
|------|------|:--:|
| `SYSTEM.EXEC_SYSTEM_COMMAND` | 执行 `/usr/bin`、`/usr/sbin` 系统命令 | 1.13.0.0000 |
| `NETWORK.ACCESS_INTERNET` | 访问外部互联网 | 1.13.0.0000 |
| `STORAGE.ACCESS_EXTERNAL` | 访问 USB 和外接存储 | 1.17.0.0000 |

**合规链接字段**：`privacy_policy_link`（隐私）、`license_agreement_link`（许可）、`source_code_link`（源码）、`technical_support_link`（技术支持）。**使用开源代码时 `license_agreement_link` 与 `source_code_link` 必填。**

---

## 文件权限规范

- **正式构建必须在 Linux 上 `ugcli pack`**，保证 Unix 权限正确
- 可执行文件/脚本（`start_cmd` 入口、`bin/` 程序、`*.sh`、生命周期脚本）需 `0755`
- 目录 `0755`、普通文件 `0644`、`.check-app` `0600`（自动生成）

---

## 登录认证

前置条件：`open_type: inner` + 配置 `proxy_path`。

1. 前端用 `cloudWindow.useCapacity('getThirdToken')` 取 token，请求头带 `Ugreen-Ttk`
2. 网关注入 `Ugreen-User-ID` / `Ugreen-User-Name` / `Ugreen-User-Type`（admin/users）
3. 后端从请求头解析用户信息，实现鉴权与数据隔离

---

## 前端 JSSDK (UGOS Core)

npm 包 `@ugreen-nas/core`，使用前必须 `UGOSCore.init()`。

```javascript
import UGOSCore from '@ugreen-nas/core'
import cloudWindow from '@ugreen-nas/core/cloudWindow'   // 窗口 + 桌面能力
import mediaCenter from '@ugreen-nas/core/mediaCenter'   // 跨窗口音视频
import { KeyboardControl } from '@ugreen-nas/core/plugins' // 快捷键
UGOSCore.init()
```

- **桌面开放能力**：`cloudWindow.useCapacity(name, params)`，常用 `getThirdToken`、`openApp`、`openAppCenterDetail`、`getComputerName` 等，完整列表见 `references/frontend/capacity/capacity.md`
- **窗口管理**：`cloudWindow` 提供 61 个方法（尺寸/位置/状态/通信/拖拽），见 `references/frontend/ugos-core/cloudWindow.md`
- **窗口配置**：`open_type: inner` 时用 `cloudWindowConfig` 自定义窗口，属性见 `references/frontend/ugos-core/windowConfig.md`
- **媒体管理**：`mediaCenter.init()` 注册已有媒体，动态元素用 `register()`，任一播放自动暂停其它
- **快捷键**：组合键用 `+` 连接（`ctrl+a`），实例关闭时务必 `destroy()`

---

## 前端构建工具 (builder-open)

npm 包 `@ugreen-nas/builder-open`，Vite 插件，要求 Vite `^6 || ^7 || ^8`。

```typescript
import { UgosViteBuilder } from '@ugreen-nas/builder-open'
const builder = new UgosViteBuilder({
  windowConfig: { width: 1200, height: 800 },
  getIgnoreFolder: (c: unknown) => c,   // 必填
})
export default defineConfig({ plugins: [...builder.pluginEntry()] })
```

完整 API 见 `references/frontend/ugos-builder/*.md`。官方示例项目说明见 `references/frontend/demo/*.md`，完整源码内置在 `assets/examples/vue-demo/` 与 `assets/examples/react-demo/`。

---

## 上架与身份审核

上架流程：研发 → 自测 → 邮件提交基础信息 → 商务对接 → 资料审校 → 上架。

上架前须完成开发者真实身份认证：个人需身份证/手机号（海外加地址证明）；企业需营业执照/统一社会信用代码（海外加注册证明+授权证明）。详见 `references/review/developer-identity/authentication-disclosure.md`。

---

## 关键约束速查

- **open_type**：`inner` 支持 JSSDK、可对接 NAS 登录；`tab` 不支持 JSSDK、需自建用户体系
- **后端语言**：仅 C/C++、Go（编译型）
- **禁止**：root 权限；Docker 应用禁 privileged/cap_add/host 网络
- **缓存**：CSS/JS 文件名哈希或查询参数版本号
- **日志**：应用自行管理日志大小/数量；stdout/stderr 自动重定向到 `log/{appid}.log`
- **端口**：可自行监听额外端口，但无系统代理、不支持远程访问
- **产品线**：交叉安装失败
- **文件权限**：Linux 上打包，可执行文件 0755
- **开源合规**：用开源代码须配置 license + source 链接
- **SDK**：`UGOSCore.init()` 必须调用；动态媒体 `register()`；快捷键实例 `destroy()`
