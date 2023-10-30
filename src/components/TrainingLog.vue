<template>
  <div class="relative">
    <template v-if="loaded">
      <div
        class="w-full h-full absolute flex items-center justify-center backdrop-blur-[1px] bg-white/30"
      >
        <LoadingCircle width="3rem" height="3rem" color="#475569" />
      </div>
    </template>
    <div class="flex items-center justify-between">
      <div>{{ props.title }}</div>
      <div v-if="!scheduleMode">
        <template v-if="doingAjax">
          <button>
            <LoadingCircle width="1rem" height="1rem" color="#475569" />
          </button>
        </template>
        <template v-else-if="!trainingLogEditing">
          <button @click="trainLogEdit">
            <img :src="editImg" alt="" class="w-[1rem] h-[1rem]" />
          </button>
        </template>
        <template v-else>
          <button @click="trainLogSave">
            <img :src="checkImg" alt="" class="w-[1rem] h-[1rem]" />
          </button>
        </template>
      </div>
    </div>
    <div class="flex items-center gap-[5px] flex-wrap my-2">
      <template v-for="(part, partIndex) in trainingPart" :key="part.name">
        <button
          class="w-[70px] rounded-full"
          :class="{
            'text-gray-400': !part.active,
            'bg-slate-300': !part.active,
            'text-white': part.active,
            'bg-[#fa9561]': part.active
          }"
          @click="togglePart(partIndex)"
        >
          {{ part.text }}
        </button>
      </template>
    </div>
    <div>
      <template v-for="(part, partIndex) in trainingPart" :key="part.name">
        <div v-if="part.active" class="my-2">
          <div class="flex items-center gap-[5px]">
            <div class="w-[50px] h-[50px] rounded-full overflow-hidden border-2">
              <img :src="trainingPartImg[part.name]" alt="" />
            </div>
            <div>{{ part.text }}</div>
          </div>
          <div
            class="my-1 p-1 hidden md:grid grid-cols-[8%_28%_28%_28%_8%] md:grid-cols-[5%_30%_30%_30%_5%]"
          >
            <div></div>
            <div class="px-[2px]">名稱</div>
            <div class="px-[2px]">重量</div>
            <div class="px-[2px]">組數</div>
            <div></div>
          </div>
          <div>
            <draggable
              tag="ul"
              :list="part.log"
              class=""
              handle=".handle"
              item-key="name"
              :group="part.name"
              v-bind="dragOptions"
            >
              <template #item="{ element, index }">
                <li class="my-1 p-1 grid grid-cols-1 gap-y-[5px] md:grid-cols-[5%_30%_30%_30%_5%]">
                  <div
                    class="cursor-move flex justify-between md:justify-center items-center"
                    :class="{ handle: trainingLogEditing }"
                  >
                    <img :src="moveImg" alt="" class="w-[1rem] h-[1rem]" />
                    <div
                      :class="{
                        invisible: !trainingLogEditing
                      }"
                      class="cursor-pointer block md:hidden"
                      @click="removeLog(partIndex, index)"
                    >
                      <img :src="crossImg" alt="" class="w-[1.25rem] h-[1.25rem]" />
                    </div>
                  </div>
                  <div class="px-[2px] flex items-center">
                    <template v-if="trainingLogEditing">
                      <label
                        :for="`text-${part.name}-${index}`"
                        class="mr-[5px] whitespace-nowrap md:hidden"
                        >名稱</label
                      >
                    </template>
                    <template v-else>
                      <div class="mr-[5px] whitespace-nowrap md:hidden">名稱</div>
                    </template>
                    <div class="flex-1 border-2 rounded">
                      <template v-if="trainingLogEditing">
                        <input
                          type="text"
                          class="w-full border-0"
                          v-model="element.text"
                          maxlength="100"
                          :id="`text-${part.name}-${index}`"
                          :name="`text-${part.name}-${index}`"
                        />
                      </template>
                      <template v-else>
                        <div>{{ element.text }}</div>
                      </template>
                    </div>
                  </div>
                  <div class="px-[2px] flex items-center">
                    <template v-if="trainingLogEditing">
                      <label
                        :for="`volume-${part.name}-${index}`"
                        class="mr-[5px] whitespace-nowrap md:hidden"
                        >重量</label
                      >
                    </template>
                    <template v-else>
                      <div class="mr-[5px] whitespace-nowrap md:hidden">重量</div>
                    </template>
                    <div class="flex-1 border-2 rounded flex items-center">
                      <div class="flex-1 border-r-2">
                        <template v-if="trainingLogEditing">
                          <input
                            :id="`volume-${part.name}-${index}`"
                            :name="`volume-${part.name}-${index}`"
                            type="number"
                            class="w-full border-0"
                            v-model="element.volume"
                            min="0"
                            max="999"
                            @input="limitRange(partIndex, index, 'volume')"
                          />
                        </template>
                        <template v-else>
                          <div>{{ element.volume }}</div>
                        </template>
                      </div>
                      <template v-if="trainingLogEditing">
                        <select
                          v-model="element.unit"
                          :id="`unit-${part.name}-${index}`"
                          :name="`unit-${part.name}-${index}`"
                        >
                          <template v-for="unitItem in trainingPartUnit" :key="unitItem.value">
                            <option :value="unitItem.value">{{ unitItem.text }}</option>
                          </template>
                        </select>
                      </template>
                      <template v-else>
                        <div>{{ trainingPartUnitDisplay[element.unit] }}</div>
                      </template>
                    </div>
                  </div>
                  <div class="px-[2px] flex items-center">
                    <template v-if="trainingLogEditing">
                      <label
                        :for="`set-${part.name}-${index}`"
                        class="mr-[5px] whitespace-nowrap md:hidden"
                        >組數</label
                      >
                    </template>
                    <template v-else>
                      <div class="mr-[5px] whitespace-nowrap md:hidden">組數</div>
                    </template>
                    <div class="flex-1 border-2 rounded">
                      <template v-if="trainingLogEditing">
                        <input
                          :id="`set-${part.name}-${index}`"
                          :name="`set-${part.name}-${index}`"
                          type="number"
                          class="w-full border-0"
                          v-model="element.set"
                          min="0"
                          max="999"
                          @input="limitRange(partIndex, index, 'set')"
                        />
                      </template>
                      <template v-else>
                        <div>{{ element.set }}</div>
                      </template>
                    </div>
                  </div>
                  <div
                    :class="{
                      invisible: !trainingLogEditing
                    }"
                    class="cursor-pointer hidden md:flex justify-center items-center"
                    @click="removeLog(partIndex, index)"
                  >
                    <img :src="crossImg" alt="" class="w-[1.25rem] h-[1.25rem]" />
                  </div>
                </li>
              </template>
              <template #footer v-if="trainingLogEditing && part.log.length < 20">
                <div class="my-2" role="" key="footer">
                  <button class="w-full h-full flex justify-center" @click="addLog(partIndex)">
                    <img :src="circlePlus" alt="" class="w-[1.5rem] h-[1.5rem]" />
                  </button>
                </div>
              </template>
            </draggable>
          </div>
          <hr />
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'
import LoadingCircle from '@/components/LoadingCircle'
import axios from 'axios'
import { alertModal } from '@/modules/alertModal'
const editImg = ref(require('@/assets/img/icons/pen.svg'))
const checkImg = ref(require('@/assets/img/icons/check.svg'))
const moveImg = ref(require('@/assets/img/icons/move.svg'))
const crossImg = ref(require('@/assets/img/icons/cross.svg'))
const circlePlus = ref(require('@/assets/img/icons/circle-plus.svg'))
const store = useStore()
const props = defineProps({
  title: {
    type: String
  },
  loaded: {
    type: Boolean
  },
  scheduleMode: {
    type: Boolean
  },
  mode: {
    typeof: Boolean
  }
})
const loaded = computed(() => props.loaded)
const trainingPart = props.scheduleMode
  ? computed(() => store.getters['schedule/getScheduleData'].log)
  : computed(() => store.getters['trainingLog/getTrainingLog'])

