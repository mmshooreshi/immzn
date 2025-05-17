<script setup lang="ts">
type Skill = {
  source: string;
  x: number;
  y: number;
};

const data = await queryContent('/skills').findOne();
const skills = ref<Skill[]>([]);
const skillsIndex = ref(0);

const placeSkill = (event: MouseEvent) => {
  const source = data.skills[skillsIndex.value];

  if (skillsIndex.value < data.skills.length - 1) {
    skillsIndex.value += 1;
  } else {
    skillsIndex.value = 0;
  }

  const container = (event.target as Element).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY - container.top;
  const newSkill = { source, x, y };
  skills.value.push(newSkill);

  setTimeout(() => {
    const i = skills.value.indexOf(newSkill);
    if (i > -1) skills.value.splice(i, 1);
  }, 5000);


};

// Preload images
onMounted(() => {
  data.skills.forEach((skill: string) => {
    const image = new Image();
    image.src = `/images/skills/${skill}`;
  });
});
</script>

<template>
  <ul ref="container" class="container" @click="placeSkill">
    <li v-for="(skill, index) in skills" :key="index">
      <SkillSticker :source="skill.source" :x="skill.x" :y="skill.y" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
.container {
  position: absolute;
  inset: 0rem 0;
  cursor: crosshair;
  // background-color: red;
  z-index: 100;

  @include screens.laptop {
    // top: -14rem;
    left: 50%;
    // translate: -50%;
    width: 100vw;
    // height: calc(100% + 14rem * 2);
  }
}


li {
  animation: fadeOut 10s ease forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
