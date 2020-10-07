const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.admin.token,
  avatar: state => state.admin.avatar,
  name: state => state.admin.name,
  roles: state => state.admin.roles,
  accessed_routes: state => state.menu.routes,
}
export default getters
