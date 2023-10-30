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
const fbData = store.getters['socialLogin/getFbData']

if (!action.value || !code.value || !state.value) authStatus.value = false
if (state.value !== socialState.value) {
  authStatus.value = false
  store.dispatch('socialLogin/cleanSocialState')
}

//取得FbToken
const getFbToken = async () => {
  try {
    const tokenResult = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/oauth/access_token?client_id=${fbData.channelId}&redirect_uri=${baseUrl}/member/fb-callback?action=${action.value}&client_secret=${fbData.channelSecret}&code=${code.value}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
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

//取得Fb公開資料
const getFbProfile = async (access_token) => {
  try {
    const profileResult = await axios({
      method: 'GET',
      url: `https://graph.facebook.com/me?fields=email,name,id&access_token=${access_token}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
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

//使用Fb ID, email註冊會員
const signupFb = async (id, email) => {
  try {
    const profileResult = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/login-social`,
      data: {
        email: email,
        socialId: id,
        provider: 'Facebook'
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

//使用Fb綁定會員
const bindFb = async (id, token) => {
  try {
    const profileResult = await axios({
      method: 'POST',
      url: `${store.getters['api/getApiUrl']}users/bind-social`,
      data: {
        token: token,
        socialId: id,
        provider: 'Facebook'
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
  const tokenResult = await getFbToken()
  if (!tokenResult.success) {
    authStatus.value = false
    store.dispatch('socialLogin/cleanSocialState')
    return
  }

  const fbProfile = await getFbProfile(tokenResult.data.access_token)
  if (!fbProfile.success) {
    authStatus.value = false
    store.dispatch('socialLogin/cleanSocialState')
    return
  }

  if (action.value === 'bind') {
    //後臺綁定
    const bindFbResult = await bindFb(fbProfile.data.id, store.getters['user/getUserToken'])
    if (bindFbResult.success) {
      router.push('/dashboard/setting')
    } else {
      if (bindFbResult.errorCode === 409)
        errorStatusText.value = '此社群帳號已與另一個帳號綁定，請使用其他社群帳號綁定。'
      authStatus.value = false
      store.dispatch('socialLogin/cleanSocialState')
    }
  } else {
    //登入、註冊
    const signupFbResult = await signupFb(fbProfile.data.id, fbProfile.data.email)
    if (signupFbResult.success) {
      store.dispatch('user/setUserToken', signupFbResult.data.token)
      router.push('/dashboard')
    } else {
      if (signupFbResult.errorCode === 409)
        errorStatusText.value =
          '您使用的社交帳號信箱已經在我們的系統中註冊過。<br>為了綁定您的社交帳號，請使用原有的帳號密碼進行登入，然後在帳號設定中找到「社交帳號綁定」。'
      authStatus.value = false
      store.dispatch('socialLogin/cleanSocialState')
    }
  }
})
</script>
