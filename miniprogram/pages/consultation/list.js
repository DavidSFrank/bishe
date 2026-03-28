// pages/consultation/list.js - 在线咨询列表
Page({
    data: { consultations: [], loading: true, statusMap: { 0: '待回复', 1: '已回复' } },
    onShow() { this.loadData() },
    async loadData() {
        const { get } = require('../../utils/request')
        try {
            const data = await get('/articles/consultations/')
            this.setData({ consultations: data.list || data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onCreate() { wx.navigateTo({ url: '/pages/consultation/create' }) }
})
