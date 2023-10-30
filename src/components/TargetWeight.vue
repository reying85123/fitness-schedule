<template>
  <div class="w-full relative">
    <div
      v-if="!targetData.loaded"
      class="w-full h-full absolute flex items-center justify-center backdrop-blur-[1px] bg-white/30"
    >
      <LoadingCircle width="3rem" height="3rem" color="#475569" />
    </div>
    <div class="flex items-center justify-between">
      <div>目標{{ title }}</div>
      <template v-if="doingAjax">
        <button>
          <LoadingCircle width="1rem" height="1rem" color="#475569" />
        </button>
      </template>
      <template v-else-if="!targetSetting">
        <button @click="targetSettingDisplay">
          <img :src="editImg" alt="" class="w-[1rem] h-[1rem]" />
        </button>
      </template>
      <template v-else>
        <button @click="targetSettingSave">
          <img :src="checkImg" alt="" class="w-[1rem] h-[1rem]" />
        </button>
      </template>
    </div>
    <div class="grid grid-cols-2 gap-x-[5px]" v-if="targetSetting">
      <div class="flex items-center">
        <label :for="`${props.type}-target`" class="whitespace-nowrap">目標:</label>
        <div class="w-[100%]">
          <input
            type="number"
            name=""
            :id="`${props.type}-target`"
            class="w-[100%]"
            min="1"
            :max="maxLimit[props.type]"
            @input="limitDecimalPlaces"
            v-model="targetData.target"
          />
        </div>
      </div>
      <div class="flex items-center">
        <template v-if="props.type === 'weight'">
          <label :for="`${props.type}-unit`" class="whitespace-nowrap">單位:</label>
          <select :id="`${props.type}-unit`" v-model="targetData.unit">
            <template v-for="unitItem in unitOptions" :key="unitItem.value">
              <option :value="unitItem.value">{{ unitItem.text }}</option>
            </template>
          </select>
        </template>
        <template v-else>
          <div class="whitespace-nowrap">單位:</div>
          <div>%</div>
        </template>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-[5px]" v-else>
      <div class="flex items-center">
        <div class="whitespace-nowrap">目標:</div>
        <div class="w-[100%]">
          {{ targetData.target }}
        </div>
      </div>
      <div class="flex items-center">
        <div class="whitespace-nowrap">單位:</div>
        <template v-if="props.type === 'weight'">
          {{ displayUnit[targetData.unit] }}
        </template>
        <template v-else>
          <div>%</div>
        </template>
      </div>
    </div>
    <div class="w-full h-[170px] md:h-[200px] lg:h-[250px]">
      <Line :data="dataSet" :options="options" />
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
import { alertModal } from '@/modules/alertModal'
import axios from 'axios'
import LoadingCircle from '@/components/LoadingCircle'
const editImg = ref(require('@/assets/img/icons/pen.svg'))
const checkImg = ref(require('@/assets/img/icons/check.svg'))
const store = useStore()
const props = defineProps({
  type: {
    type: String,
    default: 'weight'
  }
})

//顯示名稱
const targetText = () => {
  let returnText = '重'
  if (props.type === 'weight') {
    returnText = '重'
  } else if (props.type === 'fat') {
    returnText = '脂'
  }
  return returnText
}
const title = ref(`體${targetText()}`)
const unitOptions = reactive([
  {
    text: `公斤(KG)`,
    value: 'KG'
  },
  {
    text: `磅(LB)`,
    value: 'LB'
  }
])
const displayUnit = reactive({
  KG: '公斤(KG)',
  LB: '磅(LB)'
})

//限制最大輸入數字
const maxLimit = reactive({
  weight: 999,
  fat: 100
})

//設定過去天數
const settingDays = ref(7)
//取得目標資料
const targetData = computed(() => store.getters['targetWeight/getTarget'](props.type))
//取得目標體重 chart.js data array
const getTargetWeightArray = (days) => {
  let targetWeightArray = Array.from({ length: days }, () => targetData.value.target)
  return targetWeightArray
}
const getCurrentWeightArray = () => {
  let currentWeight = []
  for (const weight of targetData.value.current) {
    currentWeight.push(weight)
  }
  return currentWeight
}

