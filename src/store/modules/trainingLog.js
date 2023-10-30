const state = {
  log: [
    {
      name: 'chest',
      text: '胸',
      active: false,
      log: []
    },
    {
      name: 'back',
      text: '背',
      active: false,
      log: []
    },
    {
      name: 'shoulders',
      text: '肩',
      active: false,
      log: []
    },
    {
      name: 'biceps',
      text: '二頭',
      active: false,
      log: []
    },
    {
      name: 'triceps',
      text: '三頭',
      active: false,
      log: []
    },
    {
      name: 'core',
      text: '核心',
      active: false,
      log: []
    },
    {
      name: 'legs',
      text: '腿',
      active: false,
      log: []
    }
  ]
}

const getters = {
  getTrainingLog: (state) => state.log
}

const actions = {
  setTrainingLog: ({ commit }, data) => commit('SET_TRAINING_LOG', data),
  clearTrainingLog: ({ commit }) => commit('CLEAR_TRAINING_LOG')
}

const mutations = {
  SET_TRAINING_LOG: (state, data) => {
    state.log.forEach((logPart, logPartIndex) => {
      if (typeof data[logPart.name] !== 'undefined' && Array.isArray(data[logPart.name])) {
        let logDetailTemp = []
        data[logPart.name].forEach((logDetail) => {
          const text = logDetail.text
          if (typeof text === 'undefined' || text.length === 0) return
          const volume =
            !isNaN(logDetail.volume) && logDetail.volume >= 0 ? parseInt(logDetail.volume) : 0
          const set = !isNaN(logDetail.set) && logDetail.set >= 0 ? parseInt(logDetail.set) : 0
          const unit = logDetail.unit === 'KG' || logDetail.unit === 'LB' ? logDetail.unit : 'KG'
          logDetailTemp.push({
            text: text,
            volume: volume,
            set: set,
            unit: unit
          })
        })
        if (logDetailTemp.length > 0) {
          state.log[logPartIndex].active = true
          state.log[logPartIndex].log = logDetailTemp
        }
      }
    })
  },
  CLEAR_TRAINING_LOG: (state) => {
    for (let i = 0; i < state.log.length; i++) {
      state.log[i].active = false
      state.log[i].log = []
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
