import request from '@/utils/request'

export function getMenus() {
  return request({
    url: '/vue_menus',
    method: 'get'
  })
}

export function addMenu(data) {
  return request({
    url: '/vue_menus',
    method: 'post',
    data
  })
}

export function updateMenu(id, data) {
  return request({
    url: `/vue_menus/${id}`,
    method: 'patch',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: `/vue_menus/${id}`,
    method: 'delete'
  })
}

export function getRoleMenus() {
  return request({
    url: '/vue_menus/role_menus',
    method: 'get'
  })
}
