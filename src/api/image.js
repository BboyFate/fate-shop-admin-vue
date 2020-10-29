import request from '@/utils/request'

export function getImages(query) {
  return request({
    url: '/images',
    method: 'get',
    params: query
  })
}

export function getImage(id, query) {
  return request({
    url: `/images/${id}`,
    method: 'get',
    params: query
  })
}

export function addImage(data) {
  return request({
    url: '/images',
    method: 'post',
    data
  })
}

export function updateImage(id, data) {
  return request({
    url: `/images/${id}`,
    method: 'patch',
    data
  })
}

export function deleteImage(id) {
  return request({
    url: `/images/${id}`,
    method: 'delete'
  })
}

export function deleteImages(data) {
  return request({
    url: '/images/delete',
    method: 'post',
    data
  })
}
