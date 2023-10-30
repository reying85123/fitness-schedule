<template>
  <div class="grid grid-cols-2 gap-[10px] text-slate-600">
    <div class="col-span-2 bg-white rounded p-4 drop-shadow-md">總覽</div>
    <div class="col-span-2 md:col-span-1 bg-white rounded p-4 drop-shadow-md">
      <TargetWeight type="weight" />
    </div>
    <div class="col-span-2 md:col-span-1 bg-white rounded p-4 drop-shadow-md">
      <TargetWeight type="fat" />
    </div>
    <div class="col-span-2 bg-white rounded p-4 drop-shadow-md">
      <FitHours :loaded="doingAjaxFitHours" />
    </div>
    <div class="col-span-2 bg-white rounded p-4 drop-shadow-md">
      <TrainingLog title="最大訓練量" :loaded="doingAjaxTrainingLog" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import TargetWeight from '@/components/TargetWeight'
import TrainingLog from '@/components/TrainingLog'
import FitHours from '@/components/FitHours'

const store = useStore()

//取得目標體重
const getTargetWeight = async () => {
  try {
    const targetWeightResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}goal`,
      params: {
        token: store.getters['user/getUserToken']
      }
    })
    const targetWeightData = targetWeightResult.data.data
    targetWeightData.forEach((target) => {
      store.dispatch('targetWeight/setTarget', {
        type: target.type,
        unit: target.unit,
        target: target.target
      })
    })
  } catch (err) {
    console.log(err)
  }
}

//取得紀錄體重
const getScheduleWeight = async () => {
  try {
    let currentDate = new Date()
    let queryDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`

    const targetWeightResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}goal/weight-change`,
      params: {
        token: store.getters['user/getUserToken'],
        date: queryDate
      }
    })

    store.dispatch('targetWeight/setCurrentWeight', targetWeightResult.data.data)
  } catch (err) {
    console.log(err)
  }
}

//執行取得目標體重、紀錄體重
const getAllWeight = async () => {
  await getTargetWeight()
  await getScheduleWeight()
  store.dispatch('targetWeight/setTarget', {
    type: 'weight',
    loaded: true
  })
  store.dispatch('targetWeight/setTarget', {
    type: 'fat',
    loaded: true
  })
}

//取得最大訓練量
const doingAjaxTrainingLog = ref(false)
const getMaxTrainingLog = async () => {
  if (doingAjaxTrainingLog.value) return
  try {
    doingAjaxTrainingLog.value = true
    const maxTrainingLogResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}training-log`,
      params: {
        token: store.getters['user/getUserToken']
      }
    })
    const allowLogPart = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'core', 'legs']
    let availableLog = {}
    for (let logKey in maxTrainingLogResult.data.data) {
      if (allowLogPart.includes(logKey)) {
        availableLog[logKey] = maxTrainingLogResult.data.data[logKey]
      }
    }
    store.dispatch('trainingLog/setTrainingLog', availableLog)
  } catch (err) {
    console.log(err)
  }
  doingAjaxTrainingLog.value = false
}

//取得訓練時數
const doingAjaxFitHours = ref(false)
const getFitHours = async () => {
  if (doingAjaxFitHours.value) return
  try {
    doingAjaxFitHours.value = true
    const fitHoursResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}schedule/fit-hours`,
      params: {
        token: store.getters['user/getUserToken'],
        date: dateFormat(new Date())
      }
    })
    const resultData = fitHoursResult.data.data
    const allowGroup = ['daily', 'weekly', 'monthly']
    let availableFitHours = {}
    for (let label of allowGroup) {
      if (resultData[label]) {
        const hoursData = resultData[label].map((item) => item.hours)
        availableFitHours[label] = hoursData
      } else {
        availableFitHours[label] = []
      }
    }
    store.dispatch('fitHours/setFitHours', availableFitHours)
  } catch (err) {
    console.log(err)
  }
  doingAjaxTrainingLog.value = false
}

//日期格式化
const dateFormat = (date) => {
  let dateSet = new Date(date)
  let resDate = `${dateSet.getFullYear()}-${(dateSet.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${dateSet.getDate().toString().padStart(2, '0')}`

  return resDate
}
onMounted(() => {
  getAllWeight()
  getMaxTrainingLog()
  getFitHours()
})
</script>
