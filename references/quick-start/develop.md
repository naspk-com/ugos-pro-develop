# 开发原生应用

> 来源: https://developer.ugnas.com/doc/backend/quick-start/develop.html

原生应用开发主要包含以下步骤：

- 开发并编译应用后端服务
- 使用 web 前端技术开发应用前端界面
- 使用开发者工具 `ugcli` 创建应用项目
- 编写应用配置文件 `project.yaml`
- 拷贝应用后端服务可执行文件及前端文件到应用项目对应目录下
- 制作应用图标并拷贝到应用项目对应目录下
- 使用开发者工具 `ugcli` 打包应用

## 开发后端服务

UGOS Pro 应用的后端服务目前仅支持使用 C/C++、Go 等编译型语言开发，需要编译生成可在 Linux 系统上直接运行的可执行文件。

后端服务示例（Go 语言，实现 HTTP 心跳服务）：

```go
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"time"
)

type HeartbeatResponse struct {
	Timestamp string `json:"timestamp"`
	Status    string `json:"status"`
}

func heartbeatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	response := HeartbeatResponse{
		Timestamp: time.Now().Format(time.DateTime),
		Status:    "healthy",
	}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func main() {
	port := flag.Int("port", 21010, "Port to listen on")
	flag.Parse()
	http.HandleFunc("/api/heartbeat", heartbeatHandler)
	addr := fmt.Sprintf(":%d", *port)
	fmt.Printf("Server starting on %s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		fmt.Printf("Server failed to start: %v\n", err)
	}
}
```

运行 `go build -o myapp_serv` 编译，生成后端服务可执行文件 `myapp_serv`。

```
backend/
├── go.mod
├── main.go
└── myapp_serv
```

## 开发前端页面

你可以自由选择前端框架，如 Vue、React 等，开发你的应用界面。完成开发后，需要将构建产物（HTML、CSS、JS 等）放入应用包中的 `www` 目录。

```
www
├── css
│   └── style.css
├── index.html
└── js
    └── app.js
```

### css/js 文件浏览器缓存处理

系统 web 服务器在响应 css/js 文件时会设置 `Cache-Control` 头允许浏览器缓存。为避免应用新版本发布后用户浏览器仍使用旧版本文件，推荐采用以下其中一种方式处理：

- 文件名哈希，如 `app.a1b2c3d4.js`，修改文件内容时同时修改文件名
- 查询参数携带版本号，如 `app.js?v=1.0.1`，发布新版本时更新版本号

## 创建应用项目

运行 `ugcli create com.mycompany.myapp` 创建应用项目，生成目录结构：

```
com.mycompany.myapp
├── project.yaml                 # 应用配置文件
├── rootfs_amd64                 # x86_64（各产品线共用）
│   └── bin
├── rootfs_arm64                 # arm64（各产品线共用）
│   └── bin
├── rootfs_common                # 各架构共用
│   ├── icon.png                 # 应用图标
│   └── www                      # 应用前端文件
```

## 编写应用配置文件

修改 `project.yaml` 配置应用基本信息。主要配置项：

```yaml
spec_version: "2.1"                     # 配置规范版本
app_id: com.mycompany.myapp             # 应用ID
version: 0.1.0                          # 应用版本号
support_arch:                           # 支持的CPU架构
  - amd64
  - arm64
product_series:                         # 支持的产品线：nasync（NAS）、homeagent（HomeAgent）
  - nasync
start_cmd: bin/myapp_serv --port=21010  # 应用后端服务启动命令
port: 21010                             # 应用后端http服务端口
proxy_path: api                         # 应用后端http服务代理路径
open_type: inner                        # 应用前端页面打开方式
tag_types:                              # 应用类别
  - utility
  - devtool
depend_fw_version: 1.13.0.0000
i18n:                                   # 应用详情页展示信息（多语言）
  en-US:
    name: My APP
    description: My APP Desc
    author: My Company
    official: https://myapp.example.com
    help: https://myapp.example.com/help
    publisher: My Company
    publisher_link: https://mycompany.example.com
  zh-CN:
    name: 演示应用
    description: 演示应用描述
    author: 演示应用开发者
    official: https://myapp.example.com.cn
    help: https://myapp.example.com.cn/help
    publisher: 演示应用发布者
    publisher_link: https://mycompany.example.com.cn
```

## 拷贝应用文件

- 将两种架构的后端服务可执行文件拷贝到对应架构的 rootfs 目录下：amd64 拷贝到 `rootfs_amd64/bin/myapp_serv`；arm64 拷贝到 `rootfs_arm64/bin/myapp_serv`。各产品线默认共用这些目录。仅某条产品线需要不同文件时，再手动创建 `rootfs_{series}` 或 `rootfs_{arch}_{series}` 叠加覆盖。
- 将应用前端文件 www 目录下的文件都拷贝到 `rootfs_common/www` 目录下。

## 制作应用图标

图标制作规范：

- 图标尺寸：256*256 像素
- 图标格式：PNG
- 文件大小：小于 100KB
- 图标背景：白色或者浅色背景加 0.5 粗的 8% 黑描边
- 图标形状：正方形，需要套用平滑圆角模板（https://developer.ugnas.com/icon_template.zip）

## 打包应用

在应用项目根目录下执行 `ugcli pack` 命令打包应用。用于安装测试或上架的安装包应在 Linux 环境中生成。

命令示例：`ugcli pack --build 1`，`--build` 参数为构建号，与 `version`（如 `0.1.0`）组成最终版本号 `0.1.0.0001`。

最终生成的 upk 文件命名格式：`{amd64/arm64}_{nasync|homeagent}_{appid}_{version}.upk`。

打包前请在 `project.yaml` 中用列表声明 `product_series`（`nasync` 和/或 `homeagent`）。未配置或为空时按 `nasync` 处理。要同时上架 NAS 与 HomeAgent，在列表中写上两条后把默认可执行文件放入 `rootfs_{arch}`，再执行 `ugcli pack`（或 `--product-series all`）。
