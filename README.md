# ugos-pro-develop

> 绿联云（UGREEN NAS / UGOS Pro / HomeAgent）应用开发 Skill

一个面向 AI Agent 的标准 Skill 库，为绿联 UGOS Pro 系统的应用开发提供完整参考。当需要开发、打包、上架 UGOS Pro 系统的**原生应用**或 **Docker 应用**时使用。

## 覆盖内容

- **开发工具**：`ugcli` 命令行工具、`project.yaml` 配置文件完整字段
- **应用架构**：产品线分发（NAS / HomeAgent）、安装目录、运行环境、端口、启停、打开方式
- **系统能力**：NAS 用户登录认证
- **前端开发**：UGOS Core SDK（窗口管理 / 媒体 / 快捷键）、桌面开放能力、builder-open 构建工具
- **上架流程**：发布流程、开发者身份审核

## 目录结构

```
ugos-pro-develop/
├── SKILL.md                  # 技能主文件（核心流程 + 约束，渐进式披露）
├── references/               # 参考文档（按官方目录结构组织，按需加载）
│   ├── README.md             #   参考文档索引
│   ├── flow.md               #   应用上架流程
│   ├── quick-start/          #   快速开始（准备/原生/Docker/测试/发布/示例）
│   ├── application/          #   应用架构（产品线/目录/环境/端口/启停/配置/打开方式）
│   ├── system-capabilities/  #   系统能力（登录认证）
│   ├── tools/                #   开发工具（ugcli / project.yaml）
│   ├── frontend/             #   前端开发（UGOS Core / builder-open / 能力 / 示例）
│   └── review/               #   管理规则（开发者身份审核）
├── assets/                   # 内置示例项目（可直接复制使用的样板代码）
│   └── examples/
│       ├── vue-demo/         #   Vite 8 + Vue 3 前端示例
│       ├── react-demo/       #   Vite 8 + React 19 前端示例
│       └── ugnas-reader/     #   完整原生应用示例（Go 后端 + React 前端）
├── LICENSE
└── README.md
```

## 说明

- 数据来源：https://developer.ugnas.com/ （抓取日期 2026-11-01）
- 符合 WorkBuddy 标准 Skill 库结构：`SKILL.md`（含 frontmatter）+ `references/`（按需加载参考文档）+ `assets/`（示例样板）
- 版本管理使用 Git 标签（tag）
