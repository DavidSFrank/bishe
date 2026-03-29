const { getAdmin } = require('../../utils/request')

function fetchDashboardStats() {
    return getAdmin('/users/admin/dashboard/')
}

module.exports = {
    fetchDashboardStats
}

