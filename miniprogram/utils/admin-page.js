/**
 * 管理端页面通用守卫
 */

const { hasAdminSession } = require('./admin-auth')

function ensureAdminSession(ctx) {
    if (hasAdminSession()) {
        return true
    }

    wx.showToast({ title: '请先登录管理端', icon: 'none' })
    wx.redirectTo({ url: '/pages-admin/login/login' })
    return false
}

module.exports = {
    ensureAdminSession
}

