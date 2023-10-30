<template>
  <div class="flex items-center gap-[5px]">
    <div>日期</div>
    <datepicker
      v-model="scheduleData.date"
      format="yyyy-MM-dd"
      class=""
      :disabled-dates="disableDates"
      calendar-class="schedule-date__calendar"
      wrapper-class="schedule-date__wrapper"
      iconColor="#fa9561"
    ></datepicker>
  </div>
</template>
<script setup>
import { computed, reactive } from 'vue'
import { useStore } from 'vuex'
import Datepicker from 'vuejs3-datepicker'
const store = useStore()
const scheduleData = computed(() => store.getters['schedule/getScheduleData'])
const disableDates = reactive({
  from: new Date()
})
</script>
<style lang="scss" scoped>
::v-deep .schedule-date__wrapper {
  .vuejs3-datepicker__value {
    padding: 5px 10px;
  }
  .vuejs3-datepicker__icon {
    display: flex;
    align-items: center;
  }
}

::v-deep .schedule-date__calendar {
  > .vuejs3-datepicker__calendar-topbar {
    background-color: #fa9561;
  }
  > .vuejs3-datepicker__calendar-actionarea {
    .cell:not(.blank):not(.disabled).day:hover,
    .cell:not(.blank):not(.disabled).month:hover,
    .cell:not(.blank):not(.disabled).year:hover {
      border: 1px solid #fa9561;
    }
    .selected {
      background-color: #fa9561;
    }
  }
}
</style>
