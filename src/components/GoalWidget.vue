<template>
  <div class="relative">
    <div class="absolute w-[100%] h-[100%] top-0 left-0 flex items-end justify-center z-0">
      <div class="mb-[35px] sm:mb-[50px] text-[2rem]">{{ percentage }}%</div>
    </div>
    <div class="w-[100%] h-[100%] absolute top-0 left-0 flex items-end justify-center z-0">
      <Doughnut :data="chartData" :options="chartOptions" class="z-10" />
    </div>
  </div>
</template>
<script setup>
import { defineProps, computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
const props = defineProps({
  start: {
    type: [Number, String],
    default: 0
  },
  end: {
    type: [Number, String],
    default: 0
  },
  current: {
    type: [Number, String],
    default: 0
  },
  way: {
    type: String,
    default: 'lose'
  },
  unit: {
    type: String,
    default: 'KG'
  },
  goal: {
    type: String,
    default: '體重'
  }
})

const goalActive = computed(() => getGoalActive())
const percentage = computed(() => calculatePercentage())

//判斷是否設定目標
const getGoalActive = () => {
  if (props.end > 0) {
    return true
  } else {
    return false
  }
}

//取得體重變化值(目前體重，起始體重差距)
const getValueChange = () => {
  if (!goalActive.value) return 0
  let valueChange = 0
  if (props.way === 'lose') {
    valueChange = props.start - props.current
  } else {
    valueChange = props.current - props.start
  }

  if (valueChange < 0) valueChange = 0
  return valueChange
}

//計算距離目標還需幾kg
const calculateGap = () => {
  if (!goalActive.value) return 1
  let gap = 0
  if (props.way === 'lose') {
    gap = props.current - props.end
  } else {
    gap = props.end - props.current
  }
  if (gap < 0) gap = 0
  return gap
}

//計算距離達成目標比率
const calculatePercentage = () => {
  let percentage = 0
  if (props.way === 'lose') {
    percentage = (props.start - props.current) / (props.start - props.end)
  } else {
    percentage = Number((props.current - props.start) / (props.end - props.start))
  }
  if (percentage < 0) {
    percentage = 0
  } else if (percentage > 1) {
    percentage = 1
  }
  if (isNaN(percentage)) percentage = 0
  percentage = Math.round(percentage * 100)
  return percentage
}

//Chart JS
ChartJS.register(ArcElement, Tooltip)
const chartData = computed(() => {
  return {
    labels: [`目前${props.goal}`, `目標${props.goal}`],
    datasets: [
      {
        data: [getValueChange(), calculateGap()],
        backgroundColor: ['#475569', '#cbd5e1']
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Custom Chart Title'
      },
      tooltip: {
        display: false,
        callbacks: {
          label: (chartItem) => {
            if (chartItem.dataIndex === 0) {
              return `${chartItem.label} : ${props.current} ${props.unit}`
            } else {
              return `${chartItem.label} : ${props.end} ${props.unit}`
            }
          }
        }
      }
    },
    rotation: -90,
    circumference: 180,
    cutout: '85%',
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }
})
</script>
