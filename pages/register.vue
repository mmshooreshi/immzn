<template>
  <NuxtLayout name="page">
    <div :class="[
      'min-h-screen flex flex-col md:flex-row font-sans z-10',
      darkMode ? 'dark bg-gray-900' : 'bg-white',
      isRtl ? 'rtl' : 'ltr'
    ]">


      <!-- Left hero panel (only one!) -->
      <section class="hidden md:flex md:w-1/2 sticky top-0 h-screen items-center justify-center p-12 text-center
             bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500"
        :class="darkMode ? 'text-white' : 'text-gray-900'">
        <div class="space-y-4 animate-fade-in-down">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">
            {{ t('hero.title') }}
          </h1>
          <p class="text-lg md:text-xl">{{ t('hero.subtitle') }}</p>
          <p class="opacity-90 text-sm" dir="ltr">
            {{ t('hero.date') }} &nbsp;&ndash;&nbsp; {{ t('hero.location') }}
          </p>
        </div>
      </section>

      <!-- Registration form (scrollable) -->
      <section class="flex w-full md:w-1/2 overflow-y-auto h-screen items-start justify-center p-8 pt-28
             bg-white dark:bg-gray-900">
        <form @submit.prevent="submit" class="w-full max-w-lg space-y-6" novalidate>
          <h2 class="text-3xl font-semibold text-center dark:text-gray-100 text-gray-800">
            {{ t('form.register') }}
          </h2>

          <!-- Full Name -->
          <div>
            <label for="name" class="label">{{ t('form.fullName') }}</label>
            <input v-model="form.name" id="name" type="text" required class="input"
              :placeholder="t('form.fullNamePlaceholder')" :class="isRtl ? 'rtl' : 'ltr'" />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="label">{{ t('form.email') }}</label>
            <input v-model="form.email" id="email" type="email" required class="ltr input"
              :placeholder="t('form.emailPlaceholder')" />
          </div>

          <!-- Phone with Iran +98 and flag -->
          <div>
            <label for="phone" class="label">{{ t('form.phone') }}</label>
            <div :class="isRtl ? 'ltr' : 'ltr'" class="flex items-center gap-2  ">
              <div :class="isRtl ? 'ltr' : 'ltr'"
                class="h-8 flex  items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-md px-2 bg-gray-100 dark:bg-gray-800 select-none"
                style="min-width: 70px;">
                <NuxtImg src="/images/ir.png" alt="Iran Flag" width="20" height="15" class="inline-block" />
                <span class="ltr text-gray-700 dark:text-gray-300">+98</span>
              </div>
              <input v-model="form.phone" id="phone" type="tel" pattern="[0-9]{10}" maxlength="10" required
                class="input text-left rounded-l-none flex-grow" placeholder="9123456789" :dir="'ltr'" />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ t('form.phoneHint') }}
            </p>
          </div>

          <!-- Affiliation -->
          <div>
            <label for="affiliation" class="label">{{ t('form.affiliation') }}</label>
            <input v-model="form.affiliation" id="affiliation" type="text" required class="input"
              :placeholder="t('form.affiliationPlaceholder')" :class="isRtl ? 'rtl' : 'ltr'" />
          </div>

          <!-- Role dropdown -->
          <div>
            <label for="role" class="label">{{ t('form.role') }}</label>
            <select v-model="form.role" id="role" required class="input" :class="isRtl ? 'rtl' : 'ltr'">
              <option disabled value="">{{ t('form.selectRole') }}</option>
              <option>{{ t('roles.researcher') }}</option>
              <option>{{ t('roles.engineer') }}</option>
              <option>{{ t('roles.designer') }}</option>
              <option>{{ t('roles.student') }}</option>
              <option>{{ t('roles.other') }}</option>
            </select>
          </div>

          <!-- Attendance -->
          <fieldset class="rounded-xl">
            <legend class="label dark:bg-gray-900 bg-white mx-2 px-1">{{ t('form.attendanceLegend') }}</legend>
            <div class="mt-0 p-2 flex items-center gap-6" :class="isRtl ? 'rtl' : 'ltr'">
              <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input v-model="form.attendance" type="radio" value="In-person" required class="radio" />
                {{ t('attendance.inPerson') }}
              </label>
              <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input v-model="form.attendance" type="radio" value="Remote" required class="radio" />
                {{ t('attendance.remote') }}
              </label>
            </div>
          </fieldset>

          <!-- Tracks of interest -->
          <div>
            <span class="label">{{ t('form.tracksLabel') }}</span>
            <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" :class="isRtl ? 'rtl' : 'ltr'">
              <label v-for="track in tracks" :key="track"
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" :value="track" v-model="form.tracks" class="checkbox" />
                {{ t('tracks.' + track) }}
              </label>
            </div>
          </div>

          <!-- CV Upload -->
          <div>
            <label for="cv" class="label">{{ t('form.cvUpload') }}</label>
            <input id="cv" type="file" accept=".pdf,.doc,.docx" @change="onFileChange" required
              class="custom-file-input input" :class="isRtl ? 'ltr ' : 'ltr '" />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ t('form.cvHint') }}</p>
          </div>

          <!-- Newsletter -->
          <div class="flex items-center">
            <input v-model="form.newsletter" id="newsletter" type="checkbox" class="checkbox" />
            <label for="newsletter" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {{ t('form.newsletter') }}
            </label>
          </div>

          <!-- Terms -->
          <div class="flex items-center">
            <input v-model="form.terms" id="terms" type="checkbox" required class="checkbox" />
            <label for="terms" class="ml-2 text-sm text-gray-700 dark:text-gray-300" :class="isRtl ? 'rtl' : 'ltr'">
              {{ t('form.termsAgree') }}
              <a href="/terms" target="_blank" class="text-indigo-600 underline">
                {{ t('form.termsLink') }}
              </a>
            </label>
          </div>

          <!-- Pricing Info -->
          <div
            class="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
            :class="isRtl ? 'rtl' : 'ltr'">
            <p>
              {{ t('pricing.info1') }}
            </p>
            <ul class="list-disc list-inside">
              <li>{{ t('pricing.student') }}</li>
              <li>{{ t('pricing.nonStudent') }}</li>
              <li>{{ t('pricing.hackathonFree') }}</li>
            </ul>
            <p class="italic mt-2">{{ t('pricing.selectionNote') }}</p>
          </div>

          <!-- Submit button -->
          <button :disabled="submitting || !form.terms || !form.cv" type="submit" class="btn-primary w-full">
            <span v-if="!submitting">{{ t('form.submit') }}</span>
            <span v-else>{{ t('form.submitting') }}</span>
          </button>

          <!-- Link to login -->
          <p :class="[
            'text-center text-sm',
            darkMode ? 'text-gray-300' : 'text-gray-600',
            isRtl ? 'rtl' : 'ltr'
          ]">
            {{ t('form.alreadyRegistered') }}
            <router-link to="/login" class="text-indigo-600 underline">
              {{ t('form.login') }}
            </router-link>
          </p>
        </form>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitting = ref(false)

