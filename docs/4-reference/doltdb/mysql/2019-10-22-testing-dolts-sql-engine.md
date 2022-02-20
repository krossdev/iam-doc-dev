---
id: dolt-sql-engine
title: 测试SQL引擎
tags:
  - Demo
  - Getting started
---

- [原文](https://www.dolthub.com/blog/2019-10-22-testing-dolts-sql-engine/)

When we first started writing [Dolt](https://github.com/dolthub/dolt), we weren’t thinking about SQL functionality. We just knew we wanted a way to package data sets to make them easy to share, collaborate and merge -- to do for data what git did for source code. But as we demoed the product to potential partners and customers, we very quickly realized that we needed a way for users to analyze large amounts of data, and to interoperate with the rest of their tool chain. SQL is the standard that bridges these gaps. It’s the magic sauce that makes [dolt](https://github.com/dolthub/dolt) so powerful and user-friendly.

## 最开始没有SQL

> 最开始写 dolt 时，没有考虑 SQL 功能。 我们只像要一种**像git管理文件**一样，**管理数据**的方法。 但随着跟用户演示和接触，很快意思到，用户还需要一种方法, 来分析这些巨量的数据，以及和他们自己的工具链交互的方法。 SQL 能弥补这个间隙。

```sql
% dolt sql -q "create table demo (a int primary key, b int unsigned)"
% dolt sql -q "show tables"
+--------+
| tables |
+--------+
| demo   |
+--------+
% dolt sql -q "insert into demo values (1, 2), (3, 4)"
+---------+
| updated |
+---------+
| 2       |
+---------+
% dolt sql -q "select * from demo"
+---+---+
| a | b |
+---+---+
| 1 | 2 |
| 3 | 4 |
+---+---+
```

[Dolt](https://github.com/dolthub/dolt) is built on of a fork of [noms](https://github.com/attic-labs/noms), which didn’t support SQL, opting instead to use the much less popular GraphQL. So we needed to [build our own SQL engine](https://github.com/dolthub/dolt/tree/master/go/libraries/doltcore/sqle) on top of noms, and set about doing it. Our first pass worked well enough to demonstrate SQL’s utility for [Dolt](https://github.com/dolthub/dolt) as a proof of concept, and it was a lot of fun to write. However, it had a lot of gaps in functionality. And worse, we didn’t have a lot of confidence that it was correct for all queries. How do you go about testing something with a surface area as large as SQL?

## 开始SQL引擎, 但如何保证SQL引擎的正确呢?

> Dolt 基于 noms, 而 noms 采用的是 GraphQL 接口。 于是开始写自己的SQL引擎。 但如何测试SQL引擎呢？

Our first strategy was to just write [lots and lots of our own test queries](https://github.com/dolthub/dolt/blob/master/go/libraries/doltcore/sql/sqltestutil/selectqueries.go). This is a great start, but it’s hard to know when you have enough coverage. And writing tests this way makes you vulnerable to the biases of whoever is writing the tests. We would often discover a bug when another team member ran a query that didn’t work quite right, or that simply caused a panic. But we kept going, writing hundreds of test cases like this one:

```
 {
		Name:  "column selected more than once",
		Query: "select first, first from people where age >= 40 order by id",
		ExpectedRows: Rs(
			NewResultSetRow(types.String("Homer"), types.String("Homer")),
			NewResultSetRow(types.String("Moe"), types.String("Moe")),
			NewResultSetRow(types.String("Barney"), types.String("Barney")),
		),
		ExpectedSchema: NewResultSetSchema("first", types.StringKind, "first", types.StringKind),
	},
```

## 测试引擎: 自己写测试SQL

> 第一个策略: 写了数百个测试sql语句，类似上面那样。

After a few months of iterating on our own engine, we started looking around for a faster way to bootstrap more SQL coverage, and discovered the [go-mysql-server](https://github.com/src-d/go-mysql-server) project. It seemed very promising -- it had a lot of functionality that we hadn’t implemented in our own engine yet, including a MySQL-compatible server and much better support for joins and complex expressions. We decided to switch, and ported all the tests we had written to test our own engine to the new one. But there was a problem: despite having a lot more capabilities, the test coverage for go-mysql-server was substantially worse than what we had developed. In porting our tests to the new engine, we discovered [several bad bugs](https://github.com/src-d/go-mysql-server/pull/784) and gaps in functionality that we needed to fix before making the switch. This experience didn’t give us a lot of faith that the new engine would yield more correct results than our own engine did. And we still didn’t have a good idea for a general strategy for testing SQL engine correctness.

## 引入 go-mysql-server 引擎

> 经过几个月的迭代，估计是发现从零开始有点困难，开始google SQL引擎，搜到 go-mysql-server.
但对go-mysql-server做测试，发现了几个BUG，有点不放心. 那么该如何放人放心呢？
需要找到一个测试SQL引擎的方法。

We researched what other database engines did to test their products, and discovered the [MySQL integration tests](https://dev.mysql.com/doc/dev/mysql-server/latest/PAGE_MYSQLTEST.html) that ship with MySQL. This approach had real potential: now that we had a MySQL-compatible server thanks to go-mysql-server, in principle we should be able to run all of MySQL’s integration tests against [dolt](https://github.com/dolthub/dolt)!

```
% mysqltest [options] [db_name] < test_file
```

Unfortunately, after spending weeks massaging the test framework to run against [dolt](https://github.com/dolthub/dolt) and interpreting the results, we realized this approach was a dead end. MySQL’s integration tests aren’t functional tests against the SQL standard, but deeply arcane tests of MySQL’s internals such as the binary log format. Cleaning up the tests to be purely functional, black-box tests would be a massive undertaking.

## 用mysqltest工具测试引擎，发现不对

> 又找到了 `mysqltest` 工具，但是它主要测试的是mysqld的内部结构，而非SQL语言。

Back to the drawing board. More google searching eventually turned up the [sqllogictest package](https://www.sqlite.org/sqllogictest/doc/trunk/about.wiki), originally developed by SQLite to test their own engine. They faced the same problem we did, and came up with a novel approach to solve it: instead of trying to develop a comprehensive set of queries and correct results, they developed a templating language that let them generate millions of different queries, which they then ran on MySQL, Postgres and other databases to generate the expected results. The tests are defined in dozens of separate script files that look like this:

```
statement ok
CREATE UNIQUE INDEX idx_tab4_2 ON tab4 (col0 DESC)

statement ok
INSERT INTO tab4 SELECT * FROM tab0

query I rowsort label-0
SELECT pk FROM tab0 WHERE col3 < 6 OR col3 < 1 AND col3 BETWEEN 2 AND 7
----
1
2
3
```

The package includes 6.7 million test statements and expected results, covering a pretty wide footprint of the SQL standard. It was exactly what we were looking for, and we set about getting the tests running on [dolt](https://github.com/dolthub/dolt).

## 又找到 sqlite 的测试工具, 很好

> 最好找到了 sqlite 的测试工具，有6.7百万条SQL和验证数据。 。。。测试用例真的很多。
> 但有一个问题， 这个工具是 C 代码

The only problem was that the C code that ships with these tests had been long neglected and no longer could even connect to an ODBC connector, which it would need to do to drive [dolt](https://github.com/dolthub/dolt). After many fruitless hours trying to get the runner binaries to compile and work, we gave in and implemented our own [native golang test driver for sqllogictest files](https://github.com/dolthub/sqllogictest/blob/master/go/logictest/runner.go). Running these against the [dolt](https://github.com/dolthub/dolt) database demonstrated the following results, which we have published in a [dolt repository](https://www.dolthub.com/repositories/dolthub/dolt-sqllogictest-results). You can experiment with these results yourself by cloning the [dolt](https://github.com/dolthub/dolt) repository:

```
% dolt clone dolthub/dolt-sqllogictest-results
% cd dolt-sqllogictest-results
% dolt sql -q "select result, count(*) from dolt_results group by 1"
+---------+----------+
| result  | COUNT(*) |
+---------+----------+
| skipped | 1315601  |
| ok      | 1335695  |
| not ok  | 4233009  |
+---------+----------+
```

## 然后将sqlite测试工具移植到golang

> 最后，用go重写了一遍测试工具，利用这6.7M条的测试用例。

So by this benchmark, [dolt](https://github.com/dolthub/dolt) has slightly less than 20% SQL correctness. The vast majority of failures are caused by gaps in functionality, such as `INSERT INTO TABLE1 SELECT * FROM TABLE2` statements, which are used extensively in test setup. We’re confident that with a few small improvements to go-mysql-server, we can substantially increase our correctness metrics. After we are more satisfied with those numbers, we’ll shift our focus to performance, which is especially bad today for large joins.

Today we’re excited to announce that we have open-sourced our [golang sqllogictest driver](https://github.com/dolthub/sqllogictest). Integrators just need to implement a simple [harness](https://github.com/dolthub/sqllogictest/blob/master/go/logictest/harness.go) for their database in golang in order to run the full suite of 6.7 million sqllogictest statements and queries. Our hope is that this will help other open source database projects build better products, and that others will contribute their work back to the community, including expanding on the set of test queries and supported types.


> 有了 sqllogictest 这个利器，我们就有信心逐步改进 go-mysql-server，提高测试的正确率, 达到一个满意的水平，
然后再优化 SQL 性能！



