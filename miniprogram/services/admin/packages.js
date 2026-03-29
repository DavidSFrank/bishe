const { getAdmin } = require('../../utils/request')

function fetchPackages(params) {
    return getAdmin('/packages/', params)
}

module.exports = {
    fetchPackages
}

