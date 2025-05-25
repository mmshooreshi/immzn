/* server/api/auth/[...].ts */
import { NuxtAuthHandler } from '#auth'

/* Providers MUST use .default() because of Vite/SSR */
import GoogleProvider      from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NuxtAuthHandler({
  /**  Secret used to sign the JWT – read from runtime config in prod */
  secret: useRuntimeConfig().authSecret || 'dev-secret',

  providers: [
    // @ts-expect-error – .default() required for SSR
    GoogleProvider.default({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),

    // Phone-OTP Credentials provider
    // @ts-expect-error – .default() required for SSR
    CredentialsProvider.default({
      id:   'phone-otp',
      name: 'Phone OTP',
      credentials: { phone: { label: 'Phone' }, code: { label: 'Code' } },
      async authorize (creds) {
        const { status } = await $fetch<{ status:'ok'|'sent'|'invalid'|'error' }>('/api/otp', {
          method: 'POST',
          body:   { phone: creds?.phone, code: creds?.code }
        })
        return status === 'ok' ? { id: creds!.phone } : null
      }
    })
  ],

  /* Optional callbacks, events, pages… leave empty for now */
})
