const { hasAdminSession } = require('../../utils/admin-auth')
const { adminLogin } = require('../../services/admin/auth')

Page({
    data: {
        loading: false,
        form: {
            username: '',
            password: ''
        }
    },

    onShow() {
        if (hasAdminSession()) {
            wx.redirectTo({ url: '/pages-admin/dashboard/index' })
        }
    },

    onInput(e) {
        const field = e.currentTarget.dataset.field
        this.setData({
            [`form.${field}`]: e.detail.value
        })
    },

    async onSubmit() {
        const { username, password } = this.data.form
        if (!username || !password) {
            wx.showToast({ title: '请输入账号密码', icon: 'none' })
            return
        }

        this.setData({ loading: true })
        try {
            await adminLogin({ username, password })
            wx.showToast({ title: '登录成功', icon: 'success' })
            wx.redirectTo({ url: '/pages-admin/dashboard/index' })
        } catch (err) {
            // 错误提示由 request 层统一处理
            console.error('admin login failed', err)
        } finally {
            this.setData({ loading: false })
        }
    }
})
