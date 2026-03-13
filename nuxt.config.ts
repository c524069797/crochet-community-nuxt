// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: [
      { code: 'zh', file: 'zh.ts' },
      { code: 'en', file: 'en.ts' },
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'zh',
    },
  },

  app: {
    head: {
      title: '织趣社区 - 钩织爱好者的温馨家园',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: '钩织爱好者社区 - 产品推荐、教程资源、社区讨论' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
      link: [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧶</text></svg>' },
      ],
      script: [
        {
          innerHTML: `(function(){if(typeof document!=='undefined'){document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'light')}})()`,
        },
      ],
    },
  },

  runtimeConfig: {
    postgresUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || '',
    cronSecret: process.env.CRON_SECRET || '',
  },

  nitro: {
    preset: 'vercel',
  },
})
