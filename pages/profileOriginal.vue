<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#imports'
import { useUserStore } from '~/stores/user'

// Pinia store and router
const userStore = useUserStore()
const router = useRouter()

// Local state for inviting teammates
const invitePhone = ref<string>('')

// Ensure store is hydrated on mount (middleware handles redirects)
onMounted(async () => {
  if (!userStore.ready) {
    await userStore.hydrate()
  }
})

// Reactive user profile from store
const user = computed(() => userStore.profile)

// Logout clears session and navigates to login
const logout = async () => {
  await $fetch('/api/logout', { method: 'POST' })
  router.push('/login')
}

// Invite a teammate by phone number
const invite = async () => {
  if (!invitePhone.value) return
  try {
    await $fetch('/api/team/invite', {
      method: 'POST',
      body: { phone: invitePhone.value }
    })
    invitePhone.value = ''
  } catch (e) {
    console.error('Invite failed', e)
  }
}
</script>

<template>
  <NuxtLayout name="page">
    <div class="container mt-16 mx-auto px-4 py-8 flex flex-col items-center">
      <div class="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
        <!-- Profile Section -->
        <div class="flex flex-col items-center space-y-4">
          <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="Avatar"
            class="w-32 h-32 rounded-full object-cover shadow-md" />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ user?.name || 'Your Profile' }}
          </h1>
          <p class="ltr text-gray-600 dark:text-gray-300">{{ user?.phone }}</p>
          <button @click="logout"
            class="mt-2 px-6 py-2 bg-red-600 text-white rounded-lg transition hover:bg-red-700 focus:outline-none">
            Logout
          </button>
        </div>

        <!-- Team Section -->
        <section v-if="user?.teammates?.length" class="mt-8">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">Your Team</h2>
          <div class=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="member in user.teammates" :key="member.phone"
              class="w-max flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
              <div v-if="user.phone != member.phone">
                <img :src="member.avatarUrl" alt="Teammate Avatar" class="w-10 h-10 rounded-full object-cover" />
                <div class="flex-grow">
                  <p class="font-medium text-gray-900 dark:text-gray-100">
                    {{ member.name }}
                  </p>
                  <p class="ltr text-sm text-gray-600 dark:text-gray-300">
                    {{ member.phone }}
                  </p>
                </div>
              </div>
              <div
                class="bg-gray-500/50 pt-3 hover:scale-110 transition-all cursor-pointer hover:bg-gray-500 p-2 rounded-3xl"
                v-else>
                <Icon name="mdi:plus" />
              </div>
            </div>
          </div>

          <form @submit.prevent="invite" class="ltr mt-6 flex flex-col sm:flex-row gap-2">
            <input v-model="invitePhone" type="tel" placeholder="Teammate phone (+98…)"
              class="ltr text-left flex-grow border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100" />
            <button type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg transition hover:bg-blue-700 focus:outline-none">
              Add Teammate
            </button>
          </form>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.container {
  min-height: calc(100vh - 4rem);
}
</style>
