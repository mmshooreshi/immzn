<script lang="ts" setup>
const switchLocalePath = useSwitchLocalePath()

</script>

<template>
    <NuxtLink :to="switchLocalePath('en')">En</NuxtLink>
    <NuxtLink :to="switchLocalePath('fa')">فا</NuxtLink>

</template>
