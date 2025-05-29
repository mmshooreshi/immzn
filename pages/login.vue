<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDataStore } from '~/stores/dataStore'
import { useSettings } from '~/composables/useSettings'

import GoogleSignInButton from '~/components/GoogleSignInButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'
import { useAuth } from '~/stores/auth'

const toast = useToast()

const router = useRouter()
const auth = useAuth()

const { localizedData } = storeToRefs(useDataStore())
const { language } = useSettings()

// Localized login content
const t = computed(() => localizedData.value.login_page)

// Utilities to convert digits
const toEnglishDigits = (str: string) =>
  str.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
const toPersianDigits = (str: string) =>
  str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])

// Form state
const phoneModel = ref('')
const code = ref('')
const mode = ref<'send' | 'verify'>('send')
const isLoading = ref(false)
const errorMessage = ref('')
const otpId = ref<string | null>(null)

// Validation
const phoneEn = computed(() => toEnglishDigits(phoneModel.value))
const isValidPhone = computed(() => /^09\d{9}$/.test(phoneEn.value))
const isValidCode = computed(() => /^\d{6}$/.test(code.value))

// Redirect if user already has a session
// const session = useCookie('auth_token')
const inputOTP = ref<HTMLInputElement>()

onMounted(async () => {
  console.log("testing toast")
  toast.info({ title: 'yo0ho0', message: 'testing ...' })



  if (process.client) {


    if ('OTPCredential' in window) {
      console.log('[WebOTP] ✅ WebOTP API is supported in this browser.')

      toast.info({ title: 'WebOTP', message: 'WebOTP API is supported.' })

      console.log('[WebOTP] DOMContentLoaded — setting up OTP listener')
      // const input = document.querySelector<HTMLInputElement>('input[autocomplete="one-time-code"]')

      if (!inputOTP.value?.inputRef) {
        console.log('[WebOTP] No one-time-code input found, skipping.')
        toast.warning({ title: 'yo0ho0', message: 'WebOTP: no OTP field detected' })
        return
      } else {
        toast.success({ title: 'yo0ho0', message: 'WebOTP: OTP field detected' })
      }


      // AbortController to cancel WebOTP if the user submits manually
      const ac = new AbortController()
      const form = inputOTP.value?.inputRef?.closest('form')
      if (form) {
        form.addEventListener('submit', () => {
          console.log('[WebOTP] Form submitted manually — aborting WebOTP')
          toast.warning({ title: 'yo0ho0', message: 'WebOTP: aborted due to manual submit' })
          ac.abort()
        })
      }

      // Kick off the WebOTP flow
      console.log('[WebOTP] Calling navigator.credentials.get()')
      toast.info({ title: 'yo0ho0', message: 'WebOTP: waiting for SMS…' })

      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      }).then((otp: OTPCredential) => {
        console.log('[WebOTP] OTP received:', otp.code)
        toast.success({ title: 'yo0ho0', message: `Received OTP: ${otp.code}` })
        inputOTP.value = otp.code
        // Auto-submit
        if (form) {
          console.log('[WebOTP] Auto-submitting form with OTP')
          toast.info({ title: 'yo0ho0', message: 'WebOTP: auto-submitting form' })
          form.submit()
        }
      }).catch(err => {
        console.error('[WebOTP] Error or timeout:', err)
        toast.error({ title: 'yo0ho0', message: `WebOTP failed: ${err.message || err}` })
      })

    } else {
      console.warn('[WebOTP] ❌ WebOTP API not supported. Diagnosing why…')
      toast.warning({ title: 'WebOTP', message: 'Not supported. Checking why…' })

      const isSecure = window.isSecureContext
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      const isAndroid = /Android/.test(navigator.userAgent)
      const isSupportedVersion = (() => {
        const match = navigator.userAgent.match(/Chrome\/(\d+)/)
        return match ? parseInt(match[1]) >= 84 : false
      })()

      console.log('[WebOTP] Secure context:', isSecure)
      console.log('[WebOTP] Browser is Chrome:', isChrome)
      console.log('[WebOTP] Device is Android:', isAndroid)
      console.log('[WebOTP] Chrome version >= 84:', isSupportedVersion)

      if (!isSecure) {
        console.warn('[WebOTP] 🔐 Not HTTPS.')
        toast.warning({ title: 'WebOTP', message: 'Requires HTTPS.' })
      }
      if (!isChrome) {
        console.warn('[WebOTP] 🌐 Not Chrome.')
        toast.warning({ title: 'WebOTP', message: 'Only Chrome supports WebOTP.' })
      }
      if (!isAndroid) {
        console.warn('[WebOTP] 📱 Not Android.')
        toast.warning({ title: 'WebOTP', message: 'Only works on Android.' })
      }
      if (!isSupportedVersion) {
        console.warn('[WebOTP] 🚫 Chrome version too old.')
        toast.warning({ title: 'WebOTP', message: 'Requires Chrome 84+.' })
      }

      toast.info({ title: 'WebOTP', message: 'Try https://web-otp.glitch.me on a supported device.' })
    }

  }

})

