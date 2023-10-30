<template>
  <div class="relative w-full h-full min-h-screen bg-slate-300 flex flex-col">
    <template v-if="userToken && userLogin">
      <div class="flex-1 p-[2%] md:p-10 flex flex-col md:flex-row gap-[10px]">
        <div class="md:max-h-[1200px] md:min-h-[400px] md:w-[15%]">
          <DashboardMenu />
        </div>
        <div class="w-[100%] md:w-[85%]">
          <div>
            <router-view></router-view>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="w-screen h-screen bg-slate-300 z-20 fixed flex items-center justify-center">
        <LoadingCircle width="2rem" height="2rem" color="#475569" />
      </div>
    </template>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import DashboardMenu from '@/components/DashboardMenu'
import LoadingCircle from '@/components/LoadingCircle'
import axios from 'axios'
const store = useStore()
const router = useRouter()
const userToken = computed(() => store.getters['user/getUserToken'])
const userLogin = computed(() => store.getters['user/getUserLogin'])
// const userProfile = computed(() => store.getters['user/getUserProfile'])

const getUserProfile = async () => {
  try {
    const profile = await axios({
      method: 'GET',
      url: `${store.getters['api/getApiUrl']}users/profile`,
      params: {
        token: userToken.value
      }
    })
    if (profile) {
      store.dispatch('user/setUserProfile', profile.data.data)
      store.dispatch('user/setUserLogin')
    }
  } catch {
    logout()
  }
}

const logout = () => {
  store.dispatch('user/setUserLogout')
  store.dispatch('targetWeight/clearTarget')
  store.dispatch('trainingLog/clearTrainingLog')
  store.dispatch('schedule/clearScheduleData')
  store.dispatch('fitHours/clearFitHours')
  router.push('/member/login')
}

onMounted(async () => {
  if (!userLogin.value) await getUserProfile()
})
</script>
