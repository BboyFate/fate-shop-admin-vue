import request from '@/utils/request'

/**
 * 获取本账号个人信息
 */
export function getInfo() {
  return request({
    url: '/user',
    method: 'get'
  })
}

/**
 * 获取菜单列表
 */
export function getMenus() {
  return request({
    url: `/user/menus`,
    method: 'get'
  })
}

/**
 * 登录
 */
export function login(data) {
  return request({
    url: '/authorizations',
    method: 'post',
    data
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/authorizations/current',
    method: 'delete'
  })
}
