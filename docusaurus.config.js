// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const config = {
  title: 'KrossIAM',
  tagline: '统一身份管理与访问规则编排系统',
  url: 'https://iam.kross.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'krossdev',
  projectName: 'https://github.com/krossdev/iam-docs.git',
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/krossdev/iam-docs/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/krossdev/iam-docs/edit/main/blog/',
          blogSidebarTitle: '全部博客',
          blogSidebarCount: 'ALL',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} KrossIAM Project.`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig: ({
    image: 'img/logo.png',
    hideableSidebar: true,
    announcementBar:
    {
      id: 'announcement-2',
      content: 'If you like KrossIAM, give it a star ⭐ on <a target="_blank" rel="noopener noreferrer" href="https://github.com/krossdev/iam">GitHub</a>!',
    },
    navbar: {
      title: 'KrossIAM <开发 />',
      logo: {
        alt: 'KrossIAM Logo',
        src: 'img/logo.png',
      },
      items: [
        { type: 'doc', docId: 'quickstart', label: '文档', position: 'left', },
        { to: '/blog', label: '博客', position: 'left' },
        { to: '/demo', label: '演示', position: 'left' },
        {
          href: 'https://github.com/krossdev/iam',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        src: 'img/banner.png',
        alt: 'KrossIAM Logo',
      },
      links: [
        {
          title: '文档',
          items: [
            {
              label: '用户手册',
              to: 'https://iam.kross.work',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'Slack 聊天室',
              href: '#',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} KrossIAM Project.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  }),

  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json',
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#d7129b',
          },
        ],
      },
    ],
  ],
};

module.exports = config;
