<template>
  <div>
    <template v-for="item in socialLoginSetting" :key="item.name">
      <a :href="item.url">
        <div class="flex items-center px-2 py-1 my-2 bg-white rounded drop-shadow-md h-[30px]">
          <img :src="item.img" alt="" class="w-[20px] h-[20px]" />
          <div class="grow text-[1rem] mx-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ props.action === 'bind' ? '' : '使用' }}
            {{ item.name }}
            {{ props.action === 'login' ? '登入' : props.action === 'signup' ? '註冊' : '綁定' }}
          </div>
        </div>
      </a>
    </template>
  </div>
</template>
<script setup>
import { ref, defineProps, computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
  action: String
})

const baseUrl = window.location.origin
const lineData = store.getters['socialLogin/getLineData']
const fbData = store.getters['socialLogin/getFbData']
const socialState = computed(() => store.getters['socialLogin/getSocialState'])
store.dispatch('socialLogin/setSocialState')

const socialLoginSetting = ref([
  {
    name: 'Facebook',
    img: require('@/assets/img/icons/facebook.svg'),
    url: `https://www.facebook.com/dialog/oauth?client_id=${fbData.channelId}&redirect_uri=${baseUrl}/member/fb-callback?action=${props.action}&state=${socialState.value}&scope=email,public_profile`
  },
  {
    name: 'Line',
    img: require('@/assets/img/icons/line.svg'),
    url: `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineData.channelId}&redirect_uri=${baseUrl}/member/line-callback?action=${props.action}&state=${socialState.value}&scope=openid%20email`
  }
])
</script>
