# 打包 Docker 应用

> 来源: https://developer.ugnas.com/doc/backend/quick-start/develop-docker-app.html

Docker 应用打包主要包含以下步骤：

- 准备应用镜像（构建并导出为 tar 文件）
- 使用开发者工具 `ugcli` 创建 Docker 应用项目
- 编写应用配置文件 `project.yaml`
- 编写 `docker-compose.yaml` 并配置 compose 变量
- 将应用镜像拷贝到应用项目对应架构的 `images` 目录下
- 制作应用图标并拷贝到应用项目的 `rootfs_common` 目录下
- 使用开发者工具 `ugcli` 打包应用

## 准备应用镜像

Docker 应用以 **Docker 镜像** 为载体，需要先完成镜像的构建与导出。

### 构建镜像

```dockerfile
FROM alpine:3.18
RUN apk add --no-cache your-runtime
COPY . /app
WORKDIR /app
ENTRYPOINT ["/app/entrypoint.sh"]
```

构建并打标签：

```bash
docker build -t docker.io/mycompany/myapp:0.1.0 .
```

### 导出为 tar

```bash
docker save -o myapp-0.1.0.tar docker.io/mycompany/myapp:0.1.0
```

最终需要为每个支持的架构准备至少一个镜像 tar 文件，放入 `rootfs_{arch}/images/`。各产品线默认共用这些目录；仅某条产品线需要不同镜像时，再手动创建 `rootfs_{series}/images/` 或 `rootfs_{arch}_{series}/images/` 叠加覆盖。

**应用镜像 tar 文件规范**：
- 应用有使用的镜像都需要导出为独立的 tar 文件
- 每个镜像 tar 文件只能有一个 tag，且与 docker-compose 中配置使用的一致
- 应用如果同时支持 amd64 和 arm64 架构，需要分别导出两个架构的 tar 文件

## 创建应用项目

运行 `ugcli create com.mycompany.docker.myapp`，在交互中选择「是否为 Docker 应用」为是。目录结构：

```
com.mycompany.docker.myapp
├── project.yaml              # 应用配置文件
├── rootfs_amd64              # amd64 镜像（各产品线共用）
│   └── images
├── rootfs_arm64              # arm64 镜像（各产品线共用）
│   └── images
└── rootfs_common             # 各架构共用
    ├── icon.png              # 应用图标
    └── docker-compose.yaml   # Compose 编排文件
```

**目录规范**：
- `rootfs_common` 下仅允许 `icon.png` 和 `docker-compose.yaml` 文件
- 各架构目录下仅允许 `images/` 且其中只放 `.tar` 镜像文件

## 编写应用配置文件

Docker 应用与原生应用的主要区别：

- 必需设置 `is_docker_app: true`
- 必需设置 `depend_docker_version`，依赖 Docker 套件
- 通过 `parameters` 定义安装时可配置项，这些配置项会作为 compose 中的变量使用

```yaml
spec_version: "2.1"
app_id: com.mycompany.docker.myapp
version: 0.1.0
support_arch:
  - amd64
  - arm64
product_series:
  - nasync
is_docker_app: true
only_admin: true
port: 29090
open_type: tab
tag_types:
  - utility
depend_fw_version: 1.13.0.0000
depend_docker_version: 1.7.0.0000
parameters:
  - key: PATH
    type: path
    multi: true
    required: true
    i18n:
      en-US:
        name: Resource Access Paths
        description: Multiple paths can be configured
      zh-CN:
        name: 资源访问路径
        description: 可配置多个路径
  - key: ACCOUNT
    type: string
    i18n:
      en-US:
        name: Login Account
        description: 6-8 characters
      zh-CN:
        name: 登录账号
        description: 长度6-8位
i18n:
  en-US:
    name: My Docker APP
    description: My Docker APP Desc
    author: My Company
    official: https://myapp.example.com
    help: https://myapp.example.com/help
    publisher: My Company
    publisher_link: https://mycompany.example.com
  zh-CN:
    name: 我的Docker应用
    description: 我的Docker应用描述
    author: 演示应用开发者
    official: https://myapp.example.com.cn
    help: https://myapp.example.com.cn/help
    publisher: 演示应用发布者
    publisher_link: https://mycompany.example.com.cn
```

