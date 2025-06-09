<!-- pages/login.vue -->
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

// useNuxtApp().$debug('userLat', userLocationRef)
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
const isValidCode = computed(() => /^\d{5}$/.test(code.value))
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
    const otpCredential = await navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    }) as OTPCredential | null

    if (otpCredential?.code) {
      code.value = otpCredential.code
      if (toastShow.value)
        toast.success({ title: 'WebOTP', message: `Received OTP: ${otpCredential.code}` })
      form?.submit()
    } else {
      throw new Error('OTP credential not received or missing code')
    }
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
    errorMessage.value = t.value.verify.otpError
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
      if (toastShow.value) toast.success({ title: 'OTP', message: 'Verified' })

      // Set minimal auth state first
      auth.set({ id: parseInt(data.value.userId), phone: phoneEn.value })

      // ✅ Wait for fetch to finish
      await auth.fetch()
      const u = auth.user

      // Check for profile completeness
      const isProfileComplete = u?.fullName && u.affiliation && u.role && u.field

      if (isProfileComplete) {
        await auth.set({
          id: u.id,
          phone: phoneEn.value,
          fullName: u.fullName,
          affiliation: u.affiliation,
          role: u.role,
          field: u.field,
          email: u.email || '',
          attendance: u.attendance || 'IN_PERSON',
          tracks: u.tracks || [''],
          cvUrl: u.cvUrl || '',
          wantsNewsletter: u.wantsNewsletter ?? false
        })
        phoneModel.value = ''
        code.value = ''
        mode.value = 'send'

        router.push('/profile')
      } else {
        mode.value = 'info'
      }

    } else {
      errorMessage.value = data.value === null
        ? t.value.verify.otpError
        : t.value.verify.otpIncorrect
      if (toastShow.value)
        toast.error({ title: 'OTP', message: errorMessage.value })
    }
  } catch {
    errorMessage.value = t.value.verify.otpError
    if (toastShow.value)
      toast.error({ title: 'OTP', message: 'Verify failed' })
  } finally {
    isLoading.value = false
  }
}


