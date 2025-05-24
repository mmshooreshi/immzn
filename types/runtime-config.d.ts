// types/runtime-config.d.ts

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    githubToken: string;
    spotifyClientId: string;
    spotifyClientSecret: string;
    spotifyRefreshToken: string;

    google: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      spreadsheetId: string;
      driveFolderId: string;
    };

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
