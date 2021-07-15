import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import '@/assets/styles/index.scss' // global css
import '@/assets/icons' // icon
import '@/permission' // 权限控制

import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission' // 自定义权限指令
import { resetForm, selectDictLabel } from '@/utils/index'

/**
 * 全局方法挂载
 */
Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'success' })
}
Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'error' })
}
Vue.prototype.resetForm = resetForm
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.refreshCachedView = function ($vm) {
  $vm.$store.dispatch('tagsView/delCachedView', $vm.$route).then(() => {
    const { fullPath } = $vm.$route
    $vm.$nextTick(() => {
      $vm.$router.replace({
        path: '/redirect' + fullPath
      })
    })
  })
}

/**
 * 全局安装插件
 */
Vue.use(permission)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
