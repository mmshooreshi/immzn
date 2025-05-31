<!-- components/HackathonPane.vue -->
<template>
  <div class="space-y-4 ">
    <h3 class="text-xl text-gray-800 dark:text-white font-semibold">Hackathon</h3>

    <div v-if="!team">
      <BaseInput placeholder="Team name" v-model="teamName" label="Team Name" />
      <select v-model="track" label="Track" class="h-12 px-2 w-[98%]">
        <option v-for="trackOption in tracksList" :key="trackOption" :value="trackOption">
          {{ trackOption }}
        </option>
      </select>
      <BaseButton @click="createTeam" :disabled="!teamName || !track">
        <Icon name="hugeicons:add-team-02" /> Create Team
      </BaseButton>
    </div>
    <div v-else class="flex flex-col w-full items-center  h-full gap-4">
      <div class="flex flex-row w-full items-center justify-start text-black dark:text-teal  gap-2 mx-4 text-sm">
        <Icon name="mdi:check-circle" class="text-teal-700 w-6 h-6 dark:text-teal" /> Team: <span
          class="font-extrabold text-xl text-teal-800 text-d4 dark:text-teal-400/80 ">
          {{
            team.name
          }}</span>
      </div>
      <div class="flex flex-col w-full  justify-center items-center md:flex-row gap-0">
        <div
          class="ring-teal-200/40   w-max flex flex-col items-start justify-start content-start p-4 rounded-[28px] gap-2">
          <BaseInput class="w-max ltr" placeholder="Invite Phone" v-model="invitePhone"
            label="Invite Phone (09123456789)" />
          <BaseButton @click="invite" class="!rounded-[14px] bg-gray-700 text-teal-400" :loading="sending"
            :disabled="!invitePhone">
            <Icon name="mdi:message-text" class="w-4 mx-2 h-4" /> Send SMS Invite
          </BaseButton>
          <div class="h-max flex-grow"></div>

        </div>
        <!-- <qrcode-vue :value="inviteLink" /> -->

        <!-- HackathonPane.vue -->
        <div @click="copyLink" class="bg-teal-200/40 flex flex-col items-center justify-center
            p-[8px] w-min rounded-[28px]">

          <input readonly class="py-2 text-center text-teal-800 dark:text-teal tracking-[3px] font-mono w-[240px]"
            v-model="inviteToken" type="text" />

          <!-- Only create the element when qrcode is ready -->
          <img v-if="qrcode" :src="qrcode" class="w-[240px] rounded-[20px]" alt="QR Code" />
        </div>


      </div>

      <!-- <ul class="space-y-4">
        <li v-for="i in invites" :key="i.phone">
          <Icon name="mdi:clock" /> {{ i.phone }} ({{ i.sentAt }})
        </li>
      </ul> -->

      <!-- <BaseButton class="mt-16" @click="goUploadCV">
        <Icon name="mdi:upload" /> Upload CV
      </BaseButton> -->


      <!-- If CV already uploaded, show summary -->
      <div v-if="auth.user?.cvUrl" class="flex flex-col items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <div class="flex items-center gap-2">
          <Icon name="mdi:file-document-outline" />
          <a :href="auth.user.cvUrl" target="_blank" rel="noopener" class="underline hover:text-blue-500">
            View uploaded CV
          </a>
        </div>
        <BaseButton @click="removeCV" class="text-red-600 text-xs hover:underline">
          Remove & re-upload
        </BaseButton>
      </div>
      <CVUpload v-else @uploaded="updateCVUrl" />

    </div>
  </div>

</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/stores/auth'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { shallowRef } from 'vue'
import { nanoid } from 'nanoid'
import CVUpload from '~/components/team/cv-upload.vue'

/* ---------- incoming data & events ---------- */
const props = defineProps<{
  team: any | null
  invites: any[] | null
}>()



const emit = defineEmits<{
  (e: 'updated'): void
}>()

async function updateCVUrl(url: string) {
  await $fetch('/api/user/update', {
    method: 'POST',
    body: { cvUrl: url }
  })
  toast.success('CV attached to your profile!')
  auth.fetch()           // ✅ refresh local store so profile updates
  emit('updated')        // ✅ refresh parent pane if needed
}

async function removeCV() {
  await $fetch('/api/user/update', {
    method: 'POST',
    body: { cvUrl: null }
  })
  await auth.fetch()
  emit('updated')
  toast.info('CV removed. You can upload a new one.')
}


const auth = useAuth()
const router = useRouter()

// const team = ref<any>(null)
const teamName = ref('')
const track = ref('')
const tracksList = ['AI', 'Backend', 'Frontend', 'Data']
const invitePhone = ref('')
// const invites = ref<any[]>([])
const sending = ref(false)
const toast = useToast()



/* token + link only matter while the user keeps the pane open */
const inviteToken = ref(nanoid(12))
const inviteLink = computed(() =>
  `${window.location.origin}/invite/${inviteToken.value}`
)


const text = shallowRef(inviteToken.value)
const qrcode = useQRCode(text)


onMounted(async () => {
  // // fetch team & invites
  // team.value = await $fetch('/api/team/my')
  // invites.value = await $fetch('/api/team/invites')
})

async function createTeam() {
  await $fetch('/api/team/create', {
    method: 'POST',
    body: { name: teamName.value, hackathonTrack: track.value }
  })
  emit('updated')                 // tell the parent to refresh
}

async function invite() {
  sending.value = true
  await $fetch('/api/team/invite', {
    method: 'POST',
    body: {
      phone: invitePhone.value,
      teamId: props.team?.id,
      teamName: props.team?.name,
      token: inviteToken.value
    }
  })
  inviteToken.value = nanoid(12)  // prepare next link
  sending.value = false
  toast.success('Invitation sent!')
  emit('updated')
}

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
  toast.success('Invitation link copied!')
}

function goUploadCV() {
  router.push('/team/cv-upload')
}
</script>