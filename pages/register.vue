<template>
    <div class="min-h-screen flex flex-col md:flex-row dark:bg-gray-900">
      <!-- Left side decorative panel (hidden on small screens) -->
      <section
        class="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 p-12 text-center text-white"
      >
        <div>
          <h1 class="text-4xl font-bold mb-4 animate-fade-in-down">
            Welcome!
          </h1>
          <p class="text-lg leading-relaxed opacity-90">
            Join our community and start your journey today.
          </p>
        </div>
      </section>
  
      <!-- Registration form -->
      <section class="flex w-full md:w-1/2 items-center justify-center p-8">
        <form @submit.prevent="submit" class="w-full max-w-md space-y-6">
          <h2 class="text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center">
            Create account
          </h2>
  
          <!-- Name -->
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Full name</label
            >
            <input
              v-model="form.name"
              id="name"
              type="text"
              required
              class="mt-1 input"
              placeholder="Ada Lovelace"
            />
          </div>
  
          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Email</label
            >
            <input
              v-model="form.email"
              id="email"
              type="email"
              required
              class="mt-1 input"
              placeholder="ada@example.com"
            />
          </div>
  
          <!-- Password -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Password</label
            >
            <input
              v-model="form.password"
              id="password"
              type="password"
              required
              minlength="8"
              class="mt-1 input"
              placeholder="••••••••"
            />
          </div>
  
          <!-- Confirm Password -->
          <div>
            <label
              for="confirm"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Confirm password</label
            >
            <input
              v-model="form.confirm"
              id="confirm"
              type="password"
              required
              minlength="8"
              class="mt-1 input"
              placeholder="••••••••"
            />
            <p
              v-if="passwordMismatch"
              class="text-red-500 text-sm mt-1"
            >
              Passwords do not match
            </p>
          </div>
  
          <!-- Terms -->
          <div class="flex items-center">
            <input
              v-model="form.terms"
              id="terms"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              for="terms"
              class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >I agree to the
              <a href="#" class="text-indigo-600 underline">terms &amp; conditions</a></label
            >
          </div>
  
          <!-- Submit button -->
          <button
            :disabled="submitting || !form.terms || passwordMismatch"
            type="submit"
            class="w-full btn-primary"
          >
            <span v-if="!submitting">Create account</span>
            <span v-else>Creating...</span>
          </button>
  
          <!-- Link to login -->
          <p class="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?
            <router-link to="/login" class="text-indigo-600 underline"
              >Sign in</router-link
            >
          </p>
  
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
        </form>
      </section>
    </div>
  </template>
  
  <script setup>
  import { reactive, computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const submitting = ref(false)
  
  const form = reactive({
    name: '',
    email: '',
    password: '',
    confirm: '',
    terms: false,
  })
  
  const passwordMismatch = computed(
    () => form.password !== form.confirm && form.confirm.length > 0,
  )
  
  function fakeApiRequest(payload) {
    // Simulates an async registration call (replace with real API request)
    return new Promise((resolve) => setTimeout(() => resolve(payload), 1000))
  }
  
  async function submit() {
    if (passwordMismatch.value || !form.terms) return
    submitting.value = true
    try {
      // TODO: Replace with actual API integration
      await fakeApiRequest(form)
      router.push('/dashboard')
    } finally {
      submitting.value = false
    }
  }
  
  function social(provider) {
    // TODO: Replace with actual social sign-in
    alert(`Social sign-in with ${provider} coming soon!`)
  }
  </script>
  
  <style scoped>
  /* Tailwind utility shortcuts — use @apply for clarity & reusability */
  .input {
    @apply w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition;
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
  