/**
 * 管理员登录态工具
 */

const ADMIN_TOKEN_KEY = 'admin_token'
const ADMIN_INFO_KEY = 'admin_info'

function setAdminSession(token, adminInfo) {
    wx.setStorageSync(ADMIN_TOKEN_KEY, token || '')
    wx.setStorageSync(ADMIN_INFO_KEY, adminInfo || null)
}

function getAdminToken() {
    return wx.getStorageSync(ADMIN_TOKEN_KEY)
}

function getAdminInfo() {
    return wx.getStorageSync(ADMIN_INFO_KEY)
}

function clearAdminSession() {
    wx.removeStorageSync(ADMIN_TOKEN_KEY)
    wx.removeStorageSync(ADMIN_INFO_KEY)
}

function hasAdminSession() {
    return !!getAdminToken()
}

module.exports = {
    ADMIN_TOKEN_KEY,
    ADMIN_INFO_KEY,
    setAdminSession,
    getAdminToken,
    getAdminInfo,
    clearAdminSession,
    hasAdminSession
}

