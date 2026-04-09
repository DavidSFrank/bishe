// pages/packages/detail.js
const { get, post, del, requireUserLogin } = require('../../utils/request')
const { PACKAGE_TEXTS } = require('./constants')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: {
        package: null,
        loading: true,
        isFavorite: false,
        favoriteId: null,
        operatingFavorite: false,
        emptyText: PACKAGE_TEXTS.invalidPackage
    },

    onLoad(options) {
        const id = options.id || ''
        if (!id) {
            this.setData({ loading: false, emptyText: PACKAGE_TEXTS.invalidPackage })
            return
        }
        this.targetId = id
        this.loadPackage(id)
    },

    async loadPackage(id) {
        try {
            const pkg = await get(`/packages/${id}/`)
            this.setData({
                package: { ...pkg, displayImage: normalizeImageUrl(pkg.image) },
                loading: false
            })
            await this.loadFavoriteStatus()
        } catch (e) {
            this.setData({ loading: false, emptyText: PACKAGE_TEXTS.detailLoadFailed })
        }
    },

    async loadFavoriteStatus() {
        if (!this.data.package) {
            return
        }
        try {
            await requireUserLogin({ silent: true })
            const data = await get('/users/favorites/', { package: this.data.package.id })
            const list = Array.isArray(data && data.list) ? data.list : (Array.isArray(data) ? data : [])
            if (list.length > 0) {
                this.setData({ isFavorite: true, favoriteId: list[0].id })
            } else {
                this.setData({ isFavorite: false, favoriteId: null })
            }
        } catch (e) {
            this.setData({ isFavorite: false, favoriteId: null })
        }
    },

    async onToggleFavorite() {
        if (!this.data.package || this.data.operatingFavorite) {
            return
        }
        this.setData({ operatingFavorite: true })
        try {
            await requireUserLogin()
            if (this.data.isFavorite && this.data.favoriteId) {
                await del(`/users/favorites/${this.data.favoriteId}/`)
                this.setData({ isFavorite: false, favoriteId: null })
                wx.showToast({ title: PACKAGE_TEXTS.favoriteRemoved, icon: 'success' })
            } else {
                const fav = await post('/users/favorites/', { package: this.data.package.id })
                this.setData({ isFavorite: true, favoriteId: fav.id })
                wx.showToast({ title: PACKAGE_TEXTS.favoriteAdded, icon: 'success' })
            }
        } catch (e) {
        } finally {
            this.setData({ operatingFavorite: false })
        }
    },

    onAppointment() {
        if (!this.data.package) {
            return
        }
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
                url: `/pages/appointment/create?packageId=${this.data.package.id}&packageName=${encodeURIComponent(this.data.package.name || '')}&price=${this.data.package.price || 0}`
            })
        }).catch(() => {})
    }
})
