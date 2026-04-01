const {
    fetchConsultations,
    replyConsultation,
    deleteConsultation
} = require('../../services/admin/consultations')
const { ensureAdminSession } = require('../../utils/admin-page')

const PAGE_SIZE = 10

const STATUS_MAP = {
    0: '待回复',
    1: '已回复'
}

const STATUS_OPTIONS = [
    { label: '全部', value: '' },
    { label: '待回复', value: 0 },
    { label: '已回复', value: 1 }
]

function promptReply(defaultValue = '') {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title: '回复咨询',
            editable: true,
            placeholderText: '请输入回复内容',
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
        actionLoading: false,
        list: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        hasMore: true,
        statusMap: STATUS_MAP,
        statusOptions: STATUS_OPTIONS,
        statusIndex: 0
    },

    onShow() {
        if (!ensureAdminSession(this)) {
            return
        }
        this.loadData(true)
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

    onStatusChange(e) {
        this.setData({ statusIndex: Number(e.detail.value || 0) })
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
            const selected = this.data.statusOptions[this.data.statusIndex]
            const params = { page, page_size: this.data.pageSize }
            if (selected && selected.value !== '') {
                params.status = selected.value
            }

            const data = await fetchConsultations(params)
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
            console.error('load consultations failed', err)
        } finally {
            this.setData({ [loadingKey]: false })
            if (reset) {
                wx.stopPullDownRefresh()
            }
        }
    },

    async onReply(e) {
        const id = e.currentTarget.dataset.id
        const currentReply = e.currentTarget.dataset.reply || ''
        if (!id || this.data.actionLoading) {
            return
        }

        try {
            const reply = await promptReply(currentReply)
            if (!reply) {
                wx.showToast({ title: '回复内容不能为空', icon: 'none' })
                return
            }
            this.setData({ actionLoading: true })
            await replyConsultation(id, { reply })
            wx.showToast({ title: '回复成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('reply consultation failed', err)
            }
        } finally {
            this.setData({ actionLoading: false })
        }
    },

    onDelete(e) {
        const id = e.currentTarget.dataset.id
        if (!id || this.data.actionLoading) {
            return
        }

        wx.showModal({
            title: '删除咨询',
            content: '确认删除该咨询记录吗？',
            success: async ({ confirm }) => {
                if (!confirm) {
                    return
                }
                try {
                    this.setData({ actionLoading: true })
                    await deleteConsultation(id)
                    wx.showToast({ title: '删除成功', icon: 'success' })
                    this.loadData(true)
                } catch (err) {
                    console.error('delete consultation failed', err)
                } finally {
                    this.setData({ actionLoading: false })
                }
            }
        })
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})
