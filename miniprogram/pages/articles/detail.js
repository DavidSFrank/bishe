// pages/articles/detail.js - 健康常识详情
Page({
    data: { article: null, loading: true },
    onLoad(options) { if (options.id) this.loadData(options.id) },
    async loadData(id) {
        const { get } = require('../../utils/request')
        try {
            const data = await get(`/articles/${id}/`)
            this.setData({ article: data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    }
})
