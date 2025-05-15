// types/runtime-config.d.ts

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    githubToken: string;
    spotifyClientId: string;
    spotifyClientSecret: string;
    spotifyRefreshToken: string;
  }

  interface PublicRuntimeConfig {
    githubLink: string;
    telegramChannelLink: string;
    linkedinLink: string;
    twitterLink: string;
    redditLink: string;
    email: string;
    githubOwner: string;
    githubRepo: string;
  }
}

export {};
