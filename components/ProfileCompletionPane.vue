<template>
  <Card class="space-y-6 p-6 text-white">
    <h3 class="text-xl font-semibold">Your Profile</h3>

    <div class="grid gap-4">
      <!-- Full Name -->
      <div>
        <label class="block text-sm font-medium text-gray-200" for="full-name">
          Full Name
        </label>
        <div v-if="user.fullName" class="mt-1 text-gray-300">
          {{ user.fullName }}
        </div>
        <div v-else class="mt-1">
          <BaseInput id="full-name" v-model="form.fullName" placeholder="Enter your full name" label="Full Name" />
        </div>
      </div>

      <!-- Affiliation -->
      <div>
        <label class="block text-sm font-medium text-gray-200" for="affiliation">
          Affiliation / Institution
        </label>
        <div v-if="user.affiliation" class="mt-1 text-gray-300">
          {{ user.affiliation }}
        </div>
        <div v-else class="mt-1">
          <BaseInput id="affiliation" v-model="form.affiliation" placeholder="Enter your affiliation or institution"
            label="Affiliation / Institution" />
        </div>
      </div>

      <!-- Role -->
      <div>
        <label class="block text-sm font-medium text-gray-200" for="role">
          Role
        </label>
        <select id="role" class="mt-1 block w-full rounded bg-transparent border border-gray-600 px-3 py-2 text-white"
          v-model="form.role">
          <option disabled value="">{{ placeholder }}</option>
          <option v-for="roleOption in roles" :key="roleOption" :value="roleOption">
            {{ roleOption }}
          </option>
        </select>
      </div>
    </div>

    <BaseButton @click="save" :disabled="!isDirty" class="mt-6 justify-center">
      <Icon name="mdi:check-circle" class="mr-2" /> Save
    </BaseButton>
  </Card>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useAuth } from '~/stores/auth'

const auth = useAuth()
const user = computed(() => auth.user!)

// Initialize form with current user data
const form = reactive({
  fullName: user.value.fullName || '',
  affiliation: user.value.affiliation || '',
  role: user.value.role || ''
})

// Placeholder text for select
const placeholder = 'Please select a role'

// Available roles
const roles = ['RESEARCHER', 'ENGINEER', 'DESIGNER', 'STUDENT']

// Determine if any field has changed
const isDirty = computed(() =>
  form.fullName !== (user.value.fullName || '') ||
  form.affiliation !== (user.value.affiliation || '') ||
  form.role !== (user.value.role || '')
)

async function save() {
  if (!isDirty.value) return

  await auth.updateProfile({
    fullName: form.fullName,
    affiliation: form.affiliation,
    role: form.role
  })
}
</script>

<style scoped>
/* Style placeholder option to appear greyed out */
option[value=""] {
  color: #888;
}
</style>
