<!-- pages/profile.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '~/stores/auth'
import InfoItem from '~/components/InfoItem.vue'
import HackathonPane from '~/components/HackathonPane.vue'
import ConferencePane from '~/components/ConferencePane.vue'

const auth = useAuth()
const router = useRouter()
const user = auth.user
const { data: team, refresh: refreshTeam } = await useFetch('/api/team/my')
const { data: invites, refresh: refreshInvites } = await useFetch('/api/team/invites')

/* convenience: refresh everything after a mutation */
function refetchHackathon() {
    return Promise.all([refreshTeam(), refreshInvites()])
}

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
    <NuxtLayout name="page">
        <div class="mx-2 sm:mx-4 mt-14  py-8 px-1 sm:px-4">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-2 sm:gap-8">
                <!-- Profile Info Card -->
                <!-- Action Panes -->
                <div class="md:col-span-3 bg-white/70 dark:bg-zinc-800 shadow-xl rounded-2xl p-6 space-y-6 ">

                    <HackathonPane :team="team" :invites="invites" @updated="refetchHackathon" />
                    <!-- <ConferencePane /> -->
                </div>

                <div class="md:col-span-3 bg-white/70 dark:bg-zinc-800 shadow-xl rounded-2xl p-6 space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Profile</h2>
                        <button @click="logout" :disabled="loggingOut"
                            class="flex items-center gap-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition text-sm font-medium">
                            <Icon name="mdi:logout" class="w-5 h-5" />
                            <span v-if="!loggingOut">Logout</span>
                            <span v-else>Logging out…</span>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 w-full">
                        <InfoItem label="User ID" :value="user?.id" />
                        <InfoItem label="Phone" :value="user?.phone" />
                        <InfoItem label="Email" :value="user?.email || '—'" />
                        <InfoItem label="Full Name" :value="user?.fullName" />
                        <InfoItem label="Affiliation" :value="user?.affiliation || '—'" />
                        <InfoItem label="Role" :value="user?.role" />
                        <InfoItem label="Field" :value="user?.field" />
                        <InfoItem label="Attendance" :value="user?.attendance" />
                        <InfoItem label="Tracks" :value="user?.tracks?.join(', ') || '—'" />
                        <InfoItem class="overflow-scroll" label="CV URL"
                            :value="user?.cvUrl?.slice(0, 28) + '..' || '—'" />
                        <InfoItem label="Wants Newsletter" :value="user?.wantsNewsletter ? 'Yes' : 'No'" />
                    </div>
                </div>

            </div>
        </div>
    </NuxtLayout>
</template>