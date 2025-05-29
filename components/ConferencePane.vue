<!-- components/ConferencePane.vue -->
<template>
  <Card class="space-y-4 p-6">
    <h3 class="text-xl font-semibold">Conference</h3>
    <p>Students: 700,000 Toman<br />Others: 1,000,000 Toman</p>
    <div v-if="user.role === 'STUDENT' && !uploadedCard">
      <p>
        <Icon name="mdi:school" /> Upload Student Card
      </p>
      <BaseFileInput v-model="studentCard" />
      <BaseButton @click="uploadCard" :disabled="!studentCard">
        <Icon name="mdi:upload" /> Upload
      </BaseButton>
    </div>
    <div v-else>
      <BaseButton @click="pay">
        <Icon name="mdi:currency-try" /> Pay {{ fee }} Toman
      </BaseButton>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const user = computed(() => auth.user!)

const studentCard = ref<File | null>(null)
const uploadedCard = ref(false)
const router = useRouter()

const fee = computed(() =>
  user.value.role === 'STUDENT' ? 700000 : 1000000
)

async function uploadCard() {
  const form = new FormData()
  form.append('card', studentCard.value!)
  await fetch('/api/payment/upload-card', { method: 'POST', body: form })
  uploadedCard.value = true
}

async function pay() {
  const session = await $fetch('/api/payment/create', {
    method: 'POST',
    body: { amount: fee.value }
  })
  window.location.href = session.checkoutUrl
}
</script>