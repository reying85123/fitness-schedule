<template>
  <teleport to="body">
    <div class="modal" v-if="props.show" @click="emitCloseModal()">
      <div class="modal-content flex flex-col" @click.stop>
        <div class="flex justify-end">
          <button class="font-[2rem]" @click="emitCloseModal()">
            <img :src="crossImg" alt="" class="w-[1rem] h-[1rem]" />
          </button>
        </div>
        <template v-if="imagePreview">
          <div class="flex-1 overflow-hidden">
            <div class="test w-full h-full">
              <img :src="imagePreview" alt="Preview" class="w-full h-full object-contain" />
            </div>
          </div>
        </template>
        <template v-else-if="schedulePhoto">
          <div class="flex-1 overflow-hidden">
            <div class="test w-full h-full">
              <img
                :src="`data:image/jpg;base64,${schedulePhoto}`"
                alt="Preview"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex-1" @drop="onDragDrop" @dragover="onDragOver">
            <label for="upload-img" class="">
              <div class="w-full h-[90%] flex justify-center">
                <img :src="uploadImg" alt="" class="w-[50%] h-[100%] object-contain" />
              </div>
              <div class="w-full h-[10%] flex justify-center items-center">點擊或拖曳上傳</div>
            </label>
          </div>
        </template>
        <div
          class="text-center text-red-800"
          :class="{
            invisible: !errorMessage.show
          }"
        >
          {{ errorMessage.text }}
        </div>
        <div>
          <input
            id="upload-img"
            type="file"
            name=""
            accept="image/gif, image/jpeg, image/png"
            @change="changeFiles"
            hidden
            ref="uploadImgInput"
          />
        </div>
        <template v-if="doingAjax">
          <div class="py-[5px] flex justify-center gap-[10px]">
            <LoadingCircle width="1rem" height="1rem" color="#475569" />
          </div>
        </template>
        <template v-else-if="imagePreview || schedulePhoto">
          <div class="py-[5px] flex justify-center gap-[10px]">
            <button
              class="bg-[#fa9561] text-white py-1 px-4 rounded-full"
              @click="inputFileTrigger"
            >
              更換圖片
            </button>
            <button class="bg-slate-300 text-black py-1 px-4 rounded-full" @click="removeImage">
              移除圖片
            </button>
          </div>
        </template>
      </div>
    </div>
  </teleport>
</template>
<script setup>
import { ref, defineProps, defineEmits, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import LoadingCircle from '@/components/LoadingCircle'
const uploadImg = ref(require('@/assets/img/icons/upload.svg'))
const crossImg = ref(require('@/assets/img/icons/cross.svg'))
const props = defineProps({
  show: {
    type: Boolean
  }
})
const emit = defineEmits(['close-modal'])
const emitCloseModal = () => {
  emit('close-modal', true)
}
const store = useStore()
const uploadImgInput = ref(null)
const imagePreview = ref('')
const schedulePhoto = computed(() => store.getters['schedule/getSchedulePhoto'])
const doingAjax = ref(false)
const errorMessage = reactive({
  text: '檔案限制大小:5MB',
  show: false
})

//打開input file
const inputFileTrigger = () => {
  if (doingAjax.value) return
  uploadImgInput.value.click()
}

//Drag File upload
const onDragOver = (e) => {
  //阻擋瀏覽器drag預設行為
  e.preventDefault()
}

const onDragDrop = (e) => {
  e.preventDefault()
  const file = e.dataTransfer.files || e.target.files
  //限制上傳一張
  if (!file[0]) return
  previewImage(file[0])
}

const changeFiles = (event) => {
  const file = event.target.files[0]
  if (!file) return
  previewImage(file)
}

const previewImage = (file) => {
  if (!file) {
    imagePreview.value = ''
    return
  }

  const sizeLimit = 1024 * 1024 * 5 //5 MB
  if (file.size > sizeLimit) {
    errorMessage.text = '檔案限制大小:5MB'
    errorMessage.show = true
    return
  }

  const allowType = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowType.includes(file.type)) {
    errorMessage.text = '限制上傳JPG,PNG,GIF檔案'
    errorMessage.show = true
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result
  }
  reader.readAsDataURL(file)
  uploadImage(file)
}

const uploadImage = async (file) => {
  if (doingAjax.value) return
  const sizeLimit = 1024 * 1024 * 5 //5 MB
  if (file.size > sizeLimit) {
    errorMessage.text = '檔案限制大小:5MB'
    errorMessage.show = true
    return
  }

  doingAjax.value = true
  try {
    const scheduleDate = store.getters['schedule/getScheduleData'].date
    const uploadDate = dateFormat(scheduleDate)

    const formData = new FormData()
    formData.append('token', store.getters['user/getUserToken'])
    formData.append('date', uploadDate)
    formData.append('photo', file)

    await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}schedule/photo`,
      data: formData
    })

    const reader = new FileReader()
    reader.onload = () => {
      // 將圖片文件轉換為 base64 字符串
      store.dispatch('schedule/setSchedulePhoto', reader.result.split(',')[1])
    }

    // 讀取文件，並將其轉換為 base64 字符串
    reader.readAsDataURL(file)

    errorMessage.show = false
  } catch (err) {
    console.log(err)
    errorMessage.text = '檔案上傳失敗'
    errorMessage.show = true
  }
  doingAjax.value = false
}

const removeImage = async () => {
  if (doingAjax.value) return
  try {
    const scheduleDate = store.getters['schedule/getScheduleData'].date
    const uploadDate = dateFormat(scheduleDate)

    await axios({
      method: 'DELETE',
      url: `${store.getters['api/getApiUrl']}schedule/photo`,
      data: {
        token: store.getters['user/getUserToken'],
        date: uploadDate
      }
    })
    errorMessage.show = false
    store.dispatch('schedule/setSchedulePhoto', '')
  } catch (err) {
    console.log(err)
    errorMessage.show = true
  }
  doingAjax.value = false
}

//日期格式化
const dateFormat = (date) => {
  let dateSet = new Date(date)
  let resDate = `${dateSet.getFullYear()}-${(dateSet.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${dateSet.getDate().toString().padStart(2, '0')}`

  return resDate
}
</script>
<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .modal-content {
    background-color: #fff;
    width: 60%;
    height: 80%;
    min-height: 500px;
    padding: 20px;
    border-radius: 4px;
    position: relative;

    @media (max-width: 768px) {
      width: 90%;
      height: 70%;
    }
  }
}
</style>
