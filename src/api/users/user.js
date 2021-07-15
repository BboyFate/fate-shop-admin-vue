import request from '@/utils/request'
import qs from 'qs'

export function getUsers(params) {
  return request({
    url: '/users',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function getUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'get',
  })
}


