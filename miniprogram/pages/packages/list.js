// pages/packages/list.js - 套餐列表页
const { get } = require('../../utils/request')
const { PACKAGE_TEXTS } = require('./constants')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: { packages: [], loading: true, categories: [], currentCategory: 0, keyword: '', texts: PACKAGE_TEXTS },
    onLoad(options) {
        if (options.categoryId) this.setData({ currentCategory: parseInt(options.categoryId) })
        if (options.keyword) this.setData({ keyword: options.keyword })
        this.loadPackages()
    },
    onShow() {
        if (this._loadedOnce) {
            this.loadPackages()
        }
        this._loadedOnce = true
    },
    onPullDownRefresh() {
        this.loadPackages().finally(() => {
            wx.stopPullDownRefresh()
        })
    },
    async loadPackages() {
        try {
            const query = []
            if (this.data.currentCategory) query.push(`category=${this.data.currentCategory}`)
            if (this.data.keyword) query.push(`search=${encodeURIComponent(this.data.keyword)}`)
            const params = query.length ? `?${query.join('&')}` : ''
            const packages = await get('/packages/' + params)
            const list = Array.isArray(packages && packages.list) ? packages.list : (Array.isArray(packages) ? packages : [])
            const normalized = list.map((item) => ({
                ...item,
                displayImage: normalizeImageUrl(item.image)
            }))
            this.setData({ packages: normalized, loading: false })
        } catch (e) {
            this.setData({ loading: false })
            wx.showToast({ title: PACKAGE_TEXTS.listLoadFailed, icon: 'none' })
        }
    },
    onSearch(e) { this.setData({ keyword: e.detail.value }) },
    onSearchConfirm() { this.loadPackages() },
    onPackageTap(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            wx.showToast({ title: PACKAGE_TEXTS.invalidPackage, icon: 'none' })
            return
        }
        wx.navigateTo({ url: `/pages/packages/detail?id=${id}` })
    }
})
