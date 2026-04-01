const { getAdmin, postAdmin, patchAdmin, delAdmin } = require('../../utils/request')

function fetchPackages(params) {
    return getAdmin('/packages/', params)
}

function createPackage(payload) {
    return postAdmin('/packages/', payload)
}

function updatePackage(id, payload) {
    return patchAdmin(`/packages/${id}/`, payload)
}

function deletePackage(id) {
    return delAdmin(`/packages/${id}/`)
}

module.exports = {
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage
}

