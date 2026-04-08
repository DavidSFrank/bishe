// pages/consultation/create.js - 提交咨询
const { post } = require('../../utils/request')
const { ensureUserSession } = require('../../utils/user-page')
const { CONSULTATION_TEXTS } = require('./constants')

Page({
    data: { content: '' },
    async onShow() {
        const passed = await ensureUserSession()
        if (!passed) {
            return
        }
    },
    onInput(e) { this.setData({ content: e.detail.value }) },
    async onSubmit() {
        if (!this.data.content.trim()) {
            wx.showToast({ title: CONSULTATION_TEXTS.emptyContent, icon: 'none' })
            return
        }
        try {
            await post('/articles/consultations/', { content: this.data.content })
            wx.showToast({ title: CONSULTATION_TEXTS.submitSuccess, icon: 'success' })
            wx.navigateBack()
        } catch (e) {}
    }
})