const trainingPartImg = ref({
  chest: ref(require('@/assets/img/muscle/chest.png')),
  back: ref(require('@/assets/img/muscle/back.png')),
  shoulders: ref(require('@/assets/img/muscle/shoulders.png')),
  biceps: ref(require('@/assets/img/muscle/biceps.png')),
  triceps: ref(require('@/assets/img/muscle/triceps.png')),
  core: ref(require('@/assets/img/muscle/core.png')),
  legs: ref(require('@/assets/img/muscle/legs.png'))
})

const trainingPartUnit = ref([
  {
    text: '公斤(KG)',
    value: 'KG'
  },
  {
    text: '磅(LB)',
    value: 'LB'
  }
])

const trainingPartUnitDisplay = ref({
  KG: '公斤(KG)',
  LB: '磅(LB)'
})

const togglePart = (index) => {
  if (!trainingLogEditing.value) return
  trainingPart.value[index].active = !trainingPart.value[index].active
  if (trainingPart.value[index].log.length === 0) {
    trainingPart.value[index].log.push({
      text: '',
      volume: 0,
      set: 0,
      unit: 'KG'
    })
  }
}

const dragOptions = reactive({
  animation: 200,
  disabled: false,
  ghostClass: 'ghost'
})

const removeLog = (partIndex, idx) => {
  if (!trainingLogEditing.value) return
  trainingPart.value[partIndex].log.splice(idx, 1)
}

