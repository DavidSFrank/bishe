const { ensureAdminSession } = require('../../utils/admin-page')
const { adminLogout } = require('../../services/admin/auth')
const { fetchAdminProfile, updateAdminProfile } = require('../../services/admin/profile')
const { getAdminToken, setAdminSession } = require('../../utils/admin-auth')

Page({
    data: {
        loading: false,
        submitLoading: false,
        form: {
            name: '',
            old_password: '',
            new_password: ''
        },
        profile: {}
    },

    onShow() {
        if (!ensureAdminSession(this)) {
            return
        }
        this.loadProfile()
    },

    async loadProfile() {
        this.setData({ loading: true })
        try {
            const profile = await fetchAdminProfile()
            this.setData({
                profile,
                'form.name': profile.name || ''
            })
        } catch (err) {
            console.error('load admin profile failed', err)
        } finally {
            this.setData({ loading: false })
        }
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({ [`form.${field}`]: e.detail.value })
    },

    async onSubmit() {
        if (this.data.submitLoading) {
            return
        }

        const payload = {
            name: this.data.form.name
        }
        if (this.data.form.new_password) {
            if (!this.data.form.old_password) {
                wx.showToast({ title: '请输入原密码', icon: 'none' })
                return
            }
            payload.old_password = this.data.form.old_password
            payload.new_password = this.data.form.new_password
        }

        this.setData({ submitLoading: true })
        try {
            const profile = await updateAdminProfile(payload)
            setAdminSession(getAdminToken(), profile)
            wx.showToast({ title: '保存成功', icon: 'success' })
            this.setData({
                profile,
                'form.old_password': '',
                'form.new_password': ''
            })
        } catch (err) {
            console.error('update admin profile failed', err)
        } finally {
            this.setData({ submitLoading: false })
        }
    },

    onLogout() {
        adminLogout()
        wx.redirectTo({ url: '/pages-admin/login/login' })
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})


