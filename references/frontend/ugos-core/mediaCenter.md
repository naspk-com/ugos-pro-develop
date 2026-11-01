# 媒体管理（mediaCenter）

> 来源: https://developer.ugnas.com/doc/frontend/ugos-core/mediaCenter.html

`mediaCenter` 用于统一注册、查询和控制宿主页面及其直属 CloudWindow iframe 中的原生 `<audio>` / `<video>` 元素。

## 引入

```typescript
import mediaCenter from '@ugreen-nas/core/mediaCenter'
import type {
  MediaElement,
  MediaOperation,
  MediaOperationList,
  MediaType,
} from '@ugreen-nas/core/types'
```

`@ugreen-nas/core/mediaCenter` 导出当前页面的默认实例。不同 iframe 各自持有实例，跨窗口状态与操作由宿主中继；只导入模块不会扫描 DOM，首次调用 `init()` 或 `register()` 时才会启动。

## 基础用法

```typescript
import mediaCenter from '@ugreen-nas/core/mediaCenter'

// 注册当前 document 中已有的 audio 和 video
mediaCenter.init()

// 动态创建的媒体元素需单独注册
const video = document.querySelector('video')
if (video) {
  mediaCenter.register(video)
}

// 获取当前页面及其它直属窗口中的媒体操作代理
for (const operation of mediaCenter.list) {
  console.log(operation.owner, operation.uuid, operation.type)
}
```

任意一个已注册媒体开始播放时，`mediaCenter` 会暂停其它正在播放的已注册媒体。

## MediaCenter API

| API | 类型 | 说明 |
|-----|------|------|
| `init()` | `() => void` | 扫描并注册当前 document 中尚未注册的 `<audio>` / `<video>` |
| `register(element)` | `(element: MediaElement) => string` | 注册当前页面内的媒体元素并返回 UUID；重复注册同一元素时返回原 UUID |
| `remove(element)` | `(element: MediaElement) => boolean` | 注销当前页面注册的元素；成功时返回 `true` |
| `destroy()` | `() => void` | 清理注册、操作代理、监听和通信资源，不删除或修改媒体元素 |
| `list` | `MediaOperationList` | 当前页面及其它直属窗口的操作代理数组快照 |
| `selfList` | `readonly MediaOperation[]` | 当前页面已注册的操作代理数组快照 |

`list` 是扁平数组，每个代理通过 `owner` 标识来源：宿主页面为 `host`，CloudWindow iframe 为其 `winId`（即 `window.name`）。

## MediaOperation API

| 成员 | 类型 | 说明 |
|------|------|------|
| `uuid` | `string` | 媒体本次注册的唯一标识 |
| `owner` | `string` | 所属宿主或 CloudWindow iframe |
| `type` | `'audio' \| 'video'` | 媒体类型 |
| `play()` | `() => Promise<void>` | 开始或恢复播放 |
| `pause()` | `() => Promise<void>` | 暂停并保留当前位置 |
| `stop()` | `() => Promise<void>` | 暂停并将播放位置重置为 `0` |
| `speed` | `number` | 播放倍速；设置值必须为大于 `0` 的有限数值 |
| `duration` | `number` | 媒体总时长（秒），只读 |
| `currentTime` | `number` | 当前播放位置（秒） |
| `poster` | `string \| undefined` | 视频封面地址；音频或未设置时为 `undefined` |

```typescript
const operation = mediaCenter.list.find(item => item.owner === 'player')

if (operation) {
  await operation.pause()
  operation.currentTime = 0
  operation.speed = 1.5
}
```

## 生命周期注意事项

- `init()` 只扫描调用时已经存在的媒体元素，不会持续观察后续 DOM 变化；动态元素请调用 `register()`
- DOM 移除不会自动注销媒体。移除元素前应先调用 `remove(element)`
- CloudWindow 真实关闭时会清理已启动的 `mediaCenter`；隐藏、复用等假关闭不会销毁当前注册
- `list` / `selfList` 每次返回数组快照。媒体移除、iframe 重新加载、窗口关闭或 `destroy()` 后，旧操作代理会失效
- 当前只管理宿主页面及其直属 iframe，不支持多层嵌套 iframe
