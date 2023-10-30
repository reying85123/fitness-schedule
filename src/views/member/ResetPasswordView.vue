<template>
  <div class="w-full h-auto text-slate-600 text-[1rem] font-semibold flex flex-col justify-between">
    <div class="text-[1.25rem]">重設密碼</div>
    <template v-if="token">
      <div>
        <div class="my-2">
          <label for="pwd">密碼</label>
          <span class="text-red-800 text-[0.875rem] ml-2" v-show="userField.password.remind">{{
            userField.password.remindText
          }}</span>
          <div
            class="rounded bg-white h-[30px] drop-shadow-md px-2 flex items-center justify-start"
          >
            <input
              id="pwd"
              :type="passwordView[passwordViewControl.pwd].type"
              class="bg-transparent w-full outline-0"
              v-model="userField.password.value"
              @keyup.enter="signupSubmit"
            />
            <button @click="showPassword('pwd')" type="button" class="w-[25px] h-[25px] px-[2px]">
              <img :src="passwordView[passwordViewControl.pwd].img" alt="" />
            </button>
          </div>
        </div>
        <div class="my-2">
          <label for="confirmPwd">確認密碼</label>
          <span class="text-red-800 text-[0.875rem] ml-2" v-show="userField.confirmPwd.remind">{{
            userField.confirmPwd.remindText
          }}</span>
          <div
            class="rounded bg-white h-[30px] drop-shadow-md px-2 flex items-center justify-start"
          >
            <input
              id="confirmPwd"
              :type="passwordView[passwordViewControl.confirmPwd].type"
              class="bg-transparent w-full outline-0"
              v-model="userField.confirmPwd.value"
              @keyup.enter="signupSubmit"
            />
            <button
              @click="showPassword('confirmPwd')"
              type="button"
              class="w-[25px] h-[25px] px-[2px]"
            >
              <img :src="passwordView[passwordViewControl.confirmPwd].img" alt="" />
            </button>
          </div>
        </div>
        <button
          class="w-full h-[30px] drop-shadow-md bg-white rounded px-2 my-2 flex items-center justify-center"
          @click="resetPassword"
        >
          <LoadingCircle v-if="doingAjax" width="20px" height="20px" color="#475569" />
          <div v-else>重置密碼</div>
        </button>
      </div>
    </template>
    <template v-else>
      <div>
        <div class="my-2">
          <label for="username">輸入信箱</label>
          <span class="text-red-800 text-[0.875rem] ml-2" v-show="userField.account.remind">{{
            userField.account.remindText
          }}</span>
          <div
            class="rounded bg-white h-[30px] drop-shadow-md px-2 flex items-center justify-start"
          >
            <input
              id="username"
              type="text"
              class="bg-transparent w-full outline-0"
              v-model="userField.account.value"
              @keyup.enter="sendResetEmail"
            />
          </div>
        </div>
        <button
          class="w-full h-[30px] drop-shadow-md bg-white rounded px-2 my-2 flex items-center justify-center"
          @click="sendResetEmail"
        >
          <LoadingCircle v-if="doingAjax" width="20px" height="20px" color="#475569" />
          <div v-else>傳送郵件</div>
        </button>
      </div>
    </template>

    <router-link to="login">
      <div class="flex items-center gap-x-1">
        <img :src="arrowLeft" alt="" class="w-[1rem] h-[1rem]" />
        <div>返回登入</div>
      </div>
    </router-link>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { alertModal } from '@/modules/alertModal'
import LoadingCircle from '@/components/LoadingCircle.vue'
const store = useStore()
const route = useRoute()
const router = useRouter()
const arrowLeft = ref(require('@/assets/img/icons/arrow-left.svg'))

const token = computed(() => route.query.token)

const userField = reactive({
  account: {
    value: '',
    remind: false,
    format: '請輸入正確E-mail',
    remindText: ''
  },
  password: {
    value: '',
    remind: false,
    format: '請輸入8~16位英數密碼',
    remindText: ''
  },
  confirmPwd: {
    value: '',
    remind: false,
    format: '請確認密碼相符',
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

const passwordViewControl = reactive({
  pwd: 'hide',
  confirmPwd: 'hide'
})

const showPassword = (field) => {
  if (passwordViewControl[field] === 'show') passwordViewControl[field] = 'hide'
  else passwordViewControl[field] = 'show'
}

const doingAjax = ref(false)

const sendResetEmail = async () => {
  if (doingAjax.value) return

  //確認輸入格式
  const formatResult = checkFormat('account')
  if (!formatResult) return

  doingAjax.value = true
  try {
    const resetResult = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/reset-password-mail`,
      data: {
        email: userField.account.value
      }
    })
    if (resetResult) {
      await alertModal(
        'success',
        '系統已傳送重設密碼的連結至您所輸入的電子郵件帳號，該連結1日內有效。'
      )
    }
  } catch (err) {
    let status = ''
    if (typeof err.response !== 'undefined') status = err.response.status
    if (status === 404) {
      await alertModal('error', '信箱尚未註冊')
    } else {
      await alertModal('error', '系統重新設置密碼失敗，請稍候再申請')
    }
  }
  doingAjax.value = false
}

const resetPassword = async () => {
  if (doingAjax.value) return

  //確認輸入格式
  const formatResult = checkFormat('password')
  if (!formatResult) return

  //確認密碼相符
  const samePwd = checkSamePwd()
  if (!samePwd) return

  doingAjax.value = true
  try {
    const resetPwdResult = await axios({
      method: 'PUT',
      url: `${store.getters['api/getApiUrl']}users/reset-password`,
      data: {
        password: userField.password.value,
        token: token.value
      }
    })
    if (resetPwdResult) {
      await alertModal('success', '密碼已重設，請重新登入')
      router.push('/member/login')
    }
  } catch (err) {
    await alertModal('error', '連結已過期，請重新申請重置密碼')
    router.push('/member/reset')
  }

  doingAjax.value = false
}

//確認欄位格式
const checkFormat = (field) => {
  let checkResult = true

  //格式規則
  const rules = {
    account: /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/
  }

  if (!rules[field].test(userField[field].value)) {
    checkResult = false
    userField[field].remind = true
    userField[field].remindText = userField[field].format
  } else {
    userField[field].remind = false
    userField[field].remindText = ''
  }

  return checkResult
}

//確認密碼相符
const checkSamePwd = () => {
  let checkResult = true
  if (userField.password.value !== userField.confirmPwd.value) {
    checkResult = false
    userField.confirmPwd.remind = true
    userField.confirmPwd.remindText = userField.confirmPwd.format
  } else {
    userField.confirmPwd.remind = false
    userField.confirmPwd.remindText = ''
  }
  return checkResult
}
</script>
