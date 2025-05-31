<template>
  <div class="mx-auto max-w-xl py-12 px-4">
    <!-- <h1 class="text-3xl font-bold mb-8">Upload your CV</h1> -->

    <form @submit.prevent="submit" class="space-y-6">
      <!-- file input ------------------------------------------------ -->
      <div>
        <!-- <label for="cv" class="block mb-1 font-medium">{{ L.cvUpload }}</label> -->
        <input ref="fileInput" id="cv" type="file" accept=".pdf,.doc,.docx" class="custom-file-input input ltr w-full"
          @change="onFileChange" required />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ L.cvHint }}</p>
      </div>

      <!-- quick preview --------------------------------------------- -->
      <div v-if="file" class="flex items-center justify-between text-sm">
        <span>{{ file.name }} ({{ (file.size / 1024).toFixed(0) }} KB)</span>
        <button type="button" class="text-red-600" @click="removeFile">✕</button>
      </div>

      <!-- submit ----------------------------------------------------- -->
      <BaseButton :disabled="!file || uploading" :loading="uploading">
        <Icon name="mdi:upload" class="w-4 h-4 mr-1" />
        <span v-if="!uploading">Upload</span>
        <span v-else>Uploading…</span>
      </BaseButton>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '#imports'
import { useBase64File } from '~/composables/useBase64File'

const emit = defineEmits<{
  (e: 'uploaded', url: string): void
}>()

const L = {
  cvUpload: 'Choose your CV',
  cvHint: 'Accepted PDF/DOC/DOCX up to 10 MB.'
}

const router = useRouter()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const uploading = ref(false)
const success = ref(false)

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const okTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  if (!okTypes.includes(f.type) || f.size > 10 * 1024 * 1024) {
    toast.error(L.cvHint)
      ; (e.target as HTMLInputElement).value = ''
    file.value = null
    return
  }
  file.value = f
}
function removeFile() {
  file.value = null
  fileInput.value && (fileInput.value.value = '')
}

async function submit() {
  if (!file.value) return
  uploading.value = true
  try {
    const { base64 } = await useBase64File(file.value)
    const { fileUrl } = await $fetch('/api/upload-cv', {
      method: 'POST',
      body: {
        cvFileName: file.value.name,
        cvBase64: base64,
        sendToTelegram: false
      }
    })
    emit('uploaded', fileUrl) // ✅ emit here
    toast.success({ 'title': 'uploaded!', 'message': 'CV uploaded!' })
    success.value = true
  } catch (err) {
    toast.error({ 'title': ':(!', 'message': 'upload failed!' + err })
  } finally {
    uploading.value = false
  }
}

</script>
