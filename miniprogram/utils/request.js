/**
 * API 请求工具
 */

const app = getApp()

// 请求封装
const request = (options) => {
    return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token')

        wx.request({
            url: app.globalData.baseUrl + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            success: res => {
                if (res.statusCode === 200) {
                    if (res.data.code === 200) {
                        resolve(res.data.data)
                    } else {
                        wx.showToast({
                            title: res.data.message || '请求失败',
                            icon: 'none'
                        })
                        reject(res.data)
                    }
                } else if (res.statusCode === 401) {
                    // 未登录，跳转登录
                    wx.removeStorageSync('token')
                    wx.removeStorageSync('userInfo')
                    reject({ code: 401, message: '请先登录' })
                } else {
                    reject(res)
                }
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
const get = (url, data) => request({ url, method: 'GET', data })

// POST 请求
const post = (url, data) => request({ url, method: 'POST', data })

// PUT 请求
const put = (url, data) => request({ url, method: 'PUT', data })

// DELETE 请求
const del = (url, data) => request({ url, method: 'DELETE', data })

module.exports = {
    request,
    get,
    post,
    put,
    del
}
