<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import type { UserProfile } from '~/types'

// 1) Pinia
const userStore = useUserStore()

// 2) SSR fetch of /api/user/me
const router = useRouter()
// SSR fetch that actually sends the cookie
const { data: profile, error } = await useFetch<UserProfile>(
  '/api/user/me',
  {
    server: true,
    credentials: 'include',
    headers: useRequestHeaders(['cookie'])
  }
)

// 3) Apply result
if (error.value) {
  console.log(error.value)
  // not logged in → send to login
  router.push('/newlogin')
} else if (profile.value) {
  userStore.$patch({
    profile: profile.value,
    ready: true
  })
} else {
  // empty but no error? still mark ready
  userStore.ready = true
}

// 4) Local refs/computeds
const user = computed(() => userStore.profile)
const invitePhone = ref('')
const api = useApi()
// const log = useNuxtApp().$log.withTag('profile')

// 5) Actions
async function invite() {
  if (!invitePhone.value) return
  // log.info('invite →', invitePhone.value)
  await api('/api/team/invite', {
    method: 'POST',
    body: { phone: invitePhone.value }
  })
  invitePhone.value = ''
  alert('Invitation sent')
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST' })
  userStore.$reset()
  router.push('/login')
}
</script>

<template>
  <div v-if="userStore.ready">
    <div v-if="user">
      <img :src="user.avatarUrl" width="120" class="circle" />
      <h2>{{ user.name }}</h2>
      <p>{{ user.phone }}</p>

      <h3>Your Team</h3>
      <ul>
        <li v-for="m in user.teammates" :key="m.phone">
          <img :src="m.avatarUrl" width="32" class="circle" />
          {{ m.name }} — {{ m.phone }}
        </li>
      </ul>

      <form @submit.prevent="invite" class="mt-4">
        <input v-model="invitePhone" placeholder="Teammate phone (+98…)" class="border p-2 rounded" />
        <button class="ml-2 p-2 bg-blue-500 text-white rounded">
          Add teammate
        </button>
      </form>

      <button @click="logout" class="mt-4 p-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  </div>
</template>
