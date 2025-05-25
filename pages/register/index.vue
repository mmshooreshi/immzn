<template>
    <NuxtLayout name="page">
        <div :class="[
            'min-h-screen flex flex-col md:flex-row font-sans z-10',
            darkMode ? 'dark bg-gray-900' : 'bg-white',
            isRtl ? 'rtl' : 'ltr'
        ]">

            <!-- Left hero panel -->
            <section class="hidden md:flex md:w-1/2 sticky top-0 h-screen items-center justify-center p-12 text-center
             bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500"
                :class="darkMode ? 'text-white' : 'text-gray-900'">
                <div class="space-y-4 animate-fade-in-down">
                    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {{ hero.title }}
                    </h1>
                    <p class="text-lg md:text-xl">{{ hero.subtitle }}</p>
                    <p class="opacity-90 text-sm" dir="ltr">
                        {{ hero.date }} &nbsp;&ndash;&nbsp; {{ hero.location }}
                    </p>
                </div>
            </section>

            <!-- Registration form -->
            <section class="flex w-full md:w-1/2 overflow-y-auto h-screen items-start justify-center p-8 pt-28
             bg-white dark:bg-gray-900">
                <form @submit.prevent="submit" class="w-full max-w-lg space-y-6" novalidate>
                    <h2 class="text-3xl font-semibold text-center dark:text-gray-100 text-gray-800">
                        {{ formLabels.register }}
                    </h2>

                    <!-- Full Name -->
                    <div>
                        <label for="name" class="label">{{ formLabels.fullName }}</label>
                        <input v-model="form.name" id="name" type="text" required class="input"
                            :placeholder="formLabels.fullNamePlaceholder" :class="isRtl ? 'rtl' : 'ltr'" />
                    </div>

                    <!-- Email -->
                    <div>
                        <label for="email" class="label">{{ formLabels.email }}</label>
                        <input v-model="form.email" id="email" type="email" required class="ltr input"
                            :placeholder="formLabels.emailPlaceholder" />
                    </div>


                    <div>
                        <label for="phone" class="label">{{ formLabels.phone }}</label>
                        <div :class="isRtl ? 'ltr' : 'ltr'" class="flex items-center gap-2  ">
                            <div :class="isRtl ? 'ltr' : 'ltr'"
                                class="h-8 flex  items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-md px-2 bg-gray-100 dark:bg-gray-800 select-none"
                                style="min-width: 70px;">
                                <NuxtImg src="/images/ir.png" alt="Iran Flag" width="20" height="15"
                                    class="inline-block" />
                                <span class="ltr text-gray-700 dark:text-gray-300">+98</span>
                            </div>
                            <input v-model="form.phone" id="phone" type="tel" pattern="[0-9]{10}" maxlength="10"
                                required class="input text-left rounded-l-none flex-grow" placeholder="9123456789"
                                :dir="'ltr'" />
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ formLabels.phoneHint }}
                        </p>
                    </div>


                    <!-- Affiliation -->
                    <div>
                        <label for="affiliation" class="label">{{ formLabels.affiliation }}</label>
                        <input v-model="form.affiliation" id="affiliation" type="text" required class="input"
                            :placeholder="formLabels.affiliationPlaceholder" :class="isRtl ? 'rtl' : 'ltr'" />
                    </div>

                    <!-- Role -->
                    <div>
                        <label for="role" class="label">{{ formLabels.role }}</label>
                        <select v-model="form.role" id="role" required class="input" :class="isRtl ? 'rtl' : 'ltr'">
                            <option disabled value="">{{ formLabels.selectRole }}</option>
                            <option v-for="role in roles" :key="role">{{ role }}</option>
                        </select>
                    </div>

                    <!-- Attendance -->
                    <fieldset class="rounded-xl">
                        <legend class="label dark:bg-gray-900 bg-white mx-2 px-1">{{ formLabels.attendanceLegend }}
                        </legend>
                        <div class="mt-0 p-2 flex items-center gap-6">
                            <label v-for="opt in attendanceOptions" :key="opt"
                                class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <input v-model="form.attendance" type="radio" :value="opt" required class="radio" />
                                {{ opt }}
                            </label>
                        </div>
                    </fieldset>

                    <!-- Tracks -->
                    <div>
                        <span class="label">{{ formLabels.tracksLabel }}</span>
                        <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <label v-for="track in tracksOptions" :key="track"
                                class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <input type="checkbox" :value="track" v-model="form.tracks" class="checkbox" />
                                {{ track }}
                            </label>
                        </div>
                    </div>

                    <!-- CV Upload -->

                    <div>
                        <label for="cv" class="label">{{ formLabels.cvUpload }}</label>
                        <input id="cv" type="file" accept=".pdf,.doc,.docx" @change="onFileChange" required
                            class="custom-file-input input" :class="isRtl ? 'ltr ' : 'ltr '" />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ formLabels.cvHint }}</p>
                    </div>


                    <!-- Newsletter -->
                    <div class="flex items-center">
                        <input v-model="form.newsletter" id="newsletter" type="checkbox" class="checkbox" />
                        <label for="newsletter" class="mx-2 text-sm text-gray-700 dark:text-gray-300">
                            {{ formLabels.newsletter }}
                        </label>
                    </div>

                    <!-- Terms -->
                    <div class="flex items-center">
                        <input v-model="form.terms" id="terms" type="checkbox" required class="checkbox" />
                        <label for="terms" class="mx-2 text-sm text-gray-700 dark:text-gray-300">
                            {{ formLabels.termsAgree }} <a href="/terms" target="_blank"
                                class="text-indigo-600 underline">{{ formLabels.termsLink }}</a>
                        </label>
                    </div>

                    <!-- Pricing -->
                    <div
                        class="p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">

                        <p>{{ pricing.info1 }}</p>
                        <ul class="list-disc list-inside">
                            <li>{{ pricing.student }}</li>
                            <li>{{ pricing.nonStudent }}</li>
                            <li>{{ pricing.hackathonFree }}</li>
                        </ul>
                        <p class="italic mt-2">{{ pricing.selectionNote }}</p>
                    </div>

                    <!-- Submit -->
                    <button :disabled="submitting || !form.terms || !form.cv" type="submit" class="btn-primary w-full">
                        <span v-if="!submitting">{{ formLabels.submit }}</span>
                        <span v-else>{{ formLabels.submitting }}</span>
                    </button>

                    <!-- Login link -->
                    <p class="text-center text-sm text-gray-600 dark:text-gray-300">
                        {{ formLabels.alreadyRegistered }} <router-link to="/login" class="text-indigo-600 underline">{{
                            formLabels.login }}</router-link>
                    </p>
                </form>
            </section>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
