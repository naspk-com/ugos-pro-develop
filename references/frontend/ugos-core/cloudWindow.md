# cloudWindow 窗口管理

> 来源: https://developer.ugnas.com/doc/frontend/ugos-core/cloudWindow.html

`cloudWindow` 用于管理窗口自身，提供相关 API 用于管理、获取窗口状态、通信等。

**引入方式**：

```typescript
import cloudWindow from '@ugreen-nas/core/cloudWindow'
```

## 静态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `cloudWindow.winId` | `string` | 当前窗口的唯一 ID（只读） |
| `cloudWindow.isNative` | `boolean` | 当前页面是否为由 UGOS Core 管理的 Electron 独立原生窗口（只读） |

## 窗口事件（共 25 个）

### 加载相关

| 事件名 | 触发时机 |
|--------|----------|
| `load-finish` | 窗口加载成功时（回调 `url`） |
| `load-error` | 窗口加载失败时（回调 `url`） |

### 焦点相关

| 事件名 | 触发时机 |
|--------|----------|
| `focus` | 窗口获得焦点时 |
| `blur` | 窗口失去焦点时 |

### 移动/尺寸相关

| 事件名 | 触发时机 |
|--------|----------|
| `move` | 窗口移动结束（回调 `x, y, width, height`） |
| `moving` | 窗口正在移动（持续触发） |
| `resizing` | 窗口正在调整大小（持续触发） |
| `resize` | 窗口调整完大小 |
| `maximize` | 窗口最大化 |
| `un-maximize` | 窗口退出最大化 |
| `minimize` | 窗口最小化 |
| `restore` | 窗口从最小化恢复 |

### 关闭相关

| 事件名 | 触发时机 |
|--------|----------|
| `close` | 窗口关闭后触发（回调 `{ fake }`，`fake === true` 表示假关闭） |
| `before-close` | 窗口关闭前触发，支持 `preventDefault()` 阻止关闭 |

### 状态变更

| 事件名 | 触发时机 |
|--------|----------|
| `hostChange` | 请求的 BaseUrl 发生改变时 |
| `always-on-top-changed` | 窗口置顶状态变更时（回调 `value`） |
| `mouse-enter` / `mouse-leave` | 鼠标移入/移出窗口时 |
| `before-help` | 点击顶部帮助按钮时，支持 `preventDefault` |

### 显示/隐藏相关

| 事件名 | 触发时机 |
|--------|----------|
| `before-show` | 窗口在保活模式下被激活（显示前） |
| `show` | 窗口被显示时 |
| `hide` | 窗口被隐藏时 |
| `will-show` | 窗口从隐藏变为显示前，可 `preventDefault()` 阻止 |

### 通信事件

| 事件名 | 触发时机 |
|--------|----------|
| `message` | 其他窗口通过 `sendTo` 或桌面通过 `send` 发送消息时（回调 `data, from`） |
| `wsData` | 桌面 WebSocket 下行触发时（回调 `data`） |

## 拖拽事件

基于 HTML5 Drag and Drop API，支持从本地拖拽文件到窗口、跨窗口拖拽、从浏览器拖拽内容到窗口等场景。

| 事件名 | 触发时机 |
|--------|----------|
| `dragEnter` | 拖拽进入窗口时 |
| `dragOver` | 拖拽在窗口上移动时（持续触发） |
| `dragEnd` | 拖拽在窗口上释放（drop）时 |
| `dragLeave` | 拖拽离开窗口时 |

## 方法（完整 API 列表）

### 子窗口

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `createSubWin(config)` | 创建子窗口；仅此方法额外支持 `reload?: boolean` | `Promise<string>`（子窗口 name） |

### 窗口尺寸与位置

