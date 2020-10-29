import request from '@/utils/request'

export function getSomeCategories(query) {
  return request({
    url: '/product_categories/some',
    method: 'get',
    params: query
  })
}
