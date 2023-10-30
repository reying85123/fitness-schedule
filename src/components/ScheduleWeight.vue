<template>
  <div class="flex flex-col items-center gap-[10px]">
    <div>體重紀錄</div>
    <div class="flex justify-center">
      <img :src="weightImg" alt="" class="w-[80%] max-w-[200px]" />
    </div>
    <template v-if="props.mode">
      <div class="flex items-center">
        <div class="w-[60px] border-2 rounded">
          <input
            type="number"
            class="w-full text-right"
            max="999"
            min="0"
            v-model="scheduleData.weight"
            @input="limitDecimalPlaces"
          />
        </div>
        <div class="whitespace-nowrap">
          {{ unitText[weightUnit] }}
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center">
        <div>
          {{ scheduleData.weight }}
        </div>
        <div>
          {{ unitText[weightUnit] }}
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
const weightImg = ref(require('@/assets/img/schedule/body-weight.png'))
const props = defineProps({
  mode: {
    type: Boolean
  }
})
const store = useStore()

const weightUnit = computed(() => store.getters['targetWeight/getTarget']('weight').unit)
const unitText = ref({
  KG: '公斤(KG)',
  LB: '磅(LB)'
})

const scheduleData = computed(() => store.getters['schedule/getScheduleData'])

//限制輸入框可輸入至小數點後一位
const limitDecimalPlaces = () => {
  const value = scheduleData.value.weight

  // 使用正規表達式驗證輸入是否為有效數字格式
  const regex = new RegExp(`^-?\\d*\\.?\\d{0,1}$`)
  if (!regex.test(value)) {
    // 如果輸入不符合要求，截取前幾位有效數字
    scheduleData.value.weight = value.toFixed(1)
  }

  if (value < 0) scheduleData.value.weight = 0
  if (value > 999) {
    scheduleData.value.weight = 999
  }
}
</script>
