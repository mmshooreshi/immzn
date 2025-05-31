// types/runtime-config.d.ts

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    githubToken: string;
    spotifyClientId: string;
    spotifyClientSecret: string;
    spotifyRefreshToken: string;

    google: {
      clientId: string;
      clientEmail: string;
      clientSecret: string;
      refreshToken: string;
      spreadsheetId: string;
      driveFolderId: string;
    };

    telegram: {
      botToken: string;
      chatIdAdmin: string;
      chatIdGroup: string;
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

export { };
