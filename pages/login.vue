<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDataStore } from '~/stores/dataStore'
import { useSettings } from '~/composables/useSettings'
import GoogleSignInButton from '~/components/GoogleSignInButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useAuth } from '~/stores/auth'

/** add WebOTP types if you haven’t already: */
declare global {
  interface CredentialRequestOptions { otp?: { transport: string[] } }
  interface OTPCredential extends Credential { code: string }
}

const toast = useToast()
const router = useRouter()
const auth = useAuth()

// now also pull in toastShow:
const { localizedData } = storeToRefs(useDataStore())
const { language, toastShow } = useSettings()

const t = computed(() => localizedData.value.login_page)

const toEnglishDigits = (s: string) =>
  s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
const toPersianDigits = (s: string) =>
  s.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])

type Mode = 'send' | 'verify' | 'info'
const mode = ref<Mode>('send')
const isLoading = ref(false)
const errorMessage = ref('')

// phone step
const phoneModel = ref('')
const phoneEn = computed(() => toEnglishDigits(phoneModel.value))
const isValidPhone = computed(() => /^09\d{9}$/.test(phoneEn.value))

// otp step
const code = ref('')
const isValidCode = computed(() => /^\d{6}$/.test(code.value))
const otpId = ref<string | null>(null)

// info step
const fullName = ref('')
const affiliation = ref('')
const role = ref('')
const field = ref('')

if (auth.user) router.replace('/profile')

// run WebOTP only when entering verify
watch(mode, newMode => {
  if (newMode === 'verify') setupWebOTP()
})

async function setupWebOTP() {
  if (!toastShow.value) return
  if (!window.isSecureContext) {
    toast.warning({ title: 'WebOTP', message: 'Requires HTTPS.' })
    return
  }
  const ua = navigator.userAgent
  const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor)
  const isAndroid = /Android/.test(ua)
  const isSupportedVersion = (() => {
    const m = ua.match(/Chrome\/(\d+)/)
    return m ? parseInt(m[1]) >= 84 : false
  })()

  if (toastShow.value) {
    toast.info({ title: 'WebOTP', message: 'WebOTP API support check...' })
    toast.info({ title: 'Secure context', message: String(window.isSecureContext) })
    toast.info({ title: 'Chrome', message: String(isChrome) })
    toast.info({ title: 'Android', message: String(isAndroid) })
    toast.info({ title: 'Chrome ≥84', message: String(isSupportedVersion) })
  }

  if (!(isChrome && isAndroid && isSupportedVersion)) return

  const ac = new AbortController()
  const form = document.querySelector('form')
  form?.addEventListener('submit', () => {
    if (toastShow.value)
      toast.warning({ title: 'WebOTP', message: 'Aborting WebOTP due to manual submit' })
    ac.abort()
  })

  try {
    if (toastShow.value)
      toast.info({ title: 'WebOTP', message: 'Waiting for SMS…' })
    const otp: OTPCredential = await navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    })
    code.value = otp.code
    if (toastShow.value)
      toast.success({ title: 'WebOTP', message: `Received OTP: ${otp.code}` })
    form?.submit()
  } catch (e: any) {
    if (toastShow.value)
      toast.error({ title: 'WebOTP', message: `Failed: ${e.message || e}` })
  }
}

const requestOTP = async () => {
  errorMessage.value = ''
  if (!isValidPhone.value) return
  isLoading.value = true
  try {
    await $fetch('/api/auth/request-custom-otp', {
      method: 'POST',
      body: { phone: phoneEn.value }
    })
    if (toastShow.value)
      toast.info({ title: 'OTP', message: 'Code sent' })
    mode.value = 'verify'
  } catch {
    errorMessage.value = t.value.otpError
    if (toastShow.value)
      toast.error({ title: 'OTP', message: 'Send failed' })
  } finally {
    isLoading.value = false
  }
}

const verifyOTP = async () => {
  errorMessage.value = ''
  if (!isValidCode.value) return
  isLoading.value = true
  try {
    const { data } = await useFetch<{ ok: boolean; userId: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone: phoneEn.value, otp: code.value }
    })
    if (data.value?.ok) {
      if (toastShow.value)
        toast.success({ title: 'OTP', message: 'Verified' })
      otpId.value = data.value.userId
      mode.value = 'info'
    } else {
      errorMessage.value = data.value === null
        ? t.value.otpError
        : t.value.otpIncorrect
      if (toastShow.value)
        toast.error({ title: 'OTP', message: errorMessage.value })
    }
  } catch {
    errorMessage.value = t.value.otpError
    if (toastShow.value)
      toast.error({ title: 'OTP', message: 'Verify failed' })
  } finally {
    isLoading.value = false
  }
}

