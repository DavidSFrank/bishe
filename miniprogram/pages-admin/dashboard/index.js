const { fetchDashboardStats } = require('../../services/admin/dashboard')
const { adminLogout } = require('../../services/admin/auth')

Page({
    data: {
        stats: {}
    },

    onShow() {
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

    goLogout() {
        adminLogout()
        wx.redirectTo({ url: '/pages-admin/login/login' })
    }
})

