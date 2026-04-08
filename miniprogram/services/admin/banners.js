const { getAdmin, postAdmin, patchAdmin, delAdmin } = require('../../utils/request')

function fetchBanners(params) {
    return getAdmin('/articles/banners/', params)
}

function createBanner(payload) {
    return postAdmin('/articles/banners/', payload)
}

function updateBanner(id, payload) {
    return patchAdmin(`/articles/banners/${id}/`, payload)
}

function deleteBanner(id) {
    return delAdmin(`/articles/banners/${id}/`)
}

module.exports = {
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner
}

