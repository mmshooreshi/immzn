<template>
  <div class="min-h-screen flex flex-col md:flex-row dark:bg-gray-900 font-sans">
    <!-- Left hero panel -->
    <section
      class="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 p-12 text-center text-white"
    >
      <div class="space-y-4 animate-fade-in-down">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">
          ImmUnity Horizons
        </h1>
        <p class="text-lg md:text-xl">Decode · Build · Launch</p>
        <p class="opacity-90 text-sm">See you 9&nbsp;&ndash;&nbsp;11&nbsp;July&nbsp;2025</p>
      </div>
    </section>

    <!-- Login form -->
    <section class="flex w-full md:w-1/2 items-center justify-center p-8">
      <form
        @submit.prevent="submit"
        class="w-full max-w-md space-y-6"
        novalidate
      >
        <h2
          class="text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center"
        >
          Sign in
        </h2>

        <!-- Email -->
        <div>
          <label for="email" class="label">Email</label>
          <input
            v-model="form.email"
            id="email"
            type="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="label">Password</label>
          <input
            v-model="form.password"
            id="password"
            type="password"
            required
            class="input"
            placeholder="••••••••"
          />
        </div>

        <!-- Remember / forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input v-model="form.remember" type="checkbox" class="checkbox" /> Remember me
          </label>
          <router-link to="/forgot" class="text-sm text-indigo-600 underline">
            Forgot password?
          </router-link>
        </div>

        <!-- Submit button -->
        <button :disabled="submitting" type="submit" class="btn-primary w-full">
          <span v-if="!submitting">Log in</span>
          <span v-else>Signing in…</span>
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
          <span class="text-xs uppercase text-gray-500 dark:text-gray-400">OR</span>
          <div class="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <!-- Social buttons -->
        <div class="flex flex-col space-y-4">
          <button type="button" @click="social('google')" class="btn-secondary">
            Continue with Google
          </button>
          <button type="button" @click="social('github')" class="btn-secondary">
            Continue with GitHub
          </button>
        </div>

        <!-- Register link -->
        <p class="text-center text-sm text-gray-600 dark:text-gray-300">
          First time here?
          <router-link to="/register" class="text-indigo-600 underline"
            >Register</router-link
          >
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: true,
})

function fakeLogin(payload) {
  // Simulate sign‑in (replace with real API)
  return new Promise((resolve) => setTimeout(() => resolve(payload), 900))
}

async function submit() {
  submitting.value = true
  try {
    await fakeLogin(form)
    router.push('/dashboard')
  } finally {
    submitting.value = false
  }
}

function social(provider) {
  // TODO: Replace with real social sign‑in
  alert(`Social sign‑in with ${provider} coming soon!`)
}
</script>

<style scoped>
.label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}
.input {
  @apply w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition;
}
.checkbox {
  @apply h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded;
}
.btn-primary {
  @apply inline-flex items-center justify-center rounded-md bg-indigo-600 py-2 px-4 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition;
}
.btn-secondary {
  @apply inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition;
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
</style>