const submitInfo = async () => {
  errorMessage.value = ''
  if (!fullName.value || !affiliation.value || !role.value || !field.value) {
    errorMessage.value = t.value.infoError
    if (toastShow.value)
      toast.warning({ title: 'Info', message: 'Please fill all fields' })
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/auth/complete-onboarding', {
      method: 'POST',
      body: {
        userId: otpId.value,
        fullName: fullName.value,
        affiliation: affiliation.value,
        role: role.value,
        field: field.value
      }
    })
    auth.set({
      id: Number(otpId.value),
      phone: phoneEn.value,
      fullName: fullName.value,
      affiliation: affiliation.value,
      role: role.value,
      field: field.value
    })
    if (toastShow.value)
      toast.success({ title: 'Success', message: 'Profile complete' })
    router.push('/profile')
  } catch {
    errorMessage.value = t.value.infoError
    if (toastShow.value)
      toast.error({ title: 'Info', message: 'Submit failed' })
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = (provider: string) => {
  if (toastShow.value)
    toast.info({ title: 'Social Login', message: `Signing in with ${provider}` })
  console.log(`Signing in with ${provider}`)
}
</script>


<template>
  <NuxtLayout name="page">
    <div class="min-h-screen flex flex-col lg:flex-row bg-light dark:bg-dark transition-colors duration-300">
      <!-- Left Image -->
      <div class="hidden lg:flex w-1/2 items-center justify-center bg-cover bg-center"
        style="background-image: url('/login-side-image.jpg')">
        <div class="bg-black/40 w-full h-full flex items-center justify-center">
          <h2 class="text-3xl font-bold text-white text-center">{{ t.heroTitle }}</h2>
        </div>
      </div>

      <!-- Login Panel -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-4 py-10  h-screen">
        <div class="max-w-md w-full space-y-8 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl">
          <div class="text-center space-y-1">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ t.title }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t.subtitle }}</p>
          </div>

          <form @submit.prevent="mode === 'send' ? requestOTP() : verifyOTP()" class="space-y-6">
            <!-- Phone Input -->
            <BaseInput v-if="mode === 'send'" class="ltr" v-model="phoneModel" numberOnly :persian="language === 'fa'"
              :placeholder="t.phonePlaceholder" :floatinglabel="t.phoneLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
              placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30"
              :iconName="phoneModel ? (isValidPhone ? 'mdi:check-circle' : 'mdi:alert-circle') : null"
              :error="phoneModel && !isValidPhone ? t.phoneError : ''" dir="ltr" />

            <!-- OTP Code Input -->
            <!-- {{ mode }} -->
            <BaseInput v-if="mode === 'verify'" class="ltr" v-model="code" numberOnly :persian="language === 'fa'"
              ref="inputOTP" name="otp" id="otp" autocomplete="one-time-code" inputmode="numeric"
              :placeholder="t.codePlaceholder" :floatinglabel="t.codeLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
              placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30"
              :iconName="code ? (isValidCode ? 'mdi:check-circle' : 'mdi:alert-circle') : null"
              :error="code && !isValidCode ? t.codeError : ''" dir="ltr" />

            <BaseButton type="submit" :loading="isLoading" :disabled="mode === 'send' ? !isValidPhone : !isValidCode"
              class="text-center" :class="(mode === 'send' && !isValidPhone) || (mode === 'verify' && !isValidCode)
                ? 'bg-cyan-800/50 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-600 text-cyan-100 dark:bg-cyan-800 dark:text-white'">
              {{ mode === 'send' ? t.sendCode : t.verifyAndLogin }}
            </BaseButton>

            <p v-if="errorMessage" class="text-center text-sm text-red-600">{{ errorMessage }}</p>
          </form>

          <div class="flex items-center gap-2">
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ t.orLoginWith }}</span>
            <div class="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          </div>

          <GoogleSignInButton :onClick="() => handleSocialLogin('google')" />

          <p class="text-[10px] leading-5 text-[#797B7D] text-right dark:text-gray-500">
            {{ t.legalText }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
