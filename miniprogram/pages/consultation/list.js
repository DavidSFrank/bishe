// pages/consultation/list.js - 在线咨询列表
const { get, del } = require('../../utils/request')
const { ensureUserSession } = require('../../utils/user-page')
const { CONSULTATION_TEXTS } = require('./constants')

Page({
    data: {
        consultations: [],
        loading: true,
        refreshing: false,
        removingId: null,
        statusMap: { 0: CONSULTATION_TEXTS.statusPending, 1: CONSULTATION_TEXTS.statusReplied }
    },
    async onShow() {
        const passed = await ensureUserSession()
        if (!passed) {
            return
        }
        this.loadData()
    },
    onPullDownRefresh() {
        this.loadData({ fromPullDown: true })
    },
    async loadData({ fromPullDown = false } = {}) {
        if (fromPullDown) {
            this.setData({ refreshing: true })
        }
        try {
            const data = await get('/articles/consultations/')
            this.setData({ consultations: data.list || data, loading: false })
        } catch (e) {
            this.setData({ loading: false })
        } finally {
            if (fromPullDown) {
                wx.stopPullDownRefresh()
                this.setData({ refreshing: false })
            }
        }
    },
    async onWithdraw(e) {
        const id = e.currentTarget.dataset.id
        if (this.data.removingId) {
            return
        }

        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: CONSULTATION_TEXTS.withdrawTitle,
                content: CONSULTATION_TEXTS.withdrawConfirmContent,
                success: (res) => resolve(!!res.confirm),
                fail: () => resolve(false)
            })
        })
        if (!confirmed) {
            return
        }

        try {
            this.setData({ removingId: id })
            await del(`/articles/consultations/${id}/`)
            wx.showToast({ title: CONSULTATION_TEXTS.withdrawSuccess, icon: 'success' })
            const next = this.data.consultations.filter((item) => item.id !== id)
            this.setData({ consultations: next })
        } catch (e) {
        } finally {
            this.setData({ removingId: null })
        }
    },
    onCreate() { wx.navigateTo({ url: '/pages/consultation/create' }) }
})