// Language selection — you can bind this to user preference or toggle
// const lang = ref('en')
import { useSettings } from '~/composables/useSettings'
const { language } = useSettings()

// Dark mode example — toggle or detect system preference as needed
const darkMode = ref(false)

// i18n JSON dictionary
const dictionary = {
  en: {
    hero: {
      title: 'ImmUnity Horizons',
      subtitle: 'Bridging Computation & Immunology',
      date: '9 – 11 July 2025',
      location: 'Tehran & online',
    },
    form: {
      register: 'Register',
      fullName: 'Full name',
      fullNamePlaceholder: 'Ada Lovelace',
      email: 'Email',
      emailPlaceholder: 'ada@example.com',
      phone: 'Phone Number',
      phoneHint: 'Enter your 10-digit phone number after +98 (e.g., 9123456789)',
      affiliation: 'Affiliation / Institution',
      affiliationPlaceholder: 'University of Tehran',
      role: 'Role',
      selectRole: 'Select role',
      attendanceLegend: 'How will you attend?',
      tracksLabel: 'Tracks of interest',
      cvUpload: 'Upload your CV',
      cvHint: 'Accepted formats: PDF, DOC, DOCX. Required for selection.',
      newsletter: 'Send me occasional updates about ImmUnity Horizons',
      termsAgree: 'I agree to the',
      termsLink: 'terms & conditions',
      submit: 'Complete registration',
      submitting: 'Registering…',
      alreadyRegistered: 'Already registered?',
      login: 'Log in',
    },
    roles: {
      researcher: 'Researcher',
      engineer: 'Engineer',
      designer: 'Designer',
      student: 'Student',
      other: 'Other',
    },
    attendance: {
      inPerson: 'In-person',
      remote: 'Remote',
    },
    tracks: {
      'Keynotes': 'Keynotes',
      'Workshops': 'Workshops',
      'Hackathon': 'Hackathon',
      'Lightning Talks': 'Lightning Talks',
    },
    pricing: {
      info1: 'Registration fees for first-day conferences:',
      student: 'Students: 700,000 Toman',
      nonStudent: 'Non-students: 1,000,000 Toman',
      hackathonFree: 'Hackathon participation is free',
      selectionNote: 'Participant selection is based on CV evaluation.',
    },
  },
  fa: {
    hero: {
      title: 'افق‌های ایمیونیتی',
      subtitle: 'پل زدن میان محاسبات و ایمنی‌شناسی',
      date: '۹ تا ۱۱ تیر ۱۴۰۴',
      location: 'تهران و آنلاین',
    },
    form: {
      register: 'ثبت نام',
      fullName: 'نام کامل',
      fullNamePlaceholder: 'آدا لاولیس',
      email: 'ایمیل',
      emailPlaceholder: 'ada@example.com',
      phone: 'شماره تلفن',
      phoneHint: 'شماره ۱۰ رقمی خود را بعد از +۹۸ وارد کنید (مثلاً ۹۱۲۳۴۵۶۷۸۹)',
      affiliation: 'وابستگی / موسسه',
      affiliationPlaceholder: 'دانشگاه تهران',
      role: 'نقش',
      selectRole: 'نقش را انتخاب کنید',
      attendanceLegend: 'چگونه شرکت خواهید کرد؟',
      tracksLabel: 'دسته‌های علاقه‌مندی',
      cvUpload: 'رزومه خود را آپلود کنید',
      cvHint: 'فرمت‌های مجاز: PDF، DOC، DOCX. برای انتخاب الزامی است.',
      newsletter: 'مایلم به‌روزرسانی‌های ایمیونیتی را دریافت کنم',
      termsAgree: 'موافقم با',
      termsLink: 'شرایط و ضوابط',
      submit: 'ثبت نام نهایی',
      submitting: 'در حال ثبت…',
      alreadyRegistered: 'قبلاً ثبت نام کرده‌اید؟',
      login: 'ورود',
    },
    roles: {
      researcher: 'پژوهشگر',
      engineer: 'مهندس',
      designer: 'طراح',
      student: 'دانشجو',
      other: 'سایر',
    },
    attendance: {
      inPerson: 'حضوری',
      remote: 'راه دور',
    },
    tracks: {
      'Keynotes': 'سخنرانی‌های کلیدی',
      'Workshops': 'کارگاه‌ها',
      'Hackathon': 'هکتون',
      'Lightning Talks': 'سخنرانی‌های کوتاه',
    },
    pricing: {
      info1: 'هزینه ثبت‌نام برای کنفرانس‌های روز اول:',
      student: 'دانشجویان: ۷۰۰ هزار تومان',
      nonStudent: 'غیر دانشجوها: ۱ میلیون تومان',
      hackathonFree: 'شرکت در هکتون رایگان است',
      selectionNote: 'انتخاب شرکت‌کنندگان بر اساس بررسی رزومه است.',
    },
  },
}

