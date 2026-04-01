const { getAdmin } = require('../../utils/request')

function fetchReports(params) {
    return getAdmin('/reports/', params)
}

module.exports = {
    fetchReports
}

