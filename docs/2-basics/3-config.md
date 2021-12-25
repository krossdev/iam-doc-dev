---
id: config
title: 配置
tags: [基本指南, 配置]
---

# 配置

启动 KrossIAM 需要一个 `yaml` 格式的配置文件，可以使用 `-c` 选项指定配置文件路径，
例如下面的命令从 `/etc/kiam-conf.yaml` 文件读取配置信息：

```shell
kiam -c /etc/kiam-conf.yaml
```

## 文件格式

配置文件采用 `yaml` 格式。

## 配置选项

### debug
```
boolean，可以为 true 或 false
```

这个选项控制是否开启调试模式，所谓调试模式是指程序在运行时输出更多信息，
方便开发人员观察和跟踪系统是否按照预期的设计运行。在实际使用时将这个选项设置为 `false`，
一方面可以提高系统的性能，另一方面可以防止输出敏感的的信息。

### webdir

类型：`string`

### proxy

类型：`boolean`，可以为 `true` 或 `false`

### log

这是一个 Object，里面包含配置子项。

#### log.path

类型：`string`

## 配置文件参考

```yaml title='config.yaml'
# Debug mode or not
#
debug: true

# Web front-end static file directory, default is './web'
#
webdir: ./web

# Proxy mode
# Whether app is running behind a reverse proxy or not
#
proxy: false

# Log parameters
#
log:
  # Where to save log file(it's a path name, not filename)
  #
  path: /tmp

  # Airbrake hook configuration, comment to disable it
  # https://airbrake.io
  #
  # pid is project id(integer number), and key is project key,
  # you can get them from your airbrade account
  #
  airbrake:
    pid: project-id
    key: project-key

# Http server options
#
server:
  # Server http(s) url(with port), like http://localhost:3100
  # when output url link to this server(like url in email),
  # will use this option
  #
  # If this option is empty, the url will be contract from below 3 options:
  # secure, domains, bind
  #
  # httpurl = (secure ? https : http) :// (domains[0]) : (bind port)
  #
  httpurl: http://localhost

  # Server binding address, like 'host:8080' or ':8080'
  # Optionally, if missing, will bind protocol default port and
  # all network interface(0.0.0.0)
  #
  bind: :18080

  # Enable TLS(https) or not
  # DON'T set secure=false in production environment
  #
  secure: false

  # Automatic manage TLS cert
  # If this is true, 'tls_key' and 'tls_cert' will be ignore.
  #
  autotls: false
  domains: [ localhost, kross.work ]

  # TLS key and cert file, only apply when 'autotls' is false
  #
  # tlscrt: pub.pem
  # tlskey: private.key

# Database options
#
database:
  # Database driver, suuport sqlite, pgx(postgresql), mysql
  #
  # driver: sqlite
  # driver: mysql
  driver: pgx

  # Data Source Name, see driver document for driver-specific syntax
  #
  # dsn: /tmp/dumb.sqlite?share_mode=true&mode=rw
  # dsn: root@tcp(localhost)/?parseTime=true&clientFoundRows=true
  dsn: postgres://localhost/demo
  # dsn: postgres://root@localhost:26257/defaultdb

# Message service
#
ms:
  # Message broker(nats) connection url(s), see:
  # https://github.com/nats-io/nats.go
  #
  brokers:
    - nats://localhost
```
