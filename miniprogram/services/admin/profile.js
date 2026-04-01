const { getAdmin, putAdmin } = require('../../utils/request')

function fetchAdminProfile() {
    return getAdmin('/users/admin/profile/')
}

function updateAdminProfile(payload) {
    return putAdmin('/users/admin/profile/', payload)
}

module.exports = {
    fetchAdminProfile,
    updateAdminProfile
}

