<!-- pages/invite/[token].vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const token = route.params.token as string
const userStore = useUserStore()

onMounted(async () => {
  try {
    // 1) Call invite-accept in the browser, so Set-Cookie is applied:
    await $fetch(`/api/invite/${token}`, {
      method: 'GET',
      credentials: 'include'
    })

    // 2) Now the browser has the new JWT (with teamId), so re-hydrate:
    await userStore.hydrate()

    // 3) Finally navigate to the profile page:
    router.replace('/newprofile')
  } catch (err: any) {
    // handle 401 / 404 if you want
    console.error('Invite accept failed', err)
    router.replace('/newlogin')
  }
})
</script>

<template>
  <p>Joining your team…</p>
</template>
