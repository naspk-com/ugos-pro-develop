# ugnas-reader

绿联云（UGOS Pro）NAS 上的电子书阅读器。当前阶段：**MVP 脚手架已就绪**（后端 + 前端最小可跑），下一步实现 TXT 库扫描与阅读器视图。

> 平台细节、约束与待决策见 [AGENTS.md](AGENTS.md)。

## 目标

把电子书 / 文档放在 UGREEN NAS 上，通过 UGOS 桌面或浏览器进行集中阅读、管理与多端同步：

- 当前阶段仅支持 TXT（编码识别、章节正则、进度同步）
- 后续支持 EPUB / PDF / MOBI / CBZ
- 直接读 NAS 上用户授权的书库目录，零搬运
- 复用 NAS 系统登录态，零账号系统
- 跨设备同步阅读进度与书签

## 仓库结构

```
ugnas-reader/
├── project.yaml             # UGOS 应用配置（app_id: com.leafvmaple.ugnasreader）
├── backend/                 # Go HTTP 后端
│   ├── go.mod
│   ├── cmd/ugnas_reader/    # 入口
│   └── internal/server/     # 路由与服务
├── frontend/                # Vite + React + TS
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── rootfs_amd64/bin/        # 后端二进制 (linux/amd64)（被 .gitignore）
├── rootfs_arm64/bin/        # 后端二进制 (linux/arm64)（被 .gitignore）
├── rootfs_common/
│   ├── icon.png             # 占位图标，256×256，后续替换
│   └── www/                 # 前端 build 产物（被 .gitignore）
├── scripts/build.ps1        # 一键 build 脚本
└── tools/ugcli.exe          # 绿联打包工具（被 .gitignore）
```

## 平台

- 系统：UGOS Pro ≥ 1.13.0.0000
- 架构：amd64 + arm64
- 应用形态：原生应用（`open_type: inner`，`port: 21010`，`proxy_path: api`）

## 本地开发

### 环境要求

- Go 1.22+
- Node 22+ / pnpm 11+
- ugcli（已放在 `tools/ugcli.exe`）

### 后端

```shell
cd backend
go build -o ugnas_reader.exe ./cmd/ugnas_reader
./ugnas_reader.exe --port=21010
```

健康检查：

- `GET /api/v1/health` → `{"status":"ok"}`
- `GET /api/v1/info` → 回显 `Ugreen-User-*` 请求头 + 版本信息

### 前端

```shell
cd frontend
pnpm install
pnpm dev          # http://localhost:5173 ， /api/* 自动代理到 127.0.0.1:21010
pnpm build        # 输出到 rootfs_common/www
pnpm typecheck
```

> 前端 `App.tsx` 启动时尝试 `cloudWindow.useCapacity('getThirdToken')`，在 UGOS 壳外（dev 浏览器）会失败，UI 会标注"无 token / dev 模式"，不阻塞页面渲染。

## 一键开发 / 打包

```powershell
# 起一对前后端 dev 服务（后端用 .testdata/library 作为示例书库）
pwsh scripts/dev.ps1
# → 后端: http://127.0.0.1:21010   前端: http://localhost:5173

# build + 校验
pwsh scripts/build.ps1 -Check          # 三件套 build + ugcli check
pwsh scripts/build.ps1 -Pack 1         # 顺手打 upk（build number = 1）
```

`.testdata/library` 里放了 4 个测试 txt（UTF-8 BOM / UTF-8 / GBK / 无章节），dev 模式打开浏览器即可看到书架。

产物：`build_dir/pkgs/upk/{arch}_com.leafvmaple.ugnasreader_0.1.0.{N}.upk`

## 当前进度

- ✅ UGOS 应用骨架（`project.yaml` + rootfs_*）
- ✅ Go 后端：`/api/v1/info`、`/api/v1/health`、SIGTERM 优雅退出（8s 内）
- ✅ Linux amd64 + arm64 交叉编译（含 SQLite）
- ✅ Vite + React 前端，首页可拿 token 并渲染 `/api/v1/info` 结果
- ✅ `ugcli check` 通过
- ✅ SQLite + 书库目录扫描 + TXT 元数据
  - `LIBRARY_PATH` 自动 seed 到 `library_folders`
  - 编码识别：UTF-8 BOM / UTF-16 BOM / chardet / 纯 ASCII 短路 / GB18030 兜底
  - 章节正则解析（中文 `第X章/节/回/卷` + `Chapter N`），无标记时合成 "正文"
  - REST: `library/folders` (CRUD) · `library/scan` · `books` · `books/{id}` · `books/{id}/content?from=&len=` · `progress/{book_id}` (GET/PUT，含 stale-write 409 + 多用户隔离)
- ✅ 阅读器 MVP
  - 书架页：继续阅读卡片 + 列表（书名/作者/字数/章节数/编码/进度条）+ 搜索/排序/扫描
  - 阅读器：滚动阅读 + 章节抽屉（可点跳转）+ 设置抽屉（4 主题 × 4 档字号）+ 顶部章节标题
  - 进度自动同步（节流 5s + 关闭页面 `keepalive` flush + 409 时采用服务端位置）
  - 键盘：←/→/PageUp/PageDown/Space 翻屏 · Home/End 头尾 · Esc 返回 / 关抽屉
  - 设置持久化到 localStorage

## License

待定。
