const { getAdmin, patchAdmin } = require('../../utils/request')

function fetchUsers(params) {
    return getAdmin('/users/', params)
}

function updateUser(id, payload) {
    return patchAdmin(`/users/${id}/`, payload)
}

module.exports = {
    fetchUsers,
    updateUser
}
