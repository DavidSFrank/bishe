// pages/favorites/list.js - 收藏列表
Page({
    data: { favorites: [], loading: true },
    onShow() { this.loadData() },
    async loadData() {
        const { get } = require('../../utils/request')
        try {
            const data = await get('/users/favorites/')
            this.setData({ favorites: data.list || data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onPackageTap(e) {
        wx.navigateTo({ url: `/pages/packages/detail?id=${e.currentTarget.dataset.id}` })
    }
})
