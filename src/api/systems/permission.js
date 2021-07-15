import request from '@/utils/request'

export function getPermissions(query) {
  return request({
    url: '/systems/permissions',
    method: 'get',
    params: query
  })
}

export function getPermission(id) {
  return request({
    url: `/systems/permissions/${id}`,
    method: 'get'
  })
}

export function addPermission(data) {
  return request({
    url: '/systems/permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  return request({
    url: `/systems/permissions/${id}`,
    method: 'patch',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: `/systems/permissions/${id}`,
    method: 'delete'
  })
}
