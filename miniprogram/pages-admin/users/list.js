const { fetchUsers } = require('../../services/admin/users')
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
        hasMore: true
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
            const data = await fetchUsers({ page, page_size: this.data.pageSize })
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

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})

