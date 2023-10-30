import { setTimeGroupLabels } from '@/modules/setTimeGroupLabels'

const state = {
  timeGroup: {
    selected: 'daily'
  },
  timeGroupLabels: setTimeGroupLabels('daily'),
  fitHours: {
    daily: [],
    weekly: [],
    monthly: []
  }
}

const getters = {
  getTimeGroup: (state) => state.timeGroup,
  getTimeGroupLabels: (state) => state.timeGroupLabels,
  getFitHours: (state) => state.fitHours
}

const actions = {
  setTimeGroupLabels: ({ commit }, label) => commit('SET_TIME_GROUP_LABELS', label),
  setFitHours: ({ commit }, data) => commit('SET_FIT_HOURS', data),
  clearFitHours: ({ commit }) => commit('CLEAR_FIT_HOURS')
}

const mutations = {
  SET_TIME_GROUP_LABELS: (state, label) => {
    state.timeGroupLabels = setTimeGroupLabels(label)
  },
  SET_FIT_HOURS: (state, data) => {
    for (let fitGroup in state.fitHours) {
      if (data[fitGroup]) state.fitHours[fitGroup] = data[fitGroup]
    }
  },
  CLEAR_FIT_HOURS: (state) => {
    state.fitHours = {
      daily: [],
      weekly: [],
      monthly: []
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
