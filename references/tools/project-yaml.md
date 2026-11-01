# project.yaml 配置说明

> 来源: https://developer.ugnas.com/doc/tools/project-yaml.html

`project.yaml` 是 UGOS Pro 应用的核心配置文件，用于定义应用的基本信息、运行配置、展示信息等。使用 `ugcli` 工具对项目进行打包时，工具会校验并根据该文件配置，生成最终的安装包。

## 基本配置

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `spec_version` | string | 是 | 配置规范版本，当前版本为 `2.1` |
| `app_id` | string | 是 | 应用ID，上架后不可修改。命名规范：`com.公司/组织英文名.应用名`，只能包含小写字母、数字和点，且必须以字母开头 |
| `version` | string | 是 | 应用版本号，格式 `x.y.z`。打包时通过 `--build` 追加构建号，最终为 `x.y.z.b` |
| `support_arch` | string[] | 是 | 支持的 CPU 架构：`amd64`、`arm64` |
| `product_series` | string[] | 否 | 产品线：`nasync`（NAS）、`homeagent`（HomeAgent），支持多选。未配置或为空时按 `nasync` 处理 |
| `supports` | string[] | 否 | 客户端类型：`app`（移动端）、`pc`（桌面端）、`tv`（电视端）。留空时打包默认写入 `app`、`pc` |
| `tag_types` | string[] | 是 | 应用类别：`system`、`media`、`utility`、`security`、`download`、`backup`、`devtool` |

## 版本号规则

应用版本号由主版本号（x）、次版本号（y）、修订号（z）和构建号（b）四段组成，完整格式为 `x.y.z.b`（`b` 为 4 位构建号，左补零，示例：`0.1.0.0001`）。

| 段 | 说明 | 配置位置 |
|----|------|----------|
| x.y.z | 主/次/修订版本 | `project.yaml` 中的 `version` 字段 |
| b | 构建号（4 位数字，左补零） | 打包命令 `ugcli pack --build <n>` 指定 |

规则说明：

- 在同一个 `x.y.z` 版本下，每次提交新版本安装包时，构建号必须递增，不允许重复。
- 版本号大小按四段数字逐段比较：`1.0.1.0002` > `1.0.1.0001`，`1.1.0.0000` > `1.0.9.9999`。

```
# project.yaml 中 version: 0.1.0
ugcli pack --build 1   # 最终版本号 0.1.0.0001
ugcli pack --build 2   # 最终版本号 0.1.0.0002（同一 x.y.z 下构建号必须递增）
```

## 运行配置

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `start_cmd` | string | 是 | 后端服务启动命令（相对安装目录路径 + 参数），如 `bin/myapp_serv --port=21010`。*Docker 应用无需配置 |
| `port` | number | 是 | 后端服务监听端口，如 `21010` |
| `proxy_path` | string | 否 | 系统网关代理的 HTTP 请求路径前缀，如 `api/v1` |
| `open_type` | string | 是 | `inner`（桌面内独立窗口）/ `tab`（浏览器新标签页） |
| `depend_fw_version` | string | 否 | 依赖的 UGOS Pro 系统最低固件版本，格式 `x.y.z.b`，如 `1.13.0.0000`，适用于所有应用类型 |
| `is_docker_app` | boolean | 否 | 是否为 Docker 应用，Docker 应用需设为 `true` |
| `depend_docker_version` | string | 否 | 依赖的 Docker 套件最低版本，格式 `x.y.z.b`，如 `1.7.0.0000`。*Docker 应用必填 |

> 固件版本号获取：`depend_fw_version` 为可选配置，若需声明最低固件要求，填写值需与 UGOS Pro 系统实际版本号一致。请联系绿联开发获取可用的固件版本号，避免因版本号填写错误导致应用无法安装或运行。若应用使用系统自带能力，还需确保最低固件版本等于或高于提供该能力的固件版本号。

## 应用依赖

部分应用运行依赖系统中已安装的其他套件。依赖关系会在打包时写入安装包配置，安装前系统将检查依赖是否满足。

### Docker 应用依赖

Docker 应用必须配置 `depend_docker_version`，声明所依赖的 Docker 套件最低版本。打包时 `ugcli` 会自动生成对 `com.ugreen.docker` 的强依赖（MustDepend）。

```yaml
is_docker_app: true
depend_fw_version: 1.13.0.0000
depend_docker_version: 1.7.0.0000
```

用户安装 Docker 应用前，需确保设备上已安装且版本不低于 `depend_docker_version` 所声明的 Docker 套件。Docker 应用能否上架 HomeAgent，请联系绿联确认。

## 功能配置

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `support_migration` | boolean | 否 | 是否支持迁移安装目录，默认 `false` |
| `allow_add_access_path` | boolean | 否 | 是否支持用户授权访问个人文件夹和共享文件夹，默认 `false` |
| `only_admin` | boolean | 否 | 是否仅管理员可访问，默认 `false` |

## 应用链接与合规信息

以下字段均为 URL 链接数组，可配置一个或多个。

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `privacy_policy_link` | string[] | 否 | 隐私政策链接 |
| `license_agreement_link` | string[] | 否* | 许可协议链接。*应用使用了开源代码时必填 |
| `source_code_link` | string[] | 否* | 源码链接。*应用使用了开源代码时必填 |
| `technical_support_link` | string[] | 否 | 技术支持链接 |

