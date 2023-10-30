<template>
  <div class="flex flex-col gap-[10px] text-slate-600">
    <div class="bg-white rounded p-4 drop-shadow-md flex items-center justify-between">
      <div>日記</div>
      <div class="flex items-center" v-if="!getDataLoading">
        <button v-if="doingAjax">
          <LoadingCircle width="1rem" height="1rem" color="#475569" />
        </button>
        <button @click="saveBodyDate" v-else-if="editStatus">
          <img :src="checkIcon" alt="" class="w-[1rem] h-[1rem]" />
        </button>
        <button @click="editMode" v-else>
          <img :src="editIcon" alt="" class="w-[1rem] h-[1rem]" />
        </button>
      </div>
    </div>
    <div class="bg-white rounded p-4 drop-shadow-md z-10">
      <template v-if="getDataLoading">
        <div
          class="w-full h-full absolute top-0 left-0 flex items-center justify-center backdrop-blur-[1px] bg-white/30 z-20"
        >
          <LoadingCircle width="3rem" height="3rem" color="#475569" />
        </div>
      </template>
      <ScheduleDate />
    </div>
    <div class="relative bg-white rounded p-4 drop-shadow-md">
      <template v-if="getDataLoading">
        <div
          class="w-full h-full absolute top-0 left-0 flex items-center justify-center backdrop-blur-[1px] bg-white/30 z-20"
        >
          <LoadingCircle width="3rem" height="3rem" color="#475569" />
        </div>
      </template>
      <ScheduleTime :mode="editStatus" />
    </div>
    <div class="">
      <div class="grid grid-cols-1 xs:grid-cols-3 gap-[10px]">
        <div class="relative bg-white rounded p-4 drop-shadow-md">
          <template v-if="getDataLoading">
            <div
              class="w-full h-full absolute top-0 left-0 flex items-center justify-center backdrop-blur-[1px] bg-white/30 z-20"
            >
              <LoadingCircle width="3rem" height="3rem" color="#475569" />
            </div>
          </template>
          <ScheduleWeight :mode="editStatus" />
        </div>
        <div class="bg-white rounded p-4 drop-shadow-md">
          <template v-if="getDataLoading">
            <div
              class="w-full h-full absolute top-0 left-0 flex items-center justify-center backdrop-blur-[1px] bg-white/30 z-20"
            >
              <LoadingCircle width="3rem" height="3rem" color="#475569" />
            </div>
          </template>
          <ScheduleFat :mode="editStatus" />
        </div>
        <div class="bg-white rounded p-4 drop-shadow-md">
          <template v-if="getDataLoading">
            <div
              class="w-full h-full absolute top-0 left-0 flex items-center justify-center backdrop-blur-[1px] bg-white/30 z-20"
            >
              <LoadingCircle width="3rem" height="3rem" color="#475569" />
            </div>
          </template>
          <SchedulePhoto />
        </div>
      </div>
    </div>
    <div class="bg-white rounded p-4 drop-shadow-md">
      <TrainingLog
        title="訓練菜單"
        :scheduleMode="true"
        :mode="editStatus"
        :loaded="getDataLoading"
      />
    </div>
    <div
      class="bg-white rounded p-4 drop-shadow-md text-center"
      v-if="!getDataLoading && editStatus"
    >
      <button class="bg-[#fa9561] text-white py-1 px-4 rounded-full" @click="saveBodyDate">
        儲存日記
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import ScheduleDate from '@/components/ScheduleDate'
import ScheduleTime from '@/components/ScheduleTime'
import ScheduleWeight from '@/components/ScheduleWeight'
import ScheduleFat from '@/components/ScheduleFat'
import SchedulePhoto from '@/components/SchedulePhoto'
import TrainingLog from '@/components/TrainingLog'
import LoadingCircle from '@/components/LoadingCircle'
import { alertModal } from '@/modules/alertModal'
import axios from 'axios'
const editIcon = ref(require('@/assets/img/icons/pen.svg'))
const checkIcon = ref(require('@/assets/img/icons/check.svg'))

const store = useStore()
const scheduleData = computed(() => store.getters['schedule/getScheduleData'])
const scheduleDate = computed(() => scheduleData.value.date)

