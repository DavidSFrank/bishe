/**
 * API 请求工具
 */

const app = getApp()
const {
    getAdminToken,
    clearAdminSession
} = require('./admin-auth')

function getTokenByMode(authMode) {
    if (authMode === 'admin') {
        return getAdminToken()
    }
    return wx.getStorageSync('token')
}

function handleUnauthorized(authMode) {
    if (authMode === 'admin') {
        clearAdminSession()
        wx.showToast({ title: '登录已过期', icon: 'none' })
        wx.redirectTo({ url: '/pages-admin/login/login' })
        return
    }

    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.showToast({ title: '请先登录', icon: 'none' })
}

function parseErrorMessage(resData, fallback) {
    if (resData && typeof resData.message === 'string' && resData.message) {
        return resData.message
    }
    if (resData && typeof resData.detail === 'string' && resData.detail) {
        return resData.detail
    }
    // DRF validation errors are often objects like {field: ["msg"]}.
    if (resData && typeof resData === 'object') {
        const firstKey = Object.keys(resData)[0]
        const firstVal = firstKey ? resData[firstKey] : ''
        if (Array.isArray(firstVal) && firstVal.length) {
            return String(firstVal[0])
        }
        if (typeof firstVal === 'string' && firstVal) {
            return firstVal
        }
    }
    return fallback
}

// 请求封装
const request = (options) => {
    const authMode = options.authMode || 'user'

    return new Promise((resolve, reject) => {
        const token = getTokenByMode(authMode)

        wx.request({
            url: app.globalData.baseUrl + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            success: res => {
                const body = res.data || {}

                if (res.statusCode === 401) {
                    handleUnauthorized(authMode)
                    reject({ code: 401, message: 'unauthorized' })
                    return
                }

                if (res.statusCode !== 200) {
                    const message = parseErrorMessage(body, '请求失败')
                    wx.showToast({ title: message, icon: 'none' })
                    reject({ code: res.statusCode, message, raw: res })
                    return
                }

                if (body.code === 200) {
                    resolve(body.data)
                    return
                }

                const message = parseErrorMessage(body, '请求失败')
                wx.showToast({ title: message, icon: 'none' })
                reject(body)
            },
            fail: err => {
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

// GET 请求
const get = (url, data, options = {}) => request({ url, method: 'GET', data, ...options })

// POST 请求
const post = (url, data, options = {}) => request({ url, method: 'POST', data, ...options })

// PUT 请求
const put = (url, data, options = {}) => request({ url, method: 'PUT', data, ...options })

// PATCH 请求
const patch = (url, data, options = {}) => request({ url, method: 'PATCH', data, ...options })

// DELETE 请求
const del = (url, data, options = {}) => request({ url, method: 'DELETE', data, ...options })

module.exports = {
    request,
    get,
    post,
    put,
    patch,
    del,
    getAdmin: (url, data) => get(url, data, { authMode: 'admin' }),
    postAdmin: (url, data) => post(url, data, { authMode: 'admin' }),
    putAdmin: (url, data) => put(url, data, { authMode: 'admin' }),
    patchAdmin: (url, data) => patch(url, data, { authMode: 'admin' }),
    delAdmin: (url, data) => del(url, data, { authMode: 'admin' })
}
