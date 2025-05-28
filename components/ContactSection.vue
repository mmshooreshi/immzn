<!-- 6. ContactSection.vue -->
<script setup>
const props = defineProps({ data: Object });
</script>

<template>
    <section id="contact" class="py-12 dark:bg-gray-900 bg-[#eef2ff]">
        <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">{{ data.headline }}</h2>
            <div class="llttrr grid gap-6 sm:grid-cols-2 lg:grid-cols-4 justify-center mb-8">
                <a v-for="c in data.contact" :key="c.type"
                    :href="c.type === 'email' ? `mailto:${c.value}` : c.type === 'phone' ? `tel:${c.value}` : c.type === 'twitter' ? `https://twitter.com/${c.value.replace('@', '')}` : c.type === 'linkedin' ? `https://www.linkedin.com/company/${c.value}` : '#'"
                    class="flex flex-col items-center space-y-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800">
                    <svg v-if="c.type === 'email'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="c.type === 'phone'" class="h-6 w-6" fill="none" stroke="currentColor"
                        stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.45l1.29 5.16a2 2 0 01-.58 1.95l-2.12 2.12a15.05 15.05 0 006.36 6.36l2.12-2.12a2 2 0 011.95-.58l5.16 1.29A2 2 0 0121 17.72V21a2 2 0 01-2 2H19C9.611 23 3 16.389 3 7V5z" />
                    </svg>
                    <svg v-else-if="c.type === 'twitter'" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M23.954 4.569a10 10 0 01-2.825.775 4.932 4.932 0 002.163-2.723 9.864 9.864 0 01-3.127 1.184 4.916 4.916 0 00-8.384 4.482A13.94 13.94 0 011.671 3.149a4.822 4.822 0 001.523 6.574 4.896 4.896 0 01-2.23-.616c-.054 2.28 1.581 4.415 3.949 4.89a4.902 4.902 0 01-2.224.085 4.932 4.932 0 004.604 3.417A9.867 9.867 0 010 19.54a13.897 13.897 0 007.548 2.209c9.056 0 14.009-7.514 14.009-14.01 0-.213-.004-.425-.015-.636A9.936 9.936 0 0024 4.59z" />
                    </svg>
                    <svg v-else-if="c.type === 'linkedin'" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M19 0h-14c-2.761 0-5 2.238-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.762-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.783-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-1.337-.025-3.059-1.868-3.059-1.869 0-2.156 1.459-2.156 2.966v5.697h-3v-11h2.882v1.501h.041c.402-.762 1.384-1.566 2.851-1.566 3.05 0 3.615 2.008 3.615 4.618v6.447z" />
                    </svg>
                    <span class="text-sm llttrr">{{ c.value }}</span>
                </a>
            </div>
            <p class="text-lg text-gray-800 dark:text-gray-200 max-w-xl mx-auto w-max">{{ data.outro.sub }}</p>
        </div>

        <div style="display: flex; justify-content: center;">
            <a referrerpolicy="origin" target="_blank"
                href="https://trustseal.enamad.ir/?id=615729&Code=o73a92Jywa7Q7eL8cP7f0KuhXIiskSBr">
                <img referrerpolicy="origin"
                    src="https://trustseal.enamad.ir/logo.aspx?id=615729&Code=o73a92Jywa7Q7eL8cP7f0KuhXIiskSBr" alt=""
                    style="cursor: pointer;" code="o73a92Jywa7Q7eL8cP7f0KuhXIiskSBr">
            </a>
        </div>
    </section>
</template>

<style scoped>
.llttrr {
    direction: ltr !important;
}
</style>