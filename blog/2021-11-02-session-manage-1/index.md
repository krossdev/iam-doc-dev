---
slug: session-manage-1
title: 会话管理备忘录(一)
authors: krossdev
tags: [session manage, cheat sheet]
---

:::note 注意
这是一篇译文，仅供参考，原文地址：
https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
:::

:::tip 提示
由于文章信息量过大，一次阅读完太累，因此分成多个部分，这是第一部分。
:::

## 介绍

### Web 身份验证、会话管理和访问控制

Web 会话是与同一用户关联的一系列HTTP请求和响应事务。
现代和复杂的 Web 应用程序需要在多次请求期间保持每个用户的信息或状态。
会话提供了建立变量（例如访问权限和本地化设置）的能力，这些变量将应用于用户在会话期间与 Web
应用程序进行的每一次交互。

<!-- truncate -->

在用户首次请求之后，Web 应用程序可以创建会话来跟踪匿名用户。一个例子是维护用户语言偏好。
此外，一旦用户通过了身份验证，Web 应用程序将使用会话。确保在任何后续请求中识别用户的能力，
以及能够应用安全访问控制、对用户私有数据的授权访问以及提高应用程序的可用性。
当前的 Web 应用程序可以提供身份验证前和身份验证后的会话功能。
