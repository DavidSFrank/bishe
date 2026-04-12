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
    const raw = String(url).trim()
    if (!raw) {
        return DEFAULT_COVER
    }
    if (/^\/?images\//i.test(raw)) {
        return raw.startsWith('/') ? raw : `/${raw}`
    }
    if (/^https?:\/\//i.test(raw)) {
        return raw
    }
    if (raw.startsWith('//')) {
        return `https:${raw}`
    }
    if (/^(wxfile:\/\/|file:\/\/)/i.test(raw)) {
        return raw
    }
    if (/^\/(Users|home|var|private|tmp)\//.test(raw) || /^[A-Za-z]:[\\/]/.test(raw)) {
        const match = raw.match(/\/miniprogram\/images\/([^/?#]+)/)
        if (match && match[1]) {
            return `/images/${match[1]}`
        }
        return DEFAULT_COVER
    }
    const origin = getOrigin()
    if (!origin) {
        return DEFAULT_COVER
    }
    const path = raw.startsWith('/') ? raw : `/${raw}`
    return `${origin}${path}`
}

module.exports = {
    DEFAULT_COVER,
    normalizeImageUrl
}

