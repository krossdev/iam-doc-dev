---
slug: kiam-datastore
title: KrossIAM 后台数据存储
authors: krossdev
tags: [kross iam, database, store]
---

## 介绍

KrossIAM 采用 SQL 数据库存储帐号信息，当前支持 `PostgreSQL`，`MySQL`、`CockroachDB`、
`Sqlite` 数据库。

对于只想体验一下 KrossIAM 的用户，使用 `Sqlite` 存储是个不错的选择，当然也可以在正式环境中采用
`Sqlite` 存储，但通常不建议这么做，尤其在并发比较大的情况下。

<!--truncate-->

## 几个要点

在考虑数据存储时，需要考虑几个点：

- 数据隔离
- 数据表结构变化（升级）
- 水平扩展、负载均衡
- 数据库备份

### 数据隔离

KrossIAM 支持多`Realm`，这相当于在单个KrossIAM实例中为多个业务系统提供隔离的身份管理能力，
而不用启动多个 KrossIAM 实例，这样便于管理和维护。

举个例子，某公司有 3 套独立的业务系统，这些业务系统之间本质上是完全独立的，使用KrossIAM有2种方案，
一种是部署 3 个 KrossIAM 实例，每套业务系统使用专属的，另外一种方案是部署 1 个 KrossIAM 实例，
在其中创建 3 个 `Realm`，然后每个业务系统使用独立的 `Realm`。

选择哪种方案根据具体情况而定，但是如果是集中部署的情况下，例如 SaaS 服务商，推荐部署单个 KrossIAM
实例，因为这样可以集中管理，集中维护。

Realm 之间的数据在逻辑上是完全隔离的，KrossIAM 采用数据库 `schema` 来划分 Realm，
每个 Realm 对应一个数据库 schema，当然各个数据库对 schema 的支持不尽相同，对于
`PostgreSQL` 和 `CockroachDB`，schema 是数据库中的一个子集，对于 `MySQL`，schema
基本上和数据库等价，创建一个 schema 就等于创建了一个数据库，对于 `Sqlite`，
这是一个基于文件的数据库，每个文件就是一个数据库，要使用 schema，需要先创建一个新的数据库，
然后将新数据库作为 schema `attach` 到主数据库使用。

虽然数据库的实现方式和语义不同，但是在数据层面上，数据在逻辑上是隔离的。访问 A Realm
中的数据不会访问到 B Realm 中，如果为每个 Realm 设置访问权限，这种情况更加不会发生。

### 数据表结构变化（升级）

KrossIAM 会推出新的版本，可能存在升级新版本需要调整数据表结构的情况，例如 KrossIAM
的新版本增加了某个功能，需要增加一个数据表字段来支持新功能。

手动去修改表结构是非常危险的，即使对于有经验的数据库管理员也是如此，因为新版本需要增加哪些字段、
这些字段的名称、类型是什么，如果现有系统已经有多个 Realm，那么每个 Realm 都需要更新，这些
Realm 的名称又是什么，等等诸多问题。

KrossIAM 提供数据库迁移（migrate）功能，这是一个基于 `golang migrate` 的扩展版本，
针对 KrossIAM 的多 Realm 进行了扩展，KrossIAM 支持的数据库都可以使用这个迁移工具进行升级。
KrossIAM 在发布新版本的时候，会附带上最新的迁移文件。

### 水平扩展、负载均衡

KrossIAM 本身是支持水平扩展的，但是没有内置负载均衡功能，但是有许多负载均衡工具可以使用，
例如 `Nginx`、`Evnoy`，等等，所以将来 KrossIAM 本身也不会考虑内置负载均衡功能，
尤其是 KrossIAM 支持在 `Kubenetes` 环境中运行后。

后端的数据存储也需要水平扩展和负载均衡，这个能力由数据库提供，
有些数据库可能比另外的数据库更加适合水平扩展和负载均衡，请认真评估各数据库，做出合适的选择。

通常来说，如果认真对待的话，在特定场景下，某个数据库会比其它的数据库更合适，但这不是绝对的，
需要区分场景。KrossIAM 将来会支持更多的数据库，以给用户提供更多的选择。

### 数据库备份

KrossIAM 目前没有提供任何数据备份方面的支持，但是有很多已经存在的工具可以用，将来 KrossIAM
将考虑增加这方面的支持。

## 开发需要注意

* 数据库中时间存储统一采用 UTC 时间，在配置数据库的时候需要注意调整时区，不要使用本地的时区。
* 如果在代码中与数据库交互（存入或取出），需要进行必要的时间转换，否则将不正确。

### MySQL 驱动

[MySQL 驱动文档](https://github.com/go-sql-driver/mysq)

基本格式：

```
[username[:password]@][protocol[(address)]]/dbname[?param1=value1&...&paramN=valueN]
```

MySQL 驱动可以指定参数，KrossIAM 使用下面几个参数：

#### clientFoundRows=true

> `clientFoundRows=true` causes an UPDATE to return the number of **matching rows**
> instead of the number of rows changed.

KrossIAM 在更新数据后，为了确保符合预期，会检查更新的行数，例如更新某个用户的密码，在执行完
`update` 操作后，会检查是否准确的更新了 1 行，不多也不少。如果不指定这个参数，
那么在数据没有改变的情况下（例如新旧密码相同）会返回 0 而不是 1，这将导致后续的检查失败，
认为查询条件不正确。

#### parseTime

> `parseTime=true` changes the output type of `DATE` and `DATETIME` values to
> `time.Time` instead of `[]byte / string`.
> The date or datetime like `0000-00-00 00:00:00` is converted into zero value of
> `time.Time`.

这个方便语言之间的交流。

### PostgreSQL 驱动

[PostgreSQL 驱动文档](https://github.com/jackc/pgx)

### Sqlite 驱动

[Sqlite3 驱动文档](https://github.com/mattn/go-sqlite3)

#### mode=rw

> 模式参数可以设置为“ro”、“rw”、“rwc”或“memory”。 尝试将其设置为任何其他值是错误的。
> 如果指定了“ro”，那么数据库将以只读访问打开。 如果模式选项设置为“rw”，则以读写模式打开数据库
> （但不能创建）访问，就像设置了 SQLITE_OPEN_READWRITE（但没有 SQLITE_OPEN_CREATE）一样。
> 值“rwc”等效于设置 SQLITE_OPEN_READWRITE 和 SQLITE_OPEN_CREATE。
> 如果模式选项设置为“memory”，则使用无磁盘读写的纯内存数据库。

### CockroachDB 驱动

CockroachDB 使用 PostgreSQL 驱动。
