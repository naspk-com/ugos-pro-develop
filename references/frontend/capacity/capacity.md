# 桌面开放能力调用说明

> 来源: https://developer.ugnas.com/doc/frontend/capacity/capacity.html

## 概述

应用能力调用是 UGOS 桌面系统提供的一套标准化公共能力接口，允许各个应用通过统一的方式调用桌面级的功能和服务。这些能力包括文件操作、任务中心、系统信息获取、用户界面交互等。

## 模块来源

- **调用模块**：`cloudWindow`（来自 `ugos-core`）

## 支持环境

能力标题后的标签表示该能力正式支持的调用环境：

- Web：通过浏览器访问 UGOS 桌面的运行环境
- PC：Windows、macOS 和鸿蒙 PC 客户端

未显示某个环境标签，表示该能力不支持该环境。

## 核心特性

- **标准化接口**：所有能力调用均采用统一的 Promise 方式
- **类型安全**：提供完整的 TypeScript 类型定义
- **错误处理**：统一的错误处理机制
- **跨应用通信**：支持应用间的能力共享

## 基本使用

```typescript
import cloudWindow from '@ugreen-nas/core/cloudWindow'

// 基本调用模式
cloudWindow.useCapacity(能力名称, { /* 参数 */ })
  .then((result) => console.log('调用成功:', result))
  .catch((error) => console.error('调用失败:', error))

// 使用 async/await
async function callCapacity() {
  try {
    const result = await cloudWindow.useCapacity(能力名称, { /* 参数 */ })
    console.log('调用成功:', result)
  } catch (error) {
    console.error('调用失败:', error)
  }
}
```

## 基础能力

### `openApp`（Web PC）

通过 appId 打开应用或者链接，支持 Docker 应用等。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:--:|------|
| `appId` | string | 是 | 应用 ID |
| `data` | any | 否 | 传递给应用的数据；`data.routerParamsPath` 为字符串时会拼接到窗口 URL 后面 |
| `config` | cloudWindowConfig | 否 | 自定义窗口配置 |
| `noAssembly` | boolean | 否 | 控制是否组 data 包裹 |

### `addApiEncryptIgnore`（Web PC）

添加包体加密 uglink 多通道白名单。参数 `string[]`（白名单接口路径列表），返回 `boolean`（`false` 表示已存在）。

### `openAppCenterDetail`（Web PC）

打开应用中心管理/详情。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:--:|------|
| `appId` | string | 否 | 默认取调用方应用 ID |
| `appCenterType` | — | 是 | 应用中心类型 |

## 令牌相关

### `getThirdToken`（Web PC）

获取与账号/用户配置相关的第三方令牌及展示类配置。参数无。

返回字段：

| 字段 | 说明 |
|------|------|
| `dateFormat` | 用户日期格式 |
| `timeFormat` | 用户时间格式 |
| `temperatureUnit` | 温度单位 |
| `third_token` | 本地配置的 third_token |
| `lang` | 当前 `i18n.locale` |

```typescript
await cloudWindow.useCapacity('getThirdToken')
```

## 文件操作

### `getLocalPath`（PC）

获取本地路径子目录。参数：目录路径（string），返回子目录列表。

### `openLocalPath`（PC）

打开本地路径。

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|:--:|------|
| `path` | string | 是 | 本地路径 |
| `openType` | `'openPath' \| 'showFile'` | 是 | `'openPath'` 直接打开；`'showFile'` 在文件管理器中显示 |

也可直接传入路径字符串（不传 `openType`）。返回 `boolean`。

## 系统信息

### `getComputerUserFolder`（PC）

获取本地电脑当前用户文件夹路径。返回用户主目录路径（string）。

### `getComputerName`（PC）

获取计算机名称。返回计算机名称（string）。

### `getDeviceLocation`（Web PC）

获取设备位置。返回设备位置（string），默认为 `'China'`。

### `checkComputerPathExists`（PC）

检查计算机路径是否存在。参数 `{ path }`，返回 `boolean`。

## 实用示例

### 打开其他应用并传递数据

```typescript
async function openFileManager(path: string) {
  try {
    const result = await cloudWindow.useCapacity('openApp', {
      appId: 'com.ugreen.filemgr',
      data: { filePathOpen: path }
    })
    console.log('文件管理器已打开')
  } catch (error) {
    console.error('打开失败:', error)
  }
}
```

### 获取令牌

```typescript
async function fetchNasData(endpoint: string) {
  try {
    const token = await cloudWindow.useCapacity('getThirdToken')
  } catch (error) {
    console.error('获取失败:', error)
    throw error
  }
}
```

## 注意事项

1. **权限检查**：某些能力需要特定的权限，调用前请确保应用具有相应权限
2. **错误处理**：始终使用 try-catch 或 `.catch()` 处理可能的错误
3. **超时控制**：可以通过第三个参数设置超时时间
4. **类型安全**：建议使用 TypeScript 并导入正确的类型定义
5. **平台兼容**：以各能力标题后的环境标签为准；未标注的环境表示不支持
6. **版本依赖**：某些新增能力需要特定版本的客户端/固件支持
