<template>
  <span
    class="loader"
    :style="{
      width: width,
      height: height,
      'border-top-color': color
    }"
  ></span>
</template>
<script setup>
import { defineProps, computed } from 'vue'
const props = defineProps({
  width: {
    type: String,
    default: '25px'
  },
  height: {
    type: String,
    default: '25px'
  },
  color: {
    type: String,
    default: '#000'
  }
})

const width = computed(() => props.width)
const height = computed(() => props.height)
const color = computed(() => props.color)
</script>
<style scoped>
.loader {
  border-radius: 50%;
  display: inline-block;
  border-top: 3px solid;
  border-right: 3px solid transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
