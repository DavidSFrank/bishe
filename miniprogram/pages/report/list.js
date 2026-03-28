// pages/report/list.js
Page({
    data: { reports: [], loading: true },
    onShow() { this.loadData() },
    async loadData() {
        const { get } = require('../../utils/request')
        try {
            const data = await get('/reports/my/')
            this.setData({ reports: data.list || data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onDetail(e) { wx.navigateTo({ url: `/pages/report/detail?id=${e.currentTarget.dataset.id}` }) }
})
