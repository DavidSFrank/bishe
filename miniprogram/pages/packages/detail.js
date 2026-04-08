// pages/packages/detail.js
const { get, post, del, requireUserLogin } = require('../../utils/request')
const { PACKAGE_TEXTS } = require('./constants')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: { package: null, loading: true, isFavorite: false, favoriteId: null, operatingFavorite: false, emptyText: PACKAGE_TEXTS.invalidPackage },
    onLoad(options) {
        this.targetId = options.id || ''
        if (!this.targetId) {
            this.setData({ loading: false, emptyText: PACKAGE_TEXTS.invalidPackage })
            return
        }
        this.loadPackage(this.targetId)
    },
    async loadPackage(id) {
        try {
            const pkg = await get(`/packages/${id}/`)
            this.setData({ package: { ...pkg, displayImage: normalizeImageUrl(pkg.image) }, loading: false })
            if (wx.getStorageSync('token')) {
                this.checkFavorite(pkg.id)
            }
        } catch (e) {
            this.setData({ loading: false, emptyText: PACKAGE_TEXTS.detailLoadFailed })
        }
    },
    async checkFavorite(packageId) {
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
        if (this.data.operatingFavorite) return
        try {
            this.setData({ operatingFavorite: true })
            await requireUserLogin()
            if (this.data.isFavorite && this.data.favoriteId) {
                await del(`/users/favorites/${this.data.favoriteId}/`)
                wx.showToast({ title: PACKAGE_TEXTS.favoriteRemoved, icon: 'success' })
                this.setData({ isFavorite: false, favoriteId: null })
            } else {
                const fav = await post('/users/favorites/', { package: this.data.package.id })
                wx.showToast({ title: PACKAGE_TEXTS.favoriteAdded, icon: 'success' })
                this.setData({ isFavorite: true, favoriteId: fav.id })
            }
        } catch (e) {
        } finally {
            this.setData({ operatingFavorite: false })
        }
    },
    onAppointment() {
        if (!this.data.package) return
        requireUserLogin().then(async () => {
            let profile = null
            try {
                profile = await get('/users/me/')
            } catch (e) {}

            if (!profile || !profile.profile_completed) {
                wx.showToast({ title: PACKAGE_TEXTS.completeProfileFirst, icon: 'none' })
                const returnTo = encodeURIComponent(`/pages/packages/detail?id=${this.data.package.id}`)
                setTimeout(() => wx.navigateTo({ url: `/pages/profile/edit?returnTo=${returnTo}` }), 300)
                return
            }

            wx.navigateTo({
                url: `/pages/appointment/create?packageId=${this.data.package.id}&packageName=${this.data.package.name}&price=${this.data.package.price}`
            })
        }).catch(() => {})
    }
})
