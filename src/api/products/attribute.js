import qs from 'qs'
import request from '@/utils/request'

export function getTemplates(params) {
  return request({
    url: '/products/attributes/templates',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function addTemplate(data) {
  return request({
    url: '/products/attributes/templates',
    method: 'post',
    data
  })
}

export function updateTemplate(id, data) {
  return request({
    url: `/products/attributes/templates/${id}`,
    method: 'patch',
    data
  })
}

export function deleteTemplate(id) {
  return request({
    url: `/products/attributes/templates/${id}`,
    method: 'delete'
  })
}
