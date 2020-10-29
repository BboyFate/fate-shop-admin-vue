const TYPE_NORMAL = 'normal'
const TYPE_CROWDFUNDING = 'crowdfunding'
const TYPE_SECKILL = 'seckill'
export function onSaleMap() {
  return {
    false: '已下架',
    true: '已上架',
  }
}
export function onSaleStyleMap() {
  return {
    false: 'danger',
    true: 'success',
  }
}
export function onSaleOptions() {
  return [
    { key: 0, display_name: '已下架' },
    { key: 1, display_name: '已上架' },
  ]
}
export function typeMap() {
  return {
    [TYPE_NORMAL]: '普通商品',
    [TYPE_CROWDFUNDING]: '众筹商品',
    [TYPE_SECKILL]: '秒杀商品',
  }
}
export function typeOptions() {
  return [
    { key: TYPE_NORMAL, display_name: '普通商品' },
    { key: TYPE_CROWDFUNDING, display_name: '众筹商品' },
    { key: TYPE_SECKILL, display_name: '秒杀商品' },
  ]
}
