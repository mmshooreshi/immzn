<!-- components/HackathonPane.vue -->
<template>
  <Card class="space-y-4 ">
    <h3 class="text-xl font-semibold">Hackathon</h3>
    <div v-if="!team">
      <BaseInput placeholder="Team name" v-model="teamName" label="Team Name" />
      <select v-model="track" label="Track" class="h-12 px-2 w-[98%]">
        <option v-for="trackOption in tracksList" :key="trackOption" :value="trackOption">
          {{ trackOption }}
        </option>
      </select>
      <BaseButton @click="createTeam" :disabled="!teamName || !track">
        <Icon name="mdi:account-group-plus" /> Create Team
      </BaseButton>
    </div>
    <div v-else class="flex flex-col w-full items-center  h-full gap-4">
      <div class="flex flex-row w-full items-center justify-start   gap-2 mx-4 text-sm">
        <Icon name="mdi:check-circle text-teal " /> Team: <span class="font-extrabold text-xl text-teal-400/80"> {{
          team.name
          }}</span>
      </div>
      <div class="flex flex-col w-full  justify-center items-center md:flex-row gap-0">
        <div
          class="ring-teal-200/40   w-max flex flex-col items-start justify-start content-start p-4 rounded-[28px] gap-2">
          <BaseInput class="w-max   ltr text-white" placeholder="Invite Phone" v-model="invitePhone"
            label="Invite Phone (09123456789)" />
          <BaseButton @click="invite" class="!rounded-[14px] bg-gray-700 text-teal-400" :loading="sending"
            :disabled="!invitePhone">
            <Icon name="mdi:message-text" class="w-4 mx-2 h-4" /> Send SMS Invite
          </BaseButton>
          <div class="h-max flex-grow"></div>

        </div>
        <!-- <qrcode-vue :value="inviteLink" /> -->

        <div @click="copyLink"
          class="bg-teal-200/40  flex flex-col items-center justify-center p-[8px] w-min rounded-[28px]">
          <input readonly class="py-2 text-center tracking-[3px] font-mono w-[240px]  " v-model="text" type="text" />
          <img class=" w-[240px] rounded-[20px]" :src="qrcode" alt="QR Code" />

        </div>

      </div>

      <!-- <ul class="space-y-4">
        <li v-for="i in invites" :key="i.phone">
          <Icon name="mdi:clock" /> {{ i.phone }} ({{ i.sentAt }})
        </li>
      </ul> -->

      <BaseButton class="mt-16" @click="goUploadCV">
        <Icon name="mdi:upload" /> Upload CV
      </BaseButton>
    </div>
  </Card>

</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/stores/auth'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { shallowRef } from 'vue'
import { nanoid } from 'nanoid'

const token = nanoid(12)
const text = shallowRef(token)
const qrcode = useQRCode(text)

const auth = useAuth()
const router = useRouter()

const team = ref<any>(null)
const teamName = ref('')
const track = ref('')
const tracksList = ['AI', 'Backend', 'Frontend', 'Data']
const invitePhone = ref('')
const invites = ref<any[]>([])
const sending = ref(false)
const toast = useToast()

const inviteLink = computed(() =>
  `${window.location.origin}/invite/${token}`
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
    body: { phone: invitePhone.value, teamId: team.value?.id, teamName: team.value?.name, token: token }
  })
  invites.value = await $fetch('/api/team/invites')
  sending.value = false
}

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
  toast.success({ title: 'Success', message: 'Invitation link copied to clipboard!' })
}

function goUploadCV() {
  router.push('/team/cv-upload')
}
</script>