<template>
    <div v-if="pending">Loading…</div>
    <div v-else-if="user">
        <h1>Profile</h1>
        <p>ID: {{ user.id }}</p>
        <p>Phone: {{ user.phone }}</p>
        <p>Joined: {{ new Date(user.created_at).toLocaleString() }}</p>
    </div>
</template>

<script setup lang="ts">
const { user, pending } = useUser()
</script>
