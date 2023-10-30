const state = {
  weight: {
    target: 0,
    current: [],
    unit: 'KG',
    loaded: false
  },
  fat: {
    target: 0,
    current: [],
    unit: '%',
    loaded: false
  }
}

const getters = {
  getTargetWeight: (state) => {
    return state
  },
  getTarget: (state) => (way) => {
    return state[way]
  }
}

const actions = {
  setTarget: ({ commit }, data) => commit('SET_TARGET', data),
  setTargetLoaded: ({ commit }, data) => commit('SET_TARGET_LOADED', data),
  setCurrentWeight: ({ commit }, data) => commit('SET_CURRENT_WEIGHT', data),
  clearTarget: ({ commit }) => commit('CLEAR_TARGET')
}

const mutations = {
  SET_TARGET: (state, data) => {
    const type = data.type
    const target = data.target
    const unit = data.unit
    const loaded = data.loaded

    if (!state[type]) return
    if (!isNaN(target)) state[type].target = target
    if (type === 'weight' && (unit === 'KG' || unit === 'LB')) state[type].unit = unit
    if (typeof loaded !== 'undefined') state[type].loaded = loaded
  },
  SET_TARGET_LOADED: (state, data) => {
    const type = data.type
    const loaded = data.loaded
    if (!state[type]) return
    if (typeof loaded !== 'undefined') state[type].loaded = loaded
  },
  SET_CURRENT_WEIGHT: (state, data) => {
    data.forEach((element) => {
      state.weight.current.push(element.weight)
      state.fat.current.push(element.fat)
    })
  },
  CLEAR_TARGET: (state) => {
    state.weight = {
      target: 0,
      current: [],
      unit: 'KG',
      loaded: false
    }
    state.fat = {
      target: 0,
      current: [],
      unit: '%',
      loaded: false
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
