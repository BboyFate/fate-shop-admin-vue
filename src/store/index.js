import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import admin from './modules/admin'
import app from './modules/app'
import menu from './modules/menu'
import settings from './modules/settings'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    admin,
    app,
    menu,
    settings
  },
  getters
})

export default store
