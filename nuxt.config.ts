import { defineNuxtConfig } from 'nuxt/config';
// nuxt.config.ts
import yaml from '@rollup/plugin-yaml'


export default defineNuxtConfig({
  app:{      
    head: {
    link: [
    { rel: 'icon', type: 'image/x-icon', href: `/favicon.ico?v=${Date.now()}` },
  ]}
  },
  css: [
    '~/styles/_reset.scss',
    'locomotive-scroll/dist/locomotive-scroll.css',
    '~/styles/_fonts.scss',
    '~/styles/_base.scss',
  ],
  devtools: {
    enabled: true,
  },
  modules: [
    '@unocss/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/eslint',
    "@nuxt/icon"
  ],

  // i18n: {
  //   locales: [
  //     { code: 'en', iso: 'en-US', file: 'en.json' },
  //     { code: 'fa', iso: 'fa-IR', file: 'fa.json' },
  //   ],
  //   defaultLocale: 'en',
  //   lazy: true,
  //   langDir: 'locales/',
  // },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  runtimeConfig: {
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyRefreshToken: '',
    public: {
      githubLink: 'https://github.com/immunity_horizon_event',
      telegramChannelLink: 'https://t.me/immunity_horizon_event',
      linkedinLink: 'https://www.linkedin.com/in/immunity_horizon_event/',
      twitterLink: 'https://twitter.com/immunity_horizon_event',
      redditLink: 'https://www.reddit.com/user/immunity_horizon_event',
      email: 'contact@immhzn.com',
    },
  },
  typescript: {
    strict: true,
  },
  vite: {
    plugins: [yaml()],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use 'sass:color';
            @use "~/styles/animations";
            @use "~/styles/mixins";
            @use "~/styles/screens";
            @use "~/styles/typography";
            @use "~/styles/variables";
          `,
        },
      },
    },
  },
});