# 键盘快捷键（KeyboardControl）

> 来源: https://developer.ugnas.com/doc/frontend/ugos-core/keyboardControl.html

## 概述

`KeyboardControl` 用于在页面内注册键盘快捷键、监听按键与组合键，并支持在套件环境下触发全局快捷键。

## 引入使用

```typescript
import { KeyboardControl } from '@ugreen-nas/core/plugins'
```

## DefineKeyAction 项说明

每条快捷键配置为对象，除下表外还可通过索引签名扩展自定义字段。

| 属性名 | 类型 | 必填 | 说明 |
|--------|------|:--:|------|
| `key` | string | 是 | 快捷键定义，组合键用 `+` 连接，如 `ctrl+a`；`+` 前后不要有空格 |
| `action` | string | 否 | 触发时回调中标识该条动作；与 `command` 二选一即可 |
| `command` | string | 否 | 同 `action`，语义别名 |
| `disabled` | boolean | 否 | 为 `true` 时不注册该条 |
| `hidden` | boolean | 否 | 为 `true` 时不注册该条 |
| `longPress` | number | 否 | 长按触发时间，单位：秒 |
| `immediately` | boolean | 否 | 为 `true` 时支持组合键连续触发 |
| `global` | boolean | 否 | 为 `true` 时注册为跨 iframe 全局快捷键；仅当环境为应用托盘/卡片时生效 |

## 构造

```typescript
new KeyboardControl(defineAction, enableInFormElements?, triggerInterval?)
```

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|:--:|--------|------|
| `defineAction` | `DefineKeyAction[]` | 是 | — | 快捷键定义数组 |
| `enableInFormElements` | boolean | 否 | `true` | 为 `true` 时在 `input`、`textarea` 等表单控件内也会响应快捷键 |
| `triggerInterval` | number | 否 | `300` | 按键触发最小间隔（毫秒） |

## 静态方法

### `haveGlobalKey(key)`

查询某组合键字符串是否已存在于全局快捷键表。参数 `key` 需与内部规范化后的组合键一致（如小写、`ctrl`/`meta` 等规则）。返回 `boolean`。

## 实例方法

| 方法 | 说明 |
|------|------|
| `destroy()` | 移除快捷键监听，并清理本实例注册的全局快捷键项 |
| `updateKeyMap(defineAction?)` | 用新的定义数组更新快捷键；不传则不会更新 |
| `setTriggerInterval(interval)` | 设置按键触发时间间隔（毫秒） |
| `syncRemoteGlobalKeys(keys)` | 同步宿主下发的全局快捷键键表 |

## Getter / Setter

### `beforeHandle`（setter）

设置快捷键触发前的拦截条件；若返回 `true`，则不触发本次快捷键逻辑。

```typescript
kb.beforeHandle = () => { /* 返回 true 表示拦截 */ }
```

## 事件

| 事件 | 说明 |
|------|------|
| `action` | 识别到已注册的快捷键时触发（回调 `(action, event)`） |
| `keyPress` | 有按键参与本次逻辑时触发（回调 `(event)`） |
| `keyEvent` | 任意按键按下或松开时触发（回调 `(event, type)`，type 为 `'up'`/`'down'`） |
| `debug` | 调试：输出当前规范化后的组合键字符串（回调 `(press)`） |

## 全局快捷键（跨 iframe）

在微前端多套件（多 iframe）环境下，可将部分快捷键设为全局：当其他 iframe 未定义同键时，由注册方响应。

使用条件：
- 在对应项上设置 `global: true`
- 注册环境为应用托盘/卡片

行为说明：
- 当前 iframe 内若已定义同键，本地优先，不会落到全局
- 宿主侧会将当前快捷键表同步给子窗口
- `destroy()`、`updateKeyMap()` 会清理本实例注册的全局项；套件关闭时务必调用 `destroy()`

```typescript
const kb = new KeyboardControl([
  { key: 'Ctrl+S', action: 'save' },
  { key: 'ArrowLeft', action: 'globalLeft', global: true },
])

kb.on('action', (action, event) => {
  if (action === 'globalLeft') { /* ... */ }
})

kb.destroy()
```

## 按键定义

### 基本规则

1. 键名不区分大小写，内部会转为小写处理
2. 组合键使用 `+` 连接，如 `ctrl+a`
3. 可定义多修饰键组合，如 `ctrl+shift+a`
4. `+` 前后不能有空格

### 修饰键

| 键名 | 说明 | 平台差异 |
|------|------|----------|
| `ctrl` | Control | Mac 上自动转换为 Command（`meta`） |
| `alt` | Alt | Mac 上对应 Option |
| `option` | Option | 转为 `alt`，仅 Mac 有效 |
| `shift` | Shift | 通用 |
| `meta` | Meta | Windows 为 Win 键，Mac 为 Command；非 Mac 自动转为 `ctrl` |
| `command` | Command | 转为 `meta`（Mac）或 `ctrl`（非 Mac） |

### 特殊键

| 键名 | 对应按键 | 备注 |
|------|----------|------|
| `space` | 空格 | 不能使用空格字符本身 |
| `enter` | 回车 | |
| `tab` | Tab | |
| `esc` | Esc | 会转为 `escape` |
| `escape` | Esc | 完整写法 |
| `backspace` | 退格 | |
| `delete` | Delete | |

### 方向键

| 键名 | 对应按键 |
|------|----------|
| `arrowup` | 上 |
| `arrowdown` | 下 |
| `arrowleft` | 左 |
| `arrowright` | 右 |

### 功能键

| 键名 | 对应按键 |
|------|----------|
| `f1` - `f12` | F1 - F12 |

## 示例

### 定义与监听

```typescript
const keyboardControl = new KeyboardControl([
  { key: 'Ctrl+c', action: 'copy', disabled: true },
  { key: 'Shift+c', action: 'custom', hidden: true },
  { key: 'Ctrl+v', action: 'paste' },
])

keyboardControl.on('action', (action, event) => { /* ... */ })

keyboardControl.destroy()
```

### immediately 场景

按住 Ctrl 不松开的情况下，连续按 C/V 分别触发对应事件。使用此配置时，内部节流中会自动阻止默认行为。

```typescript
const keyboardControl = new KeyboardControl([
  { key: 'Ctrl+c', action: 'copy', immediately: true },
  { key: 'Ctrl+v', action: 'custom', immediately: true },
])
```

## 注意事项

- 在 macOS 下，`Ctrl` 会按实现转换为 Command
- 配置 `longPress`（长按）时：满足长按条件触发一次 `action`（事件类型可能为 `longKeydown`）；未满足长按但在 `keyup` 时仍触发一次 `action`（`event.type` 为 `keyup`）
- 使用 `global: true` 时需确保当前环境为应用托盘/卡片，否则不会注册到全局表
