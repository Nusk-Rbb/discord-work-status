import { defineConfig } from 'vitepress'

const repo = 'https://github.com/Nusk-Rbb/discord-work-status'

export default defineConfig({
  lang: 'ja-JP',
  title: 'Discord Work Status',
  description: 'Discord の Rich Presence を好きなステータスに設定できるデスクトップアプリ',

  // https://Nusk-Rbb.github.io/discord-work-status/ で配信する
  base: '/discord-work-status/',

  // src/assets/icons/ は Tauri 側のアセットなので docs のビルド対象から外す
  srcExclude: ['**/README.md'],

  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/discord-work-status/favicon.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Discord Work Status' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Discord の Rich Presence を好きなステータスに設定できるデスクトップアプリ',
      },
    ],
  ],

  themeConfig: {
    logo: '/icons/work.png',

    nav: [
      { text: 'ガイド', link: '/guide/install' },
      { text: '開発者向け', link: '/dev/build' },
      {
        text: 'ダウンロード',
        link: `${repo}/releases/latest`,
      },
    ],

    sidebar: [
      {
        text: 'ガイド',
        items: [
          { text: 'インストール', link: '/guide/install' },
          { text: '使い方', link: '/guide/usage' },
          { text: '画像の指定方法', link: '/guide/images' },
          { text: '自動アップデート', link: '/guide/updates' },
        ],
      },
      {
        text: '開発者向け',
        items: [
          { text: 'ソースからビルドする', link: '/dev/build' },
          { text: 'Application ID', link: '/dev/application-id' },
          { text: 'リリース手順', link: '/dev/release' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: repo }],

    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: 'このページを編集する',
    },

    lastUpdated: {
      text: '最終更新',
      formatOptions: { dateStyle: 'medium', timeStyle: undefined },
    },

    docFooter: {
      prev: '前のページ',
      next: '次のページ',
    },

    outline: { label: '目次', level: [2, 3] },
    returnToTopLabel: 'トップへ戻る',
    sidebarMenuLabel: 'メニュー',
    darkModeSwitchLabel: 'テーマ',
    lightModeSwitchTitle: 'ライトモードに切り替え',
    darkModeSwitchTitle: 'ダークモードに切り替え',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '検索', buttonAriaLabel: '検索' },
          modal: {
            displayDetails: '詳細を表示',
            resetButtonTitle: '検索をリセット',
            backButtonTitle: '戻る',
            noResultsText: '見つかりませんでした:',
            footer: {
              selectText: '選択',
              navigateText: '移動',
              closeText: '閉じる',
            },
          },
        },
      },
    },

    footer: {
      message: 'MIT License で提供されています。',
      copyright: `Copyright © ${new Date().getFullYear()} Nusk-Rbb`,
    },
  },
})
