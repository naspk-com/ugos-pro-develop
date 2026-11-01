# 运行环境

> 来源: https://developer.ugnas.com/doc/backend/application/runtime-environment.html

应用默认是运行在一个受限的环境中，包括应用具有独立的运行用户、独立的文件系统视图、受限的网络访问权限等。

## 运行用户

应用安装后，系统将会为应用创建一个独立的运行用户（非 root 权限），应用的所有进程都将以该用户身份运行。

## 数据目录

应用安装时，系统会在应用安装目录自动创建如下应用用户具有读写权限的子目录：

- `data`：应用数据目录（也是应用的工作目录）
- `log`：应用日志目录
- `cache`：应用缓存数据目录

建议应用将运行时产生的数据、日志和缓存文件分别保存在这些目录中。目录的绝对路径可以通过环境变量获取。应用卸载时，这些目录也会被同步删除。

## 环境变量

应用运行时，系统会设置如下环境变量：

- `UGAPP_INSTALL_DIR`：应用安装目录
- `UGAPP_DATA_DIR`：应用数据目录
- `UGAPP_CACHE_DIR`：应用缓存数据目录
- `UGAPP_LOG_DIR`：应用日志目录
- `UGAPP_SHARED_DIR`：用户授权的可访问目录

除了系统设置的环境变量，应用声明的自定义配置项也会通过环境变量传递给应用。环境变量名称与自定义配置声明中的 `key` 字段保持一致。

例如自定义了登录账号 (ACCOUNT) 和密码 (PASSWORD) 两个配置项，则会设置如下环境变量：

```
ACCOUNT='admin'
PASSWORD='admin123'
```

系统设置的环境变量都带 `UGAPP_` 前缀，应用自定义配置的环境变量请避免使用该前缀。

## 应用权限

应用默认运行在受限的环境中。应用需要声明所需的权限，系统根据权限声明决定是否授予应用相应的能力。

通过配置 `project.yaml` 中的 `permissions` 字段来声明需要的权限。目前支持的权限包括：

- `SYSTEM.EXEC_SYSTEM_COMMAND`：执行系统命令，可以执行系统 /usr/bin, /usr/sbin 目录下的内置命令
- `NETWORK.ACCESS_INTERNET`：访问网络，可以创建网络连接与外部互联网服务通信

（注：另有权限 `STORAGE.ACCESS_EXTERNAL`（访问外接存储），最低系统版本 1.17.0.0000，详见 [project.yaml 配置](../tools/project-yaml.md)。）

## 文件访问

应用具有独立的文件系统视图，只能访问应用安装目录下的文件及部分系统目录。

可访问系统目录（只读）：

- `/lib`
- `/sys`
- `/dev`

应用如果有声明执行系统命令权限（`SYSTEM.EXEC_SYSTEM_COMMAND`），则额外可访问并执行以下系统目录下的命令：

- `/usr/bin`
- `/usr/sbin`
- `/bin`
- `/sbin`

应用安装目录及子目录权限：

- `/var/packages/{appid}`：只读
- `/var/packages/{appid}/data`：读写
- `/var/packages/{appid}/log`：读写
- `/var/packages/{appid}/cache`：读写
- `/var/packages/{appid}/shared`：读写

应用默认无权限访问用户的个人和共享文件夹。在 `project.yaml` 中通过设置 `allow_add_access_path` 字段为 `true`，则用户可以在应用设置页面中主动授权应用可以访问的文件夹。

已授权的文件夹会同时被软链到应用安装目录的 `shared` 目录下，绝对路径可通过 `UGAPP_SHARED_DIR` 环境变量获取。例如用户授权应用可以访问个人文件夹下的 `documents` 文件夹（`/home/user/documents`），则 `shared` 目录下会有一个软链 `documents` 指向 `/home/user/documents`。

## 日志收集

应用运行时默认输出到标准输出和标准错误的内容会被系统自动重定向输出到应用 `log` 目录下的 `{appid}.log` 文件。

应用自身生成的日志文件也需要保存到 `log` 目录下，用户在系统帮助中心生成系统诊断信息时，系统会自动收集应用 `log` 目录下的所有日志文件，便于排查用户反馈的问题。

> **注意**：应用需要自行管理日志文件的大小及数量，避免日志文件累积占用过多磁盘空间。
