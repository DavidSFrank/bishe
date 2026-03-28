// pages/index/index.js - 首页
const app = getApp()
const { get } = require('../../utils/request')

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

            this.setData({
                banners,
                categories,
                hotPackages: packages.list || packages,
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
