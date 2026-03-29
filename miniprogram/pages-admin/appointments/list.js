const { fetchAppointments, updateAppointmentStatus } = require('../../services/admin/appointments')

const STATUS_OPTIONS = [
    { label: '全部', value: '' },
    { label: '待审核', value: 0 },
    { label: '已确认', value: 1 },
    { label: '已完成', value: 2 },
    { label: '已取消', value: 3 },
    { label: '已拒绝', value: 4 }
]

const STATUS_MAP = {
    0: '待审核',
    1: '已确认',
    2: '已完成',
    3: '已取消',
    4: '已拒绝'
}

Page({
    data: {
        loading: false,
        list: [],
        statusOptions: STATUS_OPTIONS,
        statusMap: STATUS_MAP,
        statusIndex: 0
    },

    onShow() {
        this.loadData()
    },

    onStatusChange(e) {
        this.setData({ statusIndex: Number(e.detail.value) })
        this.loadData()
    },

    async loadData() {
        this.setData({ loading: true })
        try {
            const selected = this.data.statusOptions[this.data.statusIndex]
            const params = { page: 1, page_size: 20 }
            if (selected.value !== '') {
                params.status = selected.value
            }
            const data = await fetchAppointments(params)
            this.setData({ list: data.list || [] })
        } catch (err) {
            console.error('load appointments failed', err)
        } finally {
            this.setData({ loading: false })
        }
    },

    async onApprove(e) {
        const id = e.currentTarget.dataset.id
        try {
            await updateAppointmentStatus(id, { status: 1 })
            wx.showToast({ title: '已确认', icon: 'success' })
            this.loadData()
        } catch (err) {
            console.error('approve appointment failed', err)
        }
    },

    onReject(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '拒绝预约',
            editable: true,
            placeholderText: '请输入拒绝原因',
            success: async ({ confirm, content }) => {
                if (!confirm) {
                    return
                }
                try {
                    await updateAppointmentStatus(id, {
                        status: 4,
                        reject_reason: content || '管理员拒绝'
                    })
                    wx.showToast({ title: '已拒绝', icon: 'success' })
                    this.loadData()
                } catch (err) {
                    console.error('reject appointment failed', err)
                }
            }
        })
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    },

    goPackages() {
        wx.navigateTo({ url: '/pages-admin/packages/list' })
    }
})

