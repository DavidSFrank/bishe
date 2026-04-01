// pages/consultation/list.js - 在线咨询列表
Page({
    data: { consultations: [], loading: true, refreshing: false, statusMap: { 0: '待回复', 1: '已回复' } },
    onShow() { this.loadData() },
    onPullDownRefresh() {
        this.loadData({ fromPullDown: true })
    },
    async loadData({ fromPullDown = false } = {}) {
        const { get } = require('../../utils/request')
        if (fromPullDown) {
            this.setData({ refreshing: true })
        }
        try {
            const data = await get('/articles/consultations/')
            this.setData({ consultations: data.list || data, loading: false })
        } catch (e) {
            this.setData({ loading: false })
        } finally {
            if (fromPullDown) {
                wx.stopPullDownRefresh()
                this.setData({ refreshing: false })
            }
        }
    },
    onCreate() { wx.navigateTo({ url: '/pages/consultation/create' }) }
})
