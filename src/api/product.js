import request from '@/utils/request'
import qs from 'qs'

export function getProducts(params) {
  return request({
    url: '/products',
    method: 'get',
    params,
    paramsSerializer: function (params) {
      return qs.stringify( params , { arrayFormat: 'indices' })
    }
  })
}

export function getProduct(id, params) {
  return request({
    url: `/products/${id}`,
    method: 'get',
    params,
    paramsSerializer: function (params) {
      return qs.stringify( params , { arrayFormat: 'indices' })
    }
  })
}

export function getProductDetail(id, params) {
  return request({
    url: `/products/${id}/detail`,
    method: 'get',
    params,
    paramsSerializer: function (params) {
      return qs.stringify( params , { arrayFormat: 'indices' })
    }
  })
}

export function addProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

export function updateProduct(id, data) {
  return request({
    url: `/products/${id}`,
    method: 'patch',
    data
  })
}

export function getCrowdfundingProducts(params) {
  return request({
    url: '/crowdfunding_products',
    method: 'get',
    params,
    paramsSerializer: function (params) {
      return qs.stringify( params , { arrayFormat: 'indices' })
    }
  })
}

export function addCrowdfundingProduct(data) {
  return request({
    url: '/crowdfunding_products',
    method: 'post',
    data
  })
}

export function updateCrowdfundingProduct(id, data) {
  return request({
    url: `/crowdfunding_products/${id}`,
    method: 'patch',
    data
  })
}

export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

export function deleteProductSku(skuId) {
  return request({
    url: `/product_skus/${skuId}`,
    method: 'delete'
  })
}

export function deleteProductSkus(data) {
  return request({
    url: `/product_skus/delete`,
    method: 'post',
    data
  })
}
