// pages/mine/index.js - 个人中心
const { requireUserLogin, clearUserSession, get } = require('../../utils/request')
const { consumeReturnUrl, navigateAfterLogin } = require('../../utils/user-page')

Page({
    data: { userInfo: null, isLogin: false },
    onShow() {
        const userInfo = wx.getStorageSync('userInfo')
        this.setData({ userInfo, isLogin: !!userInfo })
        if (userInfo && wx.getStorageSync('token')) {
            this.refreshProfile()
        }
    },
    async refreshProfile() {
        try {
            const profile = await get('/users/me/')
            const oldUserInfo = wx.getStorageSync('userInfo') || {}
            const nextUserInfo = { ...oldUserInfo, ...profile }
            wx.setStorageSync('userInfo', nextUserInfo)
            this.setData({ userInfo: nextUserInfo, isLogin: true })
        } catch (e) {}
    },
    async onLogin() {
        try {
            const userInfo = await requireUserLogin({ force: true })
            this.setData({ userInfo, isLogin: true })

            const returnUrl = consumeReturnUrl()
            if (returnUrl) {
                navigateAfterLogin(returnUrl)
            }
        } catch (e) {}
    },
    onLogout() {
        clearUserSession()
        this.setData({ userInfo: null, isLogin: false })
        wx.showToast({ title: '已退出登录', icon: 'success' })
    },
    goToAppointments() { wx.switchTab({ url: '/pages/appointment/list' }) },
    goToReports() { wx.navigateTo({ url: '/pages/report/list' }) },
    goToArticles() { wx.navigateTo({ url: '/pages/articles/list' }) },
    goToConsultations() { wx.navigateTo({ url: '/pages/consultation/list' }) },
    goToFavorites() { wx.navigateTo({ url: '/pages/favorites/list' }) },
    goToProfile() { wx.navigateTo({ url: '/pages/profile/edit' }) },
    goToAdmin() { wx.navigateTo({ url: '/pages-admin/login/login' }) }
})
