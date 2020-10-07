import{ asyncRoutes, constantRoutes } from '@/router'
import { getRoleMenus } from '@/api/menu'
import routeComponents from '@/router/components'

export function filterRoutes(routes) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    tmp.component = routeComponents[tmp.component]
    if (tmp.children) {
      tmp.children = filterRoutes(tmp.children)
    }
    res.push(tmp)
  })

  return res
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
      getRoleMenus().then(response => {
        let accessedRoutes = filterRoutes(response.data)
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
