import request from '@/utils/request'

export function getProducts(query) {
  return request({
    url: '/products',
    method: 'get',
    params: query
  })
}

export function getProduct(id, query) {
  return request({
    url: `/products/${id}`,
    method: 'get',
    params: query
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

export function getCrowdfundingProducts(query) {
  return request({
    url: '/crowdfunding_products',
    method: 'get',
    params: query
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

export function productSkuAttrFormat(data) {
  return request({
    url: '/product_sku_attributes/format',
    method: 'post',
    data
  })
}