if (auth.user) await navigateTo('/profile')   // SSR-compatible early exit



// ──────────────────────────────
// WebOTP API Integration
// ──────────────────────────────

// 1️⃣ Request OTP
const requestOTP = async () => {
  errorMessage.value = ''
  if (!isValidPhone.value) return
  isLoading.value = true
  try {
    // const response = await $fetch<{ status: string; otpId?: string }>('/api/otp', {
    //   method: 'POST',
    //   body: { phone: phoneEn.value }
    // })
    // if (response.status === 'sent' && response.otpId) {
    //   otpId.value = response.otpId
    //   mode.value = 'verify'
    // } else {
    //   errorMessage.value = t.value.otpError
    // }

    // ✚ just call the same endpoint as before
    await $fetch('/api/auth/request-custom-otp', {
      method: 'POST',
      body: { phone: phoneEn.value }
    })
    // ✚ move to “verify” step
    mode.value = 'verify'

  } catch {
    errorMessage.value = t.value.otpError
  } finally {
    isLoading.value = false
  }
}

// 2️⃣ Verify OTP
const verifyOTP = async () => {
  errorMessage.value = ''
  // if (!otpId.value || !isValidCode.value) return
  if (!isValidCode.value) return

  isLoading.value = true
  try {
    // const response = await $fetch<{ status: string }>('/api/otp', {
    //   method: 'POST',
    //   body: { otpId: otpId.value, code: code.value }
    // })
    // if (response.status === 'ok') {
    //   router.push('/profile')
    // } else if (response.status === 'invalid') {
    //   errorMessage.value = t.value.otpIncorrect
    // } else {
    //   errorMessage.value = t.value.otpError
    // }

    // ✚ use the same verify-OTP endpoint
    const { data } = await useFetch<{ ok: boolean; userId: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone: phoneEn.value, otp: code.value }
    })
    if (data.value?.ok) {
      // ✚ hydrate the auth store exactly like before
      auth.set({ id: data.value.userId, phone: phoneEn.value })

      // const { data: me } = await useFetch<User>('/api/me')
      const me = auth.user
      // fresh user:
      console.log(me)
      if (!me.fullName || !me.affiliation || me.role === 'OTHER') {
        return router.push('/onboarding')
      }

      await router.push('/profile')
      // ✚ reset form if you come back
      mode.value = 'send'
      phoneModel.value = ''
      code.value = ''
    } else {
      errorMessage.value = data.value === null
        ? t.value.otpError
        : t.value.otpIncorrect
    }

  } catch {
    errorMessage.value = t.value.otpError
  } finally {
    isLoading.value = false
  }
}

// Social login fallback
const handleSocialLogin = (provider: string) => {
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
            <BaseInput ref="inputOTP" v-if="mode === 'send'" class="ltr" v-model="phoneModel" numberOnly
              :persian="language === 'fa'" :placeholder="t.phonePlaceholder" :floatinglabel="t.phoneLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
              placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30"
              :iconName="phoneModel ? (isValidPhone ? 'mdi:check-circle' : 'mdi:alert-circle') : null"
              :error="phoneModel && !isValidPhone ? t.phoneError : ''" dir="ltr" />

            <!-- OTP Code Input -->
            <BaseInput v-else class="ltr" v-model="code" numberOnly :persian="language === 'fa'" name="otp" id="otp"
              autocomplete="one-time-code" inputmode="numeric" :placeholder="t.codePlaceholder"
              :floatinglabel="t.codeLabel" floatingLabelClass="bg-white dark:bg-zinc-800"
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
