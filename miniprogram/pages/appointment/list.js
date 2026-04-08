// pages/appointment/list.js
const { get, post } = require('../../utils/request')
const { ensureUserSession } = require('../../utils/user-page')
const { APPOINTMENT_TEXTS } = require('./constants')

const LIST_STATE_KEY_PREFIX = 'appointment_list_state'
const LIST_CACHE_TTL = 5 * 60 * 1000

Page({
    data: {
        appointments: [],
        loading: true,
        loadingMore: false,
        refreshing: false,
        cancelingId: null,
        errorText: '',
        page: 1,
        pageSize: 10,
        hasMore: true,
        scrollTop: 0,
        selectedStatus: '',
        statusFilters: [
            { label: '全部', value: '' },
            { label: '待审核', value: '0' },
            { label: '已确认', value: '1' },
            { label: '已完成', value: '2' },
            { label: '已取消', value: '3' },
            { label: '已拒绝', value: '4' }
        ],
        statusMap: { 0: '待审核', 1: '已确认', 2: '已完成', 3: '已取消', 4: '已拒绝' }
    },
    onLoad() {
        this.restoreListState()
    },
    async onShow() {
        const passed = await ensureUserSession()
        if (!passed) {
            return
        }

        if (this.data.appointments.length > 0) {
            this.loadData({ reset: true, silent: true })
            this.restoreScrollPosition()
            return
        }
        this.loadData({ reset: true })
    },
    onHide() {
        this.persistListState()
    },
    onUnload() {
        this.persistListState()
    },
    getListStateKey() {
        const userInfo = wx.getStorageSync('userInfo') || {}
        const uid = userInfo.id || userInfo.openid
        if (!uid) {
            return ''
        }
        return `${LIST_STATE_KEY_PREFIX}:${uid}`
    },
    getStatusBucketKey(status = '') {
        return status === '' ? '__all__' : String(status)
    },
    applyStatusCache(savedState, status) {
        const bucketKey = this.getStatusBucketKey(status)
        const statusCaches = (savedState && savedState.statusCaches) || {}
        const cache = statusCaches[bucketKey]
        if (!cache) {
            return false
        }

        const isFresh = cache.updatedAt && Date.now() - cache.updatedAt < LIST_CACHE_TTL
        if (!isFresh) {
            return false
        }

        this.setData({
            selectedStatus: status,
            appointments: cache.appointments || [],
            page: cache.page || 1,
            hasMore: typeof cache.hasMore === 'boolean' ? cache.hasMore : true,
            scrollTop: cache.scrollTop || 0,
            loading: false,
            errorText: ''
        })
        this._scrollTop = cache.scrollTop || 0
        return true
    },
    restoreListState() {
        const stateKey = this.getListStateKey()
        if (!stateKey) {
            return
        }

        const saved = wx.getStorageSync(stateKey)
        if (!saved) {
            return
        }
        const selectedStatus = typeof saved.selectedStatus === 'undefined' ? '' : saved.selectedStatus
        const restored = this.applyStatusCache(saved, selectedStatus)
        if (!restored) {
            this.setData({ selectedStatus })
        }
    },
    persistListState() {
        const stateKey = this.getListStateKey()
        if (!stateKey) {
            return
        }

        const saved = wx.getStorageSync(stateKey) || {}
        const statusCaches = saved.statusCaches || {}
        const latestScrollTop = typeof this._scrollTop === 'number' ? this._scrollTop : this.data.scrollTop
        const bucketKey = this.getStatusBucketKey(this.data.selectedStatus)
        statusCaches[bucketKey] = {
            appointments: this.data.appointments,
            page: this.data.page,
            hasMore: this.data.hasMore,
            scrollTop: latestScrollTop,
            updatedAt: Date.now()
        }

        wx.setStorageSync(stateKey, {
            selectedStatus: this.data.selectedStatus,
            statusCaches
        })
    },
    async loadData({ reset = false, fromPullDown = false, silent = false } = {}) {
        const page = reset ? 1 : this.data.page
        const pageSize = this.data.pageSize
        const statusQuery = this.data.selectedStatus === '' ? '' : `&status=${this.data.selectedStatus}`
        if (!reset && !this.data.hasMore) {
            return
        }

        this.setData({
            loading: reset && !silent,
            loadingMore: !reset,
            refreshing: fromPullDown,
            errorText: ''
        })

        try {
            const data = await get(`/appointments/my/?page=${page}&page_size=${pageSize}${statusQuery}`)
            const rows = data.list || data || []
            const merged = reset ? rows : this.data.appointments.concat(rows)
            const total = typeof data.total === 'number' ? data.total : merged.length

            this.setData({
                appointments: merged,
                page: page + 1,
                hasMore: merged.length < total,
                loading: false,
                loadingMore: false,
                refreshing: false
            })
            this.persistListState()
        } catch (e) {
            this.setData({
                loading: false,
                loadingMore: false,
                refreshing: false,
                errorText: APPOINTMENT_TEXTS.listLoadFailed
            })
        } finally {
            if (fromPullDown) {
                wx.stopPullDownRefresh()
            }
        }
    },
    onFilterChange(e) {
        const nextStatus = e.currentTarget.dataset.value
        if (nextStatus === this.data.selectedStatus) {
            return
        }

        this.persistListState()
        const stateKey = this.getListStateKey()
        const saved = stateKey ? (wx.getStorageSync(stateKey) || {}) : {}
        const restored = this.applyStatusCache(saved, nextStatus)
        if (restored) {
            this.restoreScrollPosition()
            this.loadData({ reset: true, silent: true })
            return
        }

        this.setData({ selectedStatus: nextStatus, appointments: [], hasMore: true, page: 1, scrollTop: 0 })
        this._scrollTop = 0
        wx.pageScrollTo({ scrollTop: 0, duration: 0 })
        this.loadData({ reset: true })
    },
    onPullDownRefresh() {
        this.loadData({ reset: true, fromPullDown: true })
    },
    onReachBottom() {
        if (this.data.loadingMore || this.data.loading || !this.data.hasMore) {
            return
        }
        this.loadData()
    },
    onRetry() {
        this.loadData({ reset: true })
    },
    onPageScroll(e) {
        this._scrollTop = e.scrollTop
    },
    restoreScrollPosition() {
        if (!this.data.scrollTop) {
            return
        }
        setTimeout(() => {
            wx.pageScrollTo({ scrollTop: this.data.scrollTop, duration: 0 })
        }, 40)
    },
    async onCancel(e) {
        const id = e.currentTarget.dataset.id
        if (this.data.cancelingId) {
            return
        }

        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: APPOINTMENT_TEXTS.cancelTitle,
                content: APPOINTMENT_TEXTS.cancelConfirmContent,
                success: (res) => resolve(!!res.confirm),
                fail: () => resolve(false)
            })
        })
        if (!confirmed) {
            return
        }

        try {
            this.setData({ cancelingId: id })
            await post(`/appointments/${id}/cancel/`, {})
            wx.showToast({ title: APPOINTMENT_TEXTS.cancelSuccess, icon: 'success' })
            this.setData({ appointments: [], page: 1, hasMore: true, scrollTop: 0 })
            wx.pageScrollTo({ scrollTop: 0, duration: 0 })
            this.loadData({ reset: true })
        } catch (e) {
        } finally {
            this.setData({ cancelingId: null })
        }
    },
    onGoReportList(e) {
        const appointmentId = e.currentTarget.dataset.appointmentId
        const suffix = appointmentId ? `?appointmentId=${appointmentId}` : ''
        wx.navigateTo({ url: `/pages/report/list${suffix}` })
    }
})
