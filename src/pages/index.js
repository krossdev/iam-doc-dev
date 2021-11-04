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
        本站点主要面向 KrossIAM 的开发人员，包含大量与使用 KrossIAM 无直接关系的信息，
        KrossIAM 用户请移步至 <Link to='https://iam.kross.work'>KrossIAM 文档站</Link>
      </div>
      <main className={styles.main}>
        <div className="row">
          <div className="col col--7">
            <h3>介绍</h3>
            <p>
              KrossIAM 是以安全作为优先设计的身份管理和访问规则编排系统，实现了大多数系统都需要，
              但却不太容易正确处理的核心部分--身份管理（或账户管理），
              包括账户注册、登录、存储，密码找回，第三方社交账号登录，多因素认证，等等...
            </p>
            <p>
            </p>
            <h3>特征</h3>
            <ul>
              <li>基于 OPA 的规则编排系统，精细的授权模式；</li>
              <li>支持 Sqlite、PostgreSQL、MySQL、CockroachDB 数据库；</li>
              <li>支持多 Realm，各 Realm 间使用数据库 schema 实现数据隔离；</li>
            </ul>
          </div>
          <div className="col col--5">
            <h3>文章</h3>
            <ul>
              <li>
                <Link to='/blog/password-hashing'>KrossIAM 中的密码哈希</Link>
              </li>
              <li>
                <Link to='/blog/kiam-datastore'>KrossIAM 后台数据存储</Link>
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
