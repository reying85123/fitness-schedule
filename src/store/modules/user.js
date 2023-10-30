const state = {
  token: '',
  isLogin: false,
  userProfile: {
    uid: '',
    email: ''
  },
  socialBind: {
    Line: false,
    Facebook: false
  }
}

const getters = {
  getUserToken: (state) => state.token,
  getUserLogin: (state) => state.isLogin,
  getUserProfile: (state) => state.userProfile,
  getUserSocialBind: (state) => state.socialBind
}

const actions = {
  setUserToken: ({ commit }, newToken) => commit('SET_USER_TOKEN', newToken),
  setUserLogin: ({ commit }) => commit('SET_USER_LOGIN', true),
  setUserLogout: ({ commit }) => commit('SET_USER_LOGOUT'),
  setUserProfile: ({ commit }, data) => commit('SET_USER_PROFILE', data),
  setUserSocialBind: ({ commit }, data) => commit('SET_USER_SOCIAL_BIND', data)
}

const mutations = {
  SET_USER_TOKEN: (state, newToken) => (state.token = newToken),
  SET_USER_LOGIN: (state, status) => (state.isLogin = status),
  SET_USER_LOGOUT: (state) => {
    state.token = ''
    state.isLogin = false
    for (let profileKey in state.userProfile) {
      state.userProfile[profileKey] = ''
    }
  },
  SET_USER_PROFILE: (state, data) => {
    for (let profileKey in data) {
      if (typeof state.userProfile[profileKey] !== 'undefined') {
        state.userProfile[profileKey] = data[profileKey]
      }
    }
  },
  SET_USER_SOCIAL_BIND: (state, data) => {
    for (let socialKey in data) {
      if (typeof state.socialBind[socialKey] !== 'undefined') {
        state.socialBind[socialKey] = data[socialKey]
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
