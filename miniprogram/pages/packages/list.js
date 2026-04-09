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

    async onLoad(options) {
        if (options.categoryId) {
            this.setData({ currentCategory: parseInt(options.categoryId, 10) || 0 })
        }
        await this.loadCategories()
        await this.loadPackages()
    },

    onShow() {
        if (this._loadedOnce) {
            this.loadCategories().then(() => this.loadPackages())
            return
        }
        this._loadedOnce = true
    },

    async onPullDownRefresh() {
        try {
            await this.loadCategories()
            await this.loadPackages()
        } finally {
            wx.stopPullDownRefresh()
        }
    },

    async loadCategories() {
        try {
            const data = await get('/packages/categories/')
            const list = Array.isArray(data && data.list) ? data.list : (Array.isArray(data) ? data : [])
            const normalized = list.map((item) => ({
                ...item,
                id: Number(item.id)
            }))
            const categories = [{ id: 0, name: '全部' }].concat(normalized)
            const currentCategory = Number(this.data.currentCategory || 0)
            const categoryExists = categories.some((item) => item.id === currentCategory)
            this.setData({
                categories,
                currentCategory: categoryExists ? currentCategory : 0
            })
        } catch (e) {}
    },

    async loadPackages() {
        const reqId = (this._packagesReqId || 0) + 1
        this._packagesReqId = reqId

        this.setData({ loading: true })
        try {
            const query = []
            if (this.data.currentCategory) query.push(`category=${this.data.currentCategory}`)
            if (this.data.keyword) query.push(`search=${encodeURIComponent(this.data.keyword)}`)
            const params = query.length ? `?${query.join('&')}` : ''
            const data = await get('/packages/' + params)
            if (reqId !== this._packagesReqId) {
                return
            }
            const list = Array.isArray(data && data.list) ? data.list : (Array.isArray(data) ? data : [])
            const normalized = list.map((item) => ({
                ...item,
                displayImage: normalizeImageUrl(item.image)
            }))
            this.setData({ packages: normalized, loading: false })
        } catch (e) {
            if (reqId !== this._packagesReqId) {
                return
            }
            this.setData({ loading: false })
            wx.showToast({ title: PACKAGE_TEXTS.listLoadFailed, icon: 'none' })
        }
    },

    onCategoryChange(e) {
        const categoryId = Number(e.currentTarget.dataset.id || 0)
        if (categoryId === this.data.currentCategory) {
            return
        }
        this.setData({ currentCategory: categoryId })
        this.loadPackages()
    },

    onSearch(e) {
        this.setData({ keyword: e.detail.value })
    },

    onSearchConfirm() {
        this.loadPackages()
    },

    onPackageTap(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            wx.showToast({ title: PACKAGE_TEXTS.invalidPackage, icon: 'none' })
            return
        }
        wx.navigateTo({ url: `/pages/packages/detail?id=${id}` })
    }
})
