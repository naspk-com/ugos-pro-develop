# 测试应用

> 来源: https://developer.ugnas.com/doc/backend/quick-start/testing.html

打包生成的 upk 文件，可以在运行 UGOS Pro 系统的 NAS 或 HomeAgent 设备上（需要先联系绿联云官方为设备获取开发者授权），通过应用中心进行手动安装。

**请安装与设备产品线匹配的包**：`nasync` 用于 NAS，`homeagent` 用于 HomeAgent。交叉安装会失败。

安装完成后，可以在应用中心已安装列表中找到该应用，点击打开应用，进行功能测试。

应用后端服务进程的日志文件位于：

```
/var/packages/com.mycompany.myapp/log/com.mycompany.myapp.log
```

应用进程的标准输出和标准错误也会被重定向到该日志文件。如果应用运行异常，可以通过查看该日志文件来排查问题。
