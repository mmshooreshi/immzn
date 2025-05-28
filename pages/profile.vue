<script setup lang="ts">
import { useAuth } from '~/stores/auth'
const auth = useAuth()
const user = auth.user
const router = useRouter()

const loggingOut = ref(false)

async function logout() {
    loggingOut.value = true
    try {
        await auth.logout()
        $log.info('🚪 User logged out from profile page')
        router.push('/login')
    } catch (err) {
        $log.error('❌ Logout failed', err)
    } finally {
        loggingOut.value = false
    }
}

definePageMeta({ requiresAuth: true })

</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 class="text-2xl font-bold">Welcome {{ user?.phone }}</h1>
        <button @click="logout" :disabled="loggingOut"
            class="px-5 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="loggingOut" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Logout</span>
        </button>
    </div>
</template>