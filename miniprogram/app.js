// app.js - 小程序入口文件
App({
    globalData: {
        userInfo: null,
        baseUrl: 'http://localhost:8000/api' // 后端API地址
    },

    onLaunch() {
        this.checkLoginStatus()
    },

    checkLoginStatus() {
        const token = wx.getStorageSync('token')
        if (token) {
            this.getUserInfo()
        }
    },

    getUserInfo() {
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.globalData.userInfo = userInfo
        }
    },

    wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => {
                    if (!res.code) {
                        reject('登录失败')
                        return
                    }

                    const cachedOpenid = wx.getStorageSync('dev_openid')
                    const stableOpenid = cachedOpenid || `dev-openid-${res.code}`

                    wx.request({
                        url: `${this.globalData.baseUrl}/users/login/`,
                        method: 'POST',
                        data: { code: res.code, openid: stableOpenid },
                        success: response => {
                            const resp = response.data || {}
                            if (response.statusCode !== 200 || resp.code !== 200) {
                                reject(resp.message || '登录失败')
                                return
                            }

                            const {
                                token,
                                userInfo,
                                is_new_user,
                                profile_completed
                            } = resp.data || {}

                            if (!token || !userInfo) {
                                reject('登录响应异常')
                                return
                            }

                            wx.setStorageSync('token', token)
                            wx.setStorageSync('userInfo', userInfo)
                            wx.setStorageSync('dev_openid', userInfo.openid || stableOpenid)
                            this.globalData.userInfo = userInfo

                            resolve({
                                token,
                                userInfo,
                                isNewUser: !!is_new_user,
                                profileCompleted: !!profile_completed
                            })
                        },
                        fail: err => reject(err)
                    })
                },
                fail: err => reject(err)
            })
        })
    }
})