const editStatus = ref(false)

const editMode = () => {
  editStatus.value = true
}

const doingAjax = ref(false)
//儲存修改日記紀錄
const saveBodyDate = async () => {
  if (doingAjax.value) return
  removeEmptyLog()
  let scheduleDateFormat = dateFormat(scheduleData.value.date)
  let updateLogData = {}
  scheduleData.value.log.forEach((part) => {
    updateLogData[part.name] = part.log
  })
  doingAjax.value = true
  try {
    await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}schedule`,
      data: {
        token: store.getters['user/getUserToken'],
        schedule: {
          date: scheduleDateFormat,
          weight: scheduleData.value.weight,
          fat: scheduleData.value.fat,
          start: scheduleData.value.scheduleTime[0],
          end: scheduleData.value.scheduleTime[1],
          log: updateLogData
        }
      }
    })
  } catch (err) {
    await alertModal('error', '儲存失敗，請重新儲存')
  }
  doingAjax.value = false
  editStatus.value = false
}

//移除沒有輸入名稱的紀錄
const removeEmptyLog = () => {
  scheduleData.value.log.forEach((part, partIndex) => {
    const availableLog = part.log.filter((item) => item.text.length > 0)
    scheduleData.value.log[partIndex].log = availableLog
    if (scheduleData.value.log[partIndex].log.length === 0)
      scheduleData.value.log[partIndex].active = false
  })
}

//日期格式化
const dateFormat = (date) => {
  let dateSet = new Date(date)
  let resDate = `${dateSet.getFullYear()}-${(dateSet.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${dateSet.getDate().toString().padStart(2, '0')}`

  return resDate
}

const getDataLoading = ref(false)
//監看選取日期變化，取得對應日期紀錄
watch(scheduleDate, (newDate, oldDate) => {
  let oldDateFormat = dateFormat(oldDate)
  let newDateFormat = dateFormat(newDate)

  if (oldDateFormat !== newDateFormat) getAllScheduleData(newDateFormat)
})

//載入時取得對應日期資料
onMounted(() => {
  let formatSheduleDate = dateFormat(scheduleDate.value)
  getAllScheduleData(formatSheduleDate)
})

const getAllScheduleData = async (date) => {
  editStatus.value = false
  getDataLoading.value = true
  await getScheduleData(date)
  await getSchedulePhoto(date)
  getDataLoading.value = false
}

//取得對應日期資料
const getScheduleData = async (date) => {
  try {
    const scheduleResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}schedule`,
      params: {
        token: store.getters['user/getUserToken'],
        date: date
      }
    })
    const scheduleResultData = scheduleResult.data.data
    let startTime = getTimeHour(scheduleResultData.start_time),
      endTime = getTimeHour(scheduleResultData.end_time)

    const scheduleDataSet = {
      date: scheduleResultData.date,
      weight: scheduleResultData.weight,
      fat: scheduleResultData.fat,
      startTime: startTime,
      endTime: endTime,
      log: scheduleResultData.log
    }
    store.dispatch('schedule/setScheduleData', scheduleDataSet)
  } catch (err) {
    console.log(err)
    const scheduleDataSet = {
      date: date,
      weight: 0,
      fat: 0,
      startTime: 0,
      endTime: 0,
      log: {}
    }
    store.dispatch('schedule/setScheduleData', scheduleDataSet)
  }
}

//取出回傳資料中start_time,end_time的小時
const getTimeHour = (time) => {
  let returnHour = 0
  if (typeof time === 'string') {
    const timeParts = time.split(':')

    if (timeParts.length === 3) {
      returnHour = parseInt(timeParts[0], 10)
    }
  }
  return returnHour
}

//取得對應日期圖片
const getSchedulePhoto = async (date) => {
  try {
    const schedulePhotoResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}schedule/photo`,
      params: {
        token: store.getters['user/getUserToken'],
        date: date
      }
    })

    let schedulePhoto = schedulePhotoResult.data.data.photo
    store.dispatch('schedule/setSchedulePhoto', schedulePhoto)
  } catch (err) {
    console.log(err)
    store.dispatch('schedule/setSchedulePhoto', '')
  }
}
</script>
