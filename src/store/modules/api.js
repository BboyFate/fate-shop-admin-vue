const baseUrl = process.env.VUE_APP_BASE_API

const getters = {
  addMaterial: () => {
    return baseUrl + '/systems/materials'
  }
}

export default {
  namespaced: true,
  getters,
}

