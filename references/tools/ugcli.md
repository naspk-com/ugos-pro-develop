# ugcli 使用指南

> 来源: https://developer.ugnas.com/doc/tools/ugcli.html

## 工具简介

ugcli 命令行工具，旨在为 UGOS Pro 系统的应用开发者提供项目创建、打包、配置生成和检查等功能。该工具支持在 Windows、Linux 和 macOS 系统上运行，帮助开发者快速创建和管理 UGOS Pro 应用项目。

## 下载使用

当前版本：**1.1.0.25**

| 平台 | 架构 | 工具文件 |
|------|------|----------|
| Linux | x86_64 | [ugcli-linux-amd64](https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.25-linux-amd64) |
| Windows | x86_64 | [ugcli-windows-amd64.exe](https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.25-windows-amd64.exe) |
| macOS | x86_64 | [ugcli-darwin-amd64](https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.25-darwin-amd64) |
| macOS | arm64 | [ugcli-darwin-arm64](https://osswaf.ugnas.com/pro/ugcli/download/ugcli-v1.1.0.25-darwin-arm64) |

### Linux/macOS 安装

```bash
# 添加执行权限
chmod +x ugcli-linux-amd64

# 重命名并移动到系统路径
sudo mv ugcli-linux-amd64 /usr/local/bin/ugcli

# 验证安装
ugcli --version
```

> macOS Intel 使用 `ugcli-darwin-amd64`，Apple Silicon 使用 `ugcli-darwin-arm64`。

### Windows 安装

1. 下载对应的 `.exe` 文件
2. 将文件重命名为 `ugcli.exe`
3. 将文件路径添加到 `PATH` 环境变量
4. 在终端中运行 `ugcli --version` 验证安装

## 基本命令使用

### 创建新项目

通过 `create` 子命令创建新的应用项目，并通过交互式问答配置应用基本信息。

```
$ ugcli create my-app
Input new values for the config (press Enter to keep the current value):
? Set the application ID (e.g. com.mycompany.myapp)*: com.mycompany.myapp
? Set the version of your application (e.g. 1.0.0)*: 0.1.0
? Choose a type for your application*: utility
? Choose the architectures your application supports*: amd64, arm64
? Choose the product series your application supports (nasync: NAS, homeagent: HomeAgent)*: nasync
? Choose the open type for your application, inner: open in new window at desktop, tab: open in new tab at browser*: inner
? Enter the start command for your application's backend service (e.g. bin/myapp_server --port=28080)*: bin/myapp_serv --port=21010
? The port number that your application will listen on*: 21010
? The path that your application want system gateway to proxy to this port (leave empty if not needed): api
Configure your application's display information (en-US):
? Application display name*: My APP
? Application description*: My APP Desc
? Application author: nobody
? Application official website: https://myapp.example.com
? Application help website: https://myapp.example.com/help
```

配置项说明：

- **应用ID**：应用唯一标识，格式 `com.mycompany.myapp`，上架后不可修改
- **版本号**：格式 `x.y.z`，打包时通过 `--build` 追加构建号，最终为 `x.y.z.b`（`b` 为 4 位构建号，左补零）
- **应用类别**：system（系统管理）、media（娱乐）、utility（实用工具）、security（安全）、download（下载）、backup（备份）、devtool（开发工具）
- **支持架构**：amd64、arm64，支持多选
- **产品线**：`nasync`（绿联 NAS）、`homeagent`（HomeAgent），支持多选；一条产品线对应一个安装包；未配置或为空时按 `nasync` 处理
- **客户端类型**：在 `project.yaml` 中通过 `supports` 声明，可选 `app`（移动端）、`pc`（桌面端）、`tv`（电视端）；留空或不配置时打包默认写入 `app`、`pc`
- **打开方式**：inner（系统桌面内独立窗口）、tab（浏览器新标签页）
- **启动命令**：后端服务启动命令，包含可执行文件相对路径和参数
- **监听端口号**：后端服务监听端口；启动前系统会检查该端口是否被占用，启动后通过探测该端口判断是否启动成功
- **代理路径**：系统网关代理的 HTTP 请求路径前缀，如 `api/v1`
- **应用展示信息**：应用名称、描述、开发者、官网、帮助链接，支持多语言

按提示配置完成后，会在当前目录下生成 `my-app` 目录：

```
my-app
├── project.yaml                 # 应用配置文件
├── rootfs_amd64                 # amd64 文件（各产品线共用）
├── rootfs_arm64                 # arm64 文件（各产品线共用）
└── rootfs_common                # 各架构共用
    ├── icon.png                 # 应用图标
    └── www                      # 前端静态文件目录
```

### 修改项目配置

```
# 进入项目目录
$ cd my-app

# 查看当前项目配置
$ ugcli config list

# 修改项目配置（交互式），如果保持不变，直接回车
$ ugcli config edit

# 新增或修改指定语言的应用描述信息（交互式）
$ ugcli config edit i18n
```

#### 多语言配置

可以直接修改 project.yaml 文件中的 `i18n` 字段来配置多语言信息。

可配置的语言列表：

```
en-US  zh-CN  de-DE  ja-JP  fr-FR  nl-NL  pt-PT  es-ES  it-IT  ko-KR  zh-TW
```

语言配置说明：

- 若应用未配置用户当前系统语言，应用中心详情页将**默认展示英语（en-US）**内容
- **建议始终保留 `en-US` 作为兜底语言**。仅面向特定国家/地区上架时，除目标语言外也必须提供英语
- 应用打开后的界面语言兼容需开发者自行实现

除 `i18n` 外，还可在 `project.yaml` 根级别配置合规与技术支持链接：

- `privacy_policy_link`：隐私政策链接
- `license_agreement_link`：许可协议链接（应用使用开源代码时必填）
- `source_code_link`：源码链接（应用使用开源代码时必填）
- `technical_support_link`：技术支持链接

### 检查项目配置

```
$ ugcli check
Checking project in /home/example/my-app
✓ check passed
```

将会检查项目配置的完整性，包括：

- project.yaml 配置文件及其内容
- rootfs 目录结构

### 打包项目

```
# 打包当前项目（按 project.yaml 的 product_series 列表，各打一份）
ugcli pack --arch all --build 1

# 只打 HomeAgent 包，需已在 product_series 中声明
ugcli pack --arch all --build 1 --product-series homeagent

# 打列表中的全部产品线（与省略 --product-series 相同）
ugcli pack --arch all --build 1 --product-series all
```

参数说明：

- `--build, -b`：设置构建号（整数），与 `version`（x.y.z）组合为最终版本号 `x.y.z.b`（如 `0.1.0.0001`）
- `--arch, -a`：指定目标架构（amd64/arm64/all）
- `--product-series, -s`：指定目标产品线（nasync/homeagent/all；省略或 all 时打包 `product_series` 声明的全部产品线；指定单条时必须已在列表中）

#### 版本号与构建号

- `project.yaml` 中填写 `version: x.y.z`
- 打包时通过 `--build` 指定构建号，最终安装包版本为 `x.y.z.b`（`b` 为 4 位构建号，左补零）
- 同一 `x.y.z` 下每次提交新版本，构建号必须递增，不允许重复
- 版本号越大表示版本越新

```
# project.yaml: version: 0.1.0
ugcli pack --build 1    # 0.1.0.0001
ugcli pack --build 2    # 0.1.0.0002
```

打包完成后，会在项目的 `build_dir/pkgs/upk` 目录下生成 upk 安装包，命名格式为 `{arch}_{product_series}_{appid}_{version}.upk`。

#### 文件权限

UGOS Pro 基于 Linux。安装包内成员的 Unix 权限随 UPK 写入，并在设备安装时还原。可执行文件缺少执行位将导致后端无法启动。

用于安装测试或上架的安装包，应在 Linux 环境中执行 `ugcli pack` 生成。Linux 完整保留 `rootfs` 中已设置的权限。Windows 文件系统不提供 Unix 执行位，无法保证安装包权限与工程设定一致。ugcli 可在 Windows 与 macOS 上用于项目创建、配置编辑与检查；正式构建应以 Linux 为准。

建议按下列默认值设置：

| 对象 | 权限 | 说明 |
|------|------|------|
| 目录 | `0755` | 含 `bin/` 等 |
| 普通文件 | `0644` | 配置、静态资源、数据文件等 |
| 可执行文件与脚本 | `0755` | `start_cmd` 指定的入口、`bin/` 下程序、生命周期脚本 `install.sh` / `uninstall.sh` / `update.sh`、以及 `*.sh` |
| `.check-app` | `0600` | 打包流程自动生成，无需手动修改 |

```
chmod 0755 rootfs_amd64/bin/myapp_serv rootfs_arm64/bin/myapp_serv
chmod 0644 rootfs_common/www/index.html
```

在非 Linux 环境执行 `ugcli pack` 时，工具按上表默认规则写入安装包权限。该方式无法保留工程内自定义的更严格或更宽松权限。需要非默认权限时，须在 Linux 上设置后打包。

## 常见问题

### 如何安装测试打包生成的 upk 包

1. 准备一台绿联 NAS 或 HomeAgent 设备，并升级到最新版本的 UGOS Pro 系统。
2. 提交设备的序列号、MAC 地址和管理员用户名到绿联官方，申请开发者授权。
3. 将授权文件重命名为 `ugdev.sig`，并上传到设备管理员用户的个人文件夹。
4. 在设备上打开应用中心，点击手动安装，选择与当前产品线匹配的 upk 文件进行安装测试。NAS 包无法安装到 HomeAgent，HomeAgent 包也无法安装到 NAS。
