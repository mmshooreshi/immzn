import { defineNuxtPlugin } from '#app'
import { ofetch } from 'ofetch'

export default defineNuxtPlugin(nuxtApp => {
  const api = ofetch.create({
    baseURL: '/',
    credentials: 'include',
    retry: 1,
    onResponseError ({ response }) {
      if (response.status === 401) nuxtApp.$router.push('/login')
    }
  })
  nuxtApp.provide('api', api)
})

declare module '#app' {
  interface NuxtApp { $api: ReturnType<typeof ofetch> }
}
