// pages/articles/list.js - 健康常识列表
const { get } = require('../../utils/request')
const { ARTICLE_TEXTS } = require('./constants')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: { articles: [], loading: true, texts: ARTICLE_TEXTS },
    onShow() { this.loadData() },
    async loadData() {
        try {
            const data = await get('/articles/')
            const list = Array.isArray(data && data.list) ? data.list : (Array.isArray(data) ? data : [])
            const normalized = list.map((item) => ({
                ...item,
                displayCover: normalizeImageUrl(item.cover_image)
            }))
            this.setData({ articles: normalized, loading: false })
        } catch (e) {
            this.setData({ loading: false })
            wx.showToast({ title: ARTICLE_TEXTS.listLoadFailed, icon: 'none' })
        }
    },
    onDetail(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            wx.showToast({ title: ARTICLE_TEXTS.invalidArticle, icon: 'none' })
            return
        }
        wx.navigateTo({ url: `/pages/articles/detail?id=${id}` })
    }
})
