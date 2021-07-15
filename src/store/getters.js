const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,

  token: state => state.admin.token,
  name: state => state.admin.name,
  roles: state => state.admin.roles,
  permissions: state => state.admin.permissions,

  accessed_routes: state => state.permission.routes,

  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews
}
export default getters
