---
slug: password-hashing
title: KrossIAM 中的密码哈希
authors: krossdev
tags: [kross iam, password, hashing, argon2id, bcrypt, pbkdf2]
---

## 介绍

KrossIAM 内部支持 `Argon2id`，`Bcrypt`, `PBKDF2` 3 种密码哈希算法，
但是在一个项目中只需要使用一种，不要混合使用，提供多种算法的目的是为了提供更多的适应性。

<!--truncate-->

## 如果选择算法

如果没有特殊的要求，使用 `Argon2id` 算法。

## PHC 编码

PHC 是对哈希后的密码进行编码的一种格式，请参考：
https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md

其看起来大致上如下：

```
$argon2id$v=19$m=65536,t=2,p=1$gZiV/M1gPc22ElAH/Jh1Hw$CWOrkoo7oJBQ/iyh7uJ0LO2aLEfrHwTWllSAxT0zRno
```

这是一串以`$`符号作为分隔的字符串，描述了采用的算法，算法参数，盐，以及哈希后的密码...,
在验证密码时，可以根据这些信息构造正确的算法和参数进行验证。这增加了可移植性，例如用
`Java` 生成的密码可以通过 `Go` 验证，不用关心实现细节，如果没有这些描述信息，
只有一个哈希后的密码，那么就没有那么容易了（想一想是不是）。

PHC 的另外一个好处是，可以多个算法共存，例如系统开始使用 `Bcrypt` 算法，注册了 1000
个用户，那么这 1000 个用户的密码是采用 bcrypt 哈希。然后因为某些原因要切换到 `PBKDF2`
算法，这没有问题，新用户将使用 PBKDF2 哈希，因为 PHC，存在的用户的密码还是可以继续使用。

可能你认为切换算法不是那么实际，但是调整算法的参数呢，例如将迭代次数从 2 增加到 3，
使用 PHC 可以有效解决这些变更带来的问题。

### 安全性

可能你认为将这些**机密**的信息编码到 PHC 中暴露了安全隐患，这是不正确的，
因为复原密码的难度来自于算法本身，而不是对某些信息的隐藏。正确设置算法才是安全的关键点。
例如 `MD5`，`sha1` 等算法用作密码哈希算法被认为是 *不安全的*，这些算法的速度太快，
如果值得的话（有利可图的话），破解这些密码的难度相对不算太高，而使用 `Argon2id`
这样的算法，暴力破解几乎不可能成功，这就是为什么将 `Argon2id` 之类的算法称为**安全哈希算法**。

## 默认算法

在 KrossIAM 中，所有对密码进行哈希的地方使用 `DefaultPHC().Hash()` 函数执行。
其中 `DefaultPHC()` 函数返回当前默认使用的哈希算法，
与之对应的提供了一个 `SetDefaultPHC(id)` 函数，这个函数设置默认的哈希算法。

可以看到默认算法是全局的，在任何时候修改都会影响到后面的所有算法执行，如果要修改默认哈希算法，
应该在程序启动时调用一次 SetDefaultPHC() 即可。

## 安全配置

调用 SetDefaultPHC() 需要修改源代码，这不太科学，因此，KrossIAM 提供一种通过文件来设置的方法，
如果在启动 KrossIAM 时通过 `-s` 选项指定了一个格式正确的文件，那么，这个文件中的参数就会在
KrossIAM 启动时流向程序内部进行各种配置。这是一个统一的入口，因此不仅仅只是配置密码哈希，
也配置其它方面。

:::warning 警告
安全配置属于**高档**用法，通常不建议普通用户使用（尤其对 KrossIAM 的内部不太了解的情况下），
以免带来副作用。如果必须使用，也请在开发人员的指导下配置。
:::

## 代码

所有上面的内容在 `secure` 包中实现，具体的文件是：
`phc.go`，`argon2.go`，`bcrypt.go`，`pbkdf2.go`

## 示例

### 使用默认哈希对密码进行加密

这是推荐的做法，KrossIAM 中所有的密码哈希采用此方法。

```go
passwd := "password"

// 使用默认的算法，默认算法可以通过 secure.SetDefaultPHC() 进行设置
passwdHash, err := secure.DefaultPHC().Hash(passwd)
if err != nil {
	return err
}
```

### 直接使用 Argon2id 哈希算法

可以直接使用某个特定的算法，系统预定义了 `Argon2idPHC`、`BcryptPHC`、`PBKDF2PHC`，可以直接使用。

```go
passwd := "password"

// 使用 Argon2id 算法
passwdHash, err := secure.Argon2idPHC.Hash(passwd)
if err != nil {
	return err
}
```

### 使用自定义的参数

如果要调整系统预定义的算法的参数，那么可以直接构造自己的 `PHC`，这是最高级的用法了。

```go
// 构造一个 Rounds 为 20 的 Bcrypt PHC
phc := &PHC{
	Id: secure.IdBcrypt,
	Params: map[string]interface{}{
		"r": 20, // rounds
	},
}

passwd := "password"

passwdHash, err := phc.Hash(passwd)
if err != nil {
	return err
}
```

### 验证密码

验证密码是通用的，感谢 PHC。

```go
// 待验证的 PHC 字符串，假想值
hashPassword := "$argon2id$v=19$m=65536,t=2,p=3$This is Salt$This is Password Hash value"

phc, err := secure.ParsePHC(hashPassword)
if err != nil {
	return err
}

err = phc.Verify("password")
if err != nil {
	// Dismatch
	return err
}
```
