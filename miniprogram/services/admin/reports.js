const { getAdmin, postAdmin, putAdmin } = require('../../utils/request')

function fetchReports(params) {
    return getAdmin('/reports/', params)
}

function createReport(payload) {
    return postAdmin('/reports/', payload)
}

function updateReport(id, payload) {
    return putAdmin(`/reports/${id}/`, payload)
}

module.exports = {
    fetchReports,
    createReport,
    updateReport
}

