# UGOS Core

> 来源: https://developer.ugnas.com/doc/frontend/ugos-core/install.html
> UGOS Pro 套件前端 SDK

## 安装

```bash
npm i @ugreen-nas/core
# yarn
yarn add @ugreen-nas/core
# pnpm
pnpm add @ugreen-nas/core
```

## 快速开始

### 1. 初始化

```javascript
import UGOSCore from "@ugreen-nas/core"

// 初始化所有 UGOS 模块（必须执行）
UGOSCore.init()
```

### 2. 按需导入

ugos-core 支持按需导入不同的功能模块：

```javascript
// 窗口管理
import cloudWindow from "@ugreen-nas/core/cloudWindow"

// 跨窗口媒体管理
import mediaCenter from "@ugreen-nas/core/mediaCenter"
```

## 基础样式

**盒模型规范**：所有元素统一使用 `box-sizing: border-box`，确保宽高计算包含 padding 和 border。

**焦点状态**：移除 `focus-visible` 时的默认轮廓线。

**图片处理**：
- 禁止图片拖拽（`-webkit-user-drag: none`）
- 禁止图片选中（`user-select: none`）

## 文档导航

- [窗口管理](cloudWindow.md) - cloudWindow 详细文档
- [媒体管理](mediaCenter.md) - 跨窗口音视频管理说明
- [快捷键](keyboardControl.md) - 快捷键系统使用说明
