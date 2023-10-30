<template>
  <div>訓練時數</div>
  <div class="mt-5 mb-10">
    <vue-slider
      v-model="scheduleData.scheduleTime"
      :disabled="!props.mode"
      :adsorb="true"
      :marks="timeMarks"
      :data="timeOptions"
      :contained="true"
      :rail-style="{ backgroundColor: '#fcd6c3' }"
      :process-style="{ backgroundColor: '#fa9561' }"
      :tooltip-style="{ backgroundColor: '#fa9561' }"
      :step-style="{ backgroundColor: '#fa9561' }"
    >
      <template v-slot:dot="{ focus }">
        <div :class="['time-slider-dot', { focus }]"></div>
      </template>
    </vue-slider>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/material.css'
const store = useStore()
const props = defineProps({
  mode: {
    type: Boolean
  }
})

const timeOptions = ref(store.getters['schedule/getTimeOptions'])
const timeMarks = ref(store.getters['schedule/getTimeOptions'])
const scheduleData = computed(() => store.getters['schedule/getScheduleData'])

const timeMarksDisplay = () => {
  if (window.innerWidth >= 768) {
    timeMarks.value = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
    ]
  } else {
    timeMarks.value = [0, 3, 6, 9, 12, 15, 18, 21, 24]
  }
}

onMounted(() => {
  timeMarksDisplay()
  window.addEventListener('resize', timeMarksDisplay)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', timeMarksDisplay)
})
</script>
<style lang="scss" scoped>
.time-slider-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #fa9561;
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 150%;
    height: 150%;
    background-color: #fcd6c3;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    z-index: -1;
    transition: transform 0.2s;
  }

  &.focus {
    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
  }
}
</style>
