---
id: log
title: 日志
tags: [基本指南, 日志]
---

# 日志

KrossIAM 采用 JSON 格式记录日志，称为结构化日志，这种日志格式可能不便于阅读，但是便于分析。

结构化日志看起来像这样：

```json
{
  "timestamp": "2021-08-08 18:04:14.721",
  "level": "INFO",
  "logger": "io.reflectoring....StructuredLoggingApplication",
  "thread": "main",
  "message": "Started StructuredLoggingApplication ..."
}
```

结构化的日志便于检索，例如与某个请求相关的日志，可以通过`请求ID`来进行过滤，
这可以从繁杂的日志中快速提取需要的信息。

## 日志文件

日志文件的存储路径在配置文件中指定。日志文件会进行回滚，当大于 20M 时，
会生成一个新的日志文件，这可以避免日志文件无限涨大。

## Logtail

前面提到了结构化日志利于分析，分析需要工具，`logtail` 是 KrossIAM
团队开发的日志分析工具，虽然它可以作为通用的工具使用，但其主要的开发目标是用于分析
KrossIAM 的日志。logtail 的项目主页位于：
https://github.com/krossdev/logtail

### 安装 logtail

从下面的地址下载 logtail：

https://github.com/krossdev/logtail

下载完成后，需要安装到 KrossIAM 日志文件所在的机器上，这样 logtail 才能读取到
KrossIAM 的日志文件。

:::warning 警告
logtail 内置提供了基本的 HTTP 认证，这是薄弱的，在实际应用中，你应该使用 KrossIAM
代理来为 logtail 增强认证功能。
:::

### 配置 logtail

### 启动 logtail
