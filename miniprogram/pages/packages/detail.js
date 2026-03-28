// pages/packages/detail.js
Page({
    data: { package: null, loading: true, isFavorite: false, favoriteId: null },
    onLoad(options) { if (options.id) this.loadPackage(options.id) },
    async loadPackage(id) {
        const { get } = require('../../utils/request')
        try {
            const pkg = await get(`/packages/${id}/`)
            this.setData({ package: pkg, loading: false })
            this.checkFavorite(pkg.id)
        } catch (e) { this.setData({ loading: false }) }
    },
    async checkFavorite(packageId) {
        const { get } = require('../../utils/request')
        try {
            const data = await get(`/users/favorites/?package=${packageId}`)
            const list = data.list || data
            if (list.length > 0) {
                this.setData({ isFavorite: true, favoriteId: list[0].id })
            } else {
                this.setData({ isFavorite: false, favoriteId: null })
            }
        } catch (e) {}
    },
    async onToggleFavorite() {
        if (!this.data.package) return
        const { post, del } = require('../../utils/request')
        try {
            if (this.data.isFavorite && this.data.favoriteId) {
                await del(`/users/favorites/${this.data.favoriteId}/`)
                wx.showToast({ title: '已取消收藏', icon: 'success' })
                this.setData({ isFavorite: false, favoriteId: null })
            } else {
                const fav = await post('/users/favorites/', { package: this.data.package.id })
                wx.showToast({ title: '已收藏', icon: 'success' })
                this.setData({ isFavorite: true, favoriteId: fav.id })
            }
        } catch (e) {}
    },
    onAppointment() {
        if (!this.data.package) return
        wx.navigateTo({ url: `/pages/appointment/create?packageId=${this.data.package.id}&packageName=${this.data.package.name}&price=${this.data.package.price}` })
    }
})
