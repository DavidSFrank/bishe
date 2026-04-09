// pages/articles/detail.js - 健康常识详情
const { get } = require('../../utils/request')
const { ARTICLE_TEXTS } = require('./constants')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: {
        article: null,
        loading: true,
        emptyText: ARTICLE_TEXTS.detailNotFound
    },

    onLoad(options) {
        const id = options.id || ''
        if (!id) {
            this.setData({ loading: false, emptyText: ARTICLE_TEXTS.detailNotFound })
            return
        }
        this.loadData(id)
    },

    async loadData(id) {
        if (this._loading) {
            return
        }
        this._loading = true
        try {
            const data = await get(`/articles/${id}/`)
            this.setData({
                article: { ...data, displayCover: normalizeImageUrl(data.cover_image) },
                loading: false
            })
        } catch (e) {
            this.setData({ loading: false, emptyText: ARTICLE_TEXTS.detailLoadFailed })
        } finally {
            this._loading = false
        }
    }
})