### parameters 配置项

`parameters` 是一个数组，每个元素对应一个配置项。Compose 中引用的变量名（`${VAR}`）需要与配置项的 `key` 一致。

| 字段 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `key` | string | 是 | 配置项标识（变量名），建议大写加下划线，如 `ACCOUNT`、`LOG_LEVEL` |
| `type` | string | 是 | 配置项类型：`string`、`path`、`number`、`password` |
| `multi` | bool | 否 | 是否支持多个值 |
| `required` | bool | 否 | 是否必填 |
| `changeable` | bool | 否 | 安装完成后是否允许修改 |
| `max_length` | int | 否 | 输入最大长度，`0` 表示不限制 |
| `min_length` | int | 否 | 输入最小长度，`0` 表示不限制 |
| `max_values_count` | int | 否 | 最多可配置值数量，仅当 `multi: true` 时生效 |
| `verify_regexp` | string | 否 | 输入值校验正则表达式，为空表示不校验 |
| `i18n` | map | 是 | 多语言展示信息 |

配置项类型说明：

| `type` 值 | 含义 | 典型场景 | 示例值 |
|-----------|------|----------|--------|
| `string` | 普通字符串 | 账号、开关标识、日志级别 | `admin`、`INFO` |
| `path` | 路径类型字符串 | 挂载到容器内的目录或文件路径 | `/mnt/user/data` |
| `number` | 数字类型输入 | 端口、重试次数、阈值 | `8080`、`3` |
| `password` | 敏感字符串 | 密码、令牌、密钥 | `MySecret123` |

> `multi` 建议主要用于 `type: path` 场景（如多个挂载路径）。

## 编写 Docker Compose 文件

- **路径**：`rootfs_common/docker-compose.yaml`
- **格式**：标准 Docker Compose（如 Compose Spec v2/v3），使用变量语法 `${VAR}` 引用 `parameters` 声明的配置项

### 变量来源

1. **内置变量**（无需在 `parameters` 中声明）：`TZ`（时区，如 `Asia/Shanghai`）
2. **安装参数变量**：与 `parameters` 的 `key` 一一对应（区分大小写）

示例：

```yaml
services:
  app:
    image: docker.io/mycompany/myapp:0.1.0
    volumes:
      - ./config:/opt/myapp
      - ${PATH}
    network_mode: bridge
    ports:
      - 29090:9090
    environment:
      - UMASK=022
      - TZ=${TZ}
      - ACCOUNT=${ACCOUNT}
      - LOG_LEVEL=${LOG_LEVEL}
    restart: always
```

- **镜像**：`image` 需与放入 `rootfs_{arch}/images/` 的 tar 中镜像包含的 tag 一致，且不能使用 latest
- **多值参数**：`type: path` 且 `multi: true` 时，在 compose 中按多值处理（如挂载多路径）

### 安全与规范建议

- 不可使用 `privileged`、`cap_add`、`host pid/ipc`，避免使用 `host` 网络，打包时会检测并告警
- 仅使用已在 `parameters` 中声明的 key 或内置变量（如 `TZ`），避免未定义变量导致打包校验失败

## 拷贝应用镜像与图标

- **镜像**：amd64 → `rootfs_amd64/images/`；arm64 → `rootfs_arm64/images/`
- **图标**：256×256 PNG 图标，替换 `rootfs_common/icon.png`（开发阶段可暂用默认图标）

## 打包应用

```bash
ugcli pack --build 1
```

- `--build` 为构建号，与 `version` 组成最终版本号（如 `0.1.0` + build 1 = `0.1.0.0001`）
- 可指定 `--arch amd64` / `--arch arm64`，或 `--product-series nasync` / `homeagent` / `all`
- 生成的 UPK 位于 `build_dir/`，命名格式：`{amd64|arm64}_{nasync|homeagent}_{appid}_{version}.upk`
- **Docker 应用能否上架 HomeAgent，请联系绿联确认**
