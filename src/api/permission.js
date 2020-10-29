import request from '@/utils/request'

export function getPermissions(query) {
  return request({
    url: '/auth/permissions',
    method: 'get',
    params: query
  })
}

export function addPermission(data) {
  return request({
    url: '/auth/permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  return request({
    url: `/auth/permissions/${id}`,
    method: 'patch',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: `/auth/permissions/${id}`,
    method: 'delete'
  })
}
