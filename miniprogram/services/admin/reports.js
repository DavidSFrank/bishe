const { getAdmin, postAdmin, patchAdmin } = require('../../utils/request')

function fetchReports(params) {
    return getAdmin('/reports/', params)
}

function createReport(payload) {
    return postAdmin('/reports/', payload)
}

function updateReport(id, payload) {
    return patchAdmin(`/reports/${id}/`, payload)
}

module.exports = {
    fetchReports,
    createReport,
    updateReport
}
