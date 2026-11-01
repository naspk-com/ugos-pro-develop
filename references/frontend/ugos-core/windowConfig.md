# 窗口配置说明

> 来源: https://developer.ugnas.com/doc/frontend/ugos-core/windowConfig.html

## WindowOptions 属性

下列默认值来自管理端内建的 `defaultOptions`；未列「默认值」的项表示合并前无固定默认。

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|:--:|--------|------|
| `width` | number | 见说明 | `800` | 未传宽高时与默认合并为 800×600 |
| `height` | number | 见说明 | `600` | 同上 |
| `belowGroup` | string \| null | 否 | `''` | 从属父窗口的 `name`；`null` 表示不按从属子窗处理 |
| `group` | string | 否 | — | 平级资源组 key |
| `maxCount` | number | 否 | — | 同 `group` 下最大窗口数 |
| `index` | number | 否 | `1` | 窗口层级索引 |
| `anim` | boolean | 否 | `true` | 过渡动画 |
| `shadow` | boolean \| string | 否 | `true` | 窗口阴影 |
| `hideTitle` | boolean | 否 | `false` | 隐藏标题区域 |
| `skipTaskbar` | boolean | 否 | `false` | 不参与任务栏聚合 |
| `data` | any | 否 | — | 打开/激活时下发给子窗口的数据 |
| `x` / `y` | number | 否 | — | 初始坐标 |
| `minWidth` / `minHeight` | number | 否 | `0` | 最小尺寸 |
| `maxWidth` / `maxHeight` | number | 否 | — | 最大尺寸 |
| `headConfig` | HeadConfig | 否 | `{ height: 40 }` | 标题栏区域高度与 Mac/Win 控制条位置 |
| `sandbox` | boolean \| string[] | 否 | `false` | iframe `sandbox` |
| `allow` | boolean \| string[] | 否 | `true` | iframe `allow` |
| `title` | string | 否 | `'cloudWindow'` | 窗口标题 |
| `icon` | LazyIcon | 否 | `''` | 图标；字符串 URL 或 `{ src, loading?, error? }` |
| `showIcon` | boolean | 否 | `true` | 是否显示图标 |
| `frame` | boolean | 否 | `true` | 是否使用内置标题栏框架 |
| `modal` | boolean | 否 | `false` | 模态窗口 |
| `minimizable` | boolean | 否 | `true` | 是否可最小化 |
| `maximizable` | boolean | 否 | `true` | 是否可最大化 |
| `resizable` | boolean | 否 | `true` | 是否可拖拽改尺寸 |
| `alwaysOnTop` | boolean | 否 | `false` | 是否置顶 |
| `color` | string | 否 | — | 标题与按钮等主色 |
| `blurColor` | string | 否 | — | 失焦态颜色 |
| `background` | string | 否 | `'#fff'` | 窗口背景色 |
| `transparent` | boolean | 否 | `false` | 是否透明背景 |
| `help` | string | 否 | `undefined` | 帮助链接 |
| `controlArea` | boolean | 否 | `true` | 顶部可拖拽条 |
| `center` | boolean | 否 | `true` | 初次布局是否居中 |
| `closable` | boolean | 否 | `true` | 是否可关闭 |
| `hideOnClose` | boolean \| number | 否 | `false` | 假关闭：`true` 一直缓存，`number` 按秒自动回收 |
| `movable` | boolean | 否 | `true` | 是否允许拖动窗口 |
| `radius` | number | 否 | `12` | 圆角像素 |
| `show` | boolean | 否 | `true` | 创建后是否可见 |

## 类型定义

### LazyIcon

```typescript
type LazyIcon =
  | string
  | {
      src: string
      loading?: string
      error?: string
    }
```

### HeadConfig

```typescript
interface HeadConfig {
  height: number    // 头部高度，默认 40
  macX?: number     // Mac 操作区域（红绿灯）的 x
  macY?: number     // Mac 操作区域（红绿灯）的 y
  winY?: number     // Windows 操作区域的 y（不支持单独配置 x）
}
```

## 补充说明

- 创建窗口时还需额外传 `name` 和 `url`，它们不属于 `WindowOptions` 字段。
- `hideOnClose` 支持三种语义：`false` 为真实关闭、`true` 为隐藏保活、`number` 为隐藏后按秒数自动回收。
- 运行时 `show: false` 只对 `hideOnClose` 窗口真正生效；普通窗口的隐藏更新会被宿主忽略。
- `parentNode` 只决定宿主挂载位置，不会进入窗口侧运行时配置；`createSubWin()` 会主动忽略它。
- `safeArea` 指宿主全局配置 `cloudWindowMgr.safeArea`，不是单窗口字段。
