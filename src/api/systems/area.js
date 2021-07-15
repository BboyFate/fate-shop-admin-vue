import request from '@/utils/request'

export function getProvinces() {
  return request({
    url: '/systems/areas/provinces',
    method: 'get'
  })
}

export function getCities(provinceCode) {
  return request({
    url: `/systems/areas/provinces/${provinceCode}/cities`,
    method: 'get'
  })
}

export function getDistrict(cityCode) {
  return request({
    url: `/systems/areas/cities/${cityCode}/districts`,
    method: 'get'
  })
}
