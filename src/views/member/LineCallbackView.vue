<template>
  <div
    class="w-full h-auto text-slate-600 text-[1rem] font-semibold flex flex-col justify-center items-center"
  >
    <template v-if="authStatus">
      <LoadingCircle width="40px" height="40px" color="#475569" />
      <div class="my-2">登入驗證中</div>
    </template>
    <template v-else>
      <div class="flex-grow flex flex-col justify-center items-center">
        <div>
          <img :src="triangleExclamation" alt="" class="w-[40px] h-[40px] my-2" />
        </div>
        <div v-html="errorStatusText"></div>
      </div>
      <template v-if="action === 'bind'">
        <router-link to="/dashboard/setting" class="mr-auto">
          <div class="flex items-center gap-x-1">
            <img :src="arrowLeft" alt="" class="w-[1rem] h-[1rem]" />
            <div>設定</div>
          </div>
        </router-link>
      </template>
      <template v-else>
        <router-link to="login" class="mr-auto">
          <div class="flex items-center gap-x-1">
            <img :src="arrowLeft" alt="" class="w-[1rem] h-[1rem]" />
            <div>返回登入</div>
          </div>
        </router-link>
      </template>
    </template>
  </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import LoadingCircle from '@/components/LoadingCircle.vue'
import axios from 'axios'

const triangleExclamation = ref(require('@/assets/img/icons/triangle-exclamation.svg'))
const arrowLeft = ref(require('@/assets/img/icons/arrow-left.svg'))
const route = useRoute()
const router = useRouter()
const store = useStore()
const authStatus = ref(true)
const errorStatusText = ref('驗證過期')
const action = computed(() => route.query.action)
const code = computed(() => route.query.code)
const state = computed(() => route.query.state)
const socialState = computed(() => store.getters['socialLogin/getSocialState'])
const baseUrl = window.location.origin
const lineData = store.getters['socialLogin/getLineData']

if (!action.value || !code.value || !state.value) authStatus.value = false
if (state.value !== socialState.value) {
  authStatus.value = false
  store.dispatch('socialLogin/cleanSocialState')
}

//Line API 取得 token
const getLineToken = async () => {
  try {
    const tokenResult = await axios({
      method: 'POST',
      url: 'https://api.line.me/oauth2/v2.1/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        grant_type: 'authorization_code',
        code: code.value,
        redirect_uri: `${baseUrl}/member/line-callback?action=${action.value}`,
        client_id: lineData.channelId,
        client_secret: lineData.channelSecret
      }
    })
    return {
      success: true,
      data: tokenResult.data
    }
  } catch {
    return {
      success: false
    }
  }
}

//Line API 取得使用者公開資料
const getLineProfile = async (id_token) => {
  try {
    const profileResult = await axios({
      method: 'POST',
      url: 'https://api.line.me/oauth2/v2.1/verify',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        id_token: id_token,
        client_id: lineData.channelId
      }
    })

    return {
      success: true,
      data: profileResult.data
    }
  } catch {
    return {
      success: false
    }
  }
}

//使用Line ID, email註冊會員
const signupLine = async (subId, email) => {
  try {
    const profileResult = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/login-social`,
      data: {
        email: email,
        socialId: subId,
        provider: 'Line'
      }
    })

    return {
      success: true,
      data: profileResult.data
    }
  } catch (err) {
    return {
      success: false,
      errorCode: err.response.status
    }
  }
}

//使用Lind綁定會員
const bindLine = async (subId, token) => {
  try {
    const profileResult = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/bind-social`,
      data: {
        token: token,
        socialId: subId,
        provider: 'Line'
      }
    })

    return {
      success: true,
      data: profileResult.data
    }
  } catch (err) {
    return {
      success: false,
      errorCode: err.response.status
    }
  }
}

onMounted(async () => {
  if (!authStatus.value) return
  const tokenResult = await getLineToken()
  if (!tokenResult.success) {
    authStatus.value = false
    store.dispatch('socialLogin/cleanSocialState')
    return
  }
  const profileResult = await getLineProfile(tokenResult.data.id_token)
  if (!profileResult.success) {
    authStatus.value = false
    store.dispatch('socialLogin/cleanSocialState')
    return
  }

  if (action.value === 'bind') {
    //後臺綁定
    const bindLineResult = await bindLine(
      profileResult.data.sub,
      store.getters['user/getUserToken']
    )
    if (bindLineResult.success) {
      router.push('/dashboard/setting')
    } else {
      if (bindLineResult.errorCode === 409)
        errorStatusText.value = '此社群帳號已與另一個帳號綁定，請使用其他社群帳號綁定。'
      authStatus.value = false
      store.dispatch('socialLogin/cleanSocialState')
    }
  } else {
    //登入、註冊
    const signupLineResult = await signupLine(profileResult.data.sub, profileResult.data.email)
    if (signupLineResult.success) {
      store.dispatch('user/setUserToken', signupLineResult.data.token)
      router.push('/dashboard')
    } else {
      if (signupLineResult.errorCode === 409)
        errorStatusText.value =
          '您使用的社交帳號信箱已經在我們的系統中註冊過。<br>為了綁定您的社交帳號，請使用原有的帳號密碼進行登入，然後在帳號設定中找到「社交帳號綁定」。'
      authStatus.value = false
      store.dispatch('socialLogin/cleanSocialState')
    }
  }
})
</script>
