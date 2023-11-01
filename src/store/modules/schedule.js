const state = {
  displayDate: new Date(),
  timeOptions: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
  ],
  scheduleData: {
    date: new Date(),
    scheduleTime: [0, 0],
    weight: 0,
    fat: 0,
    img: '',
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
}

const getters = {
  getScheduleDsiplayDate: (state) => state.displayDate,
  getTimeOptions: (state) => state.timeOptions,
  getSchedulePhoto: (state) => state.scheduleData.img,
  getScheduleData: (state) => state.scheduleData
}

const actions = {
  setScheduleDisplayDate: ({ commit }, date) => commit('SET_SCHEDULE_DISPLAY_DATE', date),
  setScheduleData: ({ commit }, data) => commit('SET_SCHEDULE_DATA', data),
  setSchedulePhoto: ({ commit }, data) => commit('SET_SCHEDULE_PHOTO', data),
  clearScheduleData: ({ commit }) => commit('CLEAR_SCHEDULE_DATA')
}

const mutations = {
  SET_SCHEDULE_DISPLAY_DATE: (state, date) => {
    state.displayDate = date
  },
  SET_SCHEDULE_DATA: (state, data) => {
    state.scheduleData.date = data.date

    let startTime = data.startTime,
      endTime = data.endTime,
      scheduleTimeArr = [0, 0]
    if (isNaN(startTime)) {
      scheduleTimeArr[0] = 0
    } else {
      startTime = parseInt(startTime)
      if (startTime < 0) startTime = 0
      else if (startTime > 24) startTime = 24
      scheduleTimeArr[0] = startTime
    }

    if (isNaN(endTime)) {
      scheduleTimeArr[1] = 0
    } else {
      endTime = parseInt(endTime)
      if (endTime < 0) endTime = 0
      else if (endTime > 24) endTime = 24
      scheduleTimeArr[1] = endTime
    }

    state.scheduleData.scheduleTime = scheduleTimeArr

    state.scheduleData.weight = isNaN(data.weight) ? 0 : data.weight
    state.scheduleData.fat = isNaN(data.fat) ? 0 : data.fat

    state.scheduleData.log.forEach((logPart, logPartIndex) => {
      if (typeof data.log[logPart.name] !== 'undefined' && Array.isArray(data.log[logPart.name])) {
        let logDetailTemp = []
        data.log[logPart.name].forEach((logDetail) => {
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
          state.scheduleData.log[logPartIndex].active = true
          state.scheduleData.log[logPartIndex].log = logDetailTemp
        }
      } else {
        state.scheduleData.log[logPartIndex].active = false
        state.scheduleData.log[logPartIndex].log = []
      }
    })
  },
  SET_SCHEDULE_PHOTO: (state, photo) => {
    state.scheduleData.img = photo
  },
  CLEAR_SCHEDULE_DATA: (state) => {
    state.scheduleData = {
      date: new Date(),
      scheduleTime: [0, 0],
      weight: 0,
      fat: 0,
      img: '',
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
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
