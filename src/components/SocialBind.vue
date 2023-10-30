<template>
  <div class="flex flex-col md:flex-row gap-[10px]">
    <template v-for="item in socialLoginSetting" :key="item.name">
      <div class="w-full md:w-[50%]">
        <div class="flex items-center px-2 py-1 bg-white rounded drop-shadow-md h-[30px]">
          <img :src="item.img" alt="" class="w-[20px] h-[20px]" />
          <div class="grow text-[1rem] mx-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ item.name }}
          </div>
          <div v-if="getBind">
            <a href="javascript:void(0);">
              <div
                class="w-[60px] h-[24px] rounded text-slate-600 border-[2px] border-slate-600 box-border flex justify-center items-center"
              >
                <LoadingCircle width="0.875rem" height="0.875rem" color="#475569" />
              </div>
            </a>
          </div>
          <div v-else>
            <template v-if="socialBind[item.name]">
              <a href="javascript:void(0);" @click="unbindSocial(item.name)">
                <div
                  class="w-[60px] h-[24px] rounded text-slate-600 border-[2px] border-slate-600 box-border flex justify-center items-center"
                >
                  <template v-if="doingAjax">
                    <LoadingCircle width="0.875rem" height="0.875rem" color="#475569" />
                  </template>
                  <template v-else> 解除 </template>
                </div>
              </a>
            </template>
            <template v-else>
              <a :href="item.url" class="">
                <div
                  class="w-[60px] h-[24px] rounded text-white bg-slate-600 border-[2px] border-slate-600 box-border flex justify-center items-center"
                >
                  綁定
                </div>
              </a>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { alertModal } from '@/modules/alertModal'
import LoadingCircle from '@/components/LoadingCircle'
const store = useStore()
const baseUrl = window.location.origin
const lineData = store.getters['socialLogin/getLineData']
const socialState = computed(() => store.getters['socialLogin/getSocialState'])
const socialBind = computed(() => store.getters['user/getUserSocialBind'])
const getBind = ref(true)
const doingAjax = ref(false)
store.dispatch('socialLogin/setSocialState')

const socialLoginSetting = ref([
  {
    name: 'Facebook',
    img: require('@/assets/img/icons/facebook.svg'),
    url: ''
  },
  {
    name: 'Line',
    img: require('@/assets/img/icons/line.svg'),
    url: `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineData.channelId}&redirect_uri=${baseUrl}/member/line-callback?action=bind&state=${socialState.value}&scope=openid%20email`
  }
])

//解除綁定
const unbindSocial = async (provider) => {
  if (doingAjax.value) return
  try {
    const unbindResult = await axios({
      method: 'DELETE',
      url: `${store.getters['api/getApiUrl']}users/bind-social`,
      data: {
        provider: provider,
        token: store.getters['user/getUserToken']
      }
    })
    if (unbindResult) {
      await alertModal('success', '解除綁定成功')
      let currentBind = socialBind.value
      currentBind[provider] = false
      store.dispatch('user/setUserSocialBind', currentBind)
    }
  } catch (err) {
    console.log(err)
    await alertModal('error', '解除綁定異常，請重整頁面後再試')
  }
  doingAjax.value = false
}

//取得綁定狀態
const getBindSocial = async () => {
  try {
    const bindSocialResult = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}users/bind-social`,
      params: {
        token: store.getters['user/getUserToken']
      }
    })

    store.dispatch('user/setUserSocialBind', bindSocialResult.data.bind)
  } catch (err) {
    console.log(err)
  }

  getBind.value = false
}

onMounted(() => {
  getBindSocial()
})
</script>
