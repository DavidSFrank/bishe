const {
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle
} = require('../../services/admin/articles')
const { ensureAdminSession } = require('../../utils/admin-page')

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
            const data = await fetchArticles({ page, page_size: this.data.pageSize })
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
            console.error('load articles failed', err)
        } finally {
            this.setData({ [loadingKey]: false })
            if (reset) {
                wx.stopPullDownRefresh()
            }
        }
    },

    async onAdd() {
        try {
            const title = await promptText({ title: '新增文章', placeholder: '请输入标题' })
            if (!title) {
                wx.showToast({ title: '标题不能为空', icon: 'none' })
                return
            }
            const content = await promptText({ title: '新增文章', placeholder: '请输入正文' })
            if (!content) {
                wx.showToast({ title: '正文不能为空', icon: 'none' })
                return
            }
            await createArticle({ title, content, is_active: true })
            wx.showToast({ title: '新增成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('create article failed', err)
            }
        }
    },

    async onEdit(e) {
        const id = e.currentTarget.dataset.id
        const currentTitle = e.currentTarget.dataset.title || ''
        if (!id) {
            return
        }
        try {
            const title = await promptText({
                title: '编辑标题',
                placeholder: '请输入标题',
                defaultValue: currentTitle
            })
            if (!title) {
                wx.showToast({ title: '标题不能为空', icon: 'none' })
                return
            }
            await updateArticle(id, { title })
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('update article failed', err)
            }
        }
    },

    onDelete(e) {
        const id = e.currentTarget.dataset.id
        if (!id) {
            return
        }
        wx.showModal({
            title: '删除文章',
            content: '确认删除该文章吗？',
            success: async ({ confirm }) => {
                if (!confirm) {
                    return
                }
                try {
                    await deleteArticle(id)
                    wx.showToast({ title: '删除成功', icon: 'success' })
                    this.loadData(true)
                } catch (err) {
                    console.error('delete article failed', err)
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
            await updateArticle(id, { is_active: !active })
            wx.showToast({ title: !active ? '已发布' : '已下线', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            console.error('toggle article active failed', err)
        }
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})

