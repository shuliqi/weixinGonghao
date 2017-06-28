import Vue from 'vue'
import Vuex from 'vuex'
// import mutations from './mutations'

Vue.use(Vuex)

const state = {
  hostName: 'http://shda.bookmall.com.cn',
  // hostName: 'http://shda.test.com',
  // hostName: 'http://200.1.3.89:1209',
  isLoading: false,
  promptTxt: 'Loading...',
  error: false,
  // 默认事件单位：1（年），2（月），3（周），4（天）
  initAxisUnit: 4,
  userId: window.localStorage.getItem('userId')
}

const mutations = {
  UPDATE_LOADING(state, status) {
    state.isLoading = status
  },
  UPDATE_PROMPT(state, status) {
    state.promptTxt = status
  },
  ERROR(state, status) {
    state.error = status
  }
}

export default new Vuex.Store({
  state,
  mutations
})