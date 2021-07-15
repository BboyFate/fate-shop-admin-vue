import { constantRoutes } from '@/router'
import { getMenus } from '@/api/systems/me'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView';

function filterAsyncRoutes(asyncRoutes) {
  return asyncRoutes.map(route => {
    if (route.component) {
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else {
        route.component = loadView(route.component)
      }
    }

    // 路由是否隐藏
    route.hidden = !route.is_showed

    if (route.children && route.children.length) {
      route.children = filterAsyncRoutes(route.children)
    }

    return route
  })
}

/**
 * 路由懒加载
 *
 * @param view
 * @returns {function(*=): any}
 */
const loadView = (view) => {
  return (resolve) => require([`@/views/${view}`], resolve)
}

const state = {
  routes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  getRoleMenus({ commit }) {
    return new Promise((resolve, reject) => {
      getMenus().then(response => {
        const accessedRoutes = filterAsyncRoutes(response.data)
        accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })

        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
