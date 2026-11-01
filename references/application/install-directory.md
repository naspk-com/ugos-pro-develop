# 安装目录

> 来源: https://developer.ugnas.com/doc/backend/application/install-directory.html

应用在被安装到指定的存储空间后，将会在存储空间中创建应用专属的安装目录，路径格式为：`/volume{volume number}/@appstore/{app_id}`。

例如：`/volume1/@appstore/com.mycompany.myapp`。

在 HomeAgent 上，系统不使用应用中心里配置的「默认存储位置」。安装根路径优先选择高速（性能）存储卷，否则使用常规（数据）存储卷。目录形态不变。详见 [产品线与机型支持](product-series.md)。

目录结构如下：

```
/var/packages/{app_id}/ -> /volume{volume number}/@appstore/{app_id}
├── bin
│   └── app_serv
├── cache -> /volume{volume number}/@appcache/{app_id}
├── data -> /volume{volume number}/@appdata/{app_id}
├── log -> /volume{volume number}/@applog/{app_id}
├── icon.png
└── www
    ├── index.html
    ├── css/
    ├── js/
    └── assets/
```

应用安装目录下的文件和目录来自 `rootfs_common`、`rootfs_{arch}`，以及手动创建的产品线叠加目录（`rootfs_{series}`、`rootfs_{arch}_{series}`）。未创建叠加目录时，各产品线内容相同。

## 打包目录结构

```
my-app/
├── project.yaml              # 应用配置文件
├── rootfs_common/            # 各架构共用
│   ├── icon.png              # 应用图标（建议尺寸：256*256 px）
│   └── www/                  # 前端静态文件目录
│       ├── index.html        # 入口页面
│       ├── css/
│       ├── js/
│       └── assets/
├── rootfs_amd64/             # AMD64（各产品线共用）
│   └── bin/                  # 后端服务可执行文件
└── rootfs_arm64/             # ARM64（各产品线共用）
    └── bin/
```

可选叠加目录需手动创建，例如 `rootfs_homeagent/`、`rootfs_amd64_homeagent/`。详见 [产品线与机型支持](product-series.md)。
