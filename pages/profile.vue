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
        <LogoutButton />
    </div>
</template>