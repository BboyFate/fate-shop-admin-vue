import qs from 'qs'
import request from '@/utils/request'

export function getCompanies(params) {
  return request({
    url: '/expresses/companies',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function addCompany(data) {
  return request({
    url: '/expresses/companies',
    method: 'post',
    data
  })
}

export function updateCompany(id, data) {
  return request({
    url: `/expresses/companies/${id}`,
    method: 'patch',
    data
  })
}

export function deleteCompany(id) {
  return request({
    url: `/expresses/companies/${id}`,
    method: 'delete'
  })
}

export function getFees(params) {
  return request({
    url: '/expresses/fees',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function getFee(id) {
  return request({
    url: `/expresses/fees/${id}`,
    method: 'get'
  })
}

export function addFee(data) {
  return request({
    url: '/expresses/fees',
    method: 'post',
    data
  })
}

export function updateFee(id, data) {
  return request({
    url: `/expresses/fees/${id}`,
    method: 'patch',
    data
  })
}

export function deleteFee(id) {
  return request({
    url: `/expresses/fees/${id}`,
    method: 'delete'
  })
}
