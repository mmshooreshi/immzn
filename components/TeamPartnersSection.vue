// components/TeamPartnersSection.vue
<template>
    <section id="team-partners" class="py-12">
        <h2 class="text-3xl font-bold text-center mb-8">{{ data.headline }}</h2>
        <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h3 class="text-2xl font-semibold mb-4">Committee</h3>
                <ul class="list-disc list-inside">
                    <li v-for="(member, idx) in data.committee" :key="idx">{{ member }}</li>
                </ul>
            </div>
            <div>
                <h3 class="text-2xl font-semibold mb-4">Sponsors</h3>
                <ul class="grid grid-cols-2 gap-4 items-center">
                    <li v-for="(sponsor, idx) in data.sponsors" :key="idx" class="flex justify-center">
                        <img :src="sponsor.logo" :alt="sponsor.name" class="max-h-16 object-contain" />
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
const props = defineProps<{
    data: {
        headline: string;
        committee: string[];
        sponsors: Array<{ name: string; logo: string }>;
    };
}>();
</script>