<template>
    <NuxtLayout name="page">

        <div :class="['min-h-screen flex flex-col items-center justify-center p-8 dark:bg-gray-900 bg-white',]">

            <div class="text-center">
                <!-- <h1 class="text-2xl font-bold mb-4">{{ message.title }}.</h1> -->
                <Icon v-if="pageKey == 'success'" name="icon-park-twotone:success"
                    class=" text-teal w-42 h-42 mb-4 mt-2" />
                <Icon v-else name="pixelarticons:mood-sad" class=" text-pink w-42 h-42 mb-4 mt-2" />


                <p class="text-md mb-12">{{ message.body }}</p>
                <nuxt-link to="/" class="btn-primary px-2 py-2 rounded-lg text-xs">
                    <!-- <Icon name="icon-park-twotone:back" /> -->
                    {{ message.home }}
                </nuxt-link>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettings } from '~/composables/useSettings'
const { darkMode } = useSettings()

// Local language state (or use global)
const { language } = useSettings()

const isRtl = computed(() => language.value === 'fa')

// Messages for both pages
const dictionaries = {
    success: {
        en: {
            title: 'Registration Successful',
            body: 'Thank you! Your registration has been completed successfully.',
            home: 'Back to Home'
        },
        fa: {
            title: 'ثبت نام با موفقیت انجام شد',
            body: 'سپاسگزاریم! ثبت نام شما با موفقیت انجام شد.',
            home: 'بازگشت به صفحه اصلی'
        }
    },
    failure: {
        en: {
            title: 'Registration Failed',
            body: 'Oops! Something went wrong. Please try again later.',
            home: 'Back to Home'
        },
        fa: {
            title: 'ثبت نام ناموفق بود',
            body: 'مشکلی پیش آمد. لطفاً بعداً دوباره تلاش کنید.',
            home: 'بازگشت به صفحه اصلی'
        }
    }
}

// Determine which page based on route
// import { useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

const pageKey = route.path.split('/')[2] === 'failure' ? 'failure' : 'success'

const message = computed(() => dictionaries[pageKey][language.value])
</script>

<style scoped lang="scss">
.input {
    --at-apply: border border-gray-300 rounded-md bg-gray-100 py-1 px-2;
}

.btn-primary {
    --at-apply: bg-indigo-600 text-white hover:bg-indigo-700;
}
</style>
