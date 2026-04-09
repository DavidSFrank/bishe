// pages/packages/list.js - 套餐列表页
const { get } = require('../../utils/request')
const { PACKAGE_TEXTS } = require('./constants')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: {
        packages: [],
        loading: true,
        categories: [{ id: 0, name: '全部' }],
        currentCategory: 0,
        keyword: '',
        texts: PACKAGE_TEXTS
    },
    onLoad(options) {
        if (options.categoryId) this.setData({ currentCategory: parseInt(options.categoryId, 10) || 0 })
        if (options.keyword) this.setData({ keyword: options.keyword })
        this.loadCategories()
        this.loadPackages()
    },
    onShow() {
        if (this._loadedOnce) {
            this.loadPackages()
        }
        this._loadedOnce = true
    },
    onPullDownRefresh() {
        Promise.all([this.loadCategories(), this.loadPackages()]).finally(() => {
            wx.stopPullDownRefresh()
        })
    },
    async loadCategories() {
        try {
            const data = await get('/packages/categories/')
            const list = Array.isArray(data && data.list) ? data.list : (Array.isArray(data) ? data : [])
            this.setData({ categories: [{ id: 0, name: '全部' }].concat(list) })
        } catch (e) {}
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
    onCategoryChange(e) {
        const categoryId = Number(e.currentTarget.dataset.id || 0)
        if (categoryId === this.data.currentCategory) {
            return
        }
        this.setData({ currentCategory: categoryId, loading: true })
        this.loadPackages()
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
