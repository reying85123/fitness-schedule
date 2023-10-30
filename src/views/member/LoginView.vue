<template>
  <div class="w-full h-auto text-slate-600 text-[1rem] font-semibold flex flex-col justify-between">
    <div class="text-[1.25rem]">登入會員</div>
    <div>
      <div class="my-2">
        <label for="username">帳號</label>
        <span class="text-red-800 text-[0.875rem] ml-2" v-show="userField.account.remind">{{
          userField.account.remindText
        }}</span>
        <div class="rounded bg-white h-[30px] drop-shadow-md px-2 flex items-center justify-start">
          <input
            id="username"
            type="text"
            class="bg-transparent w-full outline-0"
            v-model="userField.account.value"
            @keyup.enter="loginSubmit"
          />
        </div>
      </div>
      <div class="my-2">
        <label for="pwd">密碼</label>
        <span class="text-red-800 text-[0.875rem] ml-2" v-show="userField.password.remind">{{
          userField.password.remindText
        }}</span>
        <div class="rounded bg-white h-[30px] drop-shadow-md px-2 flex items-center justify-start">
          <input
            id="pwd"
            :type="passwordView[passwordViewControl].type"
            class="bg-transparent w-full outline-0"
            v-model="userField.password.value"
            @keyup.enter="loginSubmit"
          />
          <button @click="showPassword" type="button" class="w-[25px] h-[25px] px-[2px]">
            <img :src="passwordView[passwordViewControl].img" alt="" />
          </button>
        </div>
      </div>
      <button
        class="w-full h-[30px] drop-shadow-md bg-white rounded px-2 my-2 flex items-center justify-center"
        @click="loginSubmit"
      >
        <LoadingCircle v-if="doingAjax" width="20px" height="20px" color="#475569" />
        <div v-else>登入</div>
      </button>
      <div class="my-2 flex items-center justify-end">
        <div class="text-sky-600">
          <router-link to="reset">忘記密碼</router-link>
        </div>
      </div>
    </div>
    <div class="bg-slate-600 w-full h-[2px]"></div>
    <div>
      <SocialLogin action="login" />
    </div>
    <router-link to="signup">尚未成為會員? <span class="text-sky-600">註冊</span></router-link>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { alertModal } from '@/modules/alertModal'
import SocialLogin from '@/components/SocialLogin.vue'
import LoadingCircle from '@/components/LoadingCircle.vue'
import { useRouter } from 'vue-router'
const store = useStore()
const router = useRouter()

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

const passwordViewControl = ref('hide')
const showPassword = () => {
  if (passwordViewControl.value === 'show') passwordViewControl.value = 'hide'
  else passwordViewControl.value = 'show'
}

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
  }
})

const doingAjax = ref(false)

const loginSubmit = async () => {
  if (doingAjax.value) return
  //確認輸入格式
  const formatResult = checkFormat()
  if (!formatResult) return

  doingAjax.value = true
  let userToken = ''
  try {
    const result = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/login`,
      data: {
        email: userField.account.value,
        password: userField.password.value
      }
    })
    if (result) {
      userToken = result.data.token
    }
  } catch (err) {
    await alertModal('error', '帳號或密碼錯誤')
    doingAjax.value = false
    return
  }

  try {
    const profile = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}users/profile`,
      params: {
        token: userToken
      }
    })

    if (profile) {
      store.dispatch('user/setUserToken', userToken)
      store.dispatch('user/setUserProfile', profile.data.data)
      store.dispatch('user/setUserLogin')
      router.push('/dashboard')
    }
  } catch {
    await alertModal('error', '帳號或密碼驗證失敗')
  }
  doingAjax.value = false
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
