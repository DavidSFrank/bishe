const { fetchDashboardStats } = require('../../services/admin/dashboard')
const { ensureAdminSession } = require('../../utils/admin-page')

Page({
    data: {
        stats: {}
    },

    onShow() {
        if (!ensureAdminSession(this)) {
            return
        }
        this.loadStats()
    },

    async loadStats() {
        try {
            const stats = await fetchDashboardStats()
            this.setData({ stats })
        } catch (err) {
            console.error('load dashboard failed', err)
        }
    },

    goPackages() {
        wx.navigateTo({ url: '/pages-admin/packages/list' })
    },

    goAppointments() {
        wx.navigateTo({ url: '/pages-admin/appointments/list' })
    },

    goReports() {
        wx.navigateTo({ url: '/pages-admin/reports/list' })
    },

    goUsers() {
        wx.navigateTo({ url: '/pages-admin/users/list' })
    },

    goProfile() {
        wx.navigateTo({ url: '/pages-admin/profile/index' })
    },

    goArticles() {
        wx.navigateTo({ url: '/pages-admin/articles/list' })
    },

    goConsultations() {
        wx.navigateTo({ url: '/pages-admin/consultations/list' })
    },

    goBanners() {
        wx.navigateTo({ url: '/pages-admin/banners/list' })
    }
})
