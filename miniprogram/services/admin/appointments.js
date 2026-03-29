const { getAdmin, patchAdmin } = require('../../utils/request')

function fetchAppointments(params) {
    return getAdmin('/appointments/', params)
}

function updateAppointmentStatus(id, payload) {
    return patchAdmin(`/appointments/${id}/`, payload)
}

module.exports = {
    fetchAppointments,
    updateAppointmentStatus
}
