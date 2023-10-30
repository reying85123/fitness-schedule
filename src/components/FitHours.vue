<template>
  <div class="w-full relative">
    <div
      v-if="false"
      class="w-full h-full absolute flex items-center justify-center backdrop-blur-[1px] bg-white/30"
    >
      <LoadingCircle width="3rem" height="3rem" color="#475569" />
    </div>
    <div>
      <div class="flex justify-between items-center">
        <div>訓練時數</div>
        <div>
          <select name="" id="" v-model="timeGroupSelected">
            <template v-for="timeGroup in timeGroupOptions" :key="timeGroup.value">
              <option :value="timeGroup.value">{{ timeGroup.text }}</option>
            </template>
          </select>
        </div>
      </div>
      <div class="w-full h-[170px] md:h-[200px] lg:h-[250px]">
        <Bar :data="dataSet" :options="optionsSet" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import LoadingCircle from '@/components/LoadingCircle'
const store = useStore()
const timeGroupSelected = ref('daily')
const timeGroupLabels = computed(() => store.getters['fitHours/getTimeGroupLabels'])
const allFitHours = computed(() => store.getters['fitHours/getFitHours'])
const timeGroupOptions = ref([
  { text: '每日', value: 'daily' },
  { text: '每週', value: 'weekly' },
  { text: '每月', value: 'monthly' }
])

watch(timeGroupSelected, (newGroup) => {
  store.dispatch('fitHours/setTimeGroupLabels', newGroup)
})

//chart js
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const dataSet = computed(() => {
  return {
    labels: timeGroupLabels.value,
    datasets: [
      {
        label: '訓練時數',
        backgroundColor: '#fa9561',
        data: allFitHours.value[timeGroupSelected.value]
      }
    ]
  }
})

const optionsSet = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }
})

onMounted(() => {
  //   store.dispatch('fitHours/setFitHours', { daily: [1, 23, 45, 6] })
})
</script>
