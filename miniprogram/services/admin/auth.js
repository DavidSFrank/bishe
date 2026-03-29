const { postAdmin, getAdmin } = require('../../utils/request')
const { setAdminSession, clearAdminSession, getAdminInfo } = require('../../utils/admin-auth')

async function adminLogin(form) {
    const data = await postAdmin('/users/admin/login/', form)
    setAdminSession(data.token, data.admin)
    return data
}

function adminLogout() {
    clearAdminSession()
}

async function fetchAdminProfile() {
    return getAdmin('/users/admin/profile/')
}

module.exports = {
    adminLogin,
    adminLogout,
    fetchAdminProfile,
    getAdminInfo
}

