---
slug: crypto-storage
sidebar_label: 加密存储
sidebar_position: 3
---

# 加密存储备忘录

:::note 注意
这是一篇译文，仅供参考，原文地址：
https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
:::

## 介绍

本文提供了一个在实施保护静态数据的解决方案时要遵循的简单模型。

密码不要使用可逆的加密存储 - 应使用安全密码散列算法。[密码存储备忘录](./password-storage)
包含存储密码进一步的指导。

## 体系设计

设计任何应用程序的第一步是考虑系统的整体架构，因为这将对技术实现产生巨大影响。

此过程应首先考虑应用程序的[威胁模型]（即，您试图保护该数据的对象是谁）。

使用专用的秘密或密钥管理系统可以提供额外的安全保护层，
并使秘密的管理变得更加容易——但是它以额外的复杂性和管理开销为代价——因此可能并非对所有应用程序都可行.
请注意，许多云环境提供这些服务，因此应尽可能利用这些服务。

### 在哪里执行加密

可以在应用程序栈的多个级别上执行加密，例如：

- 在应用级。
- 在数据库级（例如，[SQL Server TDE]）
- 在文件系统级（例如，BitLocker 或 LUKS）
- 在硬件级（例如，加密的 RAID 卡或 SSD）

哪一级最合适取决于威胁模型。例如，硬件级加密可有效防止服务器的物理盗窃，但如果攻击者能够远程破坏服务器，
则无法提供任何保护。

### 尽量减少敏感信息的存储

保护敏感信息的最佳方法是一开始就不要存储它。尽管这适用于所有类型的信息，但它最常适用于信用卡详细信息，
因为它们是攻击者非常想要的，而且 PCI DSS 对它们的存储方式有严格的要求。在可能的情况下，应避免存储敏感信息。

## 算法

