const {
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner
} = require('../../services/admin/banners')
const { ensureAdminSession } = require('../../utils/admin-page')

const PAGE_SIZE = 10

const TEXTS = {
    imageRequired: '图片地址不能为空',
    imageInvalid: '图片地址需为 http/https 链接',
    linkInvalid: '跳转链接格式不正确',
    sortInvalid: '排序需为整数',
    loadFailed: '加载失败，请下拉重试',
    createFailed: '新增失败，请检查输入后重试',
    updateFailed: '更新失败，请检查输入后重试',
    deleteFailed: '删除失败，请稍后重试'
}

function isHttpUrl(value) {
    return /^https?:\/\//i.test(value || '')
}

function isValidLink(value) {
    if (!value) {
        return true
    }
    return /^https?:\/\//i.test(value) || value.startsWith('/')
}

function parseSortOrder(sortText) {
    if (sortText === '' || sortText === null || typeof sortText === 'undefined') {
        return 0
    }
    if (!/^-?\d+$/.test(String(sortText).trim())) {
        return null
    }
    return Number(sortText)
}

function promptText({ title, placeholder = '', defaultValue = '' }) {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title,
            editable: true,
            placeholderText: placeholder,
            content: defaultValue,
            success: (res) => {
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
            const data = await fetchBanners({ page, page_size: this.data.pageSize })
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
            console.error('load banners failed', err)
            wx.showToast({ title: TEXTS.loadFailed, icon: 'none' })
        } finally {
            this.setData({ [loadingKey]: false })
            if (reset) {
                wx.stopPullDownRefresh()
            }
        }
    },

    async onAdd() {
        try {
            const image = await promptText({ title: '新增轮播', placeholder: '请输入图片URL' })
            if (!image) {
                wx.showToast({ title: TEXTS.imageRequired, icon: 'none' })
                return
            }
            if (!isHttpUrl(image)) {
                wx.showToast({ title: TEXTS.imageInvalid, icon: 'none' })
                return
            }
            const title = await promptText({ title: '新增轮播', placeholder: '请输入标题（可选）' }).catch(() => '')
            const link = await promptText({ title: '新增轮播', placeholder: '请输入跳转链接（可选）' }).catch(() => '')
            if (!isValidLink(link)) {
                wx.showToast({ title: TEXTS.linkInvalid, icon: 'none' })
                return
            }
            const sortText = await promptText({ title: '新增轮播', placeholder: '请输入排序，默认0', defaultValue: '0' }).catch(() => '0')
            const sortOrder = parseSortOrder(sortText)
            if (sortOrder === null) {
                wx.showToast({ title: TEXTS.sortInvalid, icon: 'none' })
                return
            }
            await createBanner({
                image,
                title,
                link,
                sort_order: sortOrder,
                is_active: true
            })
            wx.showToast({ title: '新增成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('create banner failed', err)
                wx.showToast({ title: TEXTS.createFailed, icon: 'none' })
            }
        }
    },

    async onEdit(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            return
        }

        const currentTitle = e.currentTarget.dataset.title || ''
        const currentLink = e.currentTarget.dataset.link || ''
        const currentSort = e.currentTarget.dataset.sort || '0'
        try {
            const title = await promptText({ title: '编辑标题', placeholder: '请输入标题', defaultValue: currentTitle })
            const link = await promptText({ title: '编辑链接', placeholder: '请输入跳转链接', defaultValue: currentLink })
            if (!isValidLink(link)) {
                wx.showToast({ title: TEXTS.linkInvalid, icon: 'none' })
                return
            }
            const sortText = await promptText({ title: '编辑排序', placeholder: '请输入排序', defaultValue: String(currentSort) })
            const sortOrder = parseSortOrder(sortText)
            if (sortOrder === null) {
                wx.showToast({ title: TEXTS.sortInvalid, icon: 'none' })
                return
            }
            await updateBanner(id, {
                title,
                link,
                sort_order: sortOrder
            })
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('update banner failed', err)
                wx.showToast({ title: TEXTS.updateFailed, icon: 'none' })
            }
        }
    },

    onDelete(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            return
        }
        wx.showModal({
            title: '删除轮播',
            content: '确认删除该轮播吗？',
            success: async ({ confirm }) => {
                if (!confirm) {
                    return
                }
                try {
                    await deleteBanner(id)
                    wx.showToast({ title: '删除成功', icon: 'success' })
                    this.loadData(true)
                } catch (err) {
                    console.error('delete banner failed', err)
                    wx.showToast({ title: TEXTS.deleteFailed, icon: 'none' })
                }
            }
        })
    },

    async onToggleActive(e) {
        const id = e.currentTarget.dataset.id
        const active = !!e.currentTarget.dataset.active
        if (!id) {
            return
        }
        try {
            await updateBanner(id, { is_active: !active })
            wx.showToast({ title: !active ? '已启用' : '已停用', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            console.error('toggle banner active failed', err)
        }
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})


