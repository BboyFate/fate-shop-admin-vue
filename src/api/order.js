import request from '@/utils/request'
import qs from 'qs'

export function getOrders(params) {
  return request({
    url: '/orders',
    method: 'get',
    params,
    paramsSerializer: function (params) {
      return qs.stringify( params , { arrayFormat: 'indices' })
    }
  })
}

export function ship(id, data) {
  return request({
    url: `/orders/${id}/ship`,
    method: 'patch',
    data
  })
}

export function refund(id, data) {
  return request({
    url: `/orders/${id}/refund`,
    method: 'patch',
    data
  })
}