// Simple translation function
function t(path) {
  const parts = path.split('.')
  let obj = dictionary[language.value]
  for (const part of parts) {
    if (!obj) break
    obj = obj[part]
  }
  return obj || path
}

const isRtl = computed(() => language.value === 'fa')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  affiliation: '',
  role: '',
  attendance: '',
  tracks: [],
  newsletter: true,
  terms: false,
  cv: null,
})

const tracks = ['Keynotes', 'Workshops', 'Hackathon', 'Lightning Talks']

function onFileChange(event) {
  const file = event.target.files[0]
  if (
    file &&
    ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  ) {
    form.cv = file
  } else {
    form.cv = null
    alert(t('form.cvHint'))
    event.target.value = null
  }
}

function fakeApiRequest(payload) {
  return new Promise((resolve) => setTimeout(() => resolve(payload), 1200))
}

async function submit() {
  if (!form.terms || !form.cv) return
  submitting.value = true
  try {
    await fakeApiRequest(form)
    router.push('/thanks')
  } finally {
    submitting.value = false
  }
}

// definePageMeta({ name: 'register', layout: 'Page' })

</script>

<style scoped lang="scss">
.label {
  --at-apply: block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.input {
  --at-apply: w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition;
}

.radio,
.checkbox {
  --at-apply: h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded;
}

.btn-primary {
  --at-apply: inline-flex items-center justify-center rounded-md bg-indigo-600 py-2 px-4 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition;
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.8s ease-out both;
}

/* RTL support */
.rtl {
  direction: rtl;
  text-align: right;
}

.ltr {
  direction: ltr;
  text-align: left;
}


.custom-file-input {
  /* remove default padding/cursor so our styles apply cleanly */
  font: 100% sans-serif;
  cursor: pointer;
}

.custom-file-input::file-selector-button {
  /* Standard */
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5em 1em;
  margin-right: 0.5em;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.custom-file-input::-webkit-file-upload-button {
  /* WebKit/Blink */
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5em 1em;
  margin-right: 0.5em;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.custom-file-input::file-selector-button:hover {
  background: #0056b3;
}
</style>
