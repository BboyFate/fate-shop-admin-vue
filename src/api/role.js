import request from '@/utils/request'

export function getRoles(query) {
  return request({
    url: '/auth/roles',
    method: 'get',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: '/auth/roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/auth/roles/${id}`,
    method: 'patch',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/auth/roles/${id}`,
    method: 'delete'
  })
}