//取得最近日期陣列 chart.js X軸
const getRecentlyDateArray = (days) => {
  const currentDate = new Date()
  const pastSevenDays = []

  for (let i = days - 1; i >= 0; i--) {
    const pastDate = new Date(currentDate)
    pastDate.setDate(currentDate.getDate() - i)

    const formattedDate = `${pastDate.getMonth() + 1}/${pastDate.getDate()}`
    pastSevenDays.push(formattedDate)
  }
  return pastSevenDays
}

//設定上下限 chart.js Ｙ軸體重上下限
const setYAxisLimit = (type) => {
  const weightArray = [targetData.value.target, ...targetData.value.current]
    .filter((value) => !isNaN(value))
    .sort((a, b) => a - b)

  let min = 0,
    max = 0

  min = weightArray.length > 0 ? Number(weightArray[0]) : 0
  max = weightArray.length > 0 ? Number(weightArray[weightArray.length - 1]) : 90
  if (max === 0 && min === 0) {
    max = 80
  }

  min = min - 20 > 0 ? min - 20 : 0
  max = max + 20

  if (type === 'min') {
    return min
  } else {
    return max
  }
}

//限制輸入框可輸入至小數點後一位
const limitDecimalPlaces = () => {
  const value = targetData.value.target

  // 使用正規表達式驗證輸入是否為有效數字格式
  const regex = new RegExp(`^-?\\d*\\.?\\d{0,1}$`)
  if (!regex.test(value)) {
    // 如果輸入不符合要求，截取前幾位有效數字
    targetData.value.target = value.toFixed(1)
  }

  if (value < 0) targetData.value.target = 0
  if (value > maxLimit[props.type]) {
    targetData.value.target = maxLimit[props.type]
  }
}

//chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const dataSet = computed(() => {
  return {
    labels: getRecentlyDateArray(settingDays.value),
    datasets: [
      {
        label: `目標${title.value}`,
        borderColor: '#cbd5e1',
        backgroundColor: '#405E95',
        data: getTargetWeightArray(settingDays.value)
      },
      {
        label: `目前${title.value}`,
        borderColor: '#fcd6c3',
        backgroundColor: '#fa9561',
        data: getCurrentWeightArray()
      }
    ]
  }
})

const options = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (chartItem) => {
            return `${chartItem.dataset.label}:${chartItem.formattedValue} ${targetData.value.unit}`
          }
        }
      }
    },
    scales: {
      y: {
        suggestedMin: setYAxisLimit('min'),
        suggestedMax: setYAxisLimit('max')
      }
    }
  }
})

//儲存修改設置前數值
const initialValue = reactive({
  target: 0,
  unit: ''
})
//開啟設置
const targetSetting = ref(false)
const targetSettingDisplay = () => {
  initialValue.target = targetData.value.target
  initialValue.unit = targetData.value.unit
  targetSetting.value = true
}

//儲存設置到資料庫
const doingAjax = ref(false)
const targetSettingSave = async () => {
  if (doingAjax.value) return
  if (
    isNaN(targetData.value.target) ||
    targetData.value.target < 0 ||
    targetData.value.target > maxLimit[props.type]
  ) {
    await alertModal('error', '請輸入正確的數字')
    return
  }

  if (
    targetData.value.target === initialValue.target &&
    targetData.value.unit === initialValue.unit
  ) {
    doingAjax.value = false
    targetSetting.value = false
    return
  }

  doingAjax.value = true
  try {
    await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}goal`,
      data: {
        type: props.type,
        unit: targetData.value.unit,
        target: targetData.value.target,
        token: store.getters['user/getUserToken']
      }
    })
  } catch (err) {
    console.log(err)
    await alertModal('error', '儲存異常，請重整頁面後再試')
    targetData.value.target = initialValue.target
    targetData.value.unit = initialValue.unit
  }

  doingAjax.value = false
  targetSetting.value = false
}
</script>
