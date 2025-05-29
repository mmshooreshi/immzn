<!-- components/HackathonPane.vue -->
<template>
  <Card class="space-y-4 p-6">
    <h3 class="text-xl font-semibold">Hackathon</h3>
    <div v-if="!team">
      <BaseInput placeholder="Team name" v-model="teamName" label="Team Name" />
      <select v-model="track" label="Track">
        <option v-for="trackOption in tracksList" :key="trackOption" :value="trackOption">
          {{ trackOption }}
        </option>
      </select>
      <BaseButton @click="createTeam" :disabled="!teamName || !track">
        <Icon name="mdi:account-group-plus" /> Create Team
      </BaseButton>
    </div>
    <div v-else>
      <p>
        <Icon name="mdi:check-circle" /> Team: {{ team.name }}
      </p>
      <BaseInput placeholder="Invite Phone (+98...)" v-model="invitePhone" label="Invite Phone (+98...)" />
      <BaseButton @click="invite" :loading="sending" :disabled="!invitePhone">
        <Icon name="mdi:message-text" /> Send SMS Invite
      </BaseButton>
      <qrcode-vue :value="inviteLink" />
      <div class="flex items-center gap-2">
        <input class="flex-1" readonly :value="inviteLink" />
        <BaseButton @click="copyLink">
          <Icon name="mdi:content-copy" />
        </BaseButton>
      </div>
      <ul>
        <li v-for="i in invites" :key="i.phone">
          <Icon name="mdi:clock" /> {{ i.phone }} ({{ i.sentAt }})
        </li>
      </ul>
      <BaseButton @click="goUploadCV">
        <Icon name="mdi:upload" /> Upload CV
      </BaseButton>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/stores/auth'

const auth = useAuth()
const router = useRouter()

const team = ref<any>(null)
const teamName = ref('')
const track = ref('')
const tracksList = ['AI', 'Backend', 'Frontend', 'Data']
const invitePhone = ref('')
const invites = ref<any[]>([])
const sending = ref(false)

const inviteLink = computed(() =>
  `${window.location.origin}/invite/${team.value?.token}`
)

onMounted(async () => {
  // fetch team & invites
  team.value = await $fetch('/api/team/my')
  invites.value = await $fetch('/api/team/invites')
})

async function createTeam() {
  const res = await $fetch('/api/team/create', {
    method: 'POST',
    body: { name: teamName.value, hackathonTrack: track.value }
  })
  team.value = res
}

async function invite() {
  sending.value = true
  await $fetch('/api/team/invite', {
    method: 'POST',
    body: { phone: invitePhone.value, teamId: team.value?.id }
  })
  invites.value = await $fetch('/api/team/invites')
  sending.value = false
}

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
}

function goUploadCV() {
  router.push('/team/cv-upload')
}
</script>