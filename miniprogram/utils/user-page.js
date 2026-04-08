/**
 * 用户端页面通用守卫
 */

const { requireUserLogin } = require('./request')

const RETURN_URL_KEY = 'user_login_return_url'
const TAB_PAGES = [
    '/pages/index/index',
    '/pages/packages/list',
    '/pages/appointment/list',
    '/pages/mine/index'
]

function toQueryString(options = {}) {
    const keys = Object.keys(options || {})
    if (!keys.length) {
        return ''
    }
    return keys.map((key) => `${key}=${encodeURIComponent(options[key])}`).join('&')
}

function getCurrentPageUrl() {
    const pages = getCurrentPages()
    if (!pages.length) {
        return ''
    }
    const current = pages[pages.length - 1]
    const route = current.route ? `/${current.route}` : ''
    const query = toQueryString(current.options)
    return query ? `${route}?${query}` : route
}

function isTabPage(url = '') {
    const path = url.split('?')[0]
    return TAB_PAGES.includes(path)
}

function saveReturnUrl(url) {
    if (!url || url === '/pages/mine/index') {
        return
    }
    wx.setStorageSync(RETURN_URL_KEY, url)
}

function consumeReturnUrl() {
    const url = wx.getStorageSync(RETURN_URL_KEY)
    if (url) {
        wx.removeStorageSync(RETURN_URL_KEY)
    }
    return url
}

function navigateAfterLogin(url) {
    if (!url) {
        return false
    }
    if (isTabPage(url)) {
        wx.switchTab({ url: url.split('?')[0] })
        return true
    }
    wx.redirectTo({ url })
    return true
}

async function ensureUserSession({ fallbackTab = '/pages/mine/index' } = {}) {
    try {
        await requireUserLogin({ silent: true })
        return true
    } catch (err) {
        saveReturnUrl(getCurrentPageUrl())
        wx.showToast({ title: '请先登录', icon: 'none' })
        wx.switchTab({ url: fallbackTab })
        return false
    }
}

module.exports = {
    ensureUserSession,
    consumeReturnUrl,
    navigateAfterLogin
}

