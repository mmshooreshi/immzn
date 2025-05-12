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
          <p class="text-lg md:text-xl">Bridging Computation &amp; Immunology</p>
          <p class="opacity-90 text-sm">
            9&nbsp;&ndash;&nbsp;11&nbsp;July&nbsp;2025 · Tehran &amp; online
          </p>
        </div>
      </section>
  
      <!-- Registration form -->
      <section class="flex w-full md:w-1/2 items-center justify-center p-8">
        <form
          @submit.prevent="submit"
          class="w-full max-w-lg space-y-6"
          novalidate
        >
          <h2
            class="text-3xl font-semibold text-gray-800 dark:text-gray-100 text-center"
          >
            Register
          </h2>
  
          <!-- Name -->
          <div>
            <label for="name" class="label">Full name</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              required
              class="input"
              placeholder="Ada Lovelace"
            />
          </div>
  
          <!-- Email -->
          <div>
            <label for="email" class="label">Email</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              required
              class="input"
              placeholder="ada@example.com"
            />
          </div>
  
          <!-- Affiliation -->
          <div>
            <label for="affiliation" class="label">Affiliation / Institution</label>
            <input
              v-model="form.affiliation"
              id="affiliation"
              type="text"
              required
              class="input"
              placeholder="University of Tehran"
            />
          </div>
  
          <!-- Role dropdown -->
          <div>
            <label for="role" class="label">Role</label>
            <select v-model="form.role" id="role" required class="input">
              <option disabled value="">Select role</option>
              <option>Researcher</option>
              <option>Engineer</option>
              <option>Designer</option>
              <option>Student</option>
              <option>Other</option>
            </select>
          </div>
  
          <!-- Attendance -->
          <fieldset>
            <legend class="label">How will you attend?</legend>
            <div class="mt-1 flex items-center gap-6">
              <label
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <input
                  v-model="form.attendance"
                  type="radio"
                  value="In‑person"
                  required
                  class="radio"
                />
                In‑person
              </label>
              <label
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <input
                  v-model="form.attendance"
                  type="radio"
                  value="Remote"
                  required
                  class="radio"
                />
                Remote
              </label>
            </div>
          </fieldset>
  
          <!-- Interests -->
          <div>
            <span class="label">Tracks of interest</span>
            <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <label
                v-for="track in tracks"
                :key="track"
                class="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  :value="track"
                  v-model="form.tracks"
                  class="checkbox"
                />
                {{ track }}
              </label>
            </div>
          </div>
  
          <!-- Newsletter -->
          <div class="flex items-center">
            <input v-model="form.newsletter" id="newsletter" type="checkbox" class="checkbox" />
            <label for="newsletter" class="ml-2 text-sm text-gray-700 dark:text-gray-300">Send me occasional updates about ImmUnity Horizons</label>
          </div>
  
          <!-- Terms -->
          <div class="flex items-center">
            <input v-model="form.terms" id="terms" type="checkbox" required class="checkbox" />
            <label for="terms" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              I agree to the
              <a href="/terms" target="_blank" class="text-indigo-600 underline"
                >terms &amp; conditions</a
              >
            </label>
          </div>
  
          <!-- Submit button -->
          <button :disabled="submitting || !form.terms" type="submit" class="btn-primary w-full">
            <span v-if="!submitting">Complete registration</span>
            <span v-else>Registering…</span>
          </button>
  
          <!-- Link to login -->
          <p class="text-center text-sm text-gray-600 dark:text-gray-300">
            Already registered?
            <router-link to="/login" class="text-indigo-600 underline">Log in</router-link>
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
    name: '',
    email: '',
    affiliation: '',
    role: '',
    attendance: '',
    tracks: [],
    newsletter: true,
    terms: false,
  })
  
  const tracks = ['Keynotes', 'Workshops', 'Hackathon', 'Lightning Talks']
  
  function fakeApiRequest(payload) {
    // Simulate an async request (replace with real API)
    return new Promise((resolve) => setTimeout(() => resolve(payload), 1200))
  }
  
  async function submit() {
    if (!form.terms) return
    submitting.value = true
    try {
      await fakeApiRequest(form)
      router.push('/thanks')
    } finally {
      submitting.value = false
    }
  }
  </script>
  
  <style scoped>
  .label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
  }
  .input {
    @apply w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition;
  }
  .radio,
  .checkbox {
    @apply h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded;
  }
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-md bg-indigo-600 py-2 px-4 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition;
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
  