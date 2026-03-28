// pages/consultation/create.js - 提交咨询
Page({
    data: { content: '' },
    onInput(e) { this.setData({ content: e.detail.value }) },
    async onSubmit() {
        if (!this.data.content.trim()) {
            wx.showToast({ title: '请输入咨询内容', icon: 'none' })
            return
        }
        const { post } = require('../../utils/request')
        try {
            await post('/articles/consultations/', { content: this.data.content })
            wx.showToast({ title: '提交成功', icon: 'success' })
            wx.navigateBack()
        } catch (e) {}
    }
})