> 开源代码合规要求：若应用使用了开源代码（包括直接引用、修改或打包分发开源组件），须同时配置 `license_agreement_link` 与 `source_code_link`。

```yaml
privacy_policy_link:
  - https://mycompany.example.com/privacy
license_agreement_link:
  - https://mycompany.example.com/license
source_code_link:
  - https://github.com/mycompany/myapp
technical_support_link:
  - https://mycompany.example.com/support
```

## 权限配置

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `permissions` | string[] | 否 | 声明应用所需的系统权限列表 |

### 支持的权限类型

| 权限标识 | 说明 | 最低依赖系统版本 |
|----------|------|:--:|
| `SYSTEM.EXEC_SYSTEM_COMMAND` | 执行系统命令，可以执行系统 `/usr/bin`、`/usr/sbin` 目录下的内置命令 | `1.13.0.0000` |
| `NETWORK.ACCESS_INTERNET` | 访问网络，可以创建网络连接与外部互联网服务通信 | `1.13.0.0000` |
| `STORAGE.ACCESS_EXTERNAL` | 访问外接存储，可以访问已挂载的 USB 和外接存储卷 | `1.17.0.0000` |

> 声明 `permissions` 时，必须在 `project.yaml` 中配置 `depend_fw_version`，且其值不得低于所声明权限对应的最低依赖系统版本。若同时声明多个权限，取其中的最高版本要求。

## 应用自定义配置 (parameters)

`parameters` 字段用于定义应用的自定义配置项，支持用户在安装或控制面板中的应用配置页面进行配置。

### 配置项结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `key` | string | 是 | 配置项标识 |
| `type` | string | 是 | `string` / `number` / `path` / `password` |
| `required` | boolean | 否 | 是否必填，默认 `false` |
| `changeable` | boolean | 否 | 配置后是否支持再修改，默认 `false` |
| `multi` | boolean | 否 | 是否支持配置多个值，默认 `false` |
| `i18n` | object | 是 | 配置项多语言展示信息 |

### 配置项多语言 (parameters[].i18n)

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `name` | string | 是 | 配置项名称 |
| `description` | string | 是 | 配置项描述（补充说明、填写规范等） |

## 应用展示信息多语言配置 (i18n)

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `name` | string | 是 | 应用显示名称 |
| `description` | string | 是 | 应用描述 |
| `author` | string | 是 | 应用开发者 |
| `official` | string | 否 | 应用官网链接 |
| `help` | string | 否 | 使用帮助文档链接 |
| `publisher` | string | 否 | 应用发布者 |
| `publisher_link` | string | 否 | 应用发布者官网链接 |

### 语言配置与兜底规则

支持的语言代码：

```
en-US  zh-CN  de-DE  ja-JP  fr-FR  nl-NL  pt-PT  es-ES  it-IT  ko-KR  zh-TW
```

`i18n` 中至少需配置一种语言。语言展示规则：

- 仅上架特定国家/地区时：除适配该国家/地区的语言外，必须同时提供英语作为兜底语言
- 用户切换系统语言后，若当前语言无对应配置，一律以英语展示应用详情及 `i18n` 相关文案
- 应用前端界面本身的国际化需开发者自行实现；`project.yaml` 的 `i18n` 仅控制应用中心详情页展示文案

## 完整配置示例

```yaml
# 配置规范版本
spec_version: 2.1
# 应用ID
app_id: com.mycompany.myapp
# 应用版本号
version: 0.1.0
# 支持的 CPU 架构
support_arch:
  - amd64
  - arm64
# 支持的产品线：nasync（NAS）、homeagent（HomeAgent）；未配置时按 nasync
product_series:
  - nasync
# 支持的客户端类型（可选，不配置时打包默认为 app、pc）
supports:
  - app
  - pc
# 启动命令
start_cmd: bin/myapp_serv --port=21010
# 服务端口
port: 21010
# 代理路径前缀
proxy_path: api
# 打开方式
open_type: inner
# 应用类别
tag_types:
  - utility
  - devtool
# 最低固件版本（声明 permissions 时必填）
depend_fw_version: 1.13.0.0000
# 支持迁移
support_migration: true
# 允许用户授权访问个人文件夹和共享文件夹
allow_add_access_path: true
# 合规与技术支持链接
privacy_policy_link:
  - https://mycompany.example.com/privacy
license_agreement_link:
  - https://mycompany.example.com/license
source_code_link:
  - https://github.com/mycompany/myapp
technical_support_link:
  - https://mycompany.example.com/support
# 权限声明
permissions:
  - SYSTEM.EXEC_SYSTEM_COMMAND
  - NETWORK.ACCESS_INTERNET
# 自定义参数
parameters:
  - key: ACCOUNT
    type: string
    required: true
    changeable: true
    i18n:
      en-US:
        name: Login Account
        description: 6-8 characters
      zh-CN:
        name: 登录账号
        description: 长度6-8位
# 多语言信息（en-US 建议作为基础语言始终保留）
i18n:
  en-US:
    name: My APP
    description: My APP Description
    author: My Company
    official: https://myapp.example.com
    help: https://myapp.example.com/help
    publisher: My Company
    publisher_link: https://mycompany.example.com
  zh-CN:
    name: 我的应用
    description: 应用描述
    author: 演示应用开发者
    official: https://myapp.example.com.cn
    help: https://myapp.example.com.cn/help
    publisher: 演示应用发布者
    publisher_link: https://mycompany.example.com.cn
```
