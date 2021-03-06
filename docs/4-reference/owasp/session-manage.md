---
slug: session-manage
sidebar_label: 会话管理
sidebar_position: 6
---

# 会话管理备忘录

:::note 注意
这是一篇译文，仅供参考，原文地址：
https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
:::

## 介绍

### Web 身份验证、会话管理和访问控制：

Web 会话是与同一用户关联的一系列网络 HTTP 请求和响应事务。
现代和复杂的 Web 应用程序需要在多次请求期间保留有关每个用户的信息或状态。
会话提供了建立变量（例如访问权限和本地化设置）的能力，这些变量将应用于用户在会话期间与 Web
应用程序进行的每一次交互。

在用户首次请求之后，Web 应用程序可以创建会话来跟踪匿名用户。一个例子是维护用户语言偏好。
此外，一旦用户通过了身份验证，Web 应用程序将使用会话。确保在任何后续请求中识别用户的能力，
以及能够应用安全访问控制、对用户私有数据的授权访问以及提高应用程序的可用性。
当前的 Web 应用程序可以提供身份验证前和身份验证后的会话功能。

<!-- truncate -->

一旦建立了通过了身份验证的会话，会话 ID（或令牌）就暂时等同于应用程序使用的最强身份验证方法，
例如用户名和密码、密码、一次性密码 (OTP)、基于客户端的数字证书、
智能卡或生物识别技术（例如指纹或眼睛视网膜）。请参阅 OWASP 身份验证备忘录。

HTTP 是一种无状态协议（RFC2616 第 5 节），其中每个请求和响应对都独立于其他 Web 交互。
因此，为了引入会话的概念，需要实现会话管理功能，将 Web 应用程序中常见的身份验证和访问控制
（或授权）模块链接起来：

