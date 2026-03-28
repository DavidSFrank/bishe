// pages/packages/list.js - 套餐列表页
Page({
    data: { packages: [], loading: true, categories: [], currentCategory: 0, keyword: '' },
    onLoad(options) {
        if (options.categoryId) this.setData({ currentCategory: parseInt(options.categoryId) })
        if (options.keyword) this.setData({ keyword: options.keyword })
        this.loadPackages()
    },
    async loadPackages() {
        const { get } = require('../../utils/request')
        try {
            const query = []
            if (this.data.currentCategory) query.push(`category=${this.data.currentCategory}`)
            if (this.data.keyword) query.push(`search=${encodeURIComponent(this.data.keyword)}`)
            const params = query.length ? `?${query.join('&')}` : ''
            const packages = await get('/packages/' + params)
            this.setData({ packages: packages.list || packages, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onSearch(e) { this.setData({ keyword: e.detail.value }) },
    onSearchConfirm() { this.loadPackages() },
    onPackageTap(e) { wx.navigateTo({ url: `/pages/packages/detail?id=${e.currentTarget.dataset.id}` }) }
})
