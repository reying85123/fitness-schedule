<template>
  <div
    class="w-full h-full bg-white py-[5px] drop-shadow-md text-slate-600 rounded md:py-[10%] flex md:flex-col items-center justify-around gap-y-[5px] md:gap-y-[20px] flex-wrap"
  >
    <div class="w-full md:w-[4rem] h-[4rem]">
      <img :src="logoImg" alt="" class="w-full h-full object-contain" />
    </div>
    <template v-for="menuItem in menuItems" :key="menuItem.name">
      <div
        class="md:w-[80%] rounded"
        :class="{
          'md:mt-auto': menuItem.name === 'logout' ? true : false
        }"
        :style="{
          backgroundColor: menuItem.url === path ? '#475569' : '#ffffff',
          color: menuItem.url === path ? '#ffffff' : '#475569'
        }"
      >
        <router-link
          v-if="menuItem.name !== 'logout'"
          :to="menuItem.url"
          class="flex justify-center items-center gap-x-[10px] p-2 colored-svg"
        >
          <div
            :style="{
              backgroundColor: menuItem.url === path ? '#ffffff' : '#475569',
              '-webkit-mask': `url(${menuItem.icon}) no-repeat center`,
              mask: `url(${menuItem.icon}) no-repeat center`
            }"
            class="w-[1.25rem] h-[1.25rem]"
          ></div>
          <span>{{ menuItem.text }}</span>
        </router-link>
        <button
          v-else
          class="w-full flex justify-center items-center gap-x-[10px] p-2 colored-svg"
          @click="logout"
        >
          <div
            :style="{
              backgroundColor: menuItem.active ? '#ffffff' : '#475569',
              '-webkit-mask': `url(${menuItem.icon}) no-repeat center`,
              mask: `url(${menuItem.icon}) no-repeat center`
            }"
            class="w-[1.25rem] h-[1.25rem]"
          ></div>
          <span>{{ menuItem.text }}</span>
        </button>
      </div>
    </template>
  </div>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
const store = useStore()
const router = useRouter()
const route = useRoute()
const logoImg = ref(require('@/assets/img/logo.png'))
const path = computed(() => route.path)

const menuItems = reactive([
  {
    name: 'dashboard',
    text: '總覽',
    url: '/dashboard',
    icon: require('@/assets/img/icons/home.svg'),
    active: true
  },
  {
    name: 'schedule',
    text: '日記',
    url: '/dashboard/schedule',
    icon: require('@/assets/img/icons/calendar.svg'),
    active: false
  },
  {
    name: 'setting',
    text: '設定',
    url: '/dashboard/setting',
    icon: require('@/assets/img/icons/setting.svg'),
    active: false
  },
  {
    name: 'logout',
    text: '登出',
    url: '#',
    icon: require('@/assets/img/icons/logout.svg'),
    active: false
  }
])

const logout = () => {
  store.dispatch('user/setUserLogout')
  store.dispatch('targetWeight/clearTarget')
  store.dispatch('trainingLog/clearTrainingLog')
  store.dispatch('schedule/clearScheduleData')
  store.dispatch('fitHours/clearFitHours')
  router.push('/member/login')
}
</script>
