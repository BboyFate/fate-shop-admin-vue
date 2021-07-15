import request from '@/utils/request'
import qs from 'qs'

export function getOrders(params) {
  return request({
    url: '/orders',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function getOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get',
  })
}

/**
 * 全部发货
 * @param orderId
 * @param data
 * @returns {AxiosPromise}
 */
export function ship(orderId, data) {
  return request({
    url: `/orders/${orderId}/ship`,
    method: 'post',
    data
  })
}
/**
 * 部分发货
 * @param orderId
 * @param data
 * @returns {AxiosPromise}
 */
export function partiallyShip(orderId, data) {
  return request({
    url: `/orders/${orderId}/partially_ship`,
    method: 'post',
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

export function getOrderItemRefunds(orderId, itemId, params) {
  return request({
    url: `/orders/${orderId}/items/${itemId}/refunds`,
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}
