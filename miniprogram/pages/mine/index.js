// pages/mine/index.js - 个人中心
const { requireUserLogin, clearUserSession, get } = require('../../utils/request')
const { consumeReturnUrl, navigateAfterLogin } = require('../../utils/user-page')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: {
        userInfo: null,
        isLogin: false,
        avatarUrl: '/images/tab-mine.png'
    },

    applyUserInfo(userInfo) {
        this.setData({
            userInfo,
            isLogin: !!userInfo,
            avatarUrl: normalizeImageUrl(userInfo && userInfo.avatar)
        })
    },

    onShow() {
        const userInfo = wx.getStorageSync('userInfo')
        this.applyUserInfo(userInfo)
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
            this.applyUserInfo(nextUserInfo)
        } catch (e) {}
    },

    async onLogin() {
        try {
            await requireUserLogin()
            await this.refreshProfile()
            const returnUrl = consumeReturnUrl()
            if (returnUrl) {
                navigateAfterLogin(returnUrl)
            }
        } catch (e) {}
    },

    onLogout() {
        clearUserSession()
        const app = getApp()
        app.globalData.userInfo = null
        this.applyUserInfo(null)
        wx.showToast({ title: '已退出登录', icon: 'none' })
    },

    goToAppointments() { wx.switchTab({ url: '/pages/appointment/list' }) },
    goToReports() { wx.navigateTo({ url: '/pages/report/list' }) },
    goToArticles() { wx.navigateTo({ url: '/pages/articles/list' }) },
    goToConsultations() { wx.navigateTo({ url: '/pages/consultation/list' }) },
    goToFavorites() { wx.navigateTo({ url: '/pages/favorites/list' }) },
    goToProfile() { wx.navigateTo({ url: '/pages/profile/edit' }) },
    goToAdmin() { wx.navigateTo({ url: '/pages-admin/login/login' }) }
})
