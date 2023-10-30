<template>
  <div class="flex flex-col gap-[10px] text-slate-600">
    <div class="w-full bg-white rounded p-4 drop-shadow-md">設定</div>
    <div
      class="w-full bg-white rounded p-4 drop-shadow-md overflow-hidden flex flex-col gap-[10px]"
    >
      <div>我的帳戶</div>
      <div class="w-full grid grid-cols-5 md:grid-cols-6 gap-[5px] md:gap-[10px] content-center">
        <div class="col-span-1 flex items-center">E-mail</div>
        <div class="col-span-4 md:col-span-5 flex items-center break-all">
          {{ userProfile.email }}
        </div>
        <div class="col-span-1 flex items-center">密碼</div>
        <div class="col-span-4 md:col-span-5 flex items-center">
          <button
            v-if="!resetPwd"
            class="text-white bg-slate-600 rounded px-1"
            @click="showReset(true)"
          >
            重設密碼
          </button>
        </div>
        <div class="col-span-1">
          <transition name="collapse">
            <div v-if="resetPwd">重設密碼</div>
          </transition>
        </div>
        <div class="col-span-4 md:col-span-5">
          <transition name="collapse">
            <div v-if="resetPwd" class="flex flex-col gap-y-[10px]">
              <div
                class="flex flex-col gap-y-[5px]"
                v-for="(item, itemKey) in passwordViewControl"
                :key="itemKey"
              >
                <label :for="itemKey"
                  >{{ item.text }}
                  <span
                    class="text-red-800 text-[0.875rem] ml-2"
                    v-show="item.remindText.length > 0"
                    >{{ item.remindText }}</span
                  ></label
                >
                <div class="max-w-[300px] border-2 border-slate-600 rounded px-1 flex items-center">
                  <div class="grow">
                    <input
                      :id="itemKey"
                      :type="passwordView[passwordViewControl[itemKey].display].type"
                      class="outline-0 w-full"
                      v-model="item.value"
                      @keyup.enter="resetPwdSubmit"
                    />
                  </div>
                  <button
                    @click="showPassword(itemKey)"
                    type="button"
                    class="w-[25px] h-[25px] px-[2px]"
                  >
                    <img :src="passwordView[passwordViewControl[itemKey].display].img" alt="" />
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-end gap-[5px]">
                <button
                  @click="showReset(false)"
                  class="w-[60px] h-[26px] text-slate-600 border-2 border-slate-600 rounded border-box flex items-center justify-center"
                >
                  取消
                </button>
                <button
                  class="w-[60px] h-[26px] text-white bg-slate-600 rounded flex items-center justify-center"
                  @click="resetPwdSubmit"
                >
                  <template v-if="doingAjax">
                    <LoadingCircle width="0.875rem" height="0.875rem" color="white" />
                  </template>
                  <template v-else> 確定 </template>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="w-full bg-white rounded p-4 drop-shadow-md">
      <div>登入綁定</div>
      <div>
        <SocialBind />
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import SocialBind from '@/components/SocialBind'
import LoadingCircle from '@/components/LoadingCircle'
import axios from 'axios'
import { alertModal } from '@/modules/alertModal'
const store = useStore()
const userProfile = store.getters['user/getUserProfile']
const doingAjax = ref(false)

const resetPwd = ref(false)
const showReset = (display) => {
  resetPwd.value = display
  if (!display) cleanPasswordField()
}

const passwordViewControl = reactive({
  oldPwd: {
    display: 'hide',
    text: '原始密碼',
    value: '',
    remindText: ''
  },
  newPwd: {
    display: 'hide',
    text: '新密碼',
    value: '',
    remindText: ''
  },
  confirmPwd: {
    display: 'hide',
    text: '確認密碼',
    value: '',
    remindText: ''
  }
})

const passwordView = ref({
  show: {
    type: 'text',
    img: require('@/assets/img/icons/eye-solid.svg')
  },
  hide: {
    type: 'password',
    img: require('@/assets/img/icons/eye-slash-solid.svg')
  }
})

const showPassword = (field) => {
  if (passwordViewControl[field].display === 'show') passwordViewControl[field].display = 'hide'
  else passwordViewControl[field].display = 'show'
}

const resetPwdSubmit = async () => {
  if (doingAjax.value) return

  const checkFormatResult = checkFormat()
  if (!checkFormatResult) return

  doingAjax.value = true
  try {
    const resetResult = await axios({
      method: 'PUT',
      url: `${store.getters['api/getApiUrl']}users/change-password`,
      data: {
        oldPassword: passwordViewControl.oldPwd.value,
        newPassword: passwordViewControl.newPwd.value,
        token: store.getters['user/getUserToken']
      }
    })
    if (resetResult) {
      await alertModal('success', '密碼已重設')
      showReset(false)
    }
  } catch (err) {
    let status = ''
    let statusText = ''
    if (typeof err.response !== 'undefined') status = err.response.status
    if (status === 401) {
      statusText = '舊密碼驗證錯誤'
    } else {
      statusText = '重設密碼失敗，請重新設定'
    }
    await alertModal('error', statusText)
  }

  doingAjax.value = false
}

//確認欄位格式
const checkFormat = () => {
  let checkResult = []

  //格式規則
  const rules = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/
  //檢查格式
  if (!rules.test(passwordViewControl.oldPwd.value)) {
    checkResult.push(false)
    passwordViewControl.oldPwd.remindText = '請輸入8~16位英數密碼'
  } else {
    passwordViewControl.oldPwd.remindText = ''
  }
  if (!rules.test(passwordViewControl.newPwd.value)) {
    checkResult.push(false)
    passwordViewControl.newPwd.remindText = '請輸入8~16位英數密碼'
  } else {
    passwordViewControl.newPwd.remindText = ''
  }
  if (checkResult.includes(false)) return false

  //檢查新舊密碼不同
  if (passwordViewControl.oldPwd.value === passwordViewControl.newPwd.value) {
    checkResult.push(false)
    passwordViewControl.newPwd.remindText = '新密碼需不同於舊密碼'
  } else {
    passwordViewControl.newPwd.remindText = ''
  }
  if (checkResult.includes(false)) return false

  //檢查確認密碼相同
  if (passwordViewControl.newPwd.value !== passwordViewControl.confirmPwd.value) {
    checkResult.push(false)
    passwordViewControl.confirmPwd.remindText = '請確認密碼相符'
  } else {
    passwordViewControl.confirmPwd.remindText = ''
  }
  if (checkResult.includes(false)) return false
  return true
}
//清除欄位
const cleanPasswordField = () => {
  for (let passwordField in passwordViewControl) {
    passwordViewControl[passwordField].display = 'hide'
    passwordViewControl[passwordField].value = ''
    passwordViewControl[passwordField].remindText = ''
  }
}
</script>
<style lang="scss" scoped>
.collapse-enter-active {
  animation: collapse reverse 0.5s linear;
}
.collapse-leave-active {
  animation: collapse 0.5s linear;
}
@keyframes collapse {
  from {
    max-height: 200px;
    opacity: 1;
  }
  to {
    max-height: 0px;
    opacity: 0;
  }
}
</style>
