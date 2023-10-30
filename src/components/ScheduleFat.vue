<template>
  <div class="flex flex-col items-center gap-[10px]">
    <div>體脂紀錄</div>
    <div class="flex justify-center">
      <img :src="fatImg" alt="" class="w-[80%] max-w-[200px]" />
    </div>
    <template v-if="props.mode">
      <div class="flex items-center">
        <div class="w-[60px] border-2 rounded">
          <input
            type="number"
            class="w-full text-right"
            max="100"
            min="0"
            v-model="scheduleData.fat"
            @input="limitDecimalPlaces"
          />
        </div>
        <div class="whitespace-nowrap">%</div>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center">
        <div>
          {{ scheduleData.fat }}
        </div>
        <div>%</div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
const fatImg = ref(require('@/assets/img/schedule/body-fat.png'))
const props = defineProps({
  mode: {
    type: Boolean
  }
})
const store = useStore()

const scheduleData = computed(() => store.getters['schedule/getScheduleData'])

//限制輸入框可輸入至小數點後一位
const limitDecimalPlaces = () => {
  const value = scheduleData.value.fat

  // 使用正規表達式驗證輸入是否為有效數字格式
  const regex = new RegExp(`^-?\\d*\\.?\\d{0,1}$`)
  if (!regex.test(value)) {
    // 如果輸入不符合要求，截取前幾位有效數字
    scheduleData.value.fat = value.toFixed(1)
  }

  if (value < 0) scheduleData.value.fat = 0
  if (value > 100) {
    scheduleData.value.fat = 100
  }
}
</script>
