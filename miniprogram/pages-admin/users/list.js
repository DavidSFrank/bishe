const { fetchUsers, updateUser } = require('../../services/admin/users')
const { ensureAdminSession } = require('../../utils/admin-page')

const PAGE_SIZE = 10

Page({
    data: {
        loading: false,
        loadingMore: false,
        list: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        hasMore: true,
        keyword: '',
        statusFilter: '',
        statusOptions: [
            { label: '全部', value: '' },
            { label: '正常', value: '1' },
            { label: '禁用', value: '0' }
        ]
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

    async loadData(reset = false) {
        const page = reset ? 1 : this.data.page
        const loadingKey = reset ? 'loading' : 'loadingMore'
        if (this.data[loadingKey]) {
            return
        }

        this.setData({ [loadingKey]: true })
        try {
            const params = { page, page_size: this.data.pageSize }
            if (this.data.keyword) {
                params.search = this.data.keyword
            }
            if (this.data.statusFilter !== '') {
                params.is_active = this.data.statusFilter === '1'
            }

            const data = await fetchUsers(params)
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
            console.error('load users failed', err)
        } finally {
            this.setData({ [loadingKey]: false })
            if (reset) {
                wx.stopPullDownRefresh()
            }
        }
    },

    onKeywordInput(e) {
        this.setData({ keyword: (e.detail.value || '').trim() })
    },

    onSearch() {
        this.setData({ loading: true })
        this.loadData(true)
    },

    onReset() {
        this.setData({ keyword: '', statusFilter: '', loading: true })
        this.loadData(true)
    },

    onStatusChange(e) {
        const value = e.currentTarget.dataset.value
        if (value === this.data.statusFilter) {
            return
        }
        this.setData({ statusFilter: value, loading: true })
        this.loadData(true)
    },

    onToggleActive(e) {
        const id = e.currentTarget.dataset.id
        const active = !!e.currentTarget.dataset.active
        if (!id) {
            return
        }

        wx.showModal({
            title: active ? '禁用用户' : '启用用户',
            content: active ? '确认禁用该用户吗？' : '确认启用该用户吗？',
            success: async ({ confirm }) => {
                if (!confirm) {
                    return
                }
                try {
                    await updateUser(id, { is_active: !active })
                    wx.showToast({ title: !active ? '已启用' : '已禁用', icon: 'success' })
                    this.loadData(true)
                } catch (err) {
                    console.error('toggle user active failed', err)
                }
            }
        })
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})

