# 登录认证

> 来源: https://developer.ugnas.com/doc/backend/system-capabilities/login-auth.html

三方应用可以使用系统提供的登录认证能力，实现与系统用户体系的无缝集成。该能力在绿联 NAS 与 HomeAgent 上均可用。应用后端服务可以从通过系统网关服务转发的 HTTP 请求头中获取当前登录用户信息，从而实现认证访问和基于用户的数据隔离。

> **注意**：使用此能力，应用前端页面打开方式需要设置为 `inner`，即应用在 UGOS Pro 系统桌面内以独立窗口方式打开。

## 接入使用

### 1. 应用配置支持

- 配置 `proxy_path` 字段，用于指定后端服务的访问路径前缀。系统网关服务将根据此配置进行请求鉴权，并把鉴权后用户信息设置到请求头中转发到应用后端服务。
- 配置 `open_type` 为 `inner`。

```yaml
port: 21010               # 应用服务端口
proxy_path: api           # 应用后端http服务代理路径前缀
open_type: inner          # 应用前端页面打开方式
```

使用上述示例配置的应用，其前端发起的请求路径如果以 `/api` 开头，则会被系统网关处理并转发到应用后端服务（端口 21010），转发时会在 HTTP 请求头中携带当前登录用户的认证信息。

### 2. 前端集成系统 JSSDK

前端页面需集成 UGOS Core，通过 `getThirdToken` 获取认证 token，并在后端 API 请求中携带该 token。

```javascript
import UGOSCore from '@ugreen-nas/core';
import cloudWindow from '@ugreen-nas/core/cloudWindow';

UGOSCore.init();

let ugToken = null;
async function fetchAPI() {
  try {
    const headers = {};
    if (ugToken) {
      // 请求头中设置认证 token，字段名固定为 Ugreen-Ttk
      headers['Ugreen-Ttk'] = ugToken;
    }
    // 请求应用后端服务，路径前缀需与 proxy_path 字段值保持一致
    const response = await fetch('/api/v1/info', { headers: headers });
    if (!response.ok) {
      throw new Error('网络错误');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

async function init() {
  try {
    const info = await cloudWindow.useCapacity('getThirdToken');
    if (info?.third_token) {
      ugToken = info.third_token;
    }
    await fetchAPI();
  } catch (error) {
    console.log(error);
  }
}

init();
```

### 3. 后端解析用户信息

应用后端需要从 HTTP 请求头中解析系统网关注入的用户信息，用于权限验证和用户识别。

注入的请求头字段包括：

- **Ugreen-User-ID**: 用户 ID
- **Ugreen-User-Name**: 用户名
- **Ugreen-User-Type**: 用户身份（admin: 管理员，users: 普通用户）
