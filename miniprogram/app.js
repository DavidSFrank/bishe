// app.js - 小程序入口文件
App({
    globalData: {
        userInfo: null,
        baseUrl: 'http://localhost:8000/api',  // 后端API地址
    },

    onLaunch() {
        // 检查登录状态
        this.checkLoginStatus()
    },

    // 检查登录状态
    checkLoginStatus() {
        const token = wx.getStorageSync('token')
        if (token) {
            // 验证token有效性
            this.getUserInfo()
        }
    },

    // 获取用户信息
    getUserInfo() {
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.globalData.userInfo = userInfo
        }
    },

    // 微信登录
    wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: res => {
                    if (res.code) {
                        // 发送code到后端换取openid
                        wx.request({
                            url: `${this.globalData.baseUrl}/users/login/`,
                            method: 'POST',
                            data: { code: res.code },
                            success: response => {
                                if (response.data.code === 200) {
                                    const { token, userInfo } = response.data.data
                                    wx.setStorageSync('token', token)
                                    wx.setStorageSync('userInfo', userInfo)
                                    this.globalData.userInfo = userInfo
                                    resolve(userInfo)
                                } else {
                                    reject(response.data.message)
                                }
                            },
                            fail: err => reject(err)
                        })
                    } else {
                        reject('登录失败')
                    }
                },
                fail: err => reject(err)
            })
        })
    }
})
