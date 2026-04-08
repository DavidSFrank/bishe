// pages/index/index.js - 首页
const { get } = require('../../utils/request')
const { normalizeImageUrl } = require('../../utils/image')

const CATEGORY_EMOJI_FALLBACKS = ['🫀', '👨', '👩', '👴', '👶', '💪', '🧬', '🩺']

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
        this.loadData().then(() => {
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
            const normalizedBanners = bannerList.filter(Boolean).map((item) => ({
                ...item,
                displayImage: normalizeImageUrl(item.image)
            }))
            const categoryList = Array.isArray(categories && categories.list) ? categories.list : (Array.isArray(categories) ? categories : [])
            const normalizedCategories = categoryList.filter(Boolean).map((item, index) => ({
                ...item,
                displayIcon: item.icon || CATEGORY_EMOJI_FALLBACKS[index % CATEGORY_EMOJI_FALLBACKS.length]
            }))
            const rawPackages = packages.list || packages || []
            const normalizedPackages = (Array.isArray(rawPackages) ? rawPackages : []).filter(Boolean).map((item) => ({
                ...item,
                displayImage: normalizeImageUrl(item.image)
            }))

            this.setData({
                banners: normalizedBanners,
                categories: normalizedCategories,
                hotPackages: normalizedPackages,
                loading: false
            })
        } catch (error) {
            console.error('加载数据失败:', error)
            this.setData({ loading: false })
        }
    },

    // 搜索
    onSearchTap() {
        wx.navigateTo({ url: '/pages/packages/list?search=1' })
    },

    // 点击分类
    onCategoryTap(e) {
        const { id, name } = e.currentTarget.dataset
        wx.navigateTo({ url: `/pages/packages/list?categoryId=${id}&categoryName=${name}` })
    },

    // 点击套餐
    onPackageTap(e) {
        const { id } = e.currentTarget.dataset
        wx.navigateTo({ url: `/pages/packages/detail?id=${id}` })
    }
})
