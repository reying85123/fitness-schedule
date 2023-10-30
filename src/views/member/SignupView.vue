<template>
  <div class="w-full h-auto text-slate-600 text-[1rem] font-semibold flex flex-col justify-between">
    <div class="text-[1.25rem]">註冊會員</div>
    <div>
      <form>
        <div class="my-2">
          <label for="username">帳號</label>
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
              @keyup.enter="signupSubmit"
            />
          </div>
        </div>
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
          type="button"
          class="w-full h-[30px] drop-shadow-md bg-white rounded px-2 my-2 flex items-center justify-center"
          @click="signupSubmit"
        >
          <LoadingCircle v-if="doingAjax" width="20px" height="20px" color="#475569" />
          <div v-else>註冊</div>
        </button>
      </form>
    </div>
    <div class="bg-slate-600 w-full h-[2px]"></div>
    <div>
      <SocialLogin action="signup" />
    </div>
    <router-link to="login">已經成為會員? <span class="text-sky-600">登入</span></router-link>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { alertModal } from '@/modules/alertModal'
import SocialLogin from '@/components/SocialLogin.vue'
import LoadingCircle from '@/components/LoadingCircle.vue'
import router from '@/router'
const store = useStore()

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

const signupSubmit = async () => {
  if (doingAjax.value) return

  //確認輸入格式
  const formatResult = checkFormat()
  if (!formatResult) return

  //確認密碼相符
  const samePwd = checkSamePwd()
  if (!samePwd) return

  doingAjax.value = true
  try {
    const result = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/signup`,
      data: {
        email: userField.account.value,
        password: userField.password.value,
        social: false
      }
    })
    if (result) {
      await alertModal('success', '建立帳號成功')
      store.dispatch('user/setUserToken', result.data.token)
      router.push('/dashboard')
    }
  } catch (err) {
    let status = ''
    if (typeof err.response !== 'undefined') status = err.response.status
    if (status === 400) {
      await alertModal('error', '請輸入正確帳號密碼')
    } else if (status === 409) {
      await alertModal('error', '信箱已註冊')
    } else {
      await alertModal('error', '註冊失敗，請重新註冊')
    }
  }
  doingAjax.value = false
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

//確認欄位格式
const checkFormat = () => {
  let checkResult = true

  //格式規則
  const rules = {
    account: /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/
  }

  for (let field in userField) {
    if (field === 'confirmPwd') continue
    if (!rules[field].test(userField[field].value)) {
      checkResult = false
      userField[field].remind = true
      userField[field].remindText = userField[field].format
    } else {
      userField[field].remind = false
      userField[field].remindText = ''
    }
  }

  return checkResult
}
</script>
