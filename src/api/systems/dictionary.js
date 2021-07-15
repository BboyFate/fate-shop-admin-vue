import request from '@/utils/request'
import qs from 'qs'

export function getDictionaries(query) {
  return request({
    url: '/systems/dictionaries',
    method: 'get',
    params: query
  })
}

export function addDictionary(data) {
  return request({
    url: '/systems/dictionaries',
    method: 'post',
    data
  })
}

export function updateDictionary(id, data) {
  return request({
    url: `/systems/dictionaries/${id}`,
    method: 'patch',
    data
  })
}

export function deleteDictionary(id) {
  return request({
    url: `/systems/dictionaries/${id}`,
    method: 'delete'
  })
}

export function getDictionaryTypes(params) {
  return request({
    url: '/systems/dictionaries/types',
    method: 'get',
    params: params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function getDictionaryType(id, query) {
  return request({
    url: `/systems/dictionaries/types/${id}`,
    method: 'get',
    params: query
  })
}

/**
 * 单个 type 名查询
 * @param params
 * @returns {AxiosPromise}
 */
export function getDictionaryTypesFilterType(params) {
  return request({
    url: `/systems/dictionaries/types/filter_type`,
    method: 'get',
    params: params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}
/**
 * 多个 type 名查询
 * @param params
 * @returns {AxiosPromise}
 */
export function getDictionaryTypesFilterTypes(params) {
  return request({
    url: `/systems/dictionaries/types/filter_types`,
    method: 'get',
    params: params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function addDictionaryType(data) {
  return request({
    url: '/systems/dictionaries/types',
    method: 'post',
    data
  })
}

export function updateDictionaryType(id, data) {
  return request({
    url: `/systems/dictionaries/types/${id}`,
    method: 'patch',
    data
  })
}

export function deleteDictionaryType(id) {
  return request({
    url: `/systems/dictionaries/types/${id}`,
    method: 'delete'
  })
}