![](https://cheatsheetseries.owasp.org/assets/Session_Management_Cheat_Sheet_Diagram.png)

会话 ID 或令牌将用户身份验证凭据（以用户会话的形式）绑定到用户 HTTP 流量，
Web 应用程序通过它执行适当的访问控制。
这三个组件（身份验证、会话管理和访问控制）在现代 Web 应用程序中的复杂性，
加上它的实现和绑定由 Web 开发人员决定（因为 Web 开发框架不提供这些模块之间的严格关系），
使得安全会话管理模块的实现极具挑战性。

会话 ID 的暴露、截获、被预测、暴力破解或固化将导致会话劫持（或侧劫）攻击，
攻击者能够在 Web 应用程序中完全冒充受害用户。
攻击者可以执行两种类型的会话劫持攻击，有针对性的攻击或通用的攻击。
在有针对性的攻击中，攻击者的目标是冒充特定（或特权）Web 应用程序受害者用户。
对于通用攻击，攻击者的目标是冒充（或以身份访问）Web 应用程序中的任何有效或合法的用户。

## 会话 ID 属性

为了保持经过身份验证的状态并跟踪用户在 Web 应用程序中的会话，
应用程序为用户提供在会话创建时分配的会话标识符（会话 ID 或令牌），
并在会话期间由用户和 Web 应用程序共享和交换（它在每个 HTTP 请求上发送）。
会话 ID 是一个 `name=value` 对。

为了实现安全会话 ID，标识符（ID 或令牌）的生成必须满足以下属性。

### 会话 ID 名称指纹

会话 ID 使用的名称不应过于描述性，也不应提供有关 ID 的目的和含义的不必要的详细信息。

最常见的 Web 应用程序开发框架使用的会话 ID 名称可以很容易地进行指纹识别，
例如 `PHPSESSID` (PHP)、`JSESSIONID` (J2EE)、`CFID` & `CFTOKEN` (ColdFusion)、
`ASP.NET_SessionId` (ASP .NET) 等。
因此，会话 ID 名称可以揭示 Web 应用程序使用的技术和编程语言。

建议将web开发框架的默认会话ID名称改为通用名称，例如`id`。

### 会话 ID 长度

会话 ID 必须足够长，以防止暴力攻击，例如攻击者可以通过整个 ID 值范围来验证有效会话的存在。

会话 ID 长度必须至少为 128 位（16 字节）。

:::note 注意
- 128 位的会话 ID 长度作为参考是基于下一节`会话 ID 熵`所做的假设。不应将该长度作为绝对最小值，
因为其他实施因素可能会影响其强度。
- 例如，在一些的实现中，例如 Microsoft ASP.NET 会话 ID：
*“ASP .NET 会话标识符是一个随机生成的数字，编码为 24 个字符的字符串，由 a 到 z 的小写字符和 0 到 5 的数字组成”。*
- 这可以提供非常好的熵，可以认为足以避免猜测或蛮力攻击。
:::

### 会话 ID 熵

会话 ID 必须是不可预测的（足够随机）以防止猜测攻击，因为攻击者可以通过统计分析来猜测或预测会话ID。
为此，必须使用良好的 [CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator)（密码安全伪随机数生成器）。

会话 ID 值必须提供至少 64 位的熵（如果使用好的 [PRNG](https://en.wikipedia.org/wiki/Pseudorandom_number_generator)，这个值估计是 session ID 长度的一半）。

此外，一个随机的会话 ID 是不够的；它也必须是唯一的以避免重复的 ID。一个随机会话 ID
不能在当前会话 ID 空间中已经存在。

:::note 注意
- session ID 熵确实受其他外部和难以衡量的因素影响，例如 Web 应用程序通常具有的并发活动会话数、
绝对会话过期超时、攻击者每秒可以进行的会话 ID 猜测数量以及目标 Web 应用程序可以支持等。
- 假设攻击者每秒可以尝试 10,000 次猜测，同时 Web 应用程序中有 100,000 个有效的同时可用会话，
如果使用熵为 64 位的会话 ID，攻击者至少需要 292 年才能成功猜出有效的会话 ID。
- 更多信息在[这里](https://owasp.org/www-community/vulnerabilities/Insufficient_Session-ID_Length)。
:::

### 会话 ID 内容（或值）

会话 ID 内容（或值）必须是无意义的，以防止信息泄露攻击，攻击者能够解码 ID 的内容并提取用户、
会话或 Web 应用程序内部工作的详细信息。

会话 ID 必须只是客户端的标识符，其值不得包含敏感信息（或 [PII](https://en.wikipedia.org/wiki/Personally_identifiable_information)）。

与会话 ID 关联的含义和业务或应用逻辑必须存储在服务器端，具体来说应该是在会话对象或会话管理数据库或存储库中。

存储的信息可以包括客户端 IP 地址、用户代理、电子邮件、用户名、用户 ID、角色、权限级别、
访问权限、语言首选项、帐户 ID、当前状态、上次登录、会话超时和其他内部会话细节。
如果会话对象和属性包含敏感信息，例如信用卡号，则需要对会话管理存储库进行适当的加密和保护。

建议使用由您的语言或框架创建的会话 ID。如果您需要创建自己的 sessionID，
请使用大小至少为 128 位的加密安全伪随机数生成器 (CSPRNG)，并确保每个 sessionID 都是唯一的。

## 会话管理实现

会话管理实现定义了用户和 Web 应用程序之间将使用的交换机制，以共享和持续交换会话 ID。
HTTP 中有多种机制可用于在 Web 应用程序中维护会话状态，例如 cookie（标准 HTTP 标头）、
URL 参数（URL 重写 - RFC2396）、GET 请求的 URL 参数，POST 请求的正文参数，
隐藏的表单字段（HTML 表单）或专有的 HTTP 标头。

首选会话 ID 交换机制应允许定义高级令牌属性，例如令牌到期日期和时间，或细粒度的使用限制。
这就是 cookie（RFC 2109 & 2965 & 6265）是使用最广泛的会话 ID 交换机制之一的原因之一，
它提供了其他方法所不具备的高级功能。

使用特定会话 ID 交换机制（例如 ID 包含在 URL 中的机制）可能会泄露会话 ID
（在 Web 链接和日志、Web 浏览器历史记录和书签、Referer 标头或搜索引擎中），
以及促进其他攻击，例如操纵 ID 或[会话固化攻击](http://www.acrossecurity.com/papers/session_fixation.pdf)。

### 内置会话管理实现

Web 开发框架，例如 J2EE、ASP .NET、PHP 和其他框架，提供了它们自己的会话管理功能和相关的实现。
建议使用这些内置框架而不是从头开始构建一个自制框架，
因为它们在全球范围内用于多个 Web 环境，并且已经过 Web 应用程序安全和开发社区的长期测试。

但是，请注意，这些框架过去也存在漏洞和弱点，所以总是建议使用可用的最新版本，
这可能会修复所有已知的漏洞，并通过遵循本文档中描述的建议审查和更改默认配置以增强其安全性。

会话管理机制用于临时保存会话 ID 的存储能力或存储库必须是安全的，以保护会话 ID
免受本地或远程意外泄露或未经授权的访问。

### 使用与接受的会话 ID 交换机制

Web 应用程序应使用 cookie 进行会话 ID 交换管理。如果用户通过不同的交换机制（例如 URL 参数）
提交会话 ID，则 Web 应用程序应避免将其接受，作为阻止固化的防御策略的一部分。

:::note 注意
- 即使 Web 应用程序使用 cookie 作为其默认会话 ID 交换机制，它也可能接受其他交换机制。
- 因此，在处理和管理会话 ID 时，需要通过彻底测试确认 Web 应用程序当前接受的所有不同机制，
并限制仅 cookie 作为可接受的会话 ID 跟踪机制。
- 过去，一些 Web 应用程序使用 URL 参数，甚至从 cookie 切换到 URL 参数（通过自动 URL 重写），
如果满足某些条件（例如，识别不支持 cookie 的 Web 客户端或由于用户隐私问题不接受 cookie）。

:::

### 传输层安全

为了保护会话 ID 交换免受网络流量中的主动窃听和被动泄露，必须在整个网络会话中使用加密的 HTTPS (TLS)
连接，不仅仅只是在交换用户凭据的身份验证过程中。
对于支持 [HTTP 严格传输安全](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) (HSTS)的客户端，可以通过它来缓解。

此外，必须使用 `secure` cookie 属性来确保会话 ID 仅通过加密通道进行交换。
使用加密通信通道还可以保护会话免受某些会话固化攻击，在攻击者能够拦截和操纵 Web 流量以在受害者的
Web 浏览器上注入（或修复）会话 ID 的情况下
（见[这里](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-Slides.pdf)
和[这里](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-WP.pdf)）。

以下一组最佳实践侧重于保护会话 ID（特别是在使用 cookie 时）并帮助将 HTTPS 集成到 Web 应用程序中：

- 不要将给定的会话从 HTTP 切换到 HTTPS，反之亦然，因为这会通过网络以明文形式公开会话 ID。
  - 重定向到 HTTPS 时，请确保在发生重定向后设置或重新生成 cookie。
- 不要在同一页面或同一域中混合加密和未加密的内容（HTML 页面、图像、CSS、JavaScript 文件等）。
- 在可能的情况下，避免从同一主机提供公共未加密内容和私有的加密内容。如果需要不安全的内容，
请考虑将其托管在单独的不安全域中。
- 实施 HTTP 严格传输安全 (HSTS) 以强制实施 HTTPS 连接。

有关安全实施 TLS 的更多一般指导，请参阅 OWASP [传输层保护备忘录](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)。

需要强调的是，TLS 不能防止会话 ID 预测、暴力破解、客户端篡改或固化；
然而，它确实提供了有效的保护，防止攻击者通过中间人攻击拦截或窃取会话 ID。

## Cookies

基于cookies的会话ID交换机制以cookie属性的形式提供了多种安全特性，可以用来保护会话ID的交换：

### 安全属性

`secure` cookie 属性指示 Web 浏览器仅通过加密的 HTTPS (SSL/TLS) 连接发送 cookie。
这种会话保护机制是强制性的，以防止通过 MitM（中间人）攻击泄露会话 ID。
它确保攻击者不能简单地从 Web 浏览器流量中捕获会话 ID。

如果未设置 `secure` cookie，则强制 Web 应用程序仅使用 HTTPS 进行通信
（即使端口 TCP/80、HTTP 在 Web 应用程序主机中关闭）也不能防止会话 ID 泄露 -
Web 浏览器可能会被欺骗以通过未加密的 HTTP 连接泄露会话 ID。
攻击者可以拦截和操纵受害用户流量，并向 Web 应用程序注入未加密的 HTTP 引用，
这将强制 Web 浏览器以明文形式提交会话 ID。

参见: [SecureFlag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies)

### HttpOnly 属性

`HttpOnly` cookie 属性指示 Web 浏览器不允许脚本（例如 JavaScript 或 VBscript）
通过 DOM document.cookie 对象访问 cookie。
该会话 ID 保护是强制性的，以防止通过 XSS 攻击窃取会话 ID。
但是，如果 XSS 攻击与 CSRF 攻击结合使用，则发送到 Web 应用程序的请求将包含会话 cookie，
因为浏览器在发送请求时始终包含 cookie。
`HttpOnly` cookie 只保护 cookie 的机密性；在 XSS 攻击的上下文之外，攻击者不能离线使用它。

请参阅 OWASP [XSS（跨站点脚本）预防备忘录](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)。

参见: [HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies)

### SameSite 属性

`SameSite` 定义了一个 cookie 属性，以防止浏览器发送带有跨站点请求的 SameSite 标记的 cookie。
主要目标是降低跨源信息泄露的风险，并提供一些针对跨站点请求伪造攻击的保护。

参见: [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#SameSite_cookies)

### Domain 和 Path 属性

`domain` cookie 属性指示 Web 浏览器仅将 cookie 发送到指定的域和所有子域。
如果未设置该属性，则默认情况下 cookie 将仅发送到源服务器。
`Path` cookie 属性指示 Web 浏览器仅将 cookie 发送到 Web
应用程序内的指定目录或子目录（或路径或资源）。
如果未设置该属性，默认情况下，cookie 将仅针对所请求资源的目录（或路径）发送并设置 cookie。

建议使用这两个属性缩小或限制范围。这种方法中，不应设置 Domain 属性（将 cookie 仅限于源服务器），
然后将 Path 属性设置为尽可能限制使用会话 ID 的 Web 应用程序路径。

将 Domain 属性设置为过于宽松的值，例如 `example.com` 允许攻击者对属于同一域的不同主机和 Web
应用程序之间的会话 ID 发起攻击，称为跨子域 cookie。
例如，`www.example.com` 中的漏洞可能允许攻击者从 `secure.example.com` 访问会话 ID。

此外，建议不要在同一域中混合使用不同安全级别的 Web 应用程序。
Web 应用程序之一中的漏洞将允许攻击者使用准许的 `Domain` 属性为同一域上 (例如 `example.com`)
的不同 Web 应用程序设置会话 ID，这是一种可用于[会话固定攻击](http://www.acrossecurity.com/papers/session_fixation.pdf)的技术。

尽管 `Path` 属性允许在同一主机上使用不同路径隔离不同 Web 应用程序之间的会话 ID，
但强烈建议不要在同一主机上运行不同的 Web 应用程序（尤其是来自不同安全级别或范围的）。
这些应用程序可以使用其他方法来访问会话 ID，例如 `document.cookie` 对象。
此外，任何 Web 应用程序都可以为该主机上的任何路径设置 cookie。

Cookie 容易受到 DNS 欺骗/劫持/中毒攻击，攻击者可以操纵 DNS 解析来强制 Web
浏览器公开给定主机或域的会话 ID。

### Expire 和 Max-Age 属性

基于 cookie 的会话管理机制可以使用两种类型的 cookie，非持久性（或会话）cookies 和持久性cookies。
如果 cookie 设置了 Max-Age（优先于 Expires）或 Expires 属性，它将被视为持久性 cookie，
并将由 Web 浏览器存储在磁盘上，直到到期时间。

通常，在身份验证后跟踪用户的会话管理功能使用非持久性 cookie。 这会强制如果当前的 Web
浏览器实例关闭时会话从客户端消失。因此，强烈建议使用非持久性 cookie 进行会话管理，
以便会话 ID 不会长时间保留在 Web 客户端缓存中，攻击者可以从那里获取它。

- 通过确保敏感信息在需要的持续时间内不是持久的/加密的/基于需要的存储，确保不包含敏感信息
- 确保不会通过 cookie 操作进行未经授权的活动
- 确保设置了 `secure` 标志以防止以非安全方式通过“线路”意外传输
- 确定应用程序代码中的所有状态转换是否正确检查 cookie 并强制使用它们
- 如果敏感数据保留在 cookie 中，则确保整个 cookie 都应加密
- 定义应用程序使用的所有 cookie、它们的名称以及为什么需要它们

## HTML5 网络存储 API

Web 超文本应用技术工作组 (WHATWG) 描述了 HTML5 Web Storage API，`localStorage` 和
`sessionStorage`，作为在客户端存储名称-值对的机制。
与 HTTP cookie 不同，localStorage 和 sessionStorage 的内容不会在浏览器的请求或响应中自动共享，
而是用于存储客户端数据。

### localStorage API

#### 范围

使用 localStorage API 存储的数据可由从同一来源加载的页面访问，
这些页面定义为方案 (https://)、主机 (example.com)、端口 (443) 和域/领域 (example.com) ）。
这提供了对这些数据的类似访问，就像在 cookie 上使用安全标志一样，
这意味着无法通过 http 检索从 https 存储的数据。
由于来自不同窗口/线程的潜在并发访问，
使用 localStorage 存储的数据可能容易受到共享访问问题（例如竞争条件）的影响，应被视为非锁定
（[Web 存储 API 规范](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute)）。

#### 持续时间

使用 localStorage API 存储的数据在浏览会话中保持不变，从而延长了其他系统用户可以访问的时间范围。

#### 离线访问

标准不要求对 localStorage 数据进行静态加密，这意味着可以直接从磁盘访问这些数据。

#### 用例

WHATWG 建议将 localStorage 用于需要跨窗口或选项卡、跨多个会话访问的数据，
以及出于性能原因可能需要存储大量（数兆字节）数据的地方。

### sessionStorage API

#### 范围

sessionStorage API 将数据存储在调用它的窗口上下文中，这意味着 Tab 1 无法访问从 Tab 2 存储的数据。
此外，像 localStorage API 一样，
使用 sessionStorage API 存储的数据可由从同源加载的页面访问，
定义为方案 (https://)、主机 (example.com)、端口 (443) 和域/领域 (example.com)。
这提供了对该数据的类似访问，就像在 cookie 上使用安全标志一样，这意味着无法通过 http 检索从 https
存储的数据。

#### 持续时间

sessionStorage API 仅存储当前浏览会话期间的数据。选项卡关闭后，将无法再检索该数据。
如果浏览器选项卡被重复使用或保持打开状态，这不一定会阻止访问。
数据也可能在内存中持续存在，直到垃圾收集事件发生。

#### 离线访问

标准不要求对 sessionStorage 数据进行静态加密，这意味着可以直接从磁盘访问这些数据。

#### 用例

WHATWG 建议将 sessionStorage 用于与工作流的一个实例相关的数据，
例如机票预订的详细信息，这样可以在其他选项卡中同时执行多个工作流程。
窗口/选项卡绑定特性将防止数据在单独选项卡中的工作流之间泄漏。

### 参考

- [Web Storage APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [SessionStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [WHATWG Web Storage Spec](https://html.spec.whatwg.org/multipage/webstorage.html#webstorage)

## Web Workers

Web Workers 在与当前窗口之一分开的全局上下文中运行 JavaScript 代码。
存在与主执行窗口的通信通道，称为 MessageChannel。

### 用例

当不需要跨页面刷新的存储持久性时，Web Workers 是浏览器存储（会话）秘密的替代方案。
为了让 Web Workers 提供安全的浏览器存储，任何需要密码的代码都应该存在于 Web Worker 中，
并且该密码永远不应该传输到主窗口上下文。

在 Web Worker 的内存中存储密钥提供了与 HttpOnly cookie 相同的安全保证：密钥的机密性受到保护。
尽管如此，XSS 攻击仍可用于向 Web Worker 发送消息以执行需要密钥的操作。Web Worker
会将操作的结果返回给主执行线程。

与 HttpOnly cookie 相比，Web Worker 实现的优势在于 Web Worker 允许一些隔离的
JavaScript 代码访问密钥；
任何 JavaScript 都无法访问 HttpOnly cookie。
如果前端 JavaScript 代码需要访问密钥，则 Web Worker 实现是保留密钥机密性的唯一浏览器存储选项。

## 会话 ID 生命周期

### 会话 ID 生成和验证：宽松和严格的会话管理

Web 应用程序有两种类型的会话管理机制，宽松的和严格的，与会话固化漏洞相关。
宽松的机制允许 Web 应用程序最初接受用户设置的任何有效会话 ID 值，为其创建一个新会话，
而严格机制强制 Web 应用程序将只接受 Web 应用程序先前生成的会话 ID 值。

如果可能，会话令牌应由 Web 服务器处理或通过加密安全随机数生成器生成。

虽然今天使用的最常见的机制是严格的（更安全），但 PHP 默认为宽松的。
开发人员必须确保 Web 应用程序在某些情况下不使用宽松机制。
Web 应用程序永远不应该接受它们从未生成过的会话 ID，如果收到，
他们应该生成并向用户提供一个新的有效会话 ID。此外，应将此场景检测为可疑活动，并生成警报。

### 将会话 ID 作为任何其他用户输入进行管理

会话 ID 必须被视为不受信任，就像 Web 应用程序处理的任何其他用户输入一样，它们必须经过彻底验证和验证。
根据使用的会话管理机制，会话 ID 将在 GET 或 POST 参数、URL 或 HTTP 标头（例如 cookie）中收到。
如果 web 应用程序在处理它们之前没有验证和过滤掉无效的 session ID 值，它们可能会被用来利用其他 web
漏洞，例如 SQL 注入（如果会话 ID 存储在关系数据库中）或持久性 XSS（如果会话 ID 被存储并随后由
Web 应用程序反射回来）。

### 在任何权限级别更改后更新会话 ID

在关联用户会话中的任何权限级别更改之后，Web 应用程序必须更新或重新生成会话 ID。
强制重新生成会话 ID 的最常见场景是在身份验证过程中，
随着用户的权限级别从未认证（或匿名）状态变为已认证状态，尽管在某些情况下还不是授权状态。
需要考虑的常见场景包括： Web 应用程序中的密码更改、权限更改或从常规用户角色切换到管理员角色。
对于 Web 应用程序的所有敏感页面，必须忽略任何先前的会话 ID，必须将当前会话 ID
分配给每个收到的受保护资源的新请求，并且必须销毁旧的或先前的会话 ID。

最常见的 web 开发框架提供了 session 函数和方法来更新 session ID，
例如 `request.getSession(true) & HttpSession.invalidate()` (J2EE),
`Session.Abandon() & Response.Cookies.Add(new...)` (ASP .NET)，或
`session_start() & session_regenerate_id(true)` (PHP)。

会话 ID 重新生成是强制性的，以防止会话固化攻击，
攻击者在受害者用户的 Web 浏览器上设置会话 ID，而不是收集受害者的会话 ID，
与大多数其他基于会话的攻击一样，并且与使用 HTTP 或 HTTPS无关。
这种保护减轻了其他基于 Web 的漏洞的影响，这些漏洞也可用于发起会话固化攻击，
例如 HTTP 响应拆分或 XSS
（见[这里](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-Slides.pdf)
和[这里](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-WP.pdf)）。

一个补充建议是在身份验证前后使用不同的会话 ID 或令牌名称（或一组会话 ID），
以便 Web 应用程序可以跟踪匿名用户和经过身份验证的用户，而不会暴露或绑定两种状态之间的用户会话。

### 使用多个 Cookie 时的注意事项

如果 Web 应用程序使用 cookie 作为会话 ID 交换机制，并且为给定会话设置了多个 cookie，
Web 应用程序必须在允许访问用户会话之前验证所有 cookie（并强制执行它们之间的关系）。

Web 应用程序通过 HTTP 设置用户 cookie 预身份验证以跟踪未经身份验证（或匿名）的用户是很常见的。
一旦用户在 Web 应用程序中进行身份验证，就会通过 HTTPS 设置一个新的身份验证后安全 cookie，
并在 cookie 和用户会话之间建立绑定。
如果 Web 应用程序未验证所有的 cookie，则攻击者可以利用预身份验证未受保护的 cookie
来访问已验证用户会话
（见[这里](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-Slides.pdf)
和[这里](https://media.blackhat.com/bh-eu-11/Raul_Siles/BlackHat_EU_2011_Siles_SAP_Session-WP.pdf)）。

Web 应用程序应尽量避免在同一 Web 应用程序中为不同路径或域范围使用相同的 cookie 名称，
因为这会增加解决方案的复杂性并可能引入范围界定问题。

## 会话到期

为了最大限度地减少攻击者可以对活动会话发起攻击并劫持它们的时间段，必须为每个会话设置过期超时，
确定会话保持活动的时间量。

Web 应用程序的会话过期不足增加了其他基于会话的攻击的暴露，至于攻击者能够重用有效的会话 ID
并劫持关联的会话，它必须仍然处于活动状态。

会话间隔越短，攻击者使用有效会话 ID 的时间就越短。
会话过期超时值必须根据 Web 应用程序的目的和性质进行相应设置，
并平衡安全性和可用性，以便用户可以轻松地完成 Web 应用程序内的操作，而不会频繁地使他的会话过期。

空闲和绝对超时值都高度依赖于 Web 应用程序及其数据的重要性。
高价值应用程序的常见空闲超时范围为 2-5 分钟，低风险应用程序为 15-30 分钟。
绝对超时取决于用户通常使用应用程序的时间。
如果应用程序旨在供办公室工作人员使用一整天，则适当的绝对超时范围可能介于 4 到 8 小时之间。

当会话过期时，Web 应用程序必须采取主动措施使客户端和服务器双方的会话无效。
从安全角度来看，服务端是最相关的，强制性的。

对于大多数会话交换机制，使会话 ID 无效的客户端操作基于清除令牌值。
例如，要使 cookie 无效，建议为会话 ID 提供空（或无效）值，
并将 Expires（或 Max-Age）属性设置为过去的日期（使用持久性 cookie 时）：
`Set-Cookie: id=; Expires=Friday, 17-May-03 18:45:00 GMT`

为了在服务器端关闭会话并使会话失效，Web 应用程序必须在会话过期时采取主动操作，
或者用户使用会话管理机制提供的功能和方法主动注销，例如`HttpSession.invalidate()` (J2EE)、
`Session.Abandon()` (ASP .NET) 或 `session_destroy()/unset()` ( PHP）。

### 自动会话到期

#### 空闲超时

所有会话都应实现空闲或不活动超时。此超时定义了在会话中没有活动的情况下会话将保持活动状态的时间，
自 Web 应用程序接收到给定会话 ID 的最后一个 HTTP 请求以来，在定义的空闲时间段内关闭会话并使会话无效。

空闲超时限制了攻击者猜测和使用其他用户的有效会话 ID 的机会。
但是，如果攻击者能够劫持给定的会话，空闲超时不会限制攻击者的操作，因为他们可以定期在会话上生成活动，
以使会话保持更长时间的活动状态。

会话超时管理和过期必须在服务器端强制执行。如果用客户端执行会话超时，
例如使用会话令牌或其他客户端参数来跟踪时间参考（例如，自登录时间以来的分钟数），
攻击者可以操纵这些来延长会话持续时间。

#### 绝对超时

无论会话活动如何，所有会话都应实现绝对超时。此超时定义会话可以处于活动状态的最长时间，
自给定会话最初由 Web 应用程序创建以来，在定义的绝对时间段内关闭会话并使会话无效。
会话无效后，用户被迫在 Web 应用程序中再次（重新）进行身份验证并建立新会话。

绝对会话限制了攻击者可以使用被劫持的会话并冒充受害用户的时间。

#### 更新超时

或者，Web 应用程序可以实现额外的更新超时，在此之后会话 ID 会在用户会话中间自动更新，
并且独立于会话活动，因此与空闲超时无关。

在最初创建会话后的特定时间后，Web 应用程序可以为用户会话重新生成新 ID，并尝试在客户端上设置或更新它。
在客户端知道新 ID 并开始使用它之前，先前的会话 ID 值在一段时间内仍然有效，以适应安全间隔。
当客户端切换到当前会话内的新 ID 时的时候，应用程序会使之前的 ID 失效。

这种情况最大限度地减少了攻击者可能获得的给定会话 ID 值可被重用于劫持用户会话的时间，
即使受害用户会话仍处于活动状态。
用户会话在合法客户端上保持活动和打开状态，尽管其关联的会话 ID 值在会话持续时间内定期透明地更新，
每次更新超时到期。
因此，更新超时补充空闲和绝对超时，特别是当绝对超时值随时间显着延长时（例如，
保持用户会话长时间打开是应用程序要求）。

根据实施情况，可能存在竞争条件，即具有仍然有效的先前会话 ID 的攻击者在受害用户之前发送请求，
紧接着更新超时刚刚到期，并首先获取更新会话 ID 的值。
至少在这种情况下，受害用户可能会意识到攻击，因为她的会话将突然终止，因为她关联的会话 ID 不再有效。

### 手动会话过期

Web 应用程序应提供允许安全意识用户在使用完 Web 应用程序后主动关闭其会话的机制。

#### 注销按钮

Web 应用程序必须提供可见且易于访问的注销（注销、退出或关闭会话）按钮，该按钮位于 Web
应用程序标题或菜单上，并可从每个 Web 应用程序资源和页面访问，以便用户可以随时手动关闭会话。
如会话过期部分所述，Web 应用程序必须至少在服务器端使会话无效。

:::note 注意
不幸的是，并非所有 Web 应用程序都有助于用户关闭其当前会话。
因此，客户端增强功能允许认真的用户通过帮助关闭会话来保护他们的会话。
:::

### 网页内容缓存

即使在会话关闭后，仍有可能通过 Web 浏览器缓存访问会话内交换的私人或敏感数据。
因此，Web 应用程序必须对通过 HTTP 和 HTTPS 交换的所有 Web 流量使用限制性缓存指令，
例如 [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) 和
[`Pragma`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma)
HTTP 标头，和/或所有或（至少）敏感网页上的等效 META 标签。

独立于 Web 应用程序定义的缓存策略，如果允许缓存 Web 应用程序内容，则绝不能缓存会话 ID，
因此强烈建议使用 `Cache-Control: no-cache="Set-Cookie, Set-Cookie2"` 指令，
以允许 Web 客户端缓存除会话 ID 之外的所有内容
（参见[这里](https://stackoverflow.com/a/41352418)）。

## 针对会话管理的额外客户端防御

Web 应用程序可以通过客户端的额外对策来补充之前描述的会话管理防御。
客户端保护，通常以 JavaScript 检查和验证的形式，不是防弹的，很容易被熟练的攻击者击败，
但可以引入另一层防御，入侵者必须绕过。

### 初始登录超时

Web 应用程序可以在登录页面中使用 JavaScript 代码来评估和测量自页面加载和会话 ID 被授予以来的时间量。
如果在特定时间后尝试登录，客户端代码可以通知用户登录的最长时间已过并重新加载登录页面，
从而检索新的会话 ID。

这种额外的保护机制试图强制更新预认证会话 ID，
避免使用同一台计算机的下一个受害者重复使用先前使用（或手动设置）的会话 ID 的情况，
例如会话固化攻击。

### 在 Web 浏览器窗口关闭事件上强制退出会话

Web 应用程序可以使用 JavaScript 代码来捕获所有 Web 浏览器选项卡或窗口关闭（甚至返回）事件，
并在关闭 Web 浏览器之前采取适当的操作来关闭当前会话，模拟用户通过注销按钮手动关闭会话。

### 禁用 Web 浏览器交叉 Tab 会话

一旦用户登录并建立会话，Web 应用程序就可以使用 JavaScript 代码，
以在针对同一 Web 应用程序打开新的 Web 浏览器选项卡或窗口时强制用户重新进行身份验证。
Web 应用程序不希望允许多个 Web 浏览器选项卡或窗口共享同一个会话。
因此，应用程序试图强制 Web 浏览器不在它们之间同时共享相同的会话 ID。

:::note 注意
如果会话 ID 通过 cookie 交换，则无法实现此机​​制，因为所有 Web 浏览器选项卡/窗口都共享 cookie。
:::

### 自动客户端注销

Web 应用程序可以在所有（或关键）页面中使用 JavaScript 代码在空闲超时到期后自动注销客户端会话，
例如，通过将用户重定向到注销页面（与前面提到的注销按钮使用的资源相同）。

使用客户端代码增强服务器端空闲超时功能的好处是用户可以看到会话由于不活动而结束，
甚至可以通过倒计时和警告消息提前通知会话即将到期。
这种用户友好的方法有助于避免由于服务器端静默过期会话而导致需要大量输入数据的网页中的工作丢失。

## 会话攻击检测

### 会话 ID 猜测和蛮力检测

如果攻击者试图猜测或暴力破解有效的会话 ID，他们需要使用来自单个（或一组）IP 地址的不同会话 ID
针对目标 Web 应用程序启动多个顺序请求。
此外，如果攻击者试图分析会话 ID 的可预测性（例如使用统计分析），
他们需要针对目标 Web 应用程序从单个（或一组）IP 地址启动多个顺序请求，以收集新的有效会话 ID。

Web 应用程序必须能够根据收集（或使用）不同会话 ID 和警告和/或阻止违规 IP
地址的尝试次数来检测这两种情况。

### 检测会话 ID 异常

Web 应用程序应专注于检测与会话 ID 相关的异常，例如其操作。
OWASP [AppSensor 项目](https://owasp.org/www-project-appsensor/)
提供了一个框架和方法来在 Web 应用程序中实现内置的入侵检测功能，重点是检测异常和意外行为，
以检测点和响应动作的形式。有时不使用外部保护层，业务逻辑细节和高级智能只能从 Web 应用程序内部获得，
可以建立多个会话相关的检测点，例如，修改或删除现有 cookie、添加新 cookie、
重复使用来自其他用户的会话 ID，或者当用户位置或用户代理在会话过程中发生更改时。

### 将会话 ID 绑定到其他用户属性

为了检测（并在某些情况下防止）用户不当行为和会话劫持，
强烈建议将会话 ID 绑定到其他用户或客户端属性，例如客户端 IP 地址、用户代理或基于客户端的数字证书。
如果 Web 应用程序在建立的会话期间检测到这些不同属性之间的任何更改或异常，
这是会话操纵和劫持企图的一个很好的指标，这个简单的事实可用于警告和/或终止可疑会话。

尽管 Web 应用程序无法使用这些属性来可靠地防御会话攻击，它们显着提高了 Web 应用程序检测（和保护）能力。
但是，熟练的攻击者可以通过共享同一网络重用分配给受害者用户的相同 IP 地址来绕过这些控制
（在 NAT 环境中非常常见，例如 Wi-Fi 热点），或使用相同的出站 Web 代理（在企业环境中很常见），
或者通过手动修改他的 User-Agent 使其看起来与受害用户完全一样。

### 记录会话生命周期：监控会话 ID 的创建、使用和销毁

Web 应用程序应该通过包含有关会话的完整生命周期的信息来提高其日志记录功能。
特别推荐记录会话相关的事件，如会话ID的创建、更新、销毁等，以及有关其在登录和注销操作中的使用情况、
会话中的权限级别更改、超时到期、无效的会话活动（检测到时）以及会话期间的关键业务操作的详细信息。

日志详细信息可能包括时间戳、源 IP 地址、请求的 Web 目标资源（并涉及会话操作）、
HTTP 标头（包括 User-Agent 和 Referer）、GET 和 POST 参数、错误代码和消息、
用户名（或用户 ID）以及会话 ID（cookies、URL、GET、POST...）。

日志中不应包含诸如会话 ID 之类的敏感数据，以保护会话日志免受本地或远程会话 ID 泄露或未经授权的访问。
但是，必须记录某种特定于会话的信息，以便将日志条目与特定会话相关联。
建议记录会话 ID 的加盐散列而不是会话 ID 本身，以便在不暴露会话 ID 的情况下允许特定于会话的日志关联。

特别是，Web 应用程序必须彻底保护允许管理所有当前活动会话的管理界面。
支持人员经常使用这些工具来解决会话相关问题，甚至是一般问题，方法是模拟用户并像用户一样查看 Web
应用程序。

会话日志成为主要的 Web 应用程序入侵检测数据源之一，
并且还可以被入侵保护系统用于在检测到（一个或多个）攻击时自动终止会话和/或禁用用户帐户。
如果实施了主动保护，则还必须记录这些防御操作。

### 同时会话登录

由 Web 应用程序的设计人员决定是否允许同一用户从多个相同或不同的客户端 IP 地址同时登录。
如果 Web 应用程序不想允许同时会话登录，它必须在每次新的身份验证事件后采取有效措施，
隐式终止先前可用的会话，或询问用户（通过旧的、新的或两个会话）必须保持活动的会话。

建议 Web 应用程序添加允许随时检查活动会话详细信息的用户功能，
监控并发登录并提醒用户，允许用户手动远程终止会话，并通过记录多个客户端详细信息
（例如 IP 地址、用户代理、登录日期和时间、空闲时间等）来跟踪帐户活动历史记录（日志）。

## 会话管理 WAF 保护

存在 Web 应用程序源代码不可用或无法修改的情况，
或者当实施上述多项安全建议和最佳实践所需的更改意味着对 Web 应用程序架构进行全面重新设计时，
因此短期内无法轻易实施。

在这些场景中，或者为了补充 Web 应用程序防御，并且为了尽可能保证 Web 应用程序的安全，
建议使用可以减轻已经描述的会话管理威胁的外部保护，例如 Web 应用程序防火墙 (WAF)。

Web 应用程序防火墙提供针对基于会话的攻击的检测和保护功能。
一方面，WAF 在 cookie 上强制使用安全属性是不重要的，例如 `Secure` 和 `HttpOnly` 标志，
对所有设置新 cookie 的 Web 应用程序响应在 Set-Cookie 标头上应用基本重写规则。

另一方面，可以实现更高级的功能以允许 WAF 跟踪会话以及相应的会话 ID，并应用各种针对会话固化的保护措施
（通过在检测到权限更改时在客户端更新会话 ID），
强制粘性会话（通过验证会话 ID 和其他客户端属性之间的关系，例如 IP 地址或用户代理），
或管理会话过期（通过强制客户端和 Web 应用程序完成会话）。

开源 ModSecurity WAF 加上 OWASP [核心规则集](https://owasp.org/www-project-modsecurity-core-rule-set/)，
提供检测和应用安全 cookie 属性的功能、针对会话固定攻击的对策以及用于强制执行粘性会话的会话跟踪功能。
