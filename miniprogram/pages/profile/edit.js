// pages/profile/edit.js - 资料编辑
const { get, put, requireUserLogin } = require('../../utils/request')
const { navigateAfterLogin } = require('../../utils/user-page')
const { normalizeImageUrl } = require('../../utils/image')

Page({
    data: {
        form: {
            nickname: '',
            avatar: '',
            phone: '',
            real_name: '',
            id_card: '',
            gender: 0
        },
        genderOptions: ['未知', '男', '女'],
        returnTo: '',
        avatarPreview: '/images/tab-mine.png',
        uploading: false
    },

    async onLoad(options) {
        this.setData({ returnTo: options.returnTo || '' })
        try {
            await requireUserLogin()
            await this.loadProfile()
        } catch (e) {
            wx.navigateBack()
        }
    },

    async loadProfile() {
        try {
            const data = await get('/users/me/')
            const nextForm = { ...this.data.form, ...data }
            this.setData({
                form: nextForm,
                avatarPreview: normalizeImageUrl(nextForm.avatar)
            })
        } catch (e) {}
    },

    async onChooseAvatar() {
        if (this.data.uploading) {
            return
        }

        try {
            const filePath = await new Promise((resolve, reject) => {
                wx.chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera'],
                    success: (res) => {
                        const tempFilePath = (res.tempFilePaths && res.tempFilePaths[0]) || ''
                        if (!tempFilePath) {
                            reject(new Error('empty file path'))
                            return
                        }
                        resolve(tempFilePath)
                    },
                    fail: reject
                })
            })
            if (!filePath) {
                return
            }
            await this.uploadAvatar(filePath)
        } catch (e) {}
    },

    uploadAvatar(filePath) {
        const app = getApp()
        const token = wx.getStorageSync('token')
        this.setData({ uploading: true })

        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url: `${app.globalData.baseUrl}/users/upload/`,
                filePath,
                name: 'file',
                header: {
                    Authorization: token ? `Bearer ${token}` : ''
                },
                success: (res) => {
                    let body = {}
                    try {
                        body = JSON.parse(res.data || '{}')
                    } catch (err) {
                        wx.showToast({ title: '上传失败', icon: 'none' })
                        reject(err)
                        return
                    }

                    if (res.statusCode !== 200 || body.code !== 200 || !body.data || !body.data.url) {
                        wx.showToast({ title: (body && body.message) || '上传失败', icon: 'none' })
                        reject(body)
                        return
                    }

                    const avatar = body.data.url
                    this.setData({
                        form: { ...this.data.form, avatar },
                        avatarPreview: normalizeImageUrl(avatar)
                    })
                    wx.showToast({ title: '上传成功', icon: 'success' })
                    resolve(avatar)
                },
                fail: (err) => {
                    wx.showToast({ title: '上传失败', icon: 'none' })
                    reject(err)
                },
                complete: () => {
                    this.setData({ uploading: false })
                }
            })
        })
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({ form: { ...this.data.form, [field]: e.detail.value } })
    },

    onGenderChange(e) {
        this.setData({ form: { ...this.data.form, gender: parseInt(e.detail.value, 10) } })
    },

    async onSubmit() {
        try {
            const data = await put('/users/me/', this.data.form)
            const oldUserInfo = wx.getStorageSync('userInfo') || {}
            const nextUserInfo = { ...oldUserInfo, ...data }
            wx.setStorageSync('userInfo', nextUserInfo)
            const app = getApp()
            app.globalData.userInfo = nextUserInfo
            this.setData({ avatarPreview: normalizeImageUrl(nextUserInfo.avatar) })
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
