const { getAdmin, patchAdmin, delAdmin } = require('../../utils/request')

function fetchConsultations(params) {
    return getAdmin('/articles/consultations/', params)
}

function replyConsultation(id, payload) {
    return patchAdmin(`/articles/consultations/${id}/`, payload)
}

function deleteConsultation(id) {
    return delAdmin(`/articles/consultations/${id}/`)
}

module.exports = {
    fetchConsultations,
    replyConsultation,
    deleteConsultation
}

