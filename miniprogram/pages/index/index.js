// pages/index/index.js - 首页
const { get } = require('../../utils/request')
const { normalizeImageUrl } = require('../../utils/image')

const CATEGORY_EMOJI_FALLBACKS = ['🫀', '👨', '👩', '👴', '👶', '💪', '🧬', '🩺']
const PACKAGE_LIST_FILTER_KEY = 'package_list_filter_intent'

Page({
    data: {
        banners: [],
        categories: [],
        hotPackages: [],
        loading: true
    },

    onLoad() {
        this.loadData()
    },

    onPullDownRefresh() {
        this.loadData().finally(() => {
            wx.stopPullDownRefresh()
        })
    },

    async loadData() {
        try {
            const [banners, categories, packages] = await Promise.all([
                get('/articles/banners/'),
                get('/packages/categories/'),
                get('/packages/?is_hot=true&page_size=6')
            ])

            const bannerList = Array.isArray(banners && banners.list) ? banners.list : (Array.isArray(banners) ? banners : [])
            const categoryList = Array.isArray(categories && categories.list) ? categories.list : (Array.isArray(categories) ? categories : [])
            const packageList = Array.isArray(packages && packages.list) ? packages.list : (Array.isArray(packages) ? packages : [])

            this.setData({
                banners: bannerList.map((item) => ({ ...item, displayImage: normalizeImageUrl(item.image) })),
                categories: categoryList.map((item, index) => ({
                    ...item,
                    displayIcon: item.icon || CATEGORY_EMOJI_FALLBACKS[index % CATEGORY_EMOJI_FALLBACKS.length]
                })),
                hotPackages: packageList.map((item) => ({ ...item, displayImage: normalizeImageUrl(item.image) })),
                loading: false
            })
        } catch (error) {
            console.error('加载首页数据失败:', error)
            this.setData({ loading: false })
        }
    },

    onSearchTap() {
        wx.navigateTo({ url: '/pages/packages/list?search=1' })
    },

    onCategoryTap(e) {
        const { id, name } = e.currentTarget.dataset
        const categoryId = Number(id) || 0
        wx.setStorageSync(PACKAGE_LIST_FILTER_KEY, {
            categoryId,
            categoryName: name || '',
            from: 'index',
            ts: Date.now()
        })
        wx.switchTab({ url: '/pages/packages/list' })
    },

    onPackageTap(e) {
        const { id } = e.currentTarget.dataset
        wx.navigateTo({ url: `/pages/packages/detail?id=${id}` })
    }
})
