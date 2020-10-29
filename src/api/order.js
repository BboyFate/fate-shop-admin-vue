import request from '@/utils/request'

export function getOrders(query) {
  return request({
    url: '/orders',
    method: 'get',
    params: query
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
