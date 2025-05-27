<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDataStore } from '~/stores/dataStore'
import { useSettings } from '~/composables/useSettings'

import GoogleSignInButton from '~/components/GoogleSignInButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'

const router = useRouter()
const { localizedData } = storeToRefs(useDataStore())
const { language } = useSettings()

// Get localized login page content
const t = computed(() => localizedData.value.login_page)

const toEnglishDigits = (str: string) => str.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
const toPersianDigits = (str: string) => str.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])

const phoneModel = ref('')
const code = ref('')
const isLoading = ref(false)
const mode = ref<'send' | 'verify'>('send')
const errorMessage = ref('')

const phoneEn = computed(() => toEnglishDigits(phoneModel.value))
const isValidPhone = computed(() => /^09\d{9}$/.test(phoneEn.value))
const isValidCode = computed(() => /^\d{6}$/.test(code.value))

const otpId = ref('')

const requestOTP = async () => {
  errorMessage.value = ''
  if (!isValidPhone.value) return
  isLoading.value = true
  try {
    otpId.value = crypto.randomUUID()
    mode.value = 'verify'
  } catch {
    errorMessage.value = t.value.otpError
  } finally {
    isLoading.value = false
  }
}

const verify = async () => {
  errorMessage.value = ''
  if (!isValidCode.value) return
  isLoading.value = true
  try {
    router.push('/')
  } catch {
    errorMessage.value = t.value.otpIncorrect
  } finally {
    isLoading.value = false
  }
}

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
      <div class="w-full lg:w-1/2 flex items-center justify-center px-4 py-10">
        <div class="max-w-md w-full space-y-8 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl">
          <div class="text-center space-y-1">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ t.title }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t.subtitle }}</p>
          </div>

          <form @submit.prevent="mode === 'send' ? requestOTP() : verify()" class="space-y-6">
            <BaseInput v-if="mode === 'send'" class="ltr" v-model="phoneModel" numberOnly :persian="language == 'fa'"
              :placeholder="t.phonePlaceholder" :floatinglabel="t.phoneLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
              placeholderClass="placeholder-transparent focus:placeholder-black/30 dark:focus:placeholder-white/30"
              :iconName="phoneModel ? (isValidPhone ? 'mdi:check-circle' : 'mdi:alert-circle') : null"
              :error="phoneModel && !isValidPhone ? t.phoneError : ''" dir="ltr" />

            <BaseInput v-else class="ltr" v-model="code" numberOnly :persian="language == 'fa'"
              :placeholder="t.codePlaceholder" :floatinglabel="t.codeLabel"
              floatingLabelClass="bg-white dark:bg-zinc-800"
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
