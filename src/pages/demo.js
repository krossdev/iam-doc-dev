import React from 'react';
import Layout from '@theme/Layout';

const items = [
  {
    title: 'KrossIAM 管理后台',
    desc: '请先从这里开始认识 KrossIAM。你会发现 KrossIAM 很简单。',
    secondaryDesc: '没有默认的登录账号，你需要先注册一个账号后才能登录系统。',
    href: 'https://iam-demo.kross.work',
  }, {
    title: 'KrossIAM 代理',
    desc: '了解如何使用 KrossIAM 代理为系统添加身份管理。',
    secondaryDesc: '你需要一些`高级`软件的使用和配置经验，例如 git, 命令行等技能。',
    href: 'demo-proxy',
  }, {
    title: 'KrossIAM API 开发',
    desc: '了解如何在项目中通过 KrossIAM API 集成身份管理。',
    secondaryDesc: '你需要掌握 NodeJS 的基本开发技能，以及一些 OpenAPI 相关的知识。',
    href: '#',
  }, {
    title: 'KrossIAM for React',
    desc: '了解如何在 React Web 应用中集成 KrossIAM 身份管理。',
    secondaryDesc: '你需要掌握基本的 React 开发技能，以及关于 KrossIAM 的基本知识。',
    href: '#',
  },
];

export default function Demo() {
  return (
    <Layout>
      <div class="hero shadow--lw">
        <div class="container">
          <h1 class="hero__title">KrossIAM 演示</h1>
          <p class="hero__subtitle">
            本页列出了一些演示项目，可以快速了解 KrossIAM 的各种能力
          </p>
        </div>
      </div>
      <div class="container margin-vert--lg">
        <div class="row">
          {items.map(item => (
            <div class="col">
              <Card
                title={item.title}
                desc={item.desc}
                secondaryDesc={item.secondaryDesc}
                href={item.href}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function Card(props) {
  return (
    <div class="card shadow--md margin-vert--md">
      <div class="card__header">
        <h3>{props.title}</h3>
      </div>
      <div class="card__body">
        <p>{props.desc}</p>
        <small>{props.secondaryDesc}</small>
      </div>
      <div class="card__footer">
        <a class="button button--primary button--block"
          style={{color:'white'}} href={props.href} target='_blank'>
          打开
        </a>
      </div>
    </div>
  )
}
