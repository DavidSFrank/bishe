// pages/profile/edit.js - 资料编辑
const { get, put, requireUserLogin } = require('../../utils/request')
const { navigateAfterLogin } = require('../../utils/user-page')

Page({
    data: {
        form: { nickname: '', phone: '', real_name: '', id_card: '', gender: 0 },
        genderOptions: ['未知', '男', '女'],
        returnTo: ''
    },
    onLoad(options) {
        this.setData({ returnTo: options.returnTo || '' })
    },
    onShow() { this.preparePage() },
    async preparePage() {
        try {
            await requireUserLogin()
            this.loadProfile()
        } catch (e) {
            wx.navigateBack()
        }
    },
    async loadProfile() {
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
        try {
            const data = await put('/users/me/', this.data.form)
            const app = getApp()
            const oldUserInfo = wx.getStorageSync('userInfo') || {}
            const nextUserInfo = { ...oldUserInfo, ...data }
            wx.setStorageSync('userInfo', nextUserInfo)
            app.globalData.userInfo = nextUserInfo
            wx.showToast({ title: '保存成功', icon: 'success' })
            setTimeout(() => {
                const returnTo = decodeURIComponent(this.data.returnTo || '')
                if (returnTo) {
                    navigateAfterLogin(returnTo)
                    return
                }
                wx.navigateBack()
            }, 300)
        } catch (e) {}
    }
})
