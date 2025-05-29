<!-- pages/onboarding.vue -->
<template>
  <NuxtLayout name="page">

    <div class="min-h-screen p-8 mt-20">
      <NuxtLayout>
        <div class="flex gap-6">
          <ProfileCompletionPane />
          <div class="flex-1 grid grid-cols-2 gap-6">
            <HackathonPane />
            <ConferencePane />
          </div>
        </div>
      </NuxtLayout>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import ProfileCompletionPane from '~/components/ProfileCompletionPane.vue'
import HackathonPane from '~/components/HackathonPane.vue'
import ConferencePane from '~/components/ConferencePane.vue'
</script>