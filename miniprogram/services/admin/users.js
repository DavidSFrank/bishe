const { getAdmin } = require('../../utils/request')

function fetchUsers(params) {
    return getAdmin('/users/', params)
}

module.exports = {
    fetchUsers
}

