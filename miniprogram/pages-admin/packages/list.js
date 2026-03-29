const { clearAdminSession } = require('../../utils/admin-auth')
const { fetchPackages } = require('../../services/admin/packages')

Page({
    data: {
        loading: false,
        list: []
    },

    onShow() {
        this.loadData()
    },

    async loadData() {
        this.setData({ loading: true })
        try {
            const data = await fetchPackages({ page: 1, page_size: 20 })
            this.setData({ list: data.list || [] })
        } catch (err) {
            console.error('load admin packages failed', err)
        } finally {
            this.setData({ loading: false })
        }
    },

    goLogin() {
        clearAdminSession()
        wx.redirectTo({ url: '/pages-admin/login/login' })
    },

    goDashboard() {
        wx.redirectTo({ url: '/pages-admin/dashboard/index' })
    },

    goAppointments() {
        wx.navigateTo({ url: '/pages-admin/appointments/list' })
    },
})