| 方法 | 说明 |
|------|------|
| `getSize()` | 获取窗口大小 → `Promise<{width, height}>` |
| `setSize(w, h)` | 设置窗口宽高，若最大化则取消最大化 |
| `getSizeInfo()` | 获取窗口完整尺寸信息 → `Promise<SizeInfo>` |
| `setMinSize(w, h)` | 设置窗口最小宽高 |
| `setMaximumSize(w, h)` | 设置窗口最大尺寸，设为 0 或负数表示无限制 |
| `getPosition()` | 获取窗口位置 → `Promise<{x, y}>` |
| `setPosition(x, y)` | 设置窗口位置 |
| `center()` | 居中定位窗口 |
| `getRelativePos(event, offset?, reserve?)` | 获取相对整个系统的坐标 |

### 窗口状态

| 方法 | 说明 |
|------|------|
| `maximize()` / `unmaximize()` / `isMaximized()` | 最大化操作 |
| `minimize()` / `isMinimized()` | 最小化操作 |
| `restore()` | 将窗口置于顶层并取消最小化 |
| `show()` / `hide()` / `isVisible()` | 显示/隐藏 |

### 窗口控制

| 方法 | 说明 |
|------|------|
| `close()` | 关闭当前窗口 |
| `loadUrl(url)` | 设置当前窗口的 URL |
| `damaged()` | 标记窗口为已损坏，关闭时强制真实销毁 |
| `setMovable(state)` / `setResizable(resizable)` | 设置可移动/可调大小 |
| `setMinimizable(open)` / `setMaximizable(open)` / `setClosable(closeable)` | 设置窗口按钮 |
| `setAlwaysOnTop(val)` / `isAlwaysOnTop()` | 置顶 |
| `focus()` / `blur()` / `isFocus()` | 焦点 |

### 窗口外观

| 方法 | 说明 |
|------|------|
| `getTitle()` / `setTitle(title)` | 标题（桌面端无法调用 setTitle） |
| `getIcon()` / `setIcon(url)` | 图标 |
| `setBackgroundColor(color)` | 背景色（`transparent` 表示透明） |
| `setShadowColor(color)` | 阴影 |
| `setRadius(radius)` | 圆角大小 |
| `setStyle(obj)` | 自定义样式 |
| `registerHeader(handle, focus?)` | 注册自定义标题栏（强制 `frame=false`） |
| `setActionPosition(y, x?)` | 自定义窗口操作按钮位置 |
| `setActionVisible(actionRange, state)` | 控制顶部操作按钮显示/隐藏 |
| `setHelpInfo(info)` | 更新顶部帮助按钮配置 |
| `setSkipTaskbar(skip)` | 设置是否参与任务栏聚合 |

### 消息与事件通信

| 方法 | 说明 |
|------|------|
| `listenWindowData(callback)` | 监听宿主注入的数据 |
| `send(data, event?)` | 发送数据到顶层（桌面接收） |
| `sendEvent(event, data?)` | 发送事件到顶层 |
| `sendTo(winId, data?, event?)` | 发送数据到指定窗口 |
| `sendEventTo(winId, event, data?)` | 发送事件到指定窗口 |
| `subMessage(winId, event, data?, timeout?)` | 向指定窗口发起点对点请求 |
| `onSubMessage(listener)` | 监听其他窗口发起的点对点请求 |
| `sendEventToGroup(group, event, data?)` | 发送事件给一组窗口 |
| `sendEventToMyGroup(event, data?)` | 发送事件给当前窗口所在组 |
| `useCapacity(capName, data?, timeout?)` | 调用桌面开放能力 |

### 窗口组

| 方法 | 说明 |
|------|------|
| `getGroup()` | 获取窗口所属的组 |
| `getGroupList()` | 获取同组所有窗口名称（不含当前窗口） |
| `getGroupPosition()` | 获取当前窗口在同组成员列表中的索引 |
| `queryIsExist(group, winName)` | 查询指定组中是否存在指定名称的窗口 |

## 消息通信说明

- `send(data, event)` / `sendTo(winId, data, event)`：普通消息，目标窗口通过 `on('message')` 接收；`event` 为空时通过 `message` 事件接收，不为空时通过同名自定义事件接收
- `subMessage` / `onSubMessage`：独立点对点请求响应通道，不触发 `message` 事件
- 自定义事件名不能与框架内置事件名（`load-finish`、`close`、`focus` 等）冲突