对于对称加密，至少**128 位**（理想情况下为**256 位**）的密钥加上安全[模式](#密码模式)的**AES**用作首选算法。

对于非对称加密，使用椭圆曲线加密 (ECC) 和安全曲线（例如**Curve25519**）作为首选算法。
如果 ECC 不可用且必须使用**RSA**，则确保密钥至少为**2048 位**。

许多其他对称和非对称算法都有自己的优缺点，在特定用例中它们可能比 AES 或 Curve25519 更好或更差。
在考虑这些时，应考虑许多因素，包括：

- 密钥大小。
- 该算法的已知攻击和弱点。
- 算法的成熟度。
- 由第三方批准，例如 [NIST 的算法验证程序]。
- 性能（加密和解密）。
- 可用库的质量。
- 算法的可移植性（即它的支持范围有多广）。

在某些情况下，可能存在限制可以使用的算法的监管要求，例如[FIPS 140-2]或[PCI DSS]。

### 自定义算法

不要这样做。

### 密码模式

有多种模式可用于允许分组密码（例如 AES）以与流密码相同的方式加密任意数量的数据。
这些模式具有不同的安全性和性能特征，对它们的全面讨论超出了本备忘录的范围。
某些模式要求生成安全初始化向量 (IV) 和其他属性，但这些应由库自动处理。

在可用的情况下，应始终使用经过认证的模式。这些为数据的完整性和真实性以及机密性提供了保证。
最常用的认证模式是**[GCM]**和**[CCM]**，应该作为首选使用。

如果 GCM 或 CCM 不可用，则应使用[CTR]模式或[CBC]模式。
由于这些不提供有关数据真实性的任何保证，因此应实施单独的认证，例如使用 [Encrypt-then-MAC] 技术。
将此方法用于[可变长度消息]时需要小心。

如果需要随机访问加密数据，则应使用[XTS]模式。这通常用于磁盘加密，因此它不太可能被 Web 应用程序使用。

[ECB]只在非常特殊的情况下使用。

### 安全随机数生成

各种安全关键功能需要随机数（或字符串），例如生成加密密钥、IV、会话 ID、CSRF 令牌或密码重置令牌。
因此，重要的是这些是安全生成的，并且攻击者不可能猜测和预测它们。

计算机通常不可能生成真正的随机数（没有特殊硬件），因此大多数系统和语言提供两种不同类型的随机性。

伪随机数生成器 (PRNG) 提供速度更快的低质量随机性，可用于与安全无关的功能
（例如页面上的排序结果或随机化 UI 元素）。但是，它们不能用于任何安全关键的事情，
因为攻击者通常有可能猜测或预测输出。

密码安全伪随机数生成器 (CSPRNG) 旨在产生更高质量的随机性（更严格地说，是更大的熵），
使其可安全地用于安全敏感功能。但是，它们速度较慢且 CPU 密集度更高，
在请求大量随机数据时可能会在某些情况下最终阻塞。因此，如果需要大量与安全无关的随机性，它们可能不合适。

下表显示了每种语言的推荐算法，以及不应使用的不安全函数。

| 语言        | 不安全函数                                        | 加密安全函数                                                                              |
| ----------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| C           | `random()`, `rand()`                              | [getrandom(2)]                                                                            |
| Java        | `java.util.Random()`                              | [java.security.SecureRandom]                                                              |
| PHP         | `rand()`, `mt_rand()`, `array_rand()`, `uniqid()` | PHP 7 中的 `random_bytes()`、`random_int()` 或 PHP 5 中的 `openssl_random_pseudo_bytes()` |
| .NET/C#     | Random()                                          | [RNGCryptoServiceProvider]                                                                |
| Objective-C | `arc4random()`（使用 RC4 密码）                   | [SecRandomCopyBytes]                                                                      |
| Python      | `random()`                                        | [secrets()]                                                                               |
| Ruby        | `Random`                                          | [SecureRandom]                                                                            |
| Go          | `rand` 使用 math/rand 包                          | [crypto.rand]包                                                                           |
| Rust        | `rand::prng::XorShiftRng`                         | [rand::prng::chacha::ChaChaRng] 和其它 Rust 库 [CSPRNG]。                               |

#### UUID 和 GUID

通用唯一标识符（UUID 或 GUID）有时用作生成随机字符串的快速方法。尽管它们可以提供合理的随机源，
但这将取决于创建的 UUID 的类型或版本。

具体来说，版本 1 UUID 由高精度时间戳和生成它们的系统的 MAC 地址组成，因此不是随机的
（尽管它们可能很难猜测，因为时间戳接近 100ns）。类型 4 UUID 是随机生成的，但是否使用 CSPRNG
完成将取决于实现。除非已知这在特定语言或框架中是安全的，否则不应依赖 UUID 的随机性。

### 深度防御

应用程序应设计成即使加密控制失败仍然安全。任何以加密形式存储的信息也应受到额外安全层的保护。
应用程序也不应该依赖加密的 URL 参数的安全性，并且应该执行访问控制以防止对信息的未授权访问。

## 密钥管理

### 流程

应实施（并测试）正式流程以涵盖密钥管理的所有方面，包括：

- 生成和存储新密钥。
- 将密钥分发给所需的各方。
- 将密钥部署到应用服务器。
- 轮换和停用旧密钥

### 密钥生成

应使用加密安全函数随机生成密钥，例如安全随机数生成部分中讨论的那些。
密钥**不应**基于常见的单词或短语，或基于通过乱敲键盘生成的“随机”字符。

### 密钥寿命和轮换

应根据许多不同的标准更改（或轮换）加密密钥：

- 如果已知（或怀疑）先前的密钥已被泄露。
  - 这也可能是由有权访问密钥的人离开组织造成的。
- 在指定的时间段过去后（称为加密期）。
  - 有许多因素会影响适当的加密周期，包括密钥的大小、数据的敏感性以及系统的威胁模型。有关进一步指导，
    请参阅 [NIST SP 800-57] 的第 5.3 节。
- 在使用密钥加密特定数量的数据之后。
	- 这通常对于 64 位密钥是 `2^35` 字节（~34GB），对于 128 位密钥是 `2^68` 字节（~295 艾字节）。
- 如果算法提供的安全性发生重大变化（例如宣布新的攻击）。

一旦满足这些标准之一，就应该生成一个新密钥并用于加密任何新数据。
对于如何处理使用旧密钥加密的现有数据，有两种主要方法：

- 解密它并使用新密钥重新加密它。
- 用用于加密它的密钥的 ID 标记每个项目，并存储多个密钥以允许对旧数据进行解密。

通常应该首选第一个选项，因为它极大地简化了应用程序代码和密钥管理过程；然而，这可能并不总是可行的。
请注意，旧密钥通常应在其退役后存储一段时间，以防需要解密数据副本的旧备份。

重要的是，轮换密钥所需的代码和流程在需要之前就已就位，以便在发生泄露时可以快速轮换密钥。
此外，还应实施流程以允许更改加密算法或库，以防在算法或实施中发现新漏洞。

## 密钥存储

安全地存储加密密钥是最难解决的问题之一，因为应用程序总是需要对密钥有一定程度的访问权限才能解密数据。
虽然可能无法完全保护密钥免受完全破坏应用程序的攻击者的侵害，但可以采取一些措施来使他们更难获得密钥。

在可用的情况下，应使用操作系统、框架或云服务提供商提供的安全存储机制。这些包括：

- 物理硬件安全模块 (HSM)。
- 虚拟 HSM。
- Key Vault，例如 [Amazon KMS] 或 [Azure Key Vault]。
- .NET 框架中 ProtectedData 类提供的安全存储 API 。

与简单地将密钥放在配置文件中相比，使用这些类型的安全存储有许多优点。
这些细节将根据所使用的解决方案而有所不同，但它们包括：

- 密钥的集中管理，尤其是在容器化环境中。
- 方便的钥匙轮换和更换。
- 安全密钥生成。
- 简化对 FIPS 140 或 PCI DSS 等监管标准的合规性。
- 使攻击者更难导出或窃取密钥。

在某些情况下，这些都不可用，例如在共享托管环境中，这意味着不可能为任何加密密钥获得高度保护。
但是，仍然可以遵循以下基本规则：

- 不要将密钥硬编码到应用程序源代码中。
- 不要将密钥签入版本控制系统。
- 保护包含具有限制性权限的密钥的配置文件。
- 避免将密钥存储在环境变量中，因为它们可能会通过phpinfo()等函数或通过`/proc/self/environ`文件意外暴露。

### 密钥和数据的分离

在可能的情况下，加密密钥应存储在与加密数据不同的位置。例如，如果数据存储在数据库中，
则密钥应存储在文件系统中。这意味着如果攻击者只能访问其中之一（例如通过目录遍历或 SQL 注入），
他们将无法访问密钥和数据。

根据环境结构，可以将密钥和数据存储在单独的系统上，这将提供更大程度的隔离。

### 加密存储的密钥

在可能的情况下，加密密钥本身应以加密形式存储。为此至少需要两个单独的密钥：

- 数据加密密钥 (DEK) 用于加密数据。
- 密钥加密密钥 (KEK) 用于加密 DEK。

为了使其有效，KEK 必须与 DEK 分开存放。加密的 DEK 可以与数据一起存储，
但只有在攻击者也能够获得存储在另一个系统上的 KEK 时才能使用。

KEK 也应该至少与 DEK 一样强大。Google 的[信封加密]指南包含有关如何管理 DEK 和 KEK 的更多详细信息。

在不能单独存储 KEK 和 DEK 的更简单的应用程序架构（例如共享托管环境）中，这种方法的价值有限，
因为攻击者很可能能够同时获得这两个密钥。但是，它可以为不熟练的攻击者提供额外的障碍。

密钥派生函数 (KDF) 可用于从用户提供的输入（例如密码短语）生成 KEK，然后将其用于加密随机生成的 DEK。
这允许轻松更改 KEK（当用户更改其密码时），而无需重新加密数据（因为 DEK 保持不变）。


[威胁模型]: https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html
[sql server tde]: https://docs.microsoft.com/en-us/sql/relational-databases/security/encryption/transparent-data-encryption?view=sql-server-ver15
[nist 的算法验证程序]: https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program
[fips 140-2]: https://csrc.nist.gov/csrc/media/publications/fips/140/2/final/documents/fips1402annexa.pdf
[pci dss]: https://www.pcisecuritystandards.org/pci_security/glossary#Strong%20Cryptography
[gcm]: https://en.wikipedia.org/wiki/Galois/Counter_Mode
[ccm]: https://en.wikipedia.org/wiki/CCM_mode
[ctr]: https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_%28CTR%29
[cbc]: https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_%28CBC%29
[encrypt-then-mac]: https://en.wikipedia.org/wiki/Authenticated_encryption#Encrypt-then-MAC_%28EtM%29
[可变长度消息]: https://en.wikipedia.org/wiki/CBC-MAC#Security_with_fixed_and_variable-length_messages
[xts]: https://en.wikipedia.org/wiki/Disk_encryption_theory#XTS
[ecb]: https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#ECB
[rngcryptoserviceprovider]: https://docs.microsoft.com/en-us/dotnet/api/system.security.cryptography.rngcryptoserviceprovider?view=netframework-4.8
[java.security.securerandom]: https://docs.oracle.com/javase/8/docs/api/java/security/SecureRandom.html
[getrandom(2)]: http://man7.org/linux/man-pages/man2/getrandom.2.html
[secrandomcopybytes]: https://developer.apple.com/documentation/security/1399291-secrandomcopybytes?language=objc
[secrets()]: https://docs.python.org/3/library/secrets.html#module-secrets
[securerandom]: https://ruby-doc.org/stdlib-2.5.1/libdoc/securerandom/rdoc/SecureRandom.html
[crypto.rand]: https://golang.org/pkg/crypto/rand/
[rand::prng::chacha::chacharng]: https://docs.rs/rand/0.5.0/rand/prng/chacha/struct.ChaChaRng.html
[csprng]: https://docs.rs/rand/0.5.0/rand/prng/index.html#cryptographically-secure-pseudo-random-number-generators-csprngs
[nist sp 800-57]: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r4.pdf
[Amazon KMS]: https://aws.amazon.com/kms/
[Azure Key Vault]: https://azure.microsoft.com/en-gb/services/key-vault/
[信封加密]: https://cloud.google.com/kms/docs/envelope-encryption
