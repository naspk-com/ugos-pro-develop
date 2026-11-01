# 产品线与机型支持

> 来源: https://developer.ugnas.com/doc/backend/application/product-series.html

UGOS Pro 应用按产品线分发。每个安装包对应一条产品线。若需同时上架 NAS 与 HomeAgent，须分别打包并提交审核。

## 按产品线分别打包上架

- `project.yaml` 的 `product_series` 为字符串列表，可选值：`nasync`、`homeagent`，支持多选。
- 未配置、空列表或空值时，按 `nasync` 处理。
- 兼容旧版标量写法（`product_series: nasync`）；写入时统一为列表。
- `ugcli pack` 按列表为每条产品线生成一个安装包，并将该值写入对应包 `config.json` 的 `productSeries`。
- UPK 文件名格式：`{amd64|arm64}_{nasync|homeagent}_{appid}_{version}.upk`。
- 设备安装时校验产品线：NAS 安装包不可安装至 HomeAgent，HomeAgent 安装包不可安装至 NAS。
- 应用中心按设备当前产品线拉取云端列表，不同产品线的安装包互不可见。

在同一 `project.yaml` 中声明多条产品线：

```yaml
product_series:
  - nasync
  - homeagent
```

按列表逐条打包（省略 `--product-series` 时效果相同）：

```bash
ugcli pack --build 1 --product-series all
```

使用 `--product-series` 仅打包列表中的指定产品线：

```bash
ugcli pack --build 1 --product-series nasync
ugcli pack --build 1 --product-series homeagent
```

> `--product-series` 仅筛选本次打包的目标产品线，不改写 `project.yaml`。指定的值必须已出现在 `product_series` 列表中；该字段未配置或为空时，视为仅包含 `nasync`。指定列表中不存在的产品线时，打包失败。

## 产品线与 rootfs 目录

`ugcli create` 根据 `support_arch` 创建 `rootfs_{arch}`（如 `rootfs_amd64`、`rootfs_arm64`）。默认情况下，各产品线共用 `rootfs_common` 与架构目录。工具不会自动创建产品线专用目录。

打包时按以下顺序合并，后层覆盖同路径文件：

```
rootfs_common
    → rootfs_{arch}                 # 必需，如 rootfs_amd64
    → rootfs_{series}               # 可选，目录存在时叠加，如 rootfs_homeagent
    → rootfs_{arch}_{series}        # 可选，目录存在时叠加，如 rootfs_amd64_homeagent
```

可选目录不存在时跳过，不视为错误。建议各产品线使用相同的 `start_cmd` 路径（例如 `bin/app`），通过叠加层替换对应文件。

原生应用将后端可执行文件置于 `rootfs_{arch}/bin/`。仅当某产品线需要不同二进制或配置时，再创建叠加目录，例如：

- 产品线专用配置：`rootfs_homeagent/`
- 指定架构与产品线的二进制：`rootfs_amd64_homeagent/bin/app`（覆盖 `rootfs_amd64` 中的同名文件）

Docker 应用将镜像文件置于 `rootfs_{arch}/images/`。若某产品线需要不同镜像，可创建 `rootfs_{series}/images/` 或 `rootfs_{arch}_{series}/images/`。

在已有项目的 `product_series` 中新增 `homeagent` 时，无需额外创建目录，可继续使用 `rootfs_{arch}`。

## HomeAgent 安装目录说明

在 HomeAgent 上，系统不使用应用中心里配置的「默认存储位置」。安装根路径优先选择高速（性能）存储卷，否则使用常规（数据）存储卷。目录形态不变。
