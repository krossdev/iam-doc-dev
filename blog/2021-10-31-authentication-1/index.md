---
slug: authentication-1
title: 身份验证备忘录(一)
authors: krossdev
tags: [authentication, cheat sheet]
---

:::note 注意
这是一篇译文，仅供参考，原文地址：
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
:::

:::tip 提示
由于文章信息量过大，一次阅读完太累，因此分成多个部分，这是第一部分。
:::

## 介绍

**身份验证**是验证个人、实体或网站真实身份的过程。
Web 应用环境中的身份验证通常是通过提交用户名（或 ID）
以及只有该用户应该知道的一项或多项私人信息（例如密码或短信验证码）来完成。

<!-- truncate -->

**会话管理**是服务器维持与其交互的实体的状态的过程。
服务器在后续的整个事务中对请求做出正确响应必需维持会话状态。
会话一般是在服务器上维持一个`会话标识符`，
该标识符可以在客户端和服务器之间通信时来回传递。
每个用户的会话标识符应该是唯一的，并且很难通过计算来预测。
[会话管理备忘录]包含有关该领域最佳实践的进一步指导。

## 身份验证一般性指南

### 用户 ID

确保您的用户名/用户 ID 不区分大小写。用户 'smith' 和用户 'Smith' 应该是同一个用户。
用户名应该是唯一的。对于高度安全的应用程序，可以通过系统分配用户名并保密，
而不是由用户自己选择用户名。

#### 电子邮件地址作为用户 ID

有关验证电子邮件地址的信息，请访问[输入验证备忘录电子邮件讨论]。

### 身份验证方案及敏感账户

- **不允许**使用敏感帐户（即可以在内部使用的帐户，例如后端/中间件/数据库中的帐号）
  登录任何前端用户接口
- **不要**使用内部用于不安全访问（例如公共访问/DMZ）的相同身份验证方案（例如 IDP/AD）

### 实施恰当的密码强度控制

使用密码进行身份验证时的一个关键问题是密码强度。
“强”密码策略使得通过手动或自动方式猜测密码变得困难（甚至不可能）。以下特征定义了强密码：

- 密码长度
  - 应用程序应该执行密码的**最小**长度限制。少于 8 个字符的密码被认为是弱密码([NIST SP800-63B])。
  - 最大密码长度不应设置得太低，因为它会阻止用户创建[passphrases]。
    由于某些哈希算法的限制，常见的最大长度为 64 个字符，如[密码存储备忘录]中所述。
    设置最大密码长度以防止[长密码拒绝服务攻击]很重要。
- 不要悄悄的截断密码。[密码存储备忘录]提供了有关如何处理超过最大长度的密码的进一步指导。
- 允许使用**所有**字符，包括 unicode 和空格。不应该有限制允许字符类型的密码组合规则。
- 确保在密码泄露时或在身份泄露时进行凭证轮换。
- 包括密码强度测量尺，以帮助用户创建更复杂的密码并阻止常见的及之前已经泄露的密码
  - [zxcvbn] 库可用于此目的。（注意这个库不再维护）
  - [Pwned Passwords]是一项服务，可以根据以前泄露的密码检查密码。你可以自己托管或使用
    [API](https://haveibeenpwned.com/API/v3#PwnedPasswords)。

#### 有关更多详细信息，请检查

- [ASVS v4.0 密码安全要求]
- [密码进化：现代身份验证指南]

### 实施安全密码恢复机制

应用程序通常具有一种机制，可以为用户提供一种在忘记密码时访问其帐户的方法。
有关此功能的详细信息，请参阅[忘记密码备忘录]。

### 以安全的方式存储密码

应用程序使用正确的加密技术存储密码至关重要。有关此功能的详细信息，请参阅[密码存储备忘录]。

### 使用安全函数比较密码哈希

如果可能，应该使用编程语言或框架提供的安全密码比较函数来比较用户提供的密码与存储的密码哈希，
比如 PHP 中的 `password_verify()` 函数。如果这不可能，请确保密码比较函数：

- 具有最大输入长度，以防止输入过长的密码导致拒绝服务攻击。
- 明确设置两个变量的类型，以防止类型混淆攻击，例如 PHP 中的
  [Magic Hashes](https://www.whitehatsec.com/blog/magic-hashes/)。
- 以恒定时间返回，以防止时间(timing)攻击。

### 更改密码功能

在开发更改密码功能时，请确保具备：

- 用户已通过了身份验证。
- 验证当前密码。这是为了确保更改密码的是合法用户。滥用情况是这样的：
  合法用户使用公共计算机登录，忘记注销，然后另一个用户使用这台公共计算机。如果不验证当前密码，
  另一个用户就可以更改密码。

### 仅通过 TLS 或其他安全通道传输密码

请参阅：[传输层保护备忘录]

登录页面和所有后续经过身份验证的页面必须通过 TLS 或其他安全通道访问。
登录页面未使用 TLS 或其他安全传输通道允许攻击者修改登录表单的 Action，
导致用户的登录信息被发送到任意位置。
登录后不对经过身份验证后的页面使用 TLS 或其他安全传输通道使攻击者能够查看未加密的会话 ID，
危及经过身份验证的用户会话。

### 敏感功能需要重新认证

为了减轻 CSRF 和会话劫持的攻击，在更新敏感帐户信息（例如用户密码、邮箱地址）或进行敏感事务（
例如将购买的商品运送到新地址）之前，要求再次提供帐户的当前登录信息非常重要。
如果没有这种对策，攻击者可能通过 CSRF 或 XSS 攻击来执行敏感事物，而无需知道用户当前的登录信息。
此外，攻击者可能会临时物理访问用户的浏览器或窃取他们的会话 ID 以接管用户的会话。

未完待续...

[会话管理备忘录]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
[密码存储备忘录]: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#maximum-password-lengths
[忘记密码备忘录]: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
[传输层保护备忘录]: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html
[输入验证备忘录电子邮件讨论]: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#Email_Address_Validation
[nist sp800-63b]: https://pages.nist.gov/800-63-3/sp800-63b.html
[passphrases]: https://en.wikipedia.org/wiki/Passphrase
[长密码拒绝服务攻击]: https://www.acunetix.com/vulnerabilities/web/long-password-denial-of-service/
[zxcvbn]: https://github.com/dropbox/zxcvbn
[pwned passwords]: https://haveibeenpwned.com/Passwords
[asvs v4.0 密码安全要求]: https://github.com/OWASP/ASVS/blob/master/4.0/en/0x11-V2-Authentication.md#v21-password-security-requirements
[密码进化：现代身份验证指南]: https://www.troyhunt.com/passwords-evolved-authentication-guidance-for-the-modern-era/
