import qs from 'qs'
import request from '@/utils/request'

export function getCategories(params) {
  return request({
    url: '/products/categories',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function getCategoriesTree() {
  return request({
    url: '/products/categories/tree',
    method: 'get'
  })
}

export function addCategory(data) {
  return request({
    url: '/products/categories',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  return request({
    url: `/products/categories/${id}`,
    method: 'patch',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/products/categories/${id}`,
    method: 'delete'
  })
}
