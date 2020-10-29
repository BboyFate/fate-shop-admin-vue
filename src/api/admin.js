import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/authorizations',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/authorizations/current',
    method: 'delete'
  })
}

export function getAdmins(query) {
  return request({
    url: '/auth/users',
    method: 'get',
    params: query
  })
}

export function addAdmin(data) {
  return request({
    url: '/auth/users',
    method: 'post',
    data
  })
}

export function updateAdmin(id, data) {
  return request({
    url: `/auth/users/${id}`,
    method: 'patch',
    data
  })
}

export function deleteAdmin(id) {
  return request({
    url: `/auth/users/${id}`,
    method: 'delete'
  })
}
