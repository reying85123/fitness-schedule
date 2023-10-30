import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import api from './modules/api'
import user from './modules/user'
import socialLogin from './modules/socialLogin'
import targetWeight from './modules/targetWeight'
import trainingLog from './modules/trainingLog'
import schedule from './modules/schedule'
import fitHours from './modules/fitHours'

export default createStore({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    api,
    user,
    socialLogin,
    targetWeight,
    trainingLog,
    schedule,
    fitHours
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      paths: ['schedule.scheduleData.date']
    }),
    createPersistedState({
      storage: window.localStorage,
      paths: ['socialLogin.state', 'user.token']
    })
  ]
})
