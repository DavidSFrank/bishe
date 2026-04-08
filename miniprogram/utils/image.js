const DEFAULT_COVER = '/images/tab-package.png'

function getOrigin() {
    const app = getApp()
    const baseUrl = (app && app.globalData && app.globalData.baseUrl) || ''
    if (!baseUrl) {
        return ''
    }
    return baseUrl.replace(/\/api\/?$/, '')
}

function normalizeImageUrl(url) {
    if (!url) {
        return DEFAULT_COVER
    }
    if (/^https?:\/\//i.test(url)) {
        return url
    }
    if (url.startsWith('//')) {
        return `https:${url}`
    }
    const origin = getOrigin()
    if (!origin) {
        return DEFAULT_COVER
    }
    const path = url.startsWith('/') ? url : `/${url}`
    return `${origin}${path}`
}

module.exports = {
    DEFAULT_COVER,
    normalizeImageUrl
}

