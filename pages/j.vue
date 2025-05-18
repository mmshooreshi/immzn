<!-- 7. index.vue (page) -->
<script setup>

import ProgramSection from "~/components/ProgramSection.vue";
import EssentialsSection from "~/components/EssentialsSection.vue";
import TeamPartnersSection from "~/components/TeamPartnersSection.vue";
import RegisterSection from "~/components/RegisterSection.vue";
import FAQSection from "~/components/FAQSection.vue";
import ContactSection from "~/components/ContactSection.vue";


import { useSettings } from '~/composables/useSettings'
import { useDataStore } from '~/stores/dataStore'
import { storeToRefs } from 'pinia'
const { localizedData, loading } = storeToRefs(useDataStore())
const { language } = useSettings()


</script>


<template>
  <main class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
    <ProgramSection :data="localizedData.hackathon" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <!-- <EssentialsSection :data="{
      headline: localizedData.resources.headline,
      sections: [
        { title: localizedData.resources.headline, items: localizedData.resources.sections },
        { title: localizedData.logistics.headline, items: localizedData.logistics.items }
      ]
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <TeamPartnersSection :data="{
      headline: localizedData.committee.headline,
      committee: localizedData.committee.members,
      sponsors: localizedData.sponsors.list
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <RegisterSection :data="{
      headline: localizedData.register.headline,
      ctaText: localizedData.register.ctaText,
      link: localizedData.register.link
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <FAQSection :data="{
      headline: localizedData.faq.headline,
      faq: localizedData.faq.entries ?? localizedData.faq.items
    }" />
    <hr class="border-gray-200 dark:border-gray-800" />

    <ContactSection :data="{
      headline: localizedData.contact.headline,
      contact: localizedData.contact.items,
      outro: localizedData.outro
    }" /> -->
  </main>
</template>