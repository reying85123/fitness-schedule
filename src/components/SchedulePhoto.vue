<template>
  <div class="flex flex-col items-center gap-[10px] cursor-pointer" @click="openPhotoModal">
    <div class="invisible">進展相片</div>
    <div class="flex justify-center">
      <img :src="photoImg" alt="" class="w-[80%] max-w-[200px]" />
    </div>
    <div>加入相片</div>
  </div>
  <PhotoModal v-if="showPhotoModal" :show="showPhotoModal" @close-modal="closePhotoModal" />
</template>
<script setup>
import { ref } from 'vue'
import PhotoModal from '@/components/PhotoModal'
const photoImg = ref(require('@/assets/img/schedule/body-photo.png'))

const showPhotoModal = ref(false)
const openPhotoModal = () => {
  showPhotoModal.value = true
}
const closePhotoModal = (close) => {
  if (close) showPhotoModal.value = false
}
</script>
