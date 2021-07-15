import qs from 'qs'
import request from '@/utils/request'

export function getMaterials(params) {
  return request({
    url: '/systems/materials',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function addMaterial(data) {
  return request({
    url: '/systems/materials',
    method: 'post',
    data
  })
}

export function updateMaterial(id, data) {
  return request({
    url: `/systems/materials/${id}`,
    method: 'patch',
    data
  })
}

export function deleteMaterial(id) {
  return request({
    url: `/systems/materials/${id}`,
    method: 'delete'
  })
}

export function getMaterialGroups(params) {
  return request({
    url: '/systems/materials/groups',
    method: 'get',
    params,
    paramsSerializer: function(params) {
      return qs.stringify(params, { arrayFormat: 'indices' })
    }
  })
}

export function addMaterialGroup(data) {
  return request({
    url: '/systems/materials/groups',
    method: 'post',
    data
  })
}

export function updateMaterialGroup(id, data) {
  return request({
    url: `/systems/materials/groups/${id}`,
    method: 'patch',
    data
  })
}

export function deleteMaterialGroup(id) {
  return request({
    url: `/systems/materials/groups/${id}`,
    method: 'delete'
  })
}
