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
          blogSidebarTitle: '全部文章',
          blogSidebarCount: 'ALL',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Kross IAM Project.`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    ({
      image: 'img/logo.png',
      hideableSidebar: true,
      announcementBar:
      {
        id: 'announcement-2',
        content: 'If you like Kross IAM, give it a star ⭐ on <a target="_blank" rel="noopener noreferrer" href="https://github.com/krossdev/iam">GitHub</a>!',
      },
      navbar: {
        title: 'Kross IAM',
        logo: {
          alt: 'Kross IAM Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: '指南',
          },
          {to: '/blog', label: '博客', position: 'left'},
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
          alt: 'Kross IAM Logo',
          href: 'https://github.com/krossdev/iam',
        },
        links: [
          {
            title: '文档',
            items: [
              {
                label: '指南',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/krossiam',
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
        copyright: `Copyright © ${new Date().getFullYear()} Kross IAM Project, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
