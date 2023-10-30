const state = {
  url: process.env.VUE_APP_FS_API
}

const getters = {
  getApiUrl: (state) => {
    return state.url
  }
}

const actions = {}

const mutations = {}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
