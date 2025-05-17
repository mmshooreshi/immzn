<template>
  <section class="!w-full section">
    <slot />
  </section>
</template>

<style scoped lang="scss">
.section {
  @include mixins.section;
  @include mixins.section-width;
}
</style>
