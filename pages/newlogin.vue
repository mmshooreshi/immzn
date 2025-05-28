<template>
    <div class="login m-auto bg-red w-max flex flex-col  items-center ">
        <h1>Login</h1>

        <form @submit.prevent="step === 0 ? sendOtp() : verifyOtp()" class="panel">
            <input v-model.trim="phone" placeholder="Phone (+98...)" v-if="step === 0" />
            <input v-model="code" placeholder="OTP" maxlength="6" v-else />
            <button>{{ step === 0 ? 'Send Code' : 'Verify' }}</button>
        </form>

        <button @click="google">Sign in with Google</button>
    </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
// import { useRouter, useNuxtApp } from '#app'

const phone = ref('+989128462648')
const code = ref('')
const step = ref(0)
const api = useApi()
const router = useRouter()
const log = useNuxtApp().$log.withTag('login')

const sendOtp = async () => {
    log.info('request OTP', phone.value)
    await api('/api/auth/send-otp', { method: 'POST', body: { phone: phone.value } })
    step.value = 1
}

const verifyOtp = async () => {
    log.info('verify OTP')
    await api('/api/auth/verify-otp', {
        method: 'POST',
        body: { phone: phone.value, code: code.value }
    })
    router.push('/newprofile')
}

const google = () => { window.location.href = '/api/auth/google/login' }
</script>
