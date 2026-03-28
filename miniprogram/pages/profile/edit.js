// pages/profile/edit.js - 资料编辑
Page({
    data: {
        form: { nickname: '', phone: '', real_name: '', id_card: '', gender: 0 },
        genderOptions: ['未知', '男', '女']
    },
    onShow() { this.loadProfile() },
    async loadProfile() {
        const { get } = require('../../utils/request')
        try {
            const data = await get('/users/me/')
            this.setData({ form: { ...this.data.form, ...data } })
        } catch (e) {}
    },
    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({ form: { ...this.data.form, [field]: e.detail.value } })
    },
    onGenderChange(e) {
        this.setData({ form: { ...this.data.form, gender: parseInt(e.detail.value) } })
    },
    async onSubmit() {
        const { put } = require('../../utils/request')
        try {
            const data = await put('/users/me/', this.data.form)
            wx.setStorageSync('userInfo', data)
            const app = getApp()
            app.globalData.userInfo = data
            wx.showToast({ title: '保存成功', icon: 'success' })
        } catch (e) {}
    }
})