//開啟修改
const trainingLogEditing = props.scheduleMode ? computed(() => props.mode) : ref(false)
const trainLogEdit = () => {
  if (props.scheduleMode) return
  trainingLogEditing.value = true
}
const addLog = (partIndex) => {
  if (trainingPart.value[partIndex].log.length > 20) return
  let newUnit = 'KG'
  let lastAction = trainingPart.value[partIndex].log.findLast((log) => log)
  if (lastAction && lastAction.unit) newUnit = lastAction.unit
  trainingPart.value[partIndex].log.push({
    text: '',
    volume: 0,
    set: 0,
    unit: newUnit
  })
}

// 限制輸入數值0~999
const limitRange = (partIndex, logIndex, type) => {
  // const regex = /^\d{1,3}$/
  const value = trainingPart.value[partIndex].log[logIndex][type]
  if (value.length === 0) return
  if (isNaN(value)) {
    trainingPart.value[partIndex].log[logIndex][type] = 0
  } else if (value <= 0) {
    trainingPart.value[partIndex].log[logIndex][type] = 0
  } else if (value > 999) {
    trainingPart.value[partIndex].log[logIndex][type] = 999
  } else {
    trainingPart.value[partIndex].log[logIndex][type] = parseInt(value, 10)
  }
}

//修改完資料後儲存進資料庫
const doingAjax = ref(false)
const trainLogSave = async () => {
  if (props.scheduleMode) return
  if (doingAjax.value) return
  removeEmptyLog()

  doingAjax.value = true
  try {
    const updateLogData = {}
    trainingPart.value.forEach((part) => {
      updateLogData[part.name] = part.log
    })
    await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}training-log`,
      data: {
        token: store.getters['user/getUserToken'],
        log: updateLogData
      }
    })
    trainingLogEditing.value = false
  } catch (err) {
    console.log(err)
    await alertModal('error', '儲存失敗，請重新儲存')
  }
  doingAjax.value = false
}
//移除沒有輸入名稱的紀錄
const removeEmptyLog = () => {
  trainingPart.value.forEach((part, partIndex) => {
    const availableLog = part.log.filter((item) => item.text.length > 0)
    trainingPart.value[partIndex].log = availableLog
    if (trainingPart.value[partIndex].log.length === 0) trainingPart.value[partIndex].active = false
  })
}
</script>
<style lang="scss" scoped>
.button {
  margin-top: 35px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

// .list-group {
//   min-height: 20px;
// }

// .list-group-item {
//   cursor: move;
// }

// .list-group-item i {
//   cursor: pointer;
// }
</style>
