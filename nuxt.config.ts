import { defineNuxtConfig } from 'nuxt/config'

import { fontPreloadLinks } from './utils/font-preload';
// import GoogleProvider      from 'next-auth/providers/google'
// import CredentialsProvider from 'next-auth/providers/credentials'

// nuxt.config.ts
import yaml from '@rollup/plugin-yaml';
// nuxt.config.ts
import { resolve } from 'path';
import fs from 'fs';

// SAFETY: nuke all leftover cached plugins
// sadly i commented out this because gpt said so, while i love this code:
// const pluginPath = resolve('.nuxt/plugins/server.mjs');
// if (fs.existsSync(pluginPath)) fs.rmSync(pluginPath, { force: true });

export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }
      ],

      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          // href: `/favicon.ico?v=${Date.now()}`,
          href: `/favicon.ico?v=${process.env.GIT_COMMIT_SHA || 'dev'}`

        },
        ...fontPreloadLinks,
      ],
    },
  },
  //   routeRules: {
  //   '/profile/**': { middleware: 'auth' },
  //   '/team/**'   : { middleware: 'auth' }
  // },


  css: [
    '~/styles/fontiran.css',
    '~/styles/_reset.scss',
    'locomotive-scroll/dist/locomotive-scroll.css',
    '~/styles/_fonts.scss',
    '~/styles/_base.scss',
  ],
  devtools: {
    enabled: true,
  },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@sidebase/nuxt-auth',
    '@tresjs/nuxt',
    '@unocss/nuxt',
    // '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@vueuse/motion/nuxt',
    'nuxt-mapbox',
    '@nuxt/image',
    'nuxt-toast'
  ],
  /* ——— NEW AUTH BLOCK ——————————————————————————————— */
  /** Sidebase / Auth.js */
  auth: {
    provider: {
      type: 'authjs',           // tell the module we’ll use AuthJS
      defaultProvider: undefined,
      addDefaultCallbackUrl: true,
      // trustHost: false
      trustHost: true,  // ✅ Very important in dev
    },
    originEnvKey: 'http://localhost:3000',
    baseURL: 'http://localhost:3000/api/auth',

  },
  piniaPluginPersistedstate: {
    storage: 'cookies',
    cookieOptions: {
      // sameSite: 'strict',
      sameSite: 'lax',
      secure: false,        // ✅ only works over HTTPS if true — NOT good for localhost
      // secure  : true,
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }
  },



  /* optional global defaults for persistedstate (not required) */
  // piniaPersistedstate: { storage: 'localStorage' },


  mapbox: {
    accessToken: process.env.MAPBOX_TOKEN,

  },

  // i18n: {
  //   locales: [
  //     { code: 'en', iso: 'en-US', file: 'en.json' },
  //     { code: 'fa', iso: 'fa-IR', file: 'fa.json' },
  //   ],
  //   defaultLocale: 'en',
  //   lazy: true,
  //   langDir: 'locales/',
  // },
  pinia: {
    storesDirs: ['./stores/**'],
  },

  nitro: {
    trustProxy: true,
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      ignore: ['/i', '/j', '/']

    },
    // Nitro’s first-class KV layer → no “raw” ioredis in code
    storage: {
      redis: {
        driver: 'redis',
        url: process.env.REDIS_URL
      }

    }

  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    smsIrApiKey: '',
    smsIrSecretKey: '',
    smsIrTemplateId: '',
    smsMock: process.env.SMS_MOCK,
    redisUrl: process.env.REDIS_URL,
    databaseUrl: process.env.DATABASE_URL,

    // server-only values
    authSecret: process.env.NUXT_AUTH_SECRET,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatIdAdmin: process.env.TELEGRAM_CHAT_ID_ADMIN,
      chatIdGroup: process.env.TELEGRAM_CHAT_ID_GROUP
    },


    githubToken: process.env.GITHUB_TOKEN,

    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
    melipayamakApiKey: process.env.MELIPAYAMAK_API_KEY,
    melipayamakSenderId: process.env.MELIPAYAMAK_SENDER_ID,
    melipayamakOTPMsgId: process.env.MELIPAYAMAK_OTP_MSG_ID,
    melipayamakInviteMsgId: process.env.MELIPAYAMAK_INVITE_MSG_ID,
    public: {
      dataMode: process.env.DATA_MODE || 'github',
      neshanPublicToken: process.env.NESHAN_PUBLIC_API_KEY,
      // exposed to both server & client
      githubOwner: process.env.GITHUB_OWNER,
      githubRepo: process.env.GITHUB_REPO,

      githubLink: 'https://github.com/immunity_horizon_event',
      telegramChannelLink: 'https://t.me/immunity_horizon_event',
      linkedinLink: 'https://www.linkedin.com/in/immunity_horizon_event/',
      twitterLink: 'https://twitter.com/immunity_horizon_event',
      redditLink: 'https://www.reddit.com/user/immunity_horizon_event',
      email: 'contact@immhzn.com',
    },
  },

  typescript: {
    // strict: true,
    strict: false,
    typeCheck: false

  },
  vite: {
    plugins: [yaml()],
    optimizeDeps: {
      include: ['@tresjs/core', 'pinia', 'locomotive-scroll'], // adjust to real deps
    },

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
  compatibilityDate: '2025-05-28'
});