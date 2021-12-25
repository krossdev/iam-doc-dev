import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.hero)}>
      <div className="container" style={{ color: 'white' }}>
        <h1 className="hero__title">{siteConfig.tagline}</h1>
        <p className="hero__subtitle">面向 KrossIAM 开发人员的资料库</p>
        <div className='margin-top--xl margin-bottom--lg'>
          <Link to="/docs/intro" className="button button--lg button--secondary">文档</Link>
          <Link to="/blog" className="button button--lg button--secondary margin-left--md">博客</Link>
          <Link to="/demo" className="button button--lg button--info margin-left--md"
            style={{color:'black'}}>演示</Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={`${siteConfig.title}`} description="统一身份管理及访问规则编排服务器">
      <HomepageHeader />
      <div class="alert alert--info" role="alert"
        style={{ borderRadius: 0, textAlign: 'center' }}>
        本站点主要面向 KrossIAM 开发人员，KrossIAM 用户请访问
        &nbsp;<Link to='https://iam.kross.work'>KrossIAM 文档站</Link>
      </div>
      <main className={styles.main}>
        <div className="row">
          <div className="col col--7">
            <h3>介绍</h3>
            <p>
              KrossIAM 是以安全作为优先设计的身份管理和访问规则编排系统，实现了大多数系统都需要，
              但却不太容易正确处理的部分--身份管理（或账户管理），
              包括基本的注册、认证、存储，密码找回，2FA 认证，OIDC 登录，
              OAuth2 身份提供，SAML 单点登录，等等...
              &nbsp;
              <Link to='#'>
                看看我可以使用 KrossIAM 做些什么？
              </Link>
            </p>
            <p>
              KrossIAM 内置灵活的授权子系统，可以应对各种不同的授权场景，
              与常见的（例如基于角色的访问控制系统（RBAC），基于属性的访问授权系统（ABAC），等）
              不太一样，KrossIAM 的授权子系统基于可编程的规则语言，这让事情变得些微复杂，
              但是却足够灵活及强大。
              &nbsp;
              <Link to='#'>
                看看如何使用 KrossIAM 授权编排系统实现常见的访问控制模式？
              </Link>
            </p>
            <p>
              KrossIAM 提供 2 种方式将这些功能添加到现有应用中，<em>代理</em> 和 <em>API 接口</em>，
              使用代理是最简单的方法，无需对现有应用进行修改，既可以让一个没有账户管理的系统摇身一变，
              成为一个带有账户管理的系统。API 接口提供深度整合能力，将 KrossIAM 的功能融合到现有应用中。
              &nbsp;
              <Link to='#'>
                看看如何使用 KrossIAM 代理为现有系统添加账户管理功能？
              </Link>
            </p>
            <h3>特征</h3>
            <ul>
              <li>基于 OPA 的规则编排系统，精细的授权模式；</li>
              <li>支持 Sqlite、PostgreSQL、MySQL、CockroachDB 数据库；</li>
              <li>支持多项目，各项目间使用数据库 schema 实现数据隔离；</li>
            </ul>
          </div>
          <div className="col col--5">
            <h3>文档</h3>
            <ul>
              <li>
                <Link to='/docs/intro'>快速上手</Link>
              </li>
            </ul>
            <h3>博客</h3>
            <ul>
              <li>
                <Link to='/blog/email'>KrossIAM 邮件发送模块</Link>
              </li>
              <li>
                <Link to='/blog/ms'>KrossIAM 中的消息服务</Link>
              </li>
              <li>
                <Link to='/blog/password-hashing'>KrossIAM 中的密码哈希</Link>
              </li>
              <li>
                <Link to='/blog/kiam-datastore'>KrossIAM 后台数据存储</Link>
              </li>
              <li>
                <Link to='/blog/log'>KrossIAM 中的日志处理</Link>
              </li>
              <li>
                <Link to='/blog/i18n'>KrossIAM 中的 i18n</Link>
              </li>
              <li>
                <Link to='/blog/fenotes'>KrossIAM 前端开发说明</Link>
              </li>
            </ul>
            <h3>资源</h3>
            <ul>
              <li>
                <Link to='https://github.com/krossdev/iam'>代码仓库</Link>
              </li>
              <li>
                <Link to='/'>Slack 聊天室</Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}
