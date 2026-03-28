// pages/articles/list.js - 健康常识列表
Page({
    data: { articles: [], loading: true },
    onShow() { this.loadData() },
    async loadData() {
        const { get } = require('../../utils/request')
        try {
            const data = await get('/articles/')
            this.setData({ articles: data.list || data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onDetail(e) {
        wx.navigateTo({ url: `/pages/articles/detail?id=${e.currentTarget.dataset.id}` })
    }
})
