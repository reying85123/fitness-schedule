const state = {
  line: {
    apiUrl: process.env.VUE_APP_LINE_API,
    channelId: process.env.VUE_APP_CHANNEL_ID,
    channelSecret: process.env.VUE_APP_CHANNEL_SECRET
  },
  fb: {},
  state: ''
}

const getters = {
  getLineData: (state) => state.line,
  getFbData: (state) => state.fb,
  getSocialState: (state) => state.state
}

const actions = {
  setSocialState: ({ commit }) => commit('SET_SOCIAL_STATE'),
  cleanSocialState: ({ commit }) => commit('CLEAN_SOCIAL_STATE')
}

const mutations = {
  SET_SOCIAL_STATE: (state) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters.charAt(randomIndex)
    }
    state.state = result
  },
  CLEAN_SOCIAL_STATE: (state) => (state.state = '')
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
