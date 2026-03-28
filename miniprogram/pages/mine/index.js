// pages/mine/index.js - 个人中心
const app = getApp()
Page({
    data: { userInfo: null, isLogin: false },
    onShow() {
        const userInfo = wx.getStorageSync('userInfo')
        this.setData({ userInfo, isLogin: !!userInfo })
    },
    onLogin() { app.wxLogin().then(userInfo => this.setData({ userInfo, isLogin: true })) },
    onLogout() {
        wx.removeStorageSync('token')
        wx.removeStorageSync('userInfo')
        this.setData({ userInfo: null, isLogin: false })
        wx.showToast({ title: '已退出登录', icon: 'success' })
    },
    goToAppointments() { wx.navigateTo({ url: '/pages/appointment/list' }) },
    goToReports() { wx.navigateTo({ url: '/pages/report/list' }) },
    goToArticles() { wx.navigateTo({ url: '/pages/articles/list' }) },
    goToConsultations() { wx.navigateTo({ url: '/pages/consultation/list' }) },
    goToFavorites() { wx.navigateTo({ url: '/pages/favorites/list' }) },
    goToProfile() { wx.navigateTo({ url: '/pages/profile/edit' }) }
})
