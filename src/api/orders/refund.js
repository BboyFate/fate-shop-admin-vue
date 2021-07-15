import request from '@/utils/request'
import qs from 'qs'

export function getRefunds(params) {
  return request({
    url: '/orders/items/refunds',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function getRefund(id) {
  return request({
    url: `/orders/items/refunds/${id}`,
    method: 'get',
  })
}

export function getRefundCauses() {
  return request({
    url: '/orders/refunds/causes',
    method: 'get'
  })
}

/**
 * 确认退款
 * @param id
 * @param params
 * @returns {AxiosPromise}
 */
export function refund(id, data) {
  return request({
    url: `/orders/items/refunds/${id}/refund`,
    method: 'post',
    data,
  })
}


