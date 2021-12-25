import React from 'react';
import Layout from '@theme/Layout';

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
          <div class="col">
            <div class="card shadow--md margin-vert--md">
              <div class="card__header">
                <h3>KrossIAM 管理后台</h3>
              </div>
              <div class="card__body">
                <p>
                  从这里你可以了解到 KrossIAM 最全面的功能。
                </p>
                <small>
                  没有默认的演示账号，你需要自己注册一个账号后再登录。
                </small>
              </div>
              <div class="card__footer">
                <button class="button button--secondary button--block">
                  打开
                </button>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card shadow--md margin-vert--md">
              <div class="card__header">
                <h3>KrossIAM 代理</h3>
              </div>
              <div class="card__body">
                <p>
                  了解如何使用 KrossIAM 代理为业务系统添加身份管理。
                </p>
                <small>
                  你需要一些`高级`软件的使用和配置经验，例如 git, 命令行等技能。
                </small>
              </div>
              <div class="card__footer">
                <button class="button button--secondary button--block">
                  打开
                </button>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card shadow--md margin-vert--md">
              <div class="card__header">
                <h3>KrossIAM 开发</h3>
              </div>
              <div class="card__body">
                <p>
                  介绍如何在系统中通过 API 集成 KrossIAM 身份管理。
                </p>
                <small>
                  你需要掌握 ExpressJS 的基本开发技能，以及一些 OpenAPI 相关的知识。
                </small>
              </div>
              <div class="card__footer">
                <button class="button button--secondary button--block">
                  打开
                </button>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card shadow--md margin-vert--md">
              <div class="card__header">
                <h3>KrossIAM for React</h3>
              </div>
              <div class="card__body">
                <p>
                  介绍如何在 React WEB 应用中集成 KrossIAM 身份管理。
                </p>
                <small>
                  你需要掌握基本的 React 开发技能，以及关于 KrossIAM 的基本知识。
                </small>
              </div>
              <div class="card__footer">
                <button class="button button--secondary button--block">
                  打开
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
