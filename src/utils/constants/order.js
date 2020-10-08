
const REFUND_STATUS_PENDING = 'pending'
const REFUND_STATUS_APPLIED = 'applied'
const REFUND_STATUS_PROCESSING = 'processing'
const REFUND_STATUS_SUCCESS = 'success'
const REFUND_STATUS_FAILED = 'failed'
export function refundStatusMap() {
  return {
    [REFUND_STATUS_PENDING]: '未退款',
    [REFUND_STATUS_APPLIED]: '已申请退款',
    [REFUND_STATUS_PROCESSING]: '退款中',
    [REFUND_STATUS_SUCCESS]: '退款成功',
    [REFUND_STATUS_FAILED]: '退款失败',
  }
}
export function refundStatusStyleMap() {
  return {
    [REFUND_STATUS_PENDING]: '',
    [REFUND_STATUS_APPLIED]: 'warning',
    [REFUND_STATUS_PROCESSING]: 'warning',
    [REFUND_STATUS_SUCCESS]: 'success',
    [REFUND_STATUS_FAILED]: 'danger',
  }
}
export function refundStatusOptions() {
  return [
    { key: REFUND_STATUS_PENDING, display_name: '未退款' },
    { key: REFUND_STATUS_APPLIED, display_name: '已申请退款' },
    { key: REFUND_STATUS_PROCESSING, display_name: '退款中' },
    { key: REFUND_STATUS_SUCCESS, display_name: '退款成功' },
    { key: REFUND_STATUS_FAILED, display_name: '退款失败' }
  ]
}


const SHIP_STATUS_PENDING = 'pending'
const SHIP_STATUS_DELIVERED = 'delivered'
const SHIP_STATUS_RECEIVED = 'received'
export function shipStatusMap() {
  return {
    [SHIP_STATUS_PENDING]: '未发货',
    [SHIP_STATUS_DELIVERED]: '已发货',
    [SHIP_STATUS_RECEIVED]: '已收货',
  }
}
export function shipStatusStyleMap() {
  return {
    [SHIP_STATUS_PENDING]: 'warning',
    [SHIP_STATUS_DELIVERED]: 'info',
    [SHIP_STATUS_RECEIVED]: 'success',
  }
}
export function shipStatusOptions() {
  return [
    { key: SHIP_STATUS_PENDING, display_name: '未发货' },
    { key: SHIP_STATUS_DELIVERED, display_name: '已发货' },
    { key: SHIP_STATUS_RECEIVED, display_name: '已收货' },
  ]
}
