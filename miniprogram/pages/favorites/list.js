// pages/favorites/list.js - 收藏列表
const { get, del } = require('../../utils/request')
const { ensureUserSession } = require('../../utils/user-page')
const { normalizeImageUrl } = require('../../utils/image')
Page({
    data: { favorites: [], loading: true, removingId: null },
    async onShow() {
        const passed = await ensureUserSession()
        if (!passed) {
            return
        }
        this.loadData()
    },
    async loadData() {
        try {
            const data = await get('/users/favorites/')
            this.setData({ favorites: data.list || data, loading: false })
            const list = data.list || data || []
            const normalized = (Array.isArray(list) ? list : []).map((item) => ({
                ...item,
                package_info: {
                    ...(item.package_info || {}),
                    displayImage: normalizeImageUrl(item.package_info && item.package_info.image)
                }
            }))
            this.setData({ favorites: normalized, loading: false })
            this.setData({ favorites: next })
        } catch (e) {
        } finally {
            this.setData({ removingId: null })
        }
    },
    onPackageTap(e) {
        wx.navigateTo({ url: `/pages/packages/detail?id=${e.currentTarget.dataset.id}` })
    }
})
