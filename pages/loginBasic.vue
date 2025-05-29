<!-- pages/login.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/stores/auth'

// pages/login.vue – at top of <script setup>
const auth = useAuth()
if (auth.user) await navigateTo('/profile')   // SSR-compatible early exit

const phone = ref('')
const otp = ref('')
const step = ref<'phone' | 'otp'>('phone')
const busy = ref(false)
const router = useRouter()
const statusMessage = ref('Enter your phone number.')
const isPhoneValid = computed(() => phone.value.match(/^\+98\d{10}$/))
const isOtpValid = computed(() => otp.value.length === 6)

async function sendOtp() {
    busy.value = true
    try {
        await $fetch('/api/auth/request-otp', { method: 'POST', body: { phone: phone.value } })
        step.value = 'otp'
        $log.info('➡️  OTP requested', phone.value)
        statusMessage.value = '➡️  OTP requested, enter the code.'
    } catch (err) {
        $log.error('sendOtp failed', err)
        statusMessage.value = '❌  sendOtp failed'
    } finally {
        busy.value = false
    }
}


async function verify() {
    busy.value = true
    try {
        // await $fetch('/api/auth/verify-otp', { method: 'POST', body: { phone: phone.value, otp: otp.value } })
        const { data } = await useFetch('/api/auth/verify-otp', {
            method: 'POST',
            body: { phone: phone.value, otp: otp.value }
        })
        $log.debug('Verified response:', data.value)

        if (data.value?.ok) {
            $log.info('➡️ OTP verified, redirecting after cookie is stored')
            auth.set({ id: data.value.userId, phone: phone.value }) // ← hydrate *now*
            statusMessage.value = '✅ correct, redirecting you to profile.'
            await navigateTo('/profile')
            statusMessage.value = 'Enter your phone number.'
            step.value = 'phone'
            otp.value = ''
            // phone.value = ''
        } else {
            $log.info('❌ OTP WRONG')
            statusMessage.value = '❌ wrong, try again'
            otp.value = ''

        }
        // router.push('/profile')
    } catch (err) {
        $log.error('verify failed', err)
        alert('OTP incorrect')
    } finally {
        busy.value = false
    }
}

definePageMeta({ guestOnly: true })

</script>

<template>
    <div class="flex flex-col  items-center justify-center min-h-screen gap-4 w-max mx-auto">
        <h1 class="text-2xl font-bold">OTP Login</h1>

        <form v-if="step === 'phone'" @submit.prevent="sendOtp" class="space-x-2">
            <input v-model="phone" placeholder="Phone" class="p-2 border border-white/10 border-solid rounded"
                required />
            <button :disabled="!isPhoneValid || busy"
                class="px-5 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed ">
                <div class="flex items-center gap-2">
                    <svg v-if="busy" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Send</span>
                </div>
            </button>
        </form>

        <form v-else @submit.prevent="verify" class="space-x-2">
            <input v-model="otp" placeholder="123456" class="p-2 border border-white/10  border-solid rounded"
                required />
            <button :disabled="!isOtpValid || busy"
                class="px-5 py-2 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed ">
                <div class="flex items-center gap-2">
                    <svg v-if="busy" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Verify</span>
                </div>
            </button>
        </form>
        <div class="self-start px-0 text-sm text-gray-700 -mt-4">{{ statusMessage }}</div>
    </div>
</template>