const submitInfo = async () => {
  errorMessage.value = ''
  if (!fullName.value || !affiliation.value || !role.value || !field.value) {
    errorMessage.value = t.value.info.infoError
    if (toastShow.value)
      toast.warning({ title: 'Info', message: 'Please fill all fields' })
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/user/update', {
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
      field: field.value,
      email: '', attendance: 'IN_PERSON', tracks: [''], cvUrl: '', wantsNewsletter: false
    })
    if (toastShow.value)
      toast.success({ title: 'Success', message: 'Profile complete' })
    router.push('/profile')
  } catch {
    errorMessage.value = t.value.info.infoError
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
          <h2 class="text-3xl font-bold text-white text-center">{{ t.verify.heroTitle }}</h2>
        </div>
      </div>

      <!-- Login Panel -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-4 py-10  h-screen">
        <div class="max-w-md w-full space-y-8 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl">
          <div v-if="mode === 'send'" class="text-center space-y-1">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ t.verify.title }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t.verify.subtitle }}</p>
          </div>
          <div v-if="mode === 'info'" class="text-center space-y-1">
            <h1 class="text-xl font-bold text-gray-800 dark:text-white">{{ t.info.infoTitle }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t.info.infoSubtitle }}</p>
          </div>

          <!-- <form @submit.prevent="mode === 'send' ? requestOTP() : verifyOTP()" class="space-y-6"> -->
          <form @submit.prevent="mode === 'send' ? requestOTP() : mode === 'verify' ? verifyOTP() : submitInfo()"
            class="space-y-6">

            <!-- Phone Input -->
            <BaseInput v-if="mode === 'send'" class="ltr" v-model="phoneModel" numberOnly :persian="language === 'fa'"
              :placeholder="t.verify.phonePlaceholder" :floatinglabel="t.verify.phoneLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
              placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30"
              :iconName="phoneModel ? (isValidPhone ? 'mdi:check-circle' : 'mdi:alert-circle') : null"
              :error="phoneModel && !isValidPhone ? t.verify.phoneError : ''" dir="ltr" />

            <!-- OTP Code Input -->
            <!-- {{ mode }} -->
            <BaseInput v-if="mode === 'verify'" class="ltr" v-model="code" numberOnly :persian="language === 'fa'"
              ref="inputOTP" name="otp" id="otp" autocomplete="one-time-code" inputmode="numeric"
              :placeholder="t.verify.codePlaceholder" :floatinglabel="t.verify.codeLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
              placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30"
              :iconName="code ? (isValidCode ? 'mdi:check-circle' : 'mdi:alert-circle') : null"
              :error="code && !isValidCode ? t.verify.codeError : ''" dir="ltr" />

            <!-- Info Inputs -->
            <div :class="[language === 'fa' ? 'rtl text-right' : 'ltr text-left']" v-if="mode === 'info'"
              class="space-y-4 text-d4">
              <!-- Full Name -->
              <BaseInput position="left" :persian="language === 'fa'" v-model="fullName"
                :placeholder="t.fullNamePlaceholder" :floatinglabel="t.info.fullNameLabel"
                floatingLabelClass="bg-white dark:bg-zinc-800"
                placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30" />

              <!-- Affiliation -->
              <BaseInput position="left" :persian="language === 'fa'" v-model="affiliation"
                :placeholder="t.info.affiliationPlaceholder" :floatinglabel="t.info.affiliationLabel"
                floatingLabelClass="bg-white dark:bg-zinc-800"
                placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30" />

              <!-- Role -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <!-- {{ t.info.roleLabel }} -->
                </label>
                <select :persian="language === 'fa'" v-model="role"
                  class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-lg px-3 py-2">
                  <option disabled value="">{{ t.info.rolePlaceholder }}</option>
                  <option value="RESEARCHER">Researcher</option>
                  <option value="ENGINEER">Engineer</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              <!-- Field -->
              <BaseInput position="left" :persian="language === 'fa'" v-model="field"
                :placeholder="t.info.fieldPlaceholder" :floatinglabel="t.info.fieldLabel"
                floatingLabelClass="bg-white dark:bg-zinc-800"
                placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30" />
            </div>

            <BaseButton type="submit" :loading="isLoading" :disabled="(mode === 'send' && !isValidPhone) ||
              (mode === 'verify' && !isValidCode) ||
              (mode === 'info' && (!fullName || !affiliation || !role || !field))" class="text-center" :class="((mode === 'send' && !isValidPhone) ||
                (mode === 'verify' && !isValidCode) ||
                (mode === 'info' && (!fullName || !affiliation || !role || !field)))
                ? 'bg-cyan-800/50 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-600 text-cyan-100 dark:bg-cyan-800 dark:text-white'">
              {{
                mode === 'send' ? t.verify.sendCode :
                  mode === 'verify' ? t.verify.verifyAndLogin :
                    t.info.submitInfo
              }}
            </BaseButton>



            <p v-if="errorMessage" class="text-center text-sm text-red-600">{{ errorMessage }}</p>
          </form>

          <div v-if="mode === 'send'" class="flex flex-col items-center gap-6">
            <div class="flex w-full flex-row items-center gap-2">
              <div class="h-px  w-full bg-gray-200 dark:bg-gray-600"> </div>
              <span class="text-xs text-nowrap text-gray-400 dark:text-gray-500">{{ t.shared.orLoginWith }}</span>
              <div class="h-px w-full bg-gray-200 dark:bg-gray-600"></div>
            </div>

            <GoogleSignInButton :onClick="() => handleSocialLogin('google')" />

            <p class="text-[10px] leading-5 text-[#797B7D] text-right dark:text-gray-500">
              {{ t.shared.legalText }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
