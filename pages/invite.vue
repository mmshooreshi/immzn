<!-- pages/invite.vue -->
<script setup lang="ts">
import InviteSection from '~/components/InviteSection.vue'
import { useDataStore } from '~/stores/dataStore'
const { localizedData } = storeToRefs(useDataStore())
</script>

<template>
    <NuxtLayout name="page">
        <InviteSection :data="localizedData.invite_page" />
    </NuxtLayout>
</template>
