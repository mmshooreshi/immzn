<!-- JsonViewer.vue -->
<template>
    <!-- full-width, scrollable container -->
    <pre class="json-viewer m-auto my-2">{{ formattedJson }}</pre>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    /**  The JSON you want to display  */
    data: {
      type: [Object, Array],
      required: true,
    },
  })
  
  /** Pretty-print with 2-space indentation */
  const formattedJson = computed(() => JSON.stringify(props.data, null, 2))
  </script>
  
  <style scoped>
  .json-viewer {
    width: 90%;          /* take all horizontal space */
    max-height: 100%;     /* grow as tall as parent allows */
    overflow: auto;       /* scroll if it overflows */
    padding: 1rem;
  
    /* “tidy” look & feel */
    background: #1e1e1e;
    color: #d4d4d4;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.4;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  }
  </style>
  