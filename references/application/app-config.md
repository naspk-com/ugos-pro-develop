# 应用配置

> 来源: https://developer.ugnas.com/doc/backend/application/app-config.html

通过设置 `project.yaml` 中的 `parameters` 字段，可以声明自定义配置项，这些配置项会显示在应用设置页面中，供用户配置。

支持四种类型的配置项：

- 字符串类型（string）
- 数字类型（number）
- 密码类型（password）
- 路径类型（path）

配置示例：

```yaml
parameters:
  - key: ACCOUNT          # 配置项标识
    type: string          # 配置项类型：string / number / path / password
    required: true        # 是否必填
    changeable: true      # 配置后是否支持再修改
    i18n:                 # 配置项展示信息（多语言）
      en-US:
        name: Login Account      # 配置项名称
        description: 6-8 characters  # 配置项描述
      zh-CN:
        name: 登录账号
        description: 长度6-8位
```

配置项的值可以在应用运行时通过环境变量获取，环境变量的名称为配置项的 `key`。

用户可以在应用设置页面中修改配置项的值，修改之后需要重启应用才能生效。如果配置项不支持修改，可以在声明配置项时设置 `changeable` 为 `false`。
