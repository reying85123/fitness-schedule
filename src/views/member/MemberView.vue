<template>
  <div class="relative w-full h-screen min-h-[600px] bg-slate-300 flex justify-center items-center">
    <div
      class="w-[70%] md:w-[60%] lg:w-[40%] min-h-[500px] backdrop-blur-lg bg-white/40 rounded overflow-hidden flex flex-col lg:flex-row drop-shadow-lg"
    >
      <div class="w-full lg:w-[40%] h-[200px] lg:h-auto relative bg-slate-400">
        <div class="w-full h-full absolute flex justify-center items-center">
          <div class="w-[150px] lg:w-[70%] bg-white/30 rounded-full backdrop-blur-sm z-10">
            <img :src="logoImg" alt="" class="w-full h-full" />
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <img
            v-if="routerAction === '/member/login'"
            :src="dumbell"
            alt=""
            class="h-full w-full object-cover"
          />
          <img
            v-else-if="routerAction === '/member/signup'"
            :src="kettlebell"
            alt=""
            class="h-full w-full object-cover"
          />
          <img v-else :src="weightPlate" alt="" class="h-full w-full object-cover" />
        </transition>
      </div>
      <div class="w-full h-auto grow lg:w-[60%] p-6 md:p-8 lg:p-10 flex">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const logoImg = ref(require('@/assets/img/logo.png'))
const dumbell = ref(require('@/assets/img/dumbell.jpg'))
const kettlebell = ref(require('@/assets/img/kettlebell.jpg'))
const weightPlate = ref(require('@/assets/img/weight-plate.jpg'))
const route = useRoute()
const routerAction = computed(() => route.path)
</script>
<style scoped lang="scss">
.dumbell-bg {
  z-index: -1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s, transform 0.35s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