import { useSettings } from '~/composables/useSettings'

const router = useRouter()
const submitting = ref(false)
const { language } = useSettings()
const { localizedData } = storeToRefs(useDataStore())
console.log(localizedData.value.register_page)
const hero = computed(() => localizedData.value.register_page.hero)
const formLabels = computed(() => localizedData.value.register_page.form)
const roles = computed(() => localizedData.value.register_page.roles)
const attendanceOptions = computed(() => localizedData.value.register_page.attendance)
const tracksOptions = computed(() => localizedData.value.register_page.tracks)
const pricing = computed(() => localizedData.value.register_page.pricing)
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

function onFileChange(event) {
    const file = event.target.files[0]
    if (file && ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        form.cv = file
    } else {
        form.cv = null
        alert(formLabels.value.cvHint)
        event.target.value = null
    }
}

const toBase64 = (file: File) => new Promise<string>((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = rej
    reader.readAsDataURL(file)
})

const submit = async () => {
    if (submitting.value) return
    if (!form.terms) { alert(formLabels.value.termsAgree); return }
    if (!form.cv) { alert(formLabels.value.cvHint); return }

    submitting.value = true
    try {
        const cvBase64 = await toBase64(form.cv)
        const { data, error } = await useFetch('/api/submit', {
            method: 'POST',
            body: {
                ...form,
                cvFileName: form.cv.name,
                cvBase64,
            }
        })
        if (!error.value) router.push('/register/success')
        else throw new Error(error.value.message)
    } catch {
        router.push('/register/failure')
    } finally {
        submitting.value = false
    }
}
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
