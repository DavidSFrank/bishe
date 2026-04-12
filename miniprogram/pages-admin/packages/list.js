const { clearAdminSession } = require('../../utils/admin-auth')
const { ensureAdminSession } = require('../../utils/admin-page')
const {
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage
} = require('../../services/admin/packages')

const PAGE_SIZE = 10

function promptText({ title, placeholder = '', defaultValue = '' }) {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title,
            editable: true,
            placeholderText: placeholder,
            content: defaultValue,
            success: res => {
                if (!res.confirm) {
                    reject(new Error('cancel'))
                    return
                }
                resolve((res.content || '').trim())
            },
            fail: reject
        })
    })
}

Page({
    data: {
        loading: false,
        loadingMore: false,
        list: [],
        page: 1,
        pageSize: PAGE_SIZE,
        total: 0,
        hasMore: true
    },

    onShow() {
        if (!ensureAdminSession(this)) {
            return
        }
        this.loadData(true)
    },

    async loadData(reset = false) {
        const page = reset ? 1 : this.data.page
        const loadingKey = reset ? 'loading' : 'loadingMore'
        if (this.data[loadingKey]) {
            return
        }

        this.setData({ [loadingKey]: true })
        try {
            const data = await fetchPackages({ page, page_size: this.data.pageSize })
            const incoming = data.list || []
            const nextList = reset ? incoming : this.data.list.concat(incoming)
            const total = Number(data.total || 0)
            this.setData({
                list: nextList,
                total,
                page: page + 1,
                hasMore: nextList.length < total
            })
        } catch (err) {
            console.error('load admin packages failed', err)
        } finally {
            this.setData({ [loadingKey]: false })
            if (reset) {
                wx.stopPullDownRefresh()
            }
        }
    },

    onPullDownRefresh() {
        this.loadData(true)
    },

    onReachBottom() {
        if (!this.data.hasMore) {
            return
        }
        this.loadData(false)
    },

    async onAdd() {
        try {
            const name = await promptText({ title: '新增套餐', placeholder: '请输入套餐名称' })
            if (!name) {
                wx.showToast({ title: '套餐名称不能为空', icon: 'none' })
                return
            }
            const priceText = await promptText({ title: '新增套餐', placeholder: '请输入价格，例如 199.00' })
            const price = Number(priceText)
            if (!Number.isFinite(price) || price < 0) {
                wx.showToast({ title: '价格格式不正确', icon: 'none' })
                return
            }
            await createPackage({ name, price, description: '' })
            wx.showToast({ title: '新增成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('create package failed', err)
            }
        }
    },

    async onEdit(e) {
        const id = e.currentTarget.dataset.id
        const currentName = e.currentTarget.dataset.name || ''
        if (!id) {
            return
        }
        try {
            const name = await promptText({
                title: '编辑套餐名称',
                placeholder: '请输入套餐名称',
                defaultValue: currentName
            })
            if (!name) {
                wx.showToast({ title: '套餐名称不能为空', icon: 'none' })
                return
            }
            await updatePackage(id, { name })
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('update package failed', err)
            }
        }
    },

    async onToggleHot(e) {
        const id = e.currentTarget.dataset.id
        const currentHot = Boolean(e.currentTarget.dataset.hot)
        if (!id) {
            return
        }
        try {
            await updatePackage(id, { is_hot: !currentHot })
            wx.showToast({ title: !currentHot ? '已设为热门' : '已取消热门', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            console.error('toggle package hot failed', err)
        }
    },

    onDelete(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            return
        }
        wx.showModal({
            title: '删除套餐',
            content: '删除后不可恢复，确认删除吗？',
            success: async ({ confirm }) => {
                if (!confirm) {
                    return
                }
                try {
                    await deletePackage(id)
                    wx.showToast({ title: '删除成功', icon: 'success' })
                    this.loadData(true)
                } catch (err) {
                    console.error('delete package failed', err)
                }
            }
        })
    },

    goLogin() {
        clearAdminSession()
        wx.redirectTo({ url: '/pages-admin/login/login' })
    },

    goDashboard() {
        wx.redirectTo({ url: '/pages-admin/dashboard/index' })
    },

    goAppointments() {
        wx.navigateTo({ url: '/pages-admin/appointments/list' })
    }
})